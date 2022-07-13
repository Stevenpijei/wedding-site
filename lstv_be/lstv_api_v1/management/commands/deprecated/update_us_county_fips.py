import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    countries = {}
    states_provinces = {}
    place_ids = {}

    def process_geo_csv_row(self, item):

        for k in item.keys():
            if item[k] == '':
                item[k] = None

        if 'county_fips' in item:
            # # print(item['county_name'] + " - " +  item['county_fips'] + " " + item['state_id'])

            county = County.objects.filter(name=item['county_name'], state_province__code=item['state_id'],
                                           fips__isnull=True).first()

            if county:
                county.fips = item['county_fips']
                county.save()

    def handle(self, *args, **options):

        # download geo csv from our S3
        # print("Downloading lstv us-city geo database...")
        url = "https://lstv2.s3.us-east-2.amazonaws.com/seed/uscities.csv"
        wget.download(url, 'uscities.csv'

                      )

        # preload existing place IDs (will save time for incremental)

        header = False
        rows = 0

        from csv import reader

        num_cities = Place.objects.filter(country__name='United States').count()

        with open("uscities.csv") as infile:
            fields = {}
            with alive_bar(num_cities, "- update U.S. counties with FIPS code", bar="blocks", length=10) as bar:

                for line in infile:

                    line_items = re.findall(r'"([^"]*)"', line)

                    if not header:
                        fields = line_items
                        header = not header
                    else:
                        row = {}
                        for idx, field in enumerate(fields, start=0):
                            row[fields[idx]] = line_items[idx]

                        self.process_geo_csv_row(row)
                        rows += 1
                    bar()

        # print(str(rows) + " counties updated with FIPS code")
        os.remove("uscities.csv")
