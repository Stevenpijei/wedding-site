from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.tasks.tasks import job_build_video_preview, job_migrate_image_to_s3
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Image.objects.filter(Q(serve_url=None) | Q(serve_url__icontains=".tif")).exclude(
                    legacy_url='n/a').count(), "- migrate images to s3", length=10,
                       bar="blocks") as bar:
            for image in Image.objects.filter(Q(serve_url=None) | Q(serve_url__icontains=".tif")).exclude(
                    legacy_url='n/a').iterator():
                job_migrate_image_to_s3.delay(image.id)
                bar()
