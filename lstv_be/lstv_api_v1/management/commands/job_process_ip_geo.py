from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.utils import get_location_for_ip


class Command(BaseCommand):

    def handle(self, *args, **options):
        no_geo_records = IPAddress.objects.filter(ip__isnull=False, processed=False)[0:10000]
        with alive_bar(no_geo_records.count(), "- IP to location", bar="blocks", length=10) as bar:
            for no_geo_record in no_geo_records:
                get_location_for_ip(no_geo_record)
                bar()
