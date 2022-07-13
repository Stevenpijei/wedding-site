import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget


class Command(BaseCommand):
    countries = {}
    states_provinces = {}
    place_ids = {}

    def process_geo_csv_row(self, item):

        # do we already have the id in places? if not, do not add again.

        if int(item['id']) in self.place_ids:
            return

        # create or load country

        country_slug = slugify(item['country'])
        if country_slug not in self.countries:
            try:
                country = Country(name=item['country'],
                                  name_ascii=asciify(item['country']),
                                  slug=slugify(item['country']),
                                  iso2=item['iso2'],
                                  iso3=item['iso3'])
                country.save()
                self.countries[country_slug] = country
            except IntegrityError:
                country = Country.objects.filter(slug=slugify(item['country'])).first()
            except DataError:
                # print(item)
                exit(1)
        else:
            country = self.countries[country_slug]
        # state/province

        state = None
        if item['admin_name']:
            state_slug = slugify(item['admin_name']) + "-" + country_slug

            if state_slug not in self.states_provinces:
                try:
                    state = StateProvince(name=item['admin_name'],
                                          name_ascii=asciify(item['admin_name']),
                                          slug=slugify(item['admin_name']),
                                          country=country,
                                          type=item['admin_type'],
                                          code=item['admin_code'].replace(country.iso2 + "-", ""))
                    state.save()
                    self.states_provinces[state_slug] = state
                except IntegrityError:
                    state = StateProvince.objects.filter(slug=slugify(item['admin_name'])).first()
            else:
                state = self.states_provinces[state_slug]

        # city

        city_alts = None
        city_alts_ascii = None

        if item['city_alt']:
            city_alts = item['city_alt'].split("|")
            city_alts_ascii = []
            for i in city_alts:
                city_alts_ascii.append(str(unicodedata.normalize('NFKD', i).encode('ascii', 'ignore'), 'utf-8'))

        # supporting informal name for NYC that appears in LSTV1 many times.
        if item['city'] == "New York" and state.name == 'New York' and country.name == 'United States':
            if not city_alts:
                city_alts = []

            if not city_alts_ascii:
                city_alts_ascii = []

            city_alts.append('New York City')
            city_alts_ascii.append('New York City')

        if item['city'] == "Washington" and state.name == 'District of Columbia' \
                and country.name == 'United States':
            if not city_alts:
                city_alts = []

            if not city_alts_ascii:
                city_alts_ascii = []

            city_alts.append('Washington DC')
            city_alts.append('Washington D.C')
            city_alts.append('Washington D.C.')
            city_alts_ascii.append('Washington DC')
            city_alts_ascii.append('Washington D.C')
            city_alts_ascii.append('Washington D.C.')

        try:
            city = Place(import_id=item['id'],
                         name=item['city'],
                         slug=slugify(item['city']),
                         name_ascii=item['city_ascii'],
                         alt_names=city_alts,
                         alt_names_ascii=city_alts_ascii,
                         lat=item['lat'],
                         long=item['lng'],
                         state_province=state,
                         country=country,
                         timezone=item['timezone'],
                         admin_type=item['capital'],
                         ranking=item['ranking'],
                         population_urban=int(float(item['population'])) if item['population'] else None,
                         population_municipal=int(float(item['population_proper'])) if item['population_proper'] else None)
            city.save()
        except (DataError, AttributeError):
            pass

    def handle(self, *args, **options):

        Place.objects.all().delete()
        StateProvince.objects.all().delete()
        Country.objects.all().delete()

        # download geo csv from our S3
        # print("Downloading lstv geo database...")
        url = "https://lstv2-eks.s3.us-east-2.amazonaws.com/db-seed/worldcities.csv"
        wget.download(url, 'worldcities.csv')

        # preload existing place IDs (will save time for incremental)

        pids = Place.objects.values_list('import_id', flat=True)

        for pid in pids:
            self.place_ids[pid] = 1

        # print(str(len(pids)) + " place ids memory cached")


        header = False
        rows = 0

        from csv import reader

        with open("worldcities.csv") as infile:
            fields = {}
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

                    if rows % 1000 == 0:
                        # print("processed " + str(rows) + " rows", end='\r')
                        sys.stdout.flush()

        # print(str(rows) + " places imported")