from datetime import datetime
from django.core.management.base import BaseCommand
from lstv_api_v1.models import Business, Properties
from lstv_api_v1.utils.hubspot import Hubspot

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--filmmaker',
            action='store_true',
            help="send only filmmakers"
        )
        parser.add_argument(
            '--slug-start',
            help="start with the specified slug and continue"
        )

    def handle(self, *args, **options):
        businesses = Business.objects.order_by('slug')
        if options['filmmaker']:
            businesses = businesses.filter(roles__name='Videographer')
        if options['slug_start']:
            businesses = businesses.filter(slug__gte=options['slug_start'])

        if businesses.count() == 0:
            print('no eligable businesses found')
            return

        print(f"sending {businesses.count()} businesses")

        hubspot = Hubspot()
        for business in businesses:
            print(f"sending business with slug {business.slug}")
            try:
                hubspot.update_business(business)
                hubspot.update_team_members(business)
            except Exception as e:
                print(f"  error: {e}")
