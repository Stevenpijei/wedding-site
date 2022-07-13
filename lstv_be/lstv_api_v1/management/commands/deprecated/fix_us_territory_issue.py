import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        # add 6 U.S. territories and mark them as such as state_province objects under the U.S.

        # American Samoa -  AS
        # Guam - GU
        # Northern Mariana Islands - MP
        # Puerto Rico - PR
        # U.S. Virgin Islands - VI
        # U.S. Minor Outlying Islands - UM

        usa = Country.objects.filter(name='United States').first()

        if usa:

            if not StateProvince.objects.filter(country=usa, code='AS').first():
                t = StateProvince(name='American Samoa',
                                  name_ascii=asciify('American Samoa'),
                                  slug=slugify('American Samoa'),
                                  country=usa,
                                  type='territory',
                                  code='AS')
                t.save()

            if not StateProvince.objects.filter(country=usa, code='MP').first():
                t = StateProvince(name='Northern Mariana Islands',
                                  name_ascii=asciify('Northern Mariana Islands'),
                                  slug=slugify('Northern Mariana Islands'),
                                  country=usa,
                                  type='territory',
                                  code='MP')
                t.save()

            if not StateProvince.objects.filter(country=usa, code='GU').first():
                t = StateProvince(name='Guam',
                                  name_ascii=asciify('Guam'),
                                  slug=slugify('Guam'),
                                  country=usa,
                                  type='territory',
                                  code='GU')
                t.save()

            if not StateProvince.objects.filter(country=usa, code='PR').first():
                t = StateProvince(name='Puerto Rico',
                                  name_ascii=asciify('Puerto Rico'),
                                  slug=slugify('Puerto Rico'),
                                  country=usa,
                                  type='territory',
                                  code='PR')
                t.save()

            if not StateProvince.objects.filter(country=usa, code='VI').first():
                t = StateProvince(name='U.S. Virgin Islands',
                                  name_ascii=asciify('U.S. Virgin Islands'),
                                  slug=slugify('U.S. Virgin Islands'),
                                  country=usa,
                                  type='territory',
                                  code='VI')
                t.save()

            if not StateProvince.objects.filter(country=usa, code='UM').first():
                t = StateProvince(name='U.S. Minor Outlying Islands',
                                  name_ascii=asciify('U.S. Minor Outlying Islands'),
                                  slug=slugify('U.S. Minor Outlying Islands'),
                                  country=usa,
                                  type='territory',
                                  code='UM')
                t.save()