from django.core.management.base import BaseCommand
from django.db.models import Count, F

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        #businesses = Business.objects.filter(slug='the-neskes')
        businesses = Business.objects.all()
        with alive_bar(businesses.count(), "- biz serve location rebuild",bar="blocks", length=10) as bar:
            for business in businesses.iterator():
                business.rebuild_worked_at_location_cache()
                bar()

