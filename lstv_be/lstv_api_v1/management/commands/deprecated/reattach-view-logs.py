from django.core.management.base import BaseCommand
from lstv_api_v1.tasks.tasks import job_reattach_view_log_entry
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar


class Command(BaseCommand):
    def handle(self, *args, **options):
        num_recs = VideoViewLog.objects.filter(legacy_post_id__isnull=False, video__isnull=True).count()
        with alive_bar(num_recs, "- reattaching event story view log", bar="blocks", length=10) as bar:
            for log in VideoViewLog.objects.filter(legacy_post_id__isnull=False, video__isnull=True).iterator():
                job_reattach_view_log_entry.delay(log.id, 'video', log.legacy_post_id, log.legacy_user_id)
                bar()

        num_recs = ArticleViewLog.objects.filter(legacy_post_id__isnull=False, article__isnull=True).count()
        with alive_bar(num_recs, "- reattaching blog story view log", bar="blocks", length=10) as bar:
            for log in ArticleViewLog.objects.filter(legacy_post_id__isnull=False, article__isnull=True).iterator():
                job_reattach_view_log_entry.delay(log.id, 'article', log.legacy_post_id, log.legacy_user_id)
                bar()
