from django.core.management.base import BaseCommand
from django.db.models import Count

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        with alive_bar(DirectoryType.objects.all().count(), "- fixing descs in directories", bar="blocks",
                       length=10) as bar:
            for dir in DirectoryType.objects.all().iterator():
                name = dir.subtitle_name_plural or dir.name
                if name != 'DJs':
                    name = name.lower()
                dir.description = f"Browse and discover {name} by location to find the perfect team for your big day."
                dir.description_location = f"Browse and discover {name} in {{location}} to find the " \
                                           f"perfect team for your big day."
                print(dir.description)
                print(dir.description_location)
                print("---")
                dir.save()
                bar()
