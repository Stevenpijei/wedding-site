from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.tasks.tasks import job_build_video_preview
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    def handle(self, *args, **options):
        count = VideoSource.objects_all_states.filter(preview_gif_url=None).count()

        with alive_bar(count, "- building previews", length=10, bar="blocks") as bar:
            for video in VideoSource.objects_all_states.filter(preview_gif_url=None).iterator():
                job_build_video_preview.delay(video.id)
                bar()
