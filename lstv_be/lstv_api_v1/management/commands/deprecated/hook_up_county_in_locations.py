import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):

    # with alive_bar(Place.objects.filter(country__name='United States', county__isnull=True).count(),
    #                "- hooking up all geo_places to geo_counties", bar="blocks", length=10) as bar:
    #     for place in Place.objects.filter(country__name='United States', county__isnull=True).iterator():
    #         if place.county_name:
    #             place.county = County.objects.filter(name=place.county_name).first()
    #             place.save()
    #         bar()

    def handle(self, *args, **options):
        with alive_bar(Location.objects.filter(country__name='United States', county__isnull=True).count(),
                       "- hooking up county for all u.s. cities", bar="blocks", length=10) as bar:
            for location in Location.objects.filter(country__name='United States', county__isnull=True).iterator():
                if location.place and location.place.county:
                    location.county = location.place.county
                    location.save()
                bar()
