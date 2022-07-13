import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Video.objects_all_states.count(), "- fixing wedding date field", bar="blocks",
                       length=10) as bar:
            for es in Video.objects_all_states.all().iterator():
                bar()
                wd = es.properties.filter(key='wedding_date').first()
                if wd:
                    es.event_date = wd.value_date
                    es.save()

