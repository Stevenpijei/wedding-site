import json
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.mailchimp import Mailchimp

class Command(BaseCommand):
    def handle(self, *args, **options):
        mc = Mailchimp()
        print(json.dumps(mc.list_fields()))
