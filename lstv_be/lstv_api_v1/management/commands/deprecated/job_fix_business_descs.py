from django.core.management.base import BaseCommand
from django.db.models import Count

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        with alive_bar(Business.objects.all().count(), "- fixing business descs", bar="blocks", length=10) as bar:
            for business in Business.objects.all().iterator():
                if business.description:
                    if business.description.replace("\\n", "").replace("\\r", "").replace("  ",
                                                                                          " ") != business.description:
                        business.description = business.description.replace("\\n", "").replace("\\r", "").replace("  ",
                                                                                                                  " ")
                        business.save()
                bar()
