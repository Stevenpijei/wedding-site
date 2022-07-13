from django.core.management.base import BaseCommand
from django.db.models import Count, F

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight


class Command(BaseCommand):

    def handle(self, *args, **options):
        print("Cleanup...")
        Country.objects.filter(Q(weight_photos__gt=0)).update(weight_photos=0)
        StateProvince.objects.filter(Q(weight_photos__gt=0)).update(weight_photos=0)
        County.objects.filter(Q(weight_photos__gt=0)).update(weight_photos=0)
        Place.objects.filter(Q(weight_photos__gt=0)).update(weight_photos=0)
        TagType.objects.filter(Q(weight_photos__gt=0)).update(weight_photos=0)

        num_videos = Video.objects.annotate(photo_count=Count('photos')).filter(photo_count__gte=1).count()
        with alive_bar(num_videos, "- location weight of photos", bar="blocks", length=10) as bar:
            for video in Video.objects.annotate(photo_count=Count('photos')).filter(photo_count__gte=1).iterator():
                if video.location:
                    # photos in locations
                    if video.location.country:
                        Country.objects.filter(id=video.location.country.id).update(
                            weight_photos=F('weight_photos') + video.photos.count())
                    if video.location.state_province:
                        StateProvince.objects.filter(id=video.location.state_province.id).update(
                            weight_photos=F('weight_photos') + video.photos.count())
                    if video.location.county:
                        County.objects.filter(id=video.location.county.id).update(
                            weight_photos=F('weight_photos') + video.photos.count())
                    if video.location.place:
                        Place.objects.filter(id=video.location.place.id).update(
                            weight_photos=F('weight_photos') + video.photos.count())

                # photos in tags
                for tag in video.vibes.all():
                    TagType.objects.filter(id=tag.id).update(
                        weight_photos=F('weight_photos') + video.photos.count())

                bar()


