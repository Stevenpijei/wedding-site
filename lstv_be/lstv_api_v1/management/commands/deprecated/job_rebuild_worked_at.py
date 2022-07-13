import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Business.objects.count(),
                       "- rebuilding works_at locations", bar="blocks", length=10) as bar:
            for business in Business.objects.all():
                business.rebuild_worked_at_location_cache()
                bar()
