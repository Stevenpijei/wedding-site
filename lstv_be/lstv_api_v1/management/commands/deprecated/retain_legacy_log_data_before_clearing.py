from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):

    def handle(self, *args, **options):

        num_recs = VideoViewLog.objects.filter(legacy_post_id__isnull=True).count()
        with alive_bar(num_recs, "- adding legacy post id to event story view log", bar="blocks", length=10) as bar:
            for log in VideoViewLog.objects.filter(legacy_post_id__isnull=True).iterator():
                log.legacy_post_id = log.video.post.legacy_post_id
                log.save()
                bar()

        num_recs = ArticleViewLog.objects.filter(legacy_post_id__isnull=True).count()
        with alive_bar(num_recs, "- adding legacy post id to blog story view log", bar="blocks", length=10) as bar:
            for log in ArticleViewLog.objects.filter(legacy_post_id__isnull=True).iterator():
                log.legacy_post_id = log.article.post.legacy_post_id
                log.save()
                bar()

        num_recs = VideoViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).count()
        with alive_bar(num_recs, "- adding legacy user id to event story view log", bar="blocks", length=10) as bar:
            for log in VideoViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).iterator():
                log.legacy_user_id = log.user.legacy_user_id
                log.save()
                bar()

        num_recs = ArticleViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).count()
        with alive_bar(num_recs, "- adding legacy user id to blog story view log", bar="blocks", length=10) as bar:
            for log in ArticleViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).iterator():
                log.legacy_user_id = log.user.legacy_user_id
                log.save()
                bar()
