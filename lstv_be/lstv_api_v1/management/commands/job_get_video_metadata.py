from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight
from lstv_api_v1.utils.utils import get_jwplayer_video_state, verify_youtube_video, verify_vimeo_video


class Command(BaseCommand):

    def handle(self, *args, **options):
        with alive_bar(VideoSource.objects.filter(Q(type=VideoTypeEnum.jwplayer) & (
                Q(duration__isnull=True) | Q(size__isnull=True) | Q(height__isnull=True) | Q(
            width__isnull=True))).count(), "- fetching video width/height/size/duration from sources",
                       bar="blocks", length=10) as bar:
            for video in VideoSource.objects.filter(Q(type=VideoTypeEnum.jwplayer) & (
                    Q(duration__isnull=True) | Q(size__isnull=True) | Q(height__isnull=True) | Q(
                width__isnull=True))):
                bar()
                duration = None
                size = None
                height = None
                width = None
                exists = True

                print(f"{video.type} {video.media_id}")

                if video.type == VideoTypeEnum.jwplayer:
                    state = get_jwplayer_video_state(video.media_id)
                    duration = state.get('duration', None)
                    size = state.get('size', None)
                    height = state.get('height', None)
                    width = state.get('width', None)
                    exists = state.get('exists', True)
                if video.type == VideoTypeEnum.youtube:
                    success, duration = verify_youtube_video(video.media_id)
                if video.type == VideoTypeEnum.vimeo:
                    success, duration = verify_vimeo_video(video.media_id)

                if exists:
                    if duration:
                        video.duration = int(float(duration))
                    video.size = size
                    video.width = width
                    video.height = height
                else:
                    video.state = ContentModelState.suspended_review
                    video.state_desc = ["JWP Claims media ID does not exist"]

                print(f"{video.type} {video.media_id} --- DONE")
                video.save()
