from __future__ import absolute_import, unicode_literals

import hashlib
import os
import subprocess
import time
import urllib
from os.path import splitext, basename
from time import sleep

import requests
import sendgrid
import slack
from PIL import Image as PILImage
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings
from django.db.models import F
from django.db.models import Q
from requests.utils import requote_uri
from sendgrid.helpers.mail import *

from lstv_api_v1.utils.aws_utils import aws_s3_move_file_to_another_key, aws_s3_change_file_acl, \
    aws_s3_is_object_public, aws_s3_get_object_url
from lstv_api_v1.utils.jwp_utils import upload_external_file_to_jwp
from lstv_api_v1.utils.legacy_model_utils import *
from lstv_api_v1.utils.utils import verify_resource_url, verify_url_with_key_phrase, complete_address_from_geo_db, \
    stash_element, get_location_for_ip, report_issue, \
    verify_image_url, set_volatile_value, notify_grapevine, notify_emergency, get_volatile_value, delete_volatile_value
from lstv_be.celery_app import app
from lstv_be.settings import DEFAULT_CDN_BUCKET_URL, DEFAULT_CDN_BUCKET_NAME, DEBUG, WEB_SERVER_URL


@app.task(bind=True, retry_kwargs={'max_retries': 3, 'countdown': 3})
def job_queue_video_for_jwp(self, token, queue_value):
    # transfer video from uploads into its permanent place
    old_key = f"videos/uploads/{queue_value['filename']}"
    new_key = f"videos/originals/{queue_value['filename']}"
    success = aws_s3_move_file_to_another_key(old_key, new_key)
    if success:
        queue_value['queued'] = True
        queue_value['uploaded_at'] = datetime.now().replace(tzinfo=timezone.utc)
        queue_value[
            'direct_url'] = aws_s3_get_object_url(DEFAULT_CDN_BUCKET_NAME, new_key)
        set_volatile_value(f"video-upload-{token}", queue_value, 2880)
        # make video publicly accessible

        success = aws_s3_change_file_acl(DEFAULT_CDN_BUCKET_NAME, new_key)
        attempts = 0
        while True:
            if aws_s3_is_object_public(DEFAULT_CDN_BUCKET_NAME, new_key):
                break
            else:
                attempts += 1
                if attempts > 5:
                    # giving up
                    job_alert_cto("S3 Video Object ACL did not change.",
                                  "job_queue_video_for_jwp",
                                  f"{DEFAULT_CDN_BUCKET_NAME}/{new_key}")
                    return False
                time.sleep(5)

        if success:
            # shoot it to JWP...
            res = upload_external_file_to_jwp(requote_uri(queue_value['direct_url']), queue_value['filename'])
            if res and res['id']:
                queue_value['media_id'] = res['id']
                queue_value['submitted_for_transcoding_at'] = datetime.now().replace(tzinfo=timezone.utc)
                set_volatile_value(f"video-upload-{token}", queue_value, 2880)
                set_volatile_value(f"media-id-map-{res['id']}", f"video-upload-{token}", 2880)

    return success


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def assign_thumbnail_to_user(self, user, image_url):
    from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3, invalidate_public_cdn_path
    if user:
        # handle image
        image_name = slugify(
            f"{user.first_name}{user.last_name}{hashlib.sha1(bytes(user.email, encoding='utf-8')).hexdigest()}")
        thumbnail_url = upload_file_to_aws_s3(image_url, 'images/profileAvatars', f"{image_name}.jpg", "public-read",
                                              True)
        invalidate_public_cdn_path(thumbnail_url)

        new_image = Image(serve_url=thumbnail_url, source=ContentModelSource.admin,
                          purpose=ImagePurposeTypes.profile_avatar)
        new_image.save()
        user.profile_image = new_image
        user.save()
        return new_image
    else:
        return None


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def cleanup_abandoned_media_id(self, media_id):
    try:
        vs = VideoSource.objects.get(media_id=media_id)
    except VideoSource.DoesNotExist:
        pass
        #value = get_volatile_value(f"media-id-map-{media_id}")
        #if value:
        #    value = get_volatile_value(value)
        #    notify_grapevine(f":warning: {value.get('user_name', 'n/a')}{value.get('business_name', 'n/a')} "
        #                     f"successfully uploaded a video, but abandoned the publishing process.")


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def get_video_metadata(self, media_id):
    vs = VideoSource.objects.get(media_id=media_id)
    if vs:
        vs.update_metadata_from_source()


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def report_video_encoding_complete(self, media_id):

    value = get_volatile_value(f"media-id-map-{media_id}")
    upload_token = None
    if value:
        value = get_volatile_value(value)
        if value:
            upload_token = value.get('token', None)
    try:
        if upload_token:
            vs = VideoSource.objects.get(Q(media_id=media_id) | Q(upload_token=upload_token))
        else:
            vs = VideoSource.objects.get(media_id=media_id)
        if vs:
            vs.media_id = media_id
            vs.status = VideoStatusEnum.ready
            if vs.thumbnail and vs.thumbnail.legacy_url and '/images/site/nothumb.jpg' in vs.thumbnail.legacy_url:
                vs.thumbnail.legacy_url =  f"https://assets-jpcust.jwpsrv.com/thumbs/{media_id}.jpg"
                vs.thumbnail.serve_url = None
                vs.thumbnail.save()
                job_migrate_image_to_s3.apply_async(args=[vs.thumbnail_id], eta=datetime.now() + timedelta(seconds=5))

            vs.save()
            video = Video.objects.filter(videos=vs).first()
            if video:
                notify_grapevine(message=f":tv: New video: <{WEB_SERVER_URL}/{video.post.slug}|{video.title}>\r"
                                         f"Uploaded by <{WEB_SERVER_URL}/business/{vs.owner_business.slug}|"
                                         f"{vs.owner_business.name}>\r"
                                         f"Tagged Businesses: {video.businesses.count()}\r"
                                         f"Styles: {video.vibes.count()}\r"
                                         f"Don't like the thumbnail? <https://dashboard.jwplayer.com/#/content/detail-"
                                         f"preview?video={media_id}&spotlight=thumb&tab=metadata&property=92d84afc-d444-"
                                         f"11e7-8332-0a55b80e2f57|Change It!>\r",
                                 image_url=vs.thumbnail.get_serve_url())

            # update metadata (after 2 minutes)
            get_video_metadata.apply_async(args=[media_id], eta=datetime.now() + timedelta(seconds=120))

            delete_volatile_value(f"video-upload-{upload_token}")
            delete_volatile_value(f"video-status-{media_id}")
            delete_volatile_value(f"media-id-map-{media_id}")

    except VideoSource.DoesNotExist:
        try:
            print(f"jwp complete, but the user did not post the video, re-trying in "
                  f"{2 ** self.request.retries} seconds")
            self.retry(countdown=2 ** self.request.retries, max_retries=14)
        except MaxRetriesExceededError:
            print(f"jwp complete, but the user did not post the video. giving up")
            # triggering a cleanup job 24 hours in the future
            cleanup_abandoned_media_id.apply_async(args=[media_id], eta=datetime.now() + timedelta(seconds=8))



@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_migrate_wedding_dates(self):
    posts = []
    # get all event stories that DO NOT have a wedding_date property
    es = Video.objects.filter(event_date__isnull=True)
    for e in es:
        posts.append(e.post)

    with alive_bar(len(posts), "- Pruning Wedding Dates", bar="blocks", length=10) as bar:
        for p in posts:
            bar()
            # obtain event story
            es = Video.objects.filter(post=p).first()

            w_date = None
            if es:
                if not es.event_date:
                    wedding_date_prop = p.properties.filter(key='legacy_wedding_date').first()
                    if wedding_date_prop and wedding_date_prop.value_text:
                        try:
                            w_date = datetime.strptime(wedding_date_prop.value_text, '%Y-%m-%d')
                        except ValueError:
                            try:
                                w_date = datetime.strptime(wedding_date_prop.value_text, '%m.%d.%Y')
                            except ValueError:
                                try:
                                    w_date = datetime.strptime(wedding_date_prop.value_text, '%m/%d/%Y')
                                except ValueError:
                                    try:
                                        w_date = datetime.strptime(wedding_date_prop.value_text, '%m-%d-%Y')
                                    except ValueError:
                                        try:
                                            w_date = datetime.strptime(wedding_date_prop.value_text, '%b %d %Y')
                                        except ValueError:
                                            try:
                                                w_date = datetime.strptime(wedding_date_prop.value_text, '%m%d%Y')
                                            except ValueError:
                                                try:
                                                    w_date = datetime.strptime(wedding_date_prop.value_text,
                                                                               '%m.%d.%y')
                                                except ValueError:
                                                    w_date = datetime.strptime(wedding_date_prop.value_text,
                                                                               '%m%d%y')
                        if w_date:
                            # create new event story property and commit
                            es.event_date = w_date
                            es.state = ContentModelState.active
                            es.state_desc = None
                            es.save()
                        else:
                            es.set_active_review_required(ACTIVE_REVIEW_NO_EVENT_DATE, "No event date.")
                            logging.getLogger('migration-prune').warning(
                                "[NOK] no wedding date for legacy post {} ({})".format(p.id, p.legacy_post_id))
                    else:
                        logging.getLogger('migration-prune').warning(
                            "[NOK] no wedding date for legacy post {} ({})".format(p.id, p.legacy_post_id))
                        es.set_active_review_required(ACTIVE_REVIEW_NO_EVENT_DATE, "No event date.")
                        es.save()
            else:
                logging.getLogger('migration-prune').error(
                    "[NOK] can't find event story for post {} ({})".format(p.id, p.legacy_post_id))


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_process_buffered_card_impressions(self, slug, ci_data, user_id, ip_id):
    VIDEO_CI = 'video'
    ARTICLE_CI = 'article'
    BUSINESS_CARD_CI = 'business'
    PHOTO_CARD_CI = 'photo'
    VIBE_CARD_CI = 'vibe'

    user = User.objects.filter(id=user_id).first()
    ip = IPAddress.objects.filter(id=ip_id).first()

    for key in ci_data:
        data = ci_data[key]
        # # print(f"{key} {data}")

        element = None

        if data['type'] == VIDEO_CI:
            # print(key + " " + data['type'])
            # print("---")

            Video.objects.filter(post__slug=key).update(card_impressions=F('card_impressions') + data['count'])
            element = Video.objects.filter(post__slug=key).first()

        if data['type'] == ARTICLE_CI:
            # print(key + " " + data['type'])
            Article.objects.filter(post__slug=key).update(card_impressions=F('card_impressions') + data['count'])
            element = Article.objects.filter(post__slug=key).first()

        if data['type'] == BUSINESS_CARD_CI:
            # print(key + " " + data['type'])
            Business.objects.filter(slug=key).update(card_impressions=F('card_impressions') + data['count'])
            element = Business.objects.filter(slug=key).first()

        if data['type'] == PHOTO_CARD_CI:
            # print(key + " " + data['type'])
            Photo.objects.filter(id=key).update(card_impressions=F('card_impressions') + data['count'])
            element = Photo.objects.filter(id=key).first()

        if data['type'] == VIBE_CARD_CI:
            # print(key + " " + data['type'])
            TagType.objects.filter(slug=key).update(card_impressions=F('card_impressions') + data['count'])
            element = TagType.objects.filter(slug=key).first()
            data['type'] = 'tag'

        # retaining individual view logs

        if element:
            card_impression_log_entry = CardImpressionsLog(
                element_type=ContentSearchQueryType[data['type']],
                element_id=element.id,
                user=user,
                ip=ip,
                event_date=slug,
                num_impressions=data['count'])
            card_impression_log_entry.save()


@app.task(bind=True)
def job_migrate_image_to_s3(self, image_id):
    from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3
    filename = None
    filename_mobile = None
    filename_tablet = None
    filename_desktop = None
    image = None

    try:
        image = Image.objects.get(pk=image_id)
        image.legacy_url = image.legacy_url.replace("/var/www/html/production", "https://lovestoriestv.com/")

        filename_orig, extension = splitext(basename(image.legacy_url))
        filename = secrets.token_hex(6) + "-" + hashlib.sha1(
            bytes(filename_orig, encoding='utf-8')).hexdigest() + "-orig" + extension
        filename_mobile = None
        filename_tablet = None
        filename_desktop = None
        img_cdn_url = f"{DEFAULT_CDN}/images/siteContent/{filename}"
        ok = verify_image_url(img_cdn_url)

        if not ok:
            command = f"wget  -q --no-check-certificate --no-proxy  \"{image.legacy_url}\" -O \"{filename}\""
            result_code = subprocess.call(command, shell=True)
            if result_code == 0:
                if os.path.exists(filename):
                    im = PILImage.open(filename)
                    aspect_ratio = im.width / im.height

                    if extension.lower() != im.format.lower():
                        # print(f"*** file extension {extension} and content is {im.format}")
                        old_filename = filename
                        filename = filename.replace(extension, f".{im.format}")
                        os.rename(old_filename, filename)

                    if im.format.lower() == 'tiff':
                        # print("converting tiff to JPEG")
                        im = im.convert("RGB")
                        old_filename = filename
                        filename = re.sub(r'(?i).tiff|(?i).tif', '.jpg', filename)
                        os.rename(old_filename, filename)
                        im.convert("RGB").save(filename, "JPEG", quality=90)
                        im = PILImage.open(filename)

                    # upload scaled down versions

                    purpose = ImagePurposeTypes.thumbnail

                    # mobile
                    mobile_width = Image.url_appendix_dict.get(ImageDeviceTypes.phone, {}).get(purpose, None)
                    im_mbl = im.resize([mobile_width, int(mobile_width / aspect_ratio)])
                    filename_mobile = filename.replace("-orig", "-mbl")
                    im_mbl.save(filename_mobile, quality=90)
                    upload_file_to_aws_s3(filename_mobile, "images/site/content", filename_mobile)

                    # tablet
                    tablet_width = Image.url_appendix_dict.get(ImageDeviceTypes.tablet, {}).get(purpose, None)
                    im_tab = im.resize(
                        [tablet_width, int(tablet_width / aspect_ratio)],
                        PILImage.ANTIALIAS)
                    filename_tablet = filename.replace("-orig", "-tab")
                    im_tab.save(filename_tablet, quality=90)
                    upload_file_to_aws_s3(filename_tablet, "images/site/content", filename_tablet)

                    # desktop
                    desktop_width = Image.url_appendix_dict.get(ImageDeviceTypes.desktop, {}).get(purpose, None)
                    im_dsk = im.resize(
                        [desktop_width, int(desktop_width / aspect_ratio)],
                        PILImage.ANTIALIAS)
                    filename_desktop = filename.replace("-orig", "-dsk")
                    im_dsk.save(filename_desktop, quality=90)
                    upload_file_to_aws_s3(filename_desktop, "images/site/content", filename_desktop)

                    # update image record with new serve_url
                    p_orig = upload_file_to_aws_s3(filename, "images/site/content", filename)

                    if p_orig:
                        # success, at least with the original upload?
                        image.set_active()
                        image.serve_url = p_orig
                        image.width = im.width
                        image.height = im.height
                        image.save()
                    else:
                        pass
                        # print(f"cant upload images/site/content/{filename}")
            else:
                if result_code == 8:
                    print(f"can't download image from legacy urlretrying in : {2 ** self.request.retries} seconds")
                    try:
                        self.retry(countdown=2 ** self.request.retries, max_retries=10)
                    except MaxRetriesExceededError:
                        job_alert_cto("JOB/GIVE UP: migrating image to s3", "job_migrate_image_to_s3",
                                      f"image_id {image_id} - purpose: {image.purpose} --- can't download image "
                                      f"from legact url {image.legacy_url}. remedy: active_review + "
                                      f"serve_url=image-not-found")
                        image.serve_url = "https://cdn.lovestoriestv.com/images/site/nothumb.jpg"
                        image.state = ContentModelState.active_review
                        image.state_desc = ["legacy_url leads to non-existing image. defaulting to "
                                            "no-preview thumbnail"]
                        image.save()
        else:

            command = f"wget  -q --no-check-certificate --no-proxy  \"{image.legacy_url}\" -O \"{filename}\""
            result_code = subprocess.call(command, shell=True)
            if result_code == 0:
                im = PILImage.open(filename)
                image.width = im.width
                image.height = im.height
                os.remove(filename)
            image.serve_url = img_cdn_url
            image.save()

            # print(f"{filename} already exists in LSTV2's CDN ({image.width}x{image.height})")

    except ValueError as e:
        if image:
            image.set_suspended_review_required("processing", str(e))
    except OSError as e:
        if image:
            image.set_suspended_review_required("processing", str(e))
    except Image.DoesNotExist:
        print(f"can't find the image db record, retrying in : {2 ** self.request.retries} seconds")
        try:
            self.retry(countdown=2 ** self.request.retries, max_retries=10)
        except MaxRetriesExceededError:
            job_alert_cto("JOB/GIVE UP: migrating image to s3", "job_migrate_image_to_s3",
                          f"image_id {image_id} - ROOT: Image does not exist in DB")

    finally:
        # print("cleanup...")
        if filename and os.path.exists(filename):
            os.remove(filename)
        if filename_mobile and os.path.exists(filename_mobile):
            os.remove(filename_mobile)
        if filename_tablet and os.path.exists(filename_tablet):
            os.remove(filename_tablet)
        if filename_desktop and os.path.exists(filename_desktop):
            os.remove(filename_desktop)


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_build_video_preview(self, video_id):
    from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3
    # print("job_build_video_preview")
    try:
        video = VideoSource.objects.get(pk=video_id)
        if video.type == VideoTypeEnum.jwplayer and video.media_id is not None:
            video_url = f"https://content.jwplatform.com/videos/{video.media_id}-tNVC80Tv.mp4"

            # if there a preview already on S3?
            would_be_preview_url = f"{DEFAULT_CDN}/videos/previews/{video.media_id}.gif"
            # print(f"trying {would_be_preview_url}")
            if verify_image_url(would_be_preview_url):
                video.preview_gif_url = would_be_preview_url
                video.save()
                return True

            # print("it doesn't exist -- creating...")
            command = f"ffmpeg -loglevel error -ss 2.0 -t 15 -y -i {video_url} -vf fps=15,scale=320:-1:flags=lanczos,palettegen" \
                      f" {video.media_id}.png"
            if subprocess.call(command, shell=True) == 0:
                command = f"ffmpeg -loglevel error -ss 2.0 -y -t 30 -i {video_url} -i {video.media_id}.png -filter_complex \"loop=-1,fps=15,scale=320:-1:flags=lanczos[x];[x][1:v]paletteuse\" {video.media_id}.gif"
                if subprocess.call(command, shell=True) == 0:
                    os.remove(f"{video.media_id}.png")

                    # upload file to s3
                    preview_gif_url = upload_file_to_aws_s3(f"{video.media_id}.gif", 'videos/previews',
                                                            f"{video.media_id}.gif", "public-read", True)

                    # update video record
                    video.preview_gif_url = preview_gif_url
                    video.save()
                    return True
            else:
                return None
        else:
            return None
    except VideoSource.DoesNotExist:
        # print("video cannot be found")
        return None


@app.task(bind=True, autoretry_for=(Message.DoesNotExist, Message.DoesNotExist),
          retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_send_sendgrid(self, from_email_address, from_name, to_email_address, to_name,
                      subject, template_id, elements=None, message_id=None, bcc=None):
    # sending...
    sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    personalizations = {
        "dynamic_template_data": elements,
        "to": [
            {
                "email": to_email_address,
                "name": to_name
            }
        ],
    }
    if subject:
        personalizations["subject"] = subject
    data = {
        "from": {
            "email": from_email_address,
            "name": from_name
        },
        "personalizations": [personalizations],
        "reply_to": {
            "email": elements['lstv_email'],
            "name": elements['lstv_name']
        },
        "template_id": template_id,
    }
    if bcc and len(bcc) > 0:
        data['personalizations'][0]['bcc'] = []
        for bcci in bcc:
            data['personalizations'][0]['bcc'].append({"email": bcci})

    response = sg.client.mail.send.post(request_body=data)

    if message_id and "X-Message-Id" in response.headers:
        print(response.headers)
        try:
            message = Message.objects.get(pk=message_id)
            message.processor_message_id = response.headers["X-Message-Id"]
            message.message_status = ExternalMessageDeliveryStatus.sent_to_processor
            message.save()
        except Message.DoesNotExist:

            pass


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def send_slack_interactive_response(self, response_url, payload, trigger_id):
    if response_url and payload and trigger_id:
        headers = {"Content-Type": "application/json"}
        r = requests.post(response_url, json=payload, headers=headers)
        if r.status_code != 200:
            raise Exception(r.__dict__)


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def send_slack_message_or_action(self, *args, **kwargs):
    client = slack.WebClient(token=settings.BOT_USER_ACCESS_TOKEN)
    context_type = kwargs.get('context_type', None)
    context_id = kwargs.get('context_id', None)
    state_container = kwargs.get('state_container', None)
    blocks = kwargs.get('blocks', None)
    channel = kwargs.get('channel', None)
    if blocks:
        # retain state for further interaction with the slack message.
        set_volatile_value(f"{context_type}-{context_id}", state_container, 1440)
        client.chat_postMessage(
            channel=channel,
            blocks=blocks)
    else:
        job_alert_cto("issue with sending slack action", "send_slack_message_or_action", "blocks parameter was None")


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_alert_cto(self, email_subject, from_module, message):
    job_send_sendgrid.delay('donotreply@lovestoriestv.com', "LSTV2 Backend Alerts", "ronen@lovestoriestv.com",
                            "Ronen Magid", "CTOL " + email_subject, 'd-1381ccb48a6f4477aa7f77b686c87944',
                            {'message': message, 'from_name': from_module, 'lstv_name': 'LSTV2 Backend Alerts',
                             'lstv_email': 'donotreply@lovestoriestv.com', 'subject': "CTO " + email_subject})


@app.task(bind=True, autoretry_for=(Message.DoesNotExist, Message.DoesNotExist),
          retry_kwargs={'max_retries': 10, 'countdown': 5})
def job_deliver_email_message(self, message_id):
    message = Message.objects.get(pk=message_id)

    from_name = message.processor_data['lstv_name']
    from_email_address = message.processor_data['lstv_email']

    # to
    if message.to_user:
        to_name = message.to_user.get_full_name_or_email()
        to_email_address = message.to_user.email
    else:
        if 'to_name' in message.processor_data:
            to_name = message.processor_data['to_name']
        else:
            to_name = message.to_explicit_email
        to_email_address = message.delivery_email

    # send the message
    message.processor_data['message'] = message.message_content
    job_send_sendgrid.delay(from_email_address, from_name,
                            to_email_address, to_name,
                            message.processor_data['subject'], message.processor_data['template_id'],
                            message.processor_data,
                            message_id, message.bcc)


@app.task
def job_reattach_view_log_entry(log_id, element_type, legacy_post_id, legacy_user_id):
    element = None
    user = None
    if legacy_user_id:
        try:
            user = User.objects.get(legacy_user_id=legacy_user_id)
        except User.DoesNotExist:
            pass

    if element_type == 'video':
        try:
            element = Video.objects.get(post__legacy_post_id=legacy_post_id)
            log = VideoViewLog.objects.get(id=log_id)
            if element and log:
                log.video = element
                log.user_id = user
                log.save()
        except Video.DoesNotExist:
            pass

    if element_type == 'article':
        try:
            element = Article.objects.get(post__legacy_post_id=legacy_post_id)
            log = ArticleViewLog.objects.get(id=log_id)
            if element and log:
                log.article = element
                log.user_id = user
                log.save()
        except Article.DoesNotExist:
            pass


@app.task
def job_stash_user_event(user_event_id):
    try:
        user_event = UserEventLog.objects.get(pk=user_event_id)

        extra = {
            'id': user_event.id,
            'created_at': user_event.created_at.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            'domain': user_event.domain,
            'rw': 'write',
            'outcome': user_event.outcome.name,
            'action': slugify(user_event.action),
            'ip': user_event.ip.ip
        }

        stash_element(extra, user_event.severity, user_event, user_event.data)

    except UserEventLog.DoesNotExist:
        report_issue("cannot find user event id")


@app.task
def job_stash_video_playback_event(playback_event_id):
    try:
        view = VideoPlaybackLog.objects.get(pk=playback_event_id)

        extra = {
            'id': view.id,
            'video_id': view.video_identifier,
            'created_at': view.created_at.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            'domain': 'video-watch',
            'outcome': 'success',
            'action_family': 'read',
            'action': 'watched-a-video',
            'ip': view.ip.ip,
            'duration': view.duration,
            'time_watched': view.time_watched,
            'unique_guest_uuid': view.unique_guest_uuid
        }

        # video ad information, where applicable

        if view.ad_title:
            extra['ad_title'] = view.ad_title
        if view.ad_duration:
            extra['ad_duration'] = view.ad_duration
        if view.ad_time_watched:
            extra['ad_time_watched'] = view.ad_time_watched
        if view.ad_clicked:
            extra['ad_clicked'] = view.ad_clicked
        if view.ad_clicked_time_index:
            extra['ad_clicked_time_index'] = view.ad_clicked_time_index

        if view.user_id:
            extra['user_id'] = view.user.id
            extra['user_name'] = view.user.get_full_name_or_email()

        # details about the viewed video
        video = VideoSource.objects.filter(id=view.video_identifier).first()
        es = Video.objects.filter(
            videos=video).first()  # TODO: Remove first() when supporting multiple vids
        if video and video.owner_business:
            extra['filmmaker'] = video.owner_business.name
        if es:
            extra['video_title'] = es.title
        # video location
        if es.location.has_content():
            if es.location.country:
                extra['geo_video_country'] = es.location.country.name
            if es.location.state_province:
                extra['geo_video_state_province'] = es.location.state_province.name
            if es.location.place:
                extra['geo_video_place'] = es.location.place.name

        stash_element(extra, 'info', view)

    except VideoPlaybackLog.DoesNotExist:
        report_issue("cannot find user event id")


@app.task
def job_import_from_legacy_views(items):
    es_items = []
    bs_items = []

    for view_id in items:
        view = LegacyViewsLog.objects.filter(id=view_id).first()
        if view:
            post = Post.objects.filter(legacy_post_id=view.legacy_post_id).first()
            if post:
                user = User.objects.filter(legacy_user_id=view.legacy_user_id).first()
                if post.type == PostTypeEnum.video:
                    es = Video.objects.filter(post=post).first()
                    if es:
                        es_view_log = VideoViewLog(video=es, user=user)
                        es_view_log.predate_created_at(view.legacy_created, False)
                        es_items.append(es_view_log)
                elif post.type == PostTypeEnum.article:
                    bs = Article.objects.filter(post=post).first()
                    if bs:
                        bs_view_log = ArticleViewLog(article=bs, user=user)
                        bs_view_log.predate_created_at(view.legacy_created, False)
                        bs_items.append(bs_view_log)

    if len(es_items) > 0:
        VideoViewLog.objects.bulk_create(es_items)
    if len(bs_items) > 0:
        ArticleViewLog.objects.bulk_create(bs_items)


@app.task
def add(x, y):
    return x * y


@app.task
def job_verify_external_video(video_id):
    # obtain video from ID
    video = VideoSource.objects.get(pk=video_id)

    if video:

        if video.type == VideoTypeEnum.youtube:
            success, duration = verify_youtube_video(video.media_id)

            if success:
                if not video.duration:
                    video.duration = duration
                    video.save()
                logging.getLogger('migration-prune').info(
                    "[OK ] youtube video validated {} legacy post: {} ({} secs)".format(video_id,
                                                                                        video.legacy_post_id,
                                                                                        duration))
            else:
                video.state = ContentModelState.suspended_review
                video.state_desc = ["youtube video has become stale or private. please replace."]
                video.save()
                logging.getLogger('migration-prune').warning(
                    "[NOK] invalid youtube video {} legacy post: {}".format(video_id, video.legacy_post_id))

        if video.type == VideoTypeEnum.vimeo:
            success, duration = verify_vimeo_video(video.media_id)
            if success:
                if not video.duration:
                    video.duration = duration
                    video.save()
                logging.getLogger('migration-prune').info(
                    "[OK ] vimeo video validated {} legacy post: {} ({} secs)".format(video_id,
                                                                                      video.legacy_post_id,
                                                                                      duration))
            else:
                video.state = ContentModelState.suspended_review
                video.state_desc = ["vimeo video has become stale or private. please replace."]
                video.save()
                logging.getLogger('migration-prune').warning(
                    "[NOK] invalid vimeo video {} legacy post: {}".format(video_id, video.legacy_post_id))

        # tag as verified
        video.external_verified_at = now()
        video.save()

    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find video in database {} ".format(video_id))

    # return true upon completion
    return True


@app.task
def job_verify_images(image_id):
    # obtain image record

    image = Image.objects.get(pk=image_id)

    if image:
        new_url = None
        success = verify_image_url(image.legacy_url)
        if not success:
            image.legacy_url = f"{DEFAULT_CDN}/images/site/nothumb.jpg"
            image.state = ContentModelState.active_review
            if not image.state_desc:
                state_desc = ["No thumbnail. Default placeholder used"]
            else:
                image.state_desc.append("No thumbnail. Default placeholder used")

        # tag as verified
        image.verified_at = now()
        image.save()

    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find image in database {} ".format(image_id))


@app.task
def job_verify_email_in_properties(properties_id):
    # fetch property
    prop = Properties.objects.get(pk=properties_id)

    if prop:
        result = quick_verify_email_address(prop.value_text).status
        rc = result in [ZBValidateStatus.valid, ZBValidateStatus.do_not_mail, ZBValidateStatus.catch_all]
        if not rc:
            logging.getLogger('migration-prune').warning(
                "[NOK] venue email {} is not reachable".format(prop.value_text))
            prop.state = ContentModelState.active_review
            if not prop.state_desc:
                prop.state_desc = ["venue email unreachable"]
            else:
                prop.state_desc.append("venue email unreachable")
            prop.save()

    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find property in database {} ".format(properties_id))


@app.task
def job_verify_email_in_users(user_id):
    # fetch user
    user = User.objects.get(pk=user_id)

    if user:
        result = quick_verify_email_address(user.email).status
        rc = result in [ZBValidateStatus.valid, ZBValidateStatus.do_not_mail, ZBValidateStatus.catch_all]
        if not rc:
            logging.getLogger('migration-prune').warning(
                "[NOK] user email {} is not reachable".format(user.email))
            user.state = ContentModelState.active_review
            if not user.state_desc:
                user.state_desc = ["email unreachable"]
            else:
                user.state_desc.append("email unreachable")
        user.email_verification_at = now()
        user.save()

    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find user in database {} ".format(user_id))


@app.task
def job_verify_venue_websites(website_prop_id):
    # fetch property
    prop = Properties.objects.get(pk=website_prop_id)

    if prop:
        # get business
        business = prop.businesses.get()
        if business:
            rc = verify_url_with_key_phrase(prop.value_text, business.name)
            if not rc:
                logging.getLogger('migration-prune').warning(
                    "[NOK] website for business {} ({}) unreachable or wrong site".format(business.name,
                                                                                          prop.value_text))
            return rc
        else:
            logging.getLogger('migration-prune').error(
                "[NOK] Can't find business for property {} ".format(website_prop_id))

    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find property in database {} ".format(website_prop_id))


@app.task
def job_import_post_views_batch(offset, size):
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from post_views_detail where id >= %s and id <= %s",
                   (offset, offset + size - 1,))
    views = get_dict(cursor)
    cursor.close()

    arr = []
    for view in views:
        arr.append(LegacyViewsLog(legacy_created=view['created_at'],
                                  legacy_post_id=view['post_id'],
                                  legacy_user_id=view['user_id']))

    LegacyViewsLog.objects.bulk_create(arr)

    return len(arr)


@app.task
def job_sanitize_address(address_id):
    # fetch address
    address = Location.objects.get(pk=address_id)
    if address:
        if complete_address_from_geo_db(address):
            address.save()
        else:
            logging.getLogger('migration-prune').warning(
                "[NOK] no geo info to match legacy address {} ".format(address_id))
    else:
        logging.getLogger('migration-prune').error("[NOK] Can't find property in database {} ".format(address_id))


@app.task
def job_process_ip_to_geo():
    no_geo_records = IPAddress.objects.filter(ip__isnull=False).filter(processed=False)
    for no_geo_record in no_geo_records:
        get_location_for_ip(no_geo_record)


@app.task
def job_recalc_weight():
    def set_business_based_at_role_breakdown(location_object_id, location_object):
        for business in Business.objects.filter(Q(business_locations__country__id=location_object_id) |
                                                Q(business_locations__state_province__id=location_object_id) |
                                                Q(business_locations__county__id=location_object_id) |
                                                Q(business_locations__place__id=location_object_id)).all():
            location_object.weight_businesses_based_at_role_breakdown = business.get_business_role_breakdown(
                location_object.weight_businesses_based_at_role_breakdown or {})
        location_object.save()

    def set_business_work_at_role_breakdown(location_object_id, location_object):
        for video in Video.objects.filter(Q(location__country__id=location_object_id) |
                                          Q(location__state_province__id=location_object_id) |
                                          Q(location__county__id=location_object_id) |
                                          Q(location__place__id=location_object_id)).iterator():
            location_object.weight_businesses_work_at_role_breakdown = video.get_business_role_breakdown(
                location_object.weight_businesses_work_at_role_breakdown or {})
        location_object.save()

    Business.objects_all_states.filter(Q(weight_videos__gt=0) | Q(weight_articles__gt=0)). \
        update(weight_videos=0, weight_articles=0, weight_photos=0)
    TagType.objects.update(weight=0)

    Country.objects.filter(
        Q(weight_videos__gt=0) | Q(weight_articles__gt=0) | Q(weight_businesses_work_at__gt=0) |
        Q(weight_businesses_based_at__gt=0) | Q(weight_businesses_based_at_role_breakdown__isnull=True) | Q(
            weight_businesses_work_at_role_breakdown__isnull=True)).update(weight_videos=0,
                                                                           weight_businesses_based_at=0,
                                                                           weight_businesses_work_at=0,
                                                                           weight_articles=0,
                                                                           weight_businesses_based_at_role_breakdown={},
                                                                           weight_businesses_work_at_role_breakdown={})

    County.objects.filter(
        Q(weight_videos__gt=0) | Q(weight_articles__gt=0) | Q(weight_businesses_work_at__gt=0) |
        Q(weight_businesses_based_at__gt=0)).update(weight_videos=0,
                                                    weight_businesses_based_at=0,
                                                    weight_businesses_work_at=0,
                                                    weight_articles=0,
                                                    weight_businesses_based_at_role_breakdown={},
                                                    weight_businesses_work_at_role_breakdown={})
    StateProvince.objects.filter(
        Q(weight_videos__gt=0) | Q(weight_articles__gt=0) | Q(weight_businesses_work_at__gt=0) |
        Q(weight_businesses_based_at__gt=0)).update(weight_videos=0,
                                                    weight_businesses_based_at=0,
                                                    weight_businesses_work_at=0,
                                                    weight_articles=0,
                                                    weight_businesses_based_at_role_breakdown={},
                                                    weight_businesses_work_at_role_breakdown={})

    Place.objects.filter(
        Q(weight_videos__gt=0) | Q(weight_articles__gt=0) | Q(weight_businesses_work_at__gt=0) |
        Q(weight_businesses_based_at__gt=0)).update(weight_videos=0,
                                                    weight_businesses_based_at=0,
                                                    weight_businesses_work_at=0,
                                                    weight_articles=0,
                                                    weight_businesses_based_at_role_breakdown={},
                                                    weight_businesses_work_at_role_breakdown={})

    BusinessVenueType.objects_all_states.update(weight_videos=0)
    BusinessRoleType.objects.update(weight_in_videos=0, weight_in_businesses=0)

    # business role type weight in videos and businesses

    business_types = BusinessRoleType.objects.all()
    with alive_bar(len(business_types), "- business role type weight (es & business types)", bar="blocks",
                   length=10) as bar:
        for vt in business_types:
            bar()
            weight_es = Video.objects_all_states.filter(businesses__business__roles__id=vt.id).count()
            weight_businesses = Business.objects.filter(roles__id=vt.id).count()

            # update
            vt.weight_in_videos = weight_es
            vt.weight_in_businesses = weight_businesses
            vt.save()

    # tag weight -- how many event/blog story does a given tag have.

    tags = TagType.objects.all()
    with alive_bar(len(tags), "- event/blog stories weight in tags", bar="blocks", length=10) as bar:
        for tag in tags:
            bar()
            tag.weight_videos = tag.videos.count()
            tag.weight_articles = tag.articles.count()
            tag.weight = tag.weight_videos + tag.weight_articles
            tag.save()

    # business weight -- how many event/blog stories is a given business tagged in?

    businesses = Business.objects.all()
    with alive_bar(len(businesses), "- event/blog stories weight in businesses", bar="blocks", length=10) as bar:
        for business in businesses:
            bar()
            business.weight_videos = VideoBusiness.objects.filter(business=business).count()
            business.weight_articles = business.articles.count()
            business.save()

    # location weight - how many times are given country/state/place objects tagged in event/blog stories or businesses

    countries = Country.objects.all()
    with alive_bar(len(countries), "- country weight in event/blog stories and businesses", bar="blocks",
                   length=10) as bar:

        for country in countries:
            bar()
            country.weight_videos = Video.objects.filter(location__country=country).count()
            country.weight_articles = Article.objects.filter(locations__country__in=[country]).count()
            country.weight_businesses_based_at = Business.objects.filter(business_locations__country=country).count()

            country.weight_businesses_work_at = Video.objects.filter(location__country=country).values(
                'businesses__business__slug').distinct().count()
            country.save()

            set_business_work_at_role_breakdown(country.id, country)
            set_business_based_at_role_breakdown(country.id, country)

    state_provinces = StateProvince.objects.all()
    with alive_bar(len(state_provinces), "- state/province weight in event/blog stories and businesses", bar="blocks",
                   length=10) as bar:

        for state_province in state_provinces:
            bar()
            state_province.weight_videos = Video.objects.filter(
                location__state_province=state_province).count()
            state_province.weight_articles = Article.objects.filter(
                locations__state_province__in=[state_province]).count()
            state_province.weight_businesses_based_at = Business.objects.filter(
                business_locations__state_province=state_province).count()

            state_province.weight_businesses_work_at = Video.objects.filter(
                location__state_province=state_province).values(
                'businesses__business__slug').distinct().count()
            state_province.save()

            set_business_work_at_role_breakdown(state_province.id, state_province)
            set_business_based_at_role_breakdown(state_province.id, state_province)

    counties = County.objects.all()
    with alive_bar(len(counties), "- county weight in event/blog stories and businesses", bar="blocks",
                   length=10) as bar:

        for county in counties:
            bar()
            county.weight_videos = Video.objects.filter(location__county=county).count()
            county.weight_articles = Article.objects.filter(locations__county__in=[county]).count()
            county.weight_businesses_based_at = Business.objects.filter(business_locations__county=county).count()

            county.weight_businesses_work_at = Video.objects.filter(
                location__county=county).values(
                'businesses__business__slug').distinct().count()
            county.save()

            set_business_work_at_role_breakdown(county.id, county)
            set_business_based_at_role_breakdown(county.id, county)

    num_recs = Location.objects.filter(place__isnull=False).count()
    with alive_bar(num_recs, "- city/place weight in event/blog stories and businesses", bar="blocks",
                   length=10) as bar:
        for location in Location.objects.filter(place__isnull=False).iterator():
            bar()
            # how many of it?
            location.place.weight_videos = Video.objects.filter(location__place=location.place).count()
            location.place.weight_articles = Article.objects.filter(locations__place__in=[location.place]).count()
            location.place.weight_businesses_based_at = Business.objects.filter(
                business_locations__place=location.place).count()

            location.place.weight_businesses_work_at = Video.objects.filter(
                location__place=location.place).values(
                'businesses__business__slug').distinct().count()
            location.place.save()

            set_business_work_at_role_breakdown(location.place.id, location.place)
            set_business_based_at_role_breakdown(location.place.id, location.place)

    photos = Photo.objects.all()
    with alive_bar(len(photos), "- business photos weight", bar="blocks",
                   length=10) as bar:
        for photo in photos:
            bar()
            if photo.owner_business:
                photo.owner_business.weight_photos += 1
                photo.owner_business.save()

    # venue type weight in venue businesses
    businesses = Business.objects_all_states.filter(roles__slug__contains='venue')
    with alive_bar(len(businesses), "- venue type weight in venue-businesses", bar="blocks", length=10) as bar:
        for business in businesses:
            bar()
            for venue_type in business.venue_types.all():
                venue_type.weight_business += 1
                venue_type.save()

    # venue type weight in videos
    videos = Video.objects_all_states.all()
    with alive_bar(len(videos), "- venue type weight in event stories", bar="blocks", length=10) as bar:
        for es in videos:
            bar()
            for esv in es.businesses.all():
                if esv.venue_type:
                    esv.venue_type.weight_videos += 1
                    esv.venue_type.save()
