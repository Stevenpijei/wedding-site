import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):

        WeightedWorksWith.objects_all_states.all().delete()

        ww = {}

        import itertools
        def all_pairs(lst):
            for p in itertools.combinations(lst, 2):
                i = iter(p)
                yield zip(i, i)

        with alive_bar(Video.objects_all_states.count(), "- calculating works-with weight...", bar="blocks",
                       length=10) as bar:

            for es in Video.objects_all_states.all().iterator():
                bar()
                business_list = []
                for v in es.businesses.all():
                    business_list.append(v.business)

                es_pairs = all_pairs(business_list)

                for e in list(es_pairs):
                    vlist = list(e)
                    v1, v2 = vlist[0]

                    if v1.slug > v2.slug:
                        key = v1.slug+"--"+v2.slug
                    else:
                        key = v2.slug + "--" + v1.slug

                    if key not in ww:
                        ww[key] = {
                            'count': 1,
                            'v1': v1,
                            'v2': v2
                        }
                    else:
                        ww[key]['count'] += 1

        with alive_bar(len(list(ww.keys())), "- committing to database...", bar="blocks",
                       length=10) as bar:
            dups = 0
            for key in ww.keys():
                bar()
                o = ww[key]
                if o['v1'].id != o['v2'].id:
                    w = WeightedWorksWith(business_a=o['v1'], business_b=o['v2'], weight=o['count'])
                    w.save()
                else:
                    dups += 1

            print(f"{dups} duplicates ignores. e.g. (two taggings of the same business in a single wedding")








