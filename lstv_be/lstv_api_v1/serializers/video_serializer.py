import json
import secrets
from datetime import datetime, timezone
from json import JSONDecodeError

from django.db import IntegrityError
from rest_framework import serializers
from lstv_api_v1.models import ContentVerbosityType, Business, VideoBusinessCapacityType, TagType, VideoSource, \
    VideoTypeEnum, VideoPurposeEnum, VideoStatusEnum, Image, ImagePurposeTypes, Post, PostTypeEnum, PostVisibilityEnum, \
    Video, VideoType, VideoVideo, VideoBusiness, Location, Properties, BusinessRoleType, ContentModelState, \
    BusinessSubscriptionLevel, PromoVideo
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.photo_serializer import PhotoSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import VideoBusinessSerializer, PropertySerializer
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.video_source_serializer import VideoSourceSerializer, BusinessVideoSerializer
from lstv_api_v1.utils.aws_utils import aws_s3_move_file_to_another_key, aws_s3_change_file_acl, process_thumbnail_url
from lstv_be.settings import WEB_SERVER_URL, DEFAULT_CDN, DEFAULT_CDN_BUCKET_NAME
from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3
from lstv_api_v1.utils.utils import get_volatile_value, slugify_2, get_location_data_from_url_path, \
    get_location_data_from_url_path_as_object, delete_volatile_value, build_location_from_google_places
from email_validator import validate_email, EmailNotValidError

#  __ __  ____  ___      ___   ___        _____   ___  ____   ____   ____  _      ____  _____    ___  ____
# |  T  |l    j|   \    /  _] /   \      / ___/  /  _]|    \ l    j /    T| T    l    j|     T  /  _]|    \
# |  |  | |  T |    \  /  [_ Y     Y    (   \_  /  [_ |  D  ) |  T Y  o  || |     |  T l__/  | /  [_ |  D  )
# |  |  | |  | |  D  YY    _]|  O  |     \__  TY    _]|    /  |  | |     || l___  |  | |   __jY    _]|    /
# l  :  ! |  | |     ||   [_ |     |     /  \ ||   [_ |    \  |  | |  _  ||     T |  | |  /  ||   [_ |    \
#  \   /  j  l |     ||     Tl     !     \    ||     T|  .  Y j  l |  |  ||     | j  l |     ||     T|  .  Y
#   \_/  |____jl_____jl_____j \___/       \___jl_____jl__j\_j|____jl__j__jl_____j|____jl_____jl_____jl__j\_j

NOT_QUALIFIED_FOR_PUBLIC_OR_UNLISTED = f"The video doesn't meet the minmum data requirements to be public or unlisted." \
                                       f"the minimums are: couple names, wedding date, wedding location and a video"


class VideoSerializer(LSTVBaseSerializer):
    # page 0
    video_upload_token = serializers.CharField(max_length=10, required=True)
    media_id = serializers.CharField(max_length=10, required=False)
    video_type = serializers.CharField(max_length=10, required=False)

    # page 1 - wedding video
    name_spouse_1 = serializers.CharField(min_length=1, max_length=25, required=False)
    name_spouse_2 = serializers.CharField(min_length=2, max_length=25, required=False)
    event_location = serializers.CharField(min_length=5, required=False)
    event_location_google = serializers.JSONField(required=False)
    event_date = serializers.DateField(required=False)
    thumbnail_url = serializers.CharField(required=False)

    # adition: bride email and instagram

    bride_email = serializers.EmailField(required=False, allow_null=True)
    bride_instagram = serializers.CharField(min_length=2, max_length=50, required=False, allow_null=True)

    # page 1 - promo video
    title = serializers.CharField(required=False, max_length=100)

    # page 2

    businesses = serializers.JSONField(required=False)
    tags = serializers.JSONField(required=False)
    content = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    # page 3
    visibility = serializers.ChoiceField(choices=PostVisibilityEnum, required=False)
    draft = serializers.BooleanField(required=False)
    opt_in_for_social = serializers.BooleanField(required=False)
    opt_in_for_paid_partners = serializers.BooleanField(required=False)
    opt_in_for_social_and_paid = serializers.BooleanField(required=False)

    def __init__(self, *args, **kwargs):
        self.reset_internals()
        super().__init__(*args, **kwargs)

    def reset_internals(self):
        self._visibility = PostVisibilityEnum.public
        self._token_value = {}
        self._media_id = None
        self._video_type = 'wedding'
        self._venue = None
        self._businesses = []
        self._tags = []
        self._new_businesses = []
        self._new_tags = []
        self._event_location = None
        self._name_spouse_1 = None
        self._name_spouse_2 = None
        self._bride_instagram = None
        self._bride_email = None
        self._thumbnail_url = None
        self._event_date = None
        self._content = None
        self._title = None
        self._opt_in_for_social_and_paid = False
        self._video_upload_token = None
        self._draft = False

    def get_fields(self, *args, **kwargs):
        fields = super(VideoSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['video_upload_token'].required = method in ['POST']
        return fields

    def public_requirements_verification(self, data, instance=None):
        if instance:
            if instance.purpose == VideoPurposeEnum.video_video:
                video = Video.objects.filter(videos=instance).first()
                if video and video.post:

                    sp1 = video.post.properties.filter(key='spouse_1').first()
                    sp2 = video.post.properties.filter(key='spouse_2').first()

                    if (not sp1 and not self._name_spouse_1) or (not sp2 and not self._name_spouse_2):
                        raise serializers.ValidationError(
                            f"both spouse names must be sent with the request for non-draft")

                    if not video.event_date and not self._event_date:
                        raise serializers.ValidationError(
                            f"event_date must be sent with the request for non-draft")

                    if not video.location and not self._event_location:
                        raise serializers.ValidationError(
                            f"event_location must be sent with the request for non-draft")

                    return True

            if instance.purpose == VideoPurposeEnum.business_promo_video:
                promo_video = PromoVideo.objects.filter(video_source=instance).first()
                if promo_video:
                    if not promo_video.title and not self._title:
                        raise serializers.ValidationError(
                            f"title mist be  sent with the request for non-draft")

                    return True

        else:

            if not any(key in ['media_id', 'video_upload_token'] for key in data):
                raise serializers.ValidationError(
                    f"either media_id or video_upload_token must be sent with the request for non-draft")

            if self._video_type == 'wedding':
                if (not self._name_spouse_1 or not self._name_spouse_2) and self._video_type == 'wedding':
                    raise serializers.ValidationError(
                        f"name_spouse_1 and name_spouse_2 must be sent with the request for non-draft")

                if not self._event_date and self._video_type == 'wedding':
                    raise serializers.ValidationError(
                        f"event_date must be sent with the request  for non-draft")

                if not self._event_location and self._video_type == 'wedding':
                    raise serializers.ValidationError(
                        f"event_location must be sent with the request  for non-draft")

                return True

            if self._video_type == 'promo':
                if not self._title:
                    raise serializers.ValidationError(
                        f"promo video require a title")

                return True

        return False

    def validate(self, data):
        method = getattr(self.request, 'method', None)

        self.reset_internals()

        # page 0

        if 'video_type' in data:
            if data['video_type'] not in ['promo', 'wedding']:
                raise serializers.ValidationError(
                    f"{data['video_type']} is not a valid video_type. use promo or wedding.")
            self._video_type = data['video_type']
            if not self.element.is_premium() and self._video_type == 'promo':
                raise serializers.ValidationError(
                    f"{data['video_type']} videos are a premium feature. {self.element.name} is not a paid business.")

        if 'media_id' in data:
            if VideoSource.objects.filter(media_id=data['media_id']).count() < 1:
                raise serializers.ValidationError(
                    f"{data['media_id']} is not a valid media_id.")
            self._media_id = data['media_id']

        if 'video_upload_token' in data:
            if method == 'POST' and VideoSource.objects.filter(upload_token=data['video_upload_token']).count() > 0:
                raise serializers.ValidationError(
                    f"The video object already exist for this video_upload_token {data['video_upload_token']}. "
                    f"You can PATCH it to make changes.")

            self._video_upload_token = data['video_upload_token']
            self._token_value = get_volatile_value(f"video-upload-{data['video_upload_token']}")
            if not self._token_value:
                raise serializers.ValidationError(f"video_upload_token {data['video_upload_token']} is expired or "
                                                  f"doesn't exist")

            # if not self._token_value.get('media_id'):
            #     raise serializers.ValidationError(f"no media ID exists for this token!")

            # make sure media ID does not exist

            if self._token_value.get('media_id'):
                vs = VideoSource.objects.filter(media_id=self._token_value.get('media_id')).first()
                if vs:
                    raise serializers.ValidationError(f"media_id {self._token_value.get('media_id')} already exists")

        # page 1

        if 'name_spouse_1' in data:
            self._name_spouse_1 = data['name_spouse_1']

        if 'name_spouse_2' in data:
            self._name_spouse_2 = data['name_spouse_2']

        if 'bride_email' in data:
            self._bride_email = data['bride_email']

        if 'bride_instagram' in data:
            self._bride_instagram = data['bride_instagram']


        if 'thumbnail_url' in data:
            self._thumbnail_url = data['thumbnail_url']

        if 'event_date' in data:
            self._event_date = data['event_date']

        if 'event_location' in data:
            self._event_location = get_location_data_from_url_path_as_object(data['event_location'])
            if self._event_location:
                self._event_location.save()
            else:
                raise serializers.ValidationError(
                    f"location {data['event_location']} does not match anything on record")

        if 'event_location_google' in data:
            self._event_location = build_location_from_google_places(data['event_location_google']['google'])

        # page 2

        if 'content' in data:
            self._content = data['content']

        if 'title' in data:
            self._title = data['title']

        if 'businesses' in data:
            for biz in data['businesses']:
                if type(biz) == dict:
                    # name
                    if 'name' in biz.keys():
                        try:
                            b = Business.objects.get(slug=slugify_2(biz['name']))
                            #raise serializers.ValidationError(f"{b.name} already exists")
                        except Business.DoesNotExist:
                            b_obj = {
                                "name": biz['name']
                            }
                            if biz.get('role_slug', None):
                                r = BusinessRoleType.objects.filter(slug=biz['role_slug']).first()
                                if not r:
                                    raise serializers.ValidationError(f"{biz['role_slug']} is an invalid business slug")
                                b_obj['role'] = r
                            if biz.get('email', None):
                                b_obj['email'] = biz['email']
                            self._new_businesses.append(b_obj)

                    # slug + role_capacity for role capacity integration
                    if 'slug' in biz.keys():
                        r = None
                        rc = None
                        try:
                            b = Business.objects.get(slug=biz['slug'])
                            if biz.get('role_slug', None):
                                r = b.roles.filter(slug=biz['role_slug']).first()
                                if not r:
                                    raise serializers.ValidationError(
                                        f"{biz['slug']}/{biz['role_slug']} matches no known business slug/role")
                            if biz.get('role_capacity_slug', None):
                                rc = VideoBusinessCapacityType.objects.filter(slug=biz['role_capacity_slug'],
                                                                              business_role_type=r).first()
                                if not rc:
                                    raise serializers.ValidationError(f"{biz['slug']}/{biz['role_slug']} "
                                                                      f"[{biz['role_capacity_slug']}] matches no known business "
                                                                      f"slug/role [role_capacity]")
                            self._businesses.append({"business": b, "role": r, "role_capacity": rc})
                        except Business.DoesNotExist:
                            raise serializers.ValidationError(f"{biz['slug']} matches no known business slug")
                else:
                    raise serializers.ValidationError(f"businesses must be an array of objects")

        if 'tags' in data:
            for tag in data['tags']:
                if type(tag) == dict:
                    if 'name' in tag.keys():
                        try:
                            t = TagType.objects.get(slug=slugify_2(tag['name']))
                            raise serializers.ValidationError(f"{t.name} already exists")
                        except TagType.DoesNotExist:
                            self._new_tags.append(tag['name'])
                    if 'slug' in tag.keys():
                        try:
                            self._tags.append(TagType.objects.get(slug=tag['slug']))
                        except TagType.DoesNotExist:
                            raise serializers.ValidationError(f"{tag['slug']} matches no tag slug")

                else:
                    raise serializers.ValidationError(f"businesses must be an array of objects")

        # page 3

        if 'visibility' in data:
            self._visibility = data['visibility']

        if 'draft' in data:
            self._draft = data['draft']

        if (
                not self.context_object or self.context_object != 'video') and not self._draft and not self.public_requirements_verification(
                data,
                self.sub_element if self.sub_element else None):
            raise serializers.ValidationError(NOT_QUALIFIED_FOR_PUBLIC_OR_UNLISTED)

        if 'opt_in_for_social_and_paid' in data:
            self._opt_in_for_social_and_paid = data['opt_in_for_social_and_paid']

        return data

    def add_suggested_businesses(self, video):
        for b in self._new_businesses:
            slug = slugify_2(b['name'])
            if Business.objects_all_states.filter(state=ContentModelState.suspended_dmz, slug=slug):
                slug += f"_{secrets.token_hex(6)}_"

            try:
                biz = Business(name=b['name'], slug=slug)
                biz.state = ContentModelState.suspended_dmz
                biz.state_desc = [f"added by {self.element.name} for video: {WEB_SERVER_URL}/{video.post.slug}"]
                biz.subscription_level = BusinessSubscriptionLevel.objects.get(slug='free')
                biz.suggested_email = b.get('email', None)
                biz.suggested_role_type = b.get('role', None)
                biz.suggested_by_business = self.element
                biz.suggested_for_video = video
                biz.save()

                vb = VideoBusiness(business=biz, state=ContentModelState.suspended_dmz,
                                   business_role_type=BusinessRoleType.objects.get(slug='special-event-pet-care'))
                vb.save()
                video.businesses.add(vb)
            except IntegrityError:
                pass


    def add_suggested_tags(self, video):
        for t in self._new_tags:
            slug = slug = slugify_2(t)
            if TagType.objects_all_states.filter(state=ContentModelState.suspended_dmz, slug=slug):
                slug += f"_{secrets.token_hex(6)}_"

            try:
                tag = TagType(name=t, slug=slug)
                tag.state = ContentModelState.suspended_dmz
                tag.state_desc = [f"added by {self.element.name} for video: {WEB_SERVER_URL}/{video.post.slug}"]
                tag.importance = "999999"
                tag.suggested_for_video = video
                tag.suggested_by_business = self.element
                tag.save()
                video.vibes.add(tag)
            except IntegrityError:
                pass

    def create(self, validated_data):

        # thumbnail image

        serve_thumbnail = None
        if self._thumbnail_url:
            thumbnail_url = self._thumbnail_url
        elif self._media_id:
            thumbnail_url = f"https://assets-jpcust.jwpsrv.com/thumbs/{self._media_id}.jpg"
        elif self._token_value and self._token_value.get('media_id', None):
            thumbnail_url = f"https://assets-jpcust.jwpsrv.com/thumbs/{self._token_value.get('media_id')}.jpg"
        else:
            thumbnail_url = "https://lstv-cdn.s3.us-east-2.amazonaws.com/images/site/nothumb.jpg"
            serve_thumbnail = thumbnail_url

        if not serve_thumbnail:
            thumbnail_url =process_thumbnail_url(thumbnail_url)

        i = Image(purpose=ImagePurposeTypes.thumbnail,
                  legacy_url=thumbnail_url,
                  serve_url=serve_thumbnail)
        i.save()

        # only migrate if thise is not a temporary placeholder
        if not i.serve_url:
            job_migrate_image_to_s3.delay(i.id)

        # create video source

        if self._token_value:
            status = get_volatile_value(f"video-status-{self._token_value.get('media_id', None)}")
            ready = status and status.get('state', None) == 'complete'
        else:
            if self._media_id:
                ready = True
            else:
                ready = False

        vs = VideoSource(
            uploader=self.request.user,
            owner_business=self.element,
            filename=self._token_value.get('filename', None) if self._token_value else None,
            type=VideoTypeEnum.jwplayer,
            purpose=VideoPurposeEnum.business_promo_video if self._video_type == 'promo' else VideoPurposeEnum.video_video,
            source_url=f"{DEFAULT_CDN}/videos/originals/{self._token_value.get('filename', None)}" if self._token_value else None,
            status=VideoStatusEnum.ready if ready else VideoStatusEnum.encoding,
            uploaded_at=self._token_value.get('uploaded_at', None) if self._token_value else datetime.now().replace(
                tzinfo=timezone.utc),
            process_started_at=self._token_value.get('uploaded_at', None) if self._token_value else None,
            process_complete_at=datetime.now().replace(tzinfo=timezone.utc),
            media_id=self._token_value.get('media_id', None) if self._token_value else self._media_id,
            upload_token=validated_data.get('video_upload_token', None),
            thumbnail=i)
        vs.save()

        if self._video_type == 'promo':
            pv = PromoVideo(business=self.element,
                            visibility=self._visibility,
                            video_source=vs,
                            title=self._title,
                            opt_in_for_social_and_paid=self._opt_in_for_social_and_paid,
                            description=self._content,
                            is_draft=self._draft)
            pv.save()
            return {
                "business_id": self.element.id,
                "id": vs.id,
                "video_type": self._video_type,
                'object': BusinessVideoSerializer().to_representation(vs)
            }

        if self._video_type == 'wedding':

            # create post

            if self._name_spouse_1 and self._name_spouse_2 and self._event_date:
                requested_slug = f"{validated_data['name_spouse_1'].lower()}-{validated_data['name_spouse_2'].lower()}-" \
                                 f"wedding-video-{validated_data['event_date'].strftime('%B').lower()}-" \
                                 f"{validated_data['event_date'].year}"
            else:
                requested_slug = f"draft-{vs.id}-{self.element.slug}"

            # existing post?

            if Post.objects.filter(slug=requested_slug).count() > 0:
                post_slug_appendix = 1
                while True:
                    if Post.objects.filter(slug=f"{requested_slug}-{post_slug_appendix}").count() > 0:
                        post_slug_appendix += 1
                    else:
                        requested_slug = f"{requested_slug}-{post_slug_appendix}"
                        break

            p = Post(slug=requested_slug,
                     type=PostTypeEnum.video,
                     visibility=self._visibility,
                     author=self.request.user)
            p.slug = slugify_2(p.slug)
            p.save()

            # post props, namely couple's name

            if self._name_spouse_1:
                sp1 = Properties(key='spouse_1', value_text=validated_data['name_spouse_1'])
                sp1.save()
                p.properties.add(sp1)
            if self._name_spouse_2:
                sp2 = Properties(key='spouse_2', value_text=validated_data['name_spouse_2'])
                sp2.save()
                p.properties.add(sp2)

            # bride email/instagram

            if self._bride_email:
                be = Properties(key='bride_email', value_text=validated_data['bride_email'])
                be.save()
                p.properties.add(be)
            if self._bride_instagram:
                bi = Properties(key='bride_instagram', value_text=validated_data['bride_instagram'])
                bi.save()
                p.properties.add(bi)

            # create video

            if self._name_spouse_2 and self._name_spouse_2:
                if self._event_location:
                    title = f"{validated_data['name_spouse_1']} + {validated_data['name_spouse_2']} | " \
                            f"{str(self._event_location)}"
                else:
                    title = f"{validated_data['name_spouse_1']} + {validated_data['name_spouse_2']}"
            else:
                title = str(vs.id)

            v = Video(event_date=self._event_date,
                      visibility=self._visibility,
                      title=title,
                      content=validated_data.get('content', None),
                      type=VideoType.objects.get(slug='wedding-ceremony-and-reception'),
                      post=p,
                      is_draft=self._draft,
                      location=self._event_location,
                      opt_in_for_social=self._opt_in_for_social_and_paid,
                      opt_in_for_paid_partners=self._opt_in_for_social_and_paid)
            v.save()

            # add videoSource to video

            vv = VideoVideo(video_source=vs, video=v, title=v.title)
            vv.save()

            # add venue to businesses

            if self._venue:
                vb = VideoBusiness(business=self._venue, business_role_type=self._venue.roles.first())
                vb.save()
                v.businesses.add(vb)


            # add businesses to video

            for b in self._businesses:
                vb = VideoBusiness(business=b['business'], business_role_type=b['role'] or b['business'].roles.first())
                vb.save()
                v.businesses.add(vb)

            # adding the uploader, but only if he/she doesn't exist already.

            if self.element and v.businesses.filter(business=self.element).count == 0:
                vb = VideoBusiness(business=self.element,
                                   business_role_type=self.element.roles.filter(slug='videographer').first())
                vb.save()
                v.businesses.add(vb)

            # add tags to video
            for t in self._tags:
                v.vibes.add(t)

            # deal with new business suggestions
            self.add_suggested_businesses(v)

            # deal with new tag suggestions
            self.add_suggested_tags(v)

            # delete tokens

            if self._visibility in [PostVisibilityEnum.public,
                                    PostVisibilityEnum.unlisted] and self._token_value and self._token_value.get(
                'media_id', None):
                delete_volatile_value(f"video-upload-{validated_data['video_upload_token']}")
                delete_volatile_value(f"video-status-{self._token_value.get('media_id', None)}")

            # return the url
            return {
                "business_id": self.element.id,
                "id": vs.id,
                "video_id": v.id,
                "video_type": self._video_type,
                'video_url': f"{WEB_SERVER_URL}/{p.slug}" if self._visibility in [PostVisibilityEnum.public,
                                                                                  PostVisibilityEnum.unlisted] and
                                                             not self._draft and self._name_spouse_1 and
                                                             self._name_spouse_2 and self._event_date and
                                                             self._event_location else None,
                'object': BusinessVideoSerializer().to_representation(vs)}

    def update(self, instance, validated_data):
        instance_save_required = False

        if type(instance) == VideoSource:
            if instance.purpose == VideoPurposeEnum.video_video:
                video_save_required = False
                video = Video.objects.filter(videos=instance).first()
                if video and video.post:
                    # couple names

                    if 'name_spouse_1' in validated_data:
                        video.post.properties.filter(key='spouse_1').delete(hard=True)
                        sp1 = Properties(key='spouse_1', value_text=validated_data['name_spouse_1'])
                        sp1.save()
                        video.post.properties.add(sp1)

                    if 'name_spouse_2' in validated_data:
                        video.post.properties.filter(key='spouse_2').delete(hard=True)
                        sp2 = Properties(key='spouse_2', value_text=validated_data['name_spouse_2'])
                        sp2.save()
                        video.post.properties.add(sp2)

                    # bride's email + instagram

                    if 'bride_email' in validated_data:
                        video.post.properties.filter(key='bride_email').delete(hard=True)
                        if validated_data['bride_email']:
                            be = Properties(key='bride_email', value_text=validated_data['bride_email'])
                            be.save()
                            video.post.properties.add(be)

                    if 'bride_instagram' in validated_data:
                        video.post.properties.filter(key='bride_instagram').delete(hard=True)
                        if  validated_data['bride_instagram']:
                            bi = Properties(key='bride_instagram', value_text=validated_data['bride_instagram'])
                            bi.save()
                            video.post.properties.add(bi)

                    # existing + new  businesses

                    if 'businesses' in validated_data:
                        if type(self.element) == Business:
                            VideoBusiness.objects_all_states.filter(videos=video).exclude(
                                business=self.element).delete()
                        else:
                            VideoBusiness.objects_all_states.filter(videos=video).delete()
                        for b in self._businesses:
                            vb = VideoBusiness(business=b['business'], business_capacity_type=b['role_capacity'],
                                               business_role_type=b['role'] or b['business'].roles.first())
                            vb.save()
                            video.businesses.add(vb)

                        if type(self.element) == Business:
                            Business.objects_all_states.filter(state=ContentModelState.suspended_dmz,
                                                               suggested_by_business=self.element,
                                                               suggested_for_video=video).delete()

                            self.add_suggested_businesses(video)

                        # tags (existing)
                        video.vibes.clear()

                    if 'tags' in validated_data:
                        video.vibes.clear()
                        for t in self._tags:
                            video.vibes.add(t)

                        # tags (new/suggested)
                        TagType.objects_all_states.filter(state=ContentModelState.suspended_dmz,
                                                          suggested_by_business=self.element,
                                                          suggested_for_video=video).delete()
                        self.add_suggested_tags(video)

                    # event_date
                    if 'event_date' in validated_data:
                        video.event_date = self._event_date
                        video_save_required = True

                    # location
                    if 'event_location' in validated_data or 'event_location_google' in validated_data:
                        video.location = self._event_location
                        video_save_required = True

                    # content
                    if 'content' in validated_data:
                        video.content = self._content
                        video_save_required = True

                    # opt_in_for_social_and_paid
                    if 'opt_in_for_social_and_paid' in validated_data:
                        video.opt_in_for_paid_partners = self._opt_in_for_social_and_paid
                        video.opt_in_for_social = self._opt_in_for_social_and_paid
                        video_save_required = True

                    # thumbnail_url

                    if 'thumbnail_url' in validated_data:
                        if instance.thumbnail and instance.thumbnail.legacy_url != validated_data['thumbnail_url'] and \
                                instance.thumbnail.serve_url != validated_data['thumbnail_url']:
                            thumbnail_url = process_thumbnail_url(self._thumbnail_url)
                            instance.thumbnail.legacy_url = thumbnail_url
                            instance.thumbnail.serve_url = None
                            instance.thumbnail.save()
                            job_migrate_image_to_s3.delay(instance.thumbnail.id)

                    # draft
                    if 'draft' in validated_data:
                        video.is_draft = self._draft
                        video_save_required = True

                    # visibility
                    if 'visibility' in validated_data:
                        video.visibility = self._visibility
                        video.post.visibility = self._visibility
                        video.post.save()
                        video_save_required = True

                    if video_save_required:
                        video.save()
                    if instance_save_required:
                        instance.save()

                    # any title/slug changes? if so, apply them.
                    if any(key in ['name_spouse_1', 'name_spouse_2', 'event_date'] for key in validated_data):

                        sp1 = self._name_spouse_1 or video.post.properties.filter(key='spouse_1').values_list(
                            'value_text', flat=True).first()
                        sp2 = self._name_spouse_2 or video.post.properties.filter(key='spouse_2').values_list(
                            'value_text', flat=True).first()

                        ed = self._event_date or video.event_date
                        loc = str(self._event_location or video.location)

                        new_slug = f"{sp1.lower()}-{sp2.lower()}-" \
                                   f"wedding-video-{ed.strftime('%B').lower()}-" \
                                   f"{ed.year}"
                        video.post.slug = new_slug
                        video.post.save()

                        if loc:
                            title = f"{sp1} + {sp2} | {loc}"
                        else:
                            title = f"{sp1} + {sp2}"

                        video.title = title
                        video.save()

                    return {"id": instance.id,
                            'object': BusinessVideoSerializer().to_representation(instance)
                            }
            elif instance.purpose == VideoPurposeEnum.business_promo_video:
                promo_video = PromoVideo.objects.filter(video_source=instance).first()
                if promo_video:
                    promo_video_save_required = False

                    # title

                    if 'title' in validated_data:
                        promo_video.title = self._title
                        promo_video_save_required = True

                    # content

                    if 'content' in validated_data:
                        promo_video.content = self._content
                        promo_video_save_required = True

                    # content

                    if 'opt_in_for_social_and_paid' in validated_data:
                        promo_video.opt_in_for_social_and_paid = self._opt_in_for_social_and_paid
                        promo_video_save_required = True

                    # thumbnail_url
                    if 'thumbnail_url' in validated_data:
                        thumbnail_url = process_thumbnail_url(self._thumbnail_url)
                        if instance.thumbnail:
                            instance.thumbnail.legacy_url = thumbnail_url
                            instance.thumbnail.serve_url = None
                            instance.thumbnail.save()
                            job_migrate_image_to_s3.delay(instance.thumbnail.id)

                    # draft
                    if 'draft' in validated_data:
                        promo_video.is_draft = self._draft
                        promo_video_save_required = True

                    # visibility
                    if 'visibility' in validated_data:
                        promo_video.visibility = self._visibility
                        promo_video_save_required = True

                    if promo_video_save_required:
                        promo_video.save()

                    return {"id": instance.id,
                            'object': BusinessVideoSerializer().to_representation(instance)
                            }

    def to_representation(self, obj):
        data = {}

        if self.verbosity == ContentVerbosityType.slug:
            return {'slug': obj.post.slug}

        owner = None

        if obj.videos.count() > 0:
            vs = obj.videos.first()
            owner = vs.owner_business.name if vs.owner_business else None

        try:
            location = LocationSerializer().to_representation(obj.location)
        except Location.DoesNotExist:
            location = []

        videos = VideoSourceSerializer(many=True).to_representation(obj.get_videos())

        if self.verbosity in [ContentVerbosityType.administration, ContentVerbosityType.admin_list]:
            rc = {
                'id': obj.id,
                'slug': obj.post.slug,
                'visibility': str(obj.post.visibility),
                'draft': obj.is_draft,
                'created_at': obj.created_at.strftime('%Y-%m-%d'),
                'title': obj.title,
                'thumbnail_url': obj.get_thumbnail_url(),
                'event_date': obj.event_date,
                'location': str(obj.location),
                'owner': owner,
                'views': obj.views,
                'likes': obj.likes,
                'num_photos': obj.photos.count(),
                'tags': obj.get_all_public_tags_as_text(),
                'num_q_and_a': obj.q_and_a.count(),
            }

            if self.scope in [ContentModelState.active_review, ContentModelState.suspended_review,
                              ContentModelState.suspended]:
                try:
                    rc["issue"] = json.loads(obj.state_desc[0]).get('issue', None) if obj.state_desc else None
                except JSONDecodeError:
                    rc["issue"] = None
            if self.scope == ContentModelState.deleted:
                rc['deleted_at'] = obj.deleted_at

            return rc

        full_wedding_team = sorted(VideoBusinessSerializer(many=True).to_representation(obj.get_businesses(
            None)), key=lambda k: (not k['premium'], -k['weight']))

        video_premium = False
        for wtm in full_wedding_team:
            if wtm['premium']:
                video_premium = True
                break

        if not self.verbosity or self.verbosity == ContentVerbosityType.full:
            wedding_team = full_wedding_team
        elif self.verbosity and self.verbosity == ContentVerbosityType.card:
            wedding_team = sorted(VideoBusinessSerializer(many=True).to_representation(obj.get_businesses(
                ['videographer', 'venue'])), key=lambda k: (not k['premium'], -k['weight']))
        elif self.verbosity and self.verbosity == ContentVerbosityType.slug:
            return {'slug': obj.post.slug}

        vibes = TagTypeSerializer(many=True).to_representation(obj.get_public_vibes())
        tags = TagTypeSerializer(many=True).to_representation(obj.get_public_tags())
        properties = PropertySerializer(many=False).to_representation(obj.properties)
        photos = PhotoSerializer(many=True).to_representation(obj.get_photos())
        shopping = ShoppingItemSerializer(many=True).to_representation(obj.shopping_items)

        return {
            'id': obj.id,
            'obj_type': "video",
            'premium': video_premium,
            'event_date': obj.event_date,
            'draft': obj.is_draft,
            'visibility': str(obj.post.visibility),
            'created_at': obj.created_at.strftime('%Y-%m-%d'),
            'title': obj.title,
            'location': location,
            'businesses': wedding_team,
            'thumbnail': obj.get_thumbnail_url(),
            'content': obj.content,
            'type': obj.type.slug,
            'short_url_token': obj.set_short_url_token(),
            'views': obj.views,
            'likes': obj.likes,
            'shares': obj.shares,
            'vibes': vibes + tags,
            'tags': tags,
            'shopping': shopping,
            'q_and_a': InPageMessagingSerializer(request=self.request).to_representation(obj.q_and_a),
            'properties': properties,
            'videosSources': videos,
            'photos': photos,
            'slug': obj.post.slug,
            'post_properties': PropertySerializer(many=False).to_representation(obj.post.properties.exclude(
                key__contains='legacy_'))
        }
