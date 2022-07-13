from django.core.management.base import BaseCommand
from django.db.models import Count

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        with alive_bar(DirectoryType.objects.all().count(), "- fixing bg_color in directories", bar="blocks",
                       length=10) as bar:
            for directory in DirectoryType.objects.all().iterator():
                if directory.role_types.count() == 1:
                    new_bg_color = "#000000"
                    brt = directory.role_types.first()
                    if brt.bg_color and brt.bg_color != directory.bg_color:
                        print(f"{directory.slug} - changed from {directory.bg_color} to {brt.bg_color}")
                        directory.bg_color = brt.bg_color
                        directory.save()
                bar()
