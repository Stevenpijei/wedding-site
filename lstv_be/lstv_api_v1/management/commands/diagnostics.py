import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):

        # Video -> Detached Video Source

        num_video_short_code = 0
        with alive_bar(Video.objects_all_states.filter(videos__isnull=True).count(),
                       "- Video -> Video Source", length=10, bar="blocks") as bar:
            for vid in Video.objects_all_states.filter(videos__isnull=True).iterator():
                # try to match with lstv1 data
                if vid.post.legacy_post_id:
                    cursor = connections['migrate'].cursor()
                    cursor.execute(
                        f"select * from postmeta where post_id = {vid.post.legacy_post_id}")

                    result = get_dict(cursor)
                    cursor.close()

                    if len(result) > 0:
                        video_type = "unknown"
                        media_id = None
                        video_thumbnail = None
                        for r in result:
                            if 'meta_key' in r and r['meta_key'] == 'video_type':
                                video_type = r['meta_value']
                        for r in result:
                            if 'meta_key' in r and r['meta_key'] == 'video_short_code' and r['meta_value'] and r[
                                'meta_value'] != "":
                                media_id = r['meta_value']

                        if not media_id:
                            for r in result:
                                if 'meta_key' in r and r['meta_key'] == 'dp_video_url' and r['meta_value'] and r[
                                    'meta_value'] != "":
                                    media_id = r['meta_value']

                        if media_id:
                            owner_business = None
                            uploader = None
                            # get owner business
                            vb = vid.businesses.filter(business_role_type__slug='videographer').first()
                            if vb:
                                owner_business = vb.business
                                up = BusinessTeamMember.objects.filter(business=owner_business).order_by(
                                    'created_at').first()
                                if up:
                                    uploader = up.user

                            for r in result:
                                if 'meta_key' in r and r['meta_key'] in ['video_poster_image', 'dp_video_poster']:
                                    video_thumbnail = r['meta_value']

                            if '[jwplayer' in media_id:
                                media_id = media_id.replace("[jwplayer ", "").replace("]", "")
                                video_type = 'jwplayer'

                            if 'https://vimeo.com/' in media_id:
                                video_type = 'vimeo'
                                media_id = media_id.replace("https://vimeo.com/", "")

                            if video_type == 'jwplayer':
                                image = Image(
                                    legacy_url=video_thumbnail or f"https://content.jwplatform.com/thumbs/{vs.media_id}.jpg",
                                    purpose=ImagePurposeTypes.thumbnail)
                                image.save()

                                vs = VideoSource(type=VideoTypeEnum.jwplayer, thumbnail=image,
                                                 media_id=media_id,
                                                 status=VideoStatusEnum.ready,
                                                 owner_business=owner_business,
                                                 uploader=uploader)
                                vs.save()
                                vid.videos.add(vs)

                            if video_type == 'vimeo':
                                image = Image(
                                    legacy_url=video_thumbnail or "https://cdn.lovestoriestv.com/images/site/nothumb.jpg",
                                    purpose=ImagePurposeTypes.thumbnail)
                                image.save()

                                vs = VideoSource(type=VideoTypeEnum.vimeo, thumbnail=image,
                                                 media_id=media_id,
                                                 status=VideoStatusEnum.ready,
                                                 owner_business=owner_business,
                                                 uploader=uploader)
                                vs.save()
                                vid.videos.add(vs)

                            if video_type == 'unknown':
                                print("---unknown---")
                                vid.post.state = ContentModelState.suspended_review
                                vid.post.state_desc = ["no video source"]
                                vid.post.save()
                                vid.state = ContentModelState.suspended_review
                                vid.stat_desc = [{"issue": "No video source", "resolved": False, "key": "no_video_source"}]
                                vid.save()

                            print(f"{vid.post.slug} - {video_type} -- {media_id} -- {video_thumbnail}")

                bar()
        print(f"{num_video_short_code} have num_video_short_code")
        exit()

        # Video Sources without business Owner

        bot = 0
        bot_found = 0
        non_business = 0
        non_business_found = 0
        with alive_bar(VideoSource.objects.filter(owner_business__isnull=True).count(),
                       "- Video Sources without owner business", length=10, bar="blocks") as bar:
            for vs in VideoSource.objects.filter(owner_business__isnull=True).all().iterator():

                if vs.uploader and vs.uploader.user_type == UserTypeEnum.bot:
                    bot += 1
                    vid = Video.objects.filter(videos=vs).first()
                    if vid:
                        filmamker = vid.businesses.filter(business_role_type__slug='videographer').first()
                        if filmamker:
                            vs.owner_business = filmamker.business
                            vs.save()
                            bot_found += 1
                    if vid and vid.post and vid.post.author:
                        print(vid.post.author.email)
                        bot_found += 1
                else:
                    non_business += 1
                bar()

        print(f"bots: {bot} (salvaged: {bot_found})   non_business: {non_business} (salvaged {non_business_found})")

        # businesses -> locations

        with alive_bar(Business.objects.count(), "businesses -> locations", length=10, bar="blocks") as bar:
            for biz in Business.objects.filter(slug='canvas-vale').iterator():
                print(biz.business_locations.all())
                for bl in biz.business_locations.all():
                    print(bl.id)
                    try:
                        i = bl.id
                    except Location.DoesNotExist:
                        try:
                            biz_loc = Location.objects_all_states.get(pk=bl.id)
                            print(f"Video {biz_loc.id} -> missing VideoSource {biz_loc.id}  -- ROOT CAUSE "
                                  f"{biz_loc.state} - {biz_loc.state_desc}")
                            # ww.id = uuid.uuid4()
                            # ww.state = b.state
                            # ww.state_desc = b.state_desc
                            # ww.save()
                        except VideoSource.DoesNotExist:
                            print(f"business {biz.id} -> hard deleted VideoSource {bl.id}")
                            # ww.id = uuid.uuid4()
                            # ww.delete()

                bar()

        # Video -> Detached Video Source

        with alive_bar(Video.objects.count(),
                       "- Video -> Video Source", length=10, bar="blocks") as bar:
            for vid in Video.objects.all().iterator():
                for vs in vid.videos.all():
                    try:
                        i = vs.id
                    except VideoSource.DoesNotExist:
                        try:
                            vso = VideoSource.objects_all_states.get(pk=vs.video_source_id)
                            print(f"Video {vid.id} -> missing VideoSource {vso.id}  -- ROOT CAUSE "
                                  f"{vso.state} - {vso.state_desc}")
                        except VideoSource.DoesNotExist:
                            print(f"Video {vid.id} -> hard deleted VideoSource {vso.id}")

                bar()

        # WeightedWorksWith -> Business

        with alive_bar(WeightedWorksWith.objects.count(),
                       "- WeightedWorksWith -> Business", length=10, bar="blocks") as bar:
            for ww in WeightedWorksWith.objects.all().iterator():
                if ww.business_a_id:
                    try:
                        f = ww.business_a.slug
                    except Business.DoesNotExist:
                        try:
                            b = Business.objects_all_states.get(pk=ww.business_a_id)
                            print(f"(a) works with {ww.id} - business_id missing {ww.business_a_id} -- ROOT CAUSE "
                                  f"{b.state} - {b.state_desc}")
                            ww.state = b.state
                            ww.state_desc = b.state_desc
                            ww.save()
                        except Business.DoesNotExist:
                            print(f"(a) works with {ww.id} - business_id missing {ww.business_a_id} -- Business "
                                  f"deleted")
                            ww.delete()

                if ww.business_b_id:
                    try:
                        f = ww.business_a.slug
                    except Business.DoesNotExist:
                        try:
                            b = Business.objects_all_states.get(pk=ww.business_a_id)
                            print(f"(b) works with {ww.id} - business_id missing {ww.business_a_id} -- ROOT CAUSE "
                                  f"{b.state} - {b.state_desc}")
                            ww.id = uuid.uuid4()
                            ww.state = b.state
                            ww.state_desc = b.state_desc
                            ww.save()
                        except Business.DoesNotExist:
                            print(f"(b) works with {ww.id} - business_id missing {ww.business_a_id} -- Business "
                                  f"deleted")
                            ww.id = uuid.uuid4()
                            ww.delete()

                bar()

        # Video -> Post

        with alive_bar(Video.objects.count(),
                       "- Video -> Post", length=10, bar="blocks") as bar:
            for video in Video.objects.all():
                p = None
                if video.post_id:
                    try:
                        p = video.post
                    except:
                        try:
                            p = Post.objects_all_states.get(pk=video.post_id)
                            print(
                                f"Video {video.id} ({video.created_at}) ({video.state}) -- missing post id: "
                                f"{video.post_id} -- ROOT CAUSE: {p.state}-{p.state_desc}")
                        except Post.DoesNotExist:
                            print(f"Video {video.id} ({video.created_at}) ({video.state}) -- "
                                  f"missing post id: {video.post_id} -- ROOT CAUSE: Post ID physically missing "
                                  f"from database")

                        # remedy
                        #
                        # 1. make video same status as post (or deleted if the post does not exist)
                        # 2. references in VideoVideo

                        if p:
                            video.state = p.state
                            video.state_desc = p.state_desc
                            video.save()
                        else:
                            video.delete()

                bar()

        # VideoSource -> Image (thumbnail)

        with alive_bar(VideoSource.objects.count(),
                       "- VideoSource -> Image (thumbnail)", length=10, bar="blocks") as bar:
            for video_source in VideoSource.objects.all():
                if video_source.thumbnail_id:
                    try:
                        s = video_source.thumbnail.get_serve_url()
                    except:
                        print(f"video_source {video_source.id} -- missing thumbnail id: {video_source.thumbnail_id}")

                bar()

        # VideoSource -> VideoVideo

        with alive_bar(VideoSource.objects.count(),
                       "- VideoSource -> VideoVideo", length=10, bar="blocks") as bar:
            for video_source in VideoSource.objects.all():
                vid = VideoVideo.objects.filter(video_source=video_source).first()
                v = None
                if vid:
                    if vid.video_id:
                        try:
                            id = vid.video.id
                        except:

                            try:
                                v = Video.objects_all_states.get(pk=vid.video_id)
                                print(f"videoSource {video_source.id} referred in VideoVideo which refers "
                                      f"missing Video ID {vid.video_id} ({v.state}--{v.state_desc})")
                            except Video.DoesNotExist:
                                print(f"videoSource {video_source.id} referred in VideoVideo which refers "
                                      f"Video ID {vid.video_id} not in database")
                            # remedy
                            if v:
                                video_source.state = v.state
                                video_source.state_desc = v.state_desc
                                video_source.save()
                            else:
                                video_source.delete()

                    else:
                        print(f"video_source {video_source.id} referred from video_video but has no video.id")
                bar()
