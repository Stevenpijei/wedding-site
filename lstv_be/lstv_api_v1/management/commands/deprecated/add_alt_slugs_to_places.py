from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):

    def handle(self, *args, **options):
        max_len = 0
        with alive_bar(Place.objects.count(), "- setting up alt slugs for different names", bar="blocks",
                       length=10) as bar:
            for place in Place.objects.all().iterator():
                # clear...
                for a in place.alternates.all():
                    a.delete()
                place.alternates.clear()
                # rebuild...
                if place.alt_names_ascii and len(place.alt_names_ascii) > 1:
                    if len(place.alt_names_ascii) > max_len:
                        max_len = len(place.alt_names_ascii)
                    for n in place.alt_names_ascii:
                        p_alt = PlaceAltName(type=PlaceAltType.slug, value=slugify_2(n))
                        p_alt.save()
                        place.alternates.add(p_alt)
                bar()
