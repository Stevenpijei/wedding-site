import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Business.objects.all().count(),
                       "- fixing business locations from usermeta", bar="blocks", length=10) as bar:
            for business in Business.objects.all():
                bl = get_legacy_business_business_location(business.name)
                if bl:
                    bll = BusinessLocation(business=business, location=bl)
                    bll.save()
                bar()
