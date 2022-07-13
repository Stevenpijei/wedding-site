from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        job_recalc_weight()
