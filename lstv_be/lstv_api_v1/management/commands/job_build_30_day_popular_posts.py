from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv

from lstv_api_v1.utils.utils import job_refresh_most_watched_30d_videos_x_days


class Command(BaseCommand):
    def handle(self, *args, **options):
        job_refresh_most_watched_30d_videos_x_days(LSTV_CACHE_MOST_WATCHED_VIDEOS_30_DAYS, 100 if settings.DEBUG else 30,
                                               True)
