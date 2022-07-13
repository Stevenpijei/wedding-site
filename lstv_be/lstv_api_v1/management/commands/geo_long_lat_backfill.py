import csv
from django.db.models import Func, F
from django.core.management.base import BaseCommand
from lstv_api_v1.models import County, Country, StateProvince, PlaceSource
from lstv_api_v1.utils.utils import get_google_place_info


# modifications necessary for the dataset from https://www.weather.gov/gis/Counties
county_mods = {
    "AK": {
        "Petersburg Census Area": "Petersburg Borough",
    },
    "FL": {
        "Mainland Monroe": "Monroe",
        "Lower Keys in Monroe": "",
        "Middle Keys in Monroe": "",
        "Upper Keys in Monroe": "",
    },
    "HI": {
        "Niihau in Kauai": "",
        "Kauai in Kauai": "Kauai",
        "Kahoolawe in Maui": "Kalawao",
        "Lanai in Maui": "",
        "Maui in Maui": "Maui",
        "Molokai in Maui": "",
        "Hawaii in Hawaii": "Hawaii",
        "Oahu in Honolulu": "Honolulu",
    },
    "IN": {
        "Lagrange": "LaGrange",
        "De Kalb": "DeKalb",
        "La Porte": "LaPorte",
    },
    "IL": {
        "La Salle": "LaSalle",
        "De Kalb": "DeKalb",
    },
    "LA": {
        "La Salle": "La Salle Parish",
        "St. John The Baptist": "St. John the Baptist",
    },
    "MD": {
        "Baltimore City": "Baltimore",
        "St. Marys": "St. Mary's",
        "Prince Georges": "Prince George's",
    },
    "MO": {
        "St. Louis City": "St. Louis",
    },
    "NY": {
        "New York (Manhattan)": "New York",
    },
    "TN": {
        "De Kalb": "DeKalb",
    },
}


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--country-csv',
            type=str,
            help='csv file with country data'
        )
        parser.add_argument(
            '--state-csv',
            type=str,
            help='csv file with state data'
        )
        parser.add_argument(
            '--county-csv',
            type=str,
            help='csv file with county data'
        )

    def handle(self, *args, **options):
        if options['country_csv']:
            print("updating countries")
            with open(options['country_csv'], 'r') as f:
                reader = csv.reader(f)
                for row in reader:
                    code, lat, long, name = row
                    country = Country.objects.filter(iso2=code).first()
                    if not country:
                        continue
                    country.lat = lat
                    country.long = long
                    country.source = PlaceSource.geo_db
                    country.save()

        if options['state_csv']:
            print("updating states")
            usa = Country.objects.get(name='United States')
            with open(options['state_csv'], 'r') as f:
                reader = csv.reader(f)
                for row in reader:
                    name, lat, long = row
                    state = StateProvince.objects.get(name=name, country=usa)
                    state.lat = lat
                    state.long = long
                    state.source = PlaceSource.geo_db
                    state.save()

        if options['county_csv']:
            print("updating counties")
            usa = Country.objects.get(name='United States')
            with open(options['county_csv'], 'r') as f:
                reader = csv.reader(f)
                for row in reader:
                    state_code, county_name, lat, long = row
                    if state_code in ['AS', 'GU']:
                        continue
                    if state_code == 'VI':
                        county_name = county_name.replace('Saint', 'St.')
                    if county_name.startswith('City of '):
                        county_name = county_name[8:]
                    mods = county_mods.get(state_code, {})
                    county_name = mods.get(county_name, county_name)
                    if county_name == "":
                        continue

                    county = County.objects.annotate(unaccented_name=Func(F('name'), function='UNACCENT')).filter(
                        unaccented_name=county_name, state_province__code=state_code, state_province__country=usa
                    ).first()
                    if not county:
                        print(f"missing {county_name} in {state_code}")
                    county.lat = lat
                    county.long = long
                    county.source = PlaceSource.geo_db
                    county.save()
