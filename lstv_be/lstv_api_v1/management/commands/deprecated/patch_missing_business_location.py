import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Business.objects.filter(business_locations=None).count(),
                       "- patching missing based_at business locations", bar="blocks", length=10) as bar:

            #  ____    ___       _       ___   ____    ____    ___  ____
            # |    \  /   \     | T     /   \ |    \  /    T  /  _]|    \
            # |  _  YY     Y    | |    Y     Y|  _  YY   __j /  [_ |  D  )
            # |  |  ||  O  |    | l___ |  O  ||  |  ||  T  |Y    _]|    /
            # |  |  ||     |    |     T|     ||  |  ||  l_ ||   [_ |    \
            # |  |  |l     !    |     |l     !|  |  ||     ||     T|  .  Y
            # l__j__j \___/     l_____j \___/ l__j__jl___,_jl_____jl__j\_j
            #
            #  ___     ___   ____  ____    ____      ______  __ __  ____   _____
            # |   \   /   \ l    j|    \  /    T    |      T|  T  Tl    j / ___/
            # |    \ Y     Y |  T |  _  YY   __j    |      ||  l  | |  T (   \_
            # |  D  Y|  O  | |  | |  |  ||  T  |    l_j  l_j|  _  | |  |  \__  T
            # |     ||     | |  | |  |  ||  l_ |      |  |  |  |  | |  |  /  \ | __
            # |     |l     ! j  l |  |  ||     |      |  |  |  |  | j  l  \    ||  T
            # l_____j \___/ |____jl__j__jl___,_j      l__j  l__j__j|____j  \___jl__j

            for business in Business.objects.filter(business_locations=None):
                bar()

            #     worked_at_history = business.worked_at_cache.all().order_by('-weight')
            #     if len(worked_at_history) == 0:
            #         business.rebuild_worked_at_location_cache()
            #         worked_at_history = business.worked_at_cache.filter(place__isnull=False).order_by('-weight').first()
            #         if not worked_at_history:
            #             worked_at_history = business.worked_at_cache.filter(state_province__isnull=False).order_by(
            #                 '-weight').first()
            #         if not worked_at_history:
            #             worked_at_history = business.worked_at_cache.filter(country__isnull=False).order_by(
            #                 '-weight').first()
            #         if worked_at_history:
            #             new_location = Location()
            #             if worked_at_history.place:
            #                 new_location.place = worked_at_history.place
            #                 new_location.state_province = worked_at_history.place.state_province
            #                 new_location.county = worked_at_history.place.county
            #                 new_location.country = worked_at_history.place.country
            #             elif worked_at_history.state_province:
            #                 new_location.state_province = worked_at_history.state_province
            #                 new_location.country = worked_at_history.state_province.country
            #             elif worked_at_history.country:
            #                 new_location.country = worked_at_history.country
            #             new_location.save()
            #             vl = BusinessLocation(business=business, location=new_location)
            #             vl.save()
            #             business.save()


        #print(f"{Business.objects.filter(business_locations__isnull=False).count()} businesses without business "
        #      f"location patched")
