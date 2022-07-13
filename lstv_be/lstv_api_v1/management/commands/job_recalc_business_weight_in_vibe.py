from django.core.management.base import BaseCommand
from django.db.models import Count, F

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        print("Cleanup...")

        TagType.objects.filter(Q(weight_businesses__gt=0)).update(weight_businesses=0)

        with alive_bar(TagType.objects.count(), "- businesses weight in tags",bar="blocks", length=10) as bar:
            for tag in TagType.objects.iterator():
                businesses = {}
                # obtain all videos where this tag is used
                videos = Video.objects.filter(vibes__in=[tag]).count()
                # build list of all unique IDs
                for video in Video.objects.filter(vibes__in=[tag]):
                    for business in video.businesses.all():
                        businesses[business.business.slug] = 0
                #print(f"{tag.name} - {videos} videos - {len(businesses.keys())} businesses (unique)")
                tag.weight_businesses = len(businesses.keys())
                tag.save()
                bar()

