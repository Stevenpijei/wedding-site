from django.core.management.base import BaseCommand
from lstv_api_v1.models import Business
from lstv_api_v1.utils.hubspot import Hubspot

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--slug',
            type=str,
            help='slug of the business to send to mailchimp'
        )
        parser.add_argument(
            '--one',
            action='store_true',
            help='resend one random business who has already been sent'
        )

    def handle(self, *args, **options):
        if options['slug']:
            businesses = Business.objects.filter(slug=options['slug'])
        else:
            businesses = Business.objects.filter(properties__key='hubspot_id')
        if businesses.count() == 0:
            print('no eligable businesses found')
            return

        if options['one']:
            businesses = [businesses.first()]

        hubspot = Hubspot()
        for business in businesses:
            hubspot.update_business(business)
            hubspot.update_team_members(business)
            print(f"sent business slug {business.slug}")

