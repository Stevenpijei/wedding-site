from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        locations = Location.objects.filter(sanitized=False)
        with alive_bar(locations.count(), "- sanitizing addresses...", bar="blocks", length=10) as bar:
            for location in locations:
                bar()

        locations = Location.objects.filter(
            Q(state_province__isnull=True) | Q(country__isnull=True) | Q(county__isnull=True))
        with alive_bar(locations.count(), "- filling addresses...", bar="blocks", length=10) as bar:
            for location in locations:
                if location.place and not location.state_province:
                    if location.place.state_province:
                        location.state_province = location.place.state_province
                        print(f" fixed no state_province: {location}")
                        location.save()
                if location.state_province and not location.country:
                    location.country = location.state_province.country
                    print(f"fixed: no country: {location}")
                    location.save()
                if location.place and not location.county:
                    if location.place.county:
                        location.county = location.place.county
                        print(f"fixed: no county ({location.county.name}): {location}")
                        location.save()
                bar()
