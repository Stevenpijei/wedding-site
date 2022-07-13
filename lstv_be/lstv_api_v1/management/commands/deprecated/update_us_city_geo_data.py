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

        # do we already have the id in places? if not, do not add again.
        # create or load country

        place = Place.objects.filter(import_id=item['id']).first()
        if place:
            place.county_name = item['county_name']

            if item['zips'] and item['zips'] != '':
                zipcodes = item['zips'].split(' ')
                place.zipcodes = None
                for zipcode in zipcodes:
                    if place.zipcodes:
                        place.zipcodes.append(zipcode)
                    else:
                        place.zipcodes = [zipcode]

            place.married_percent = item['married']
            place.race_white_percent = item['race_white']
            place.race_black_percent = item['race_black']
            place.race_asian_percent = item['race_asian']
            place.race_native_percent = item['race_native']
            place.race_pacific_percent = item['race_pacific']
            place.race_other_percent = item['race_other']
            place.race_multiple_percent = item['race_multiple']
            place.age_20s_percent = item['age_20s']
            place.age_30s_percent = item['age_30s']
            place.age_40s_percent = item['age_40s']
            place.age_50s_percent = item['age_50s']
            place.divorced_percent = item['divorced']
            place.never_married_percent = item['never_married']
            place.income_household_median = item['income_household_median']
            place.age_median = item['age_median']
            place.education_high_school_and_not_more_percent = item['education_highschool']
            place.education_bachelors_but_no_more_percent = item['education_bachelors']
            place.education_graduate_but_no_more_percent = item['education_graduate']
            place.education_college_degree_percent = item['education_college_or_above']

            place.income_household_100_to_150_percent = item['income_household_100_to_150']
            place.income_household_over_150_percent = item['income_household_150_over']

            place.family_dual_income_percent = item['family_dual_income']
            place.income_household_under_5_percent = item['income_household_under_5']
            place.income_household_5_to_10_percent = item['income_household_5_to_10']
            place.income_household_10_to_15_percent = item['income_household_10_to_15']
            place.income_household_15_to_20_percent = item['income_household_15_to_20']
            place.income_household_20_to_25_percent = item['income_household_20_to_25']
            place.income_household_25_to_35_percent = item['income_household_25_to_35']
            place.income_household_35_to_50_percent = item['income_household_35_to_50']
            place.income_household_50_to_75_percent = item['income_household_50_to_75']
            place.income_household_75_to_100_percent = item['income_household_75_to_100']
            place.home_value_median = item['home_value']
            place.rent_percent_of_household_income = item['rent_burden']
            place.income_household_six_figure_percent = item['income_household_six_figure']
            place.income_household_median = item['income_household_median']
            place.health_uninsured_percent = item['health_uninsured']

            # make sure we have a county record for each city

            county = County.objects.filter(name=item['county_name'], state_province__code=item['state_id']).first()

            if not county:
                state_exists = StateProvince.objects.filter(
                    code=item['state_id'], country__name='United States').first()

                if state_exists:
                    # add county
                    county = County(name=item['county_name'],
                                    fips=item['county_fips'],
                                    slug=slugify_2(item['county_name']),
                                    state_province=StateProvince.objects.filter(
                                        code=item['state_id'],
                                        country__name='United States').first())
                    county.save()
                    place.state_province = state_exists
                    place.county = county

                else:
                    print(f"county: {item['county_name']} - no state found. item state ID = {item['state_id']} ")

            place.county = county
            place.save()
        else:
            print(
                f"NOT FOUND: import_id: {item['id']}  city: {item['city']}    state: {item['state_name']}    "
                f"zip: {item['zips']}  county: {item['county_name']}")

    def handle(self, *args, **options):

        # download geo csv from our S3
        # print("Downloading lstv us-city geo database...")
        url = "https://lstv2.s3.us-east-2.amazonaws.com/seed/uscities.csv"
        wget.download(url, 'uscities.csv')

        # preload existing place IDs (will save time for incremental)

        header = False
        rows = 0

        from csv import reader

        num_cities = Place.objects.filter(country__name='United States').count()

        with open("uscities.csv") as infile:
            fields = {}
            with alive_bar(num_cities, "- update U.S. Cities geo/socio data", bar="blocks", length=10) as bar:

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

        # print(str(rows) + " places updated with county, zip and more...")
        os.remove("uscities.csv")
