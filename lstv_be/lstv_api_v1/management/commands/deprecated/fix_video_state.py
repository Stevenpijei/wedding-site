import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):

        # relaxing restrictions on videos. Minimum to be visible is videographer. NOT videographer+venue

        vids = Video.objects_all_states.filter(state=ContentModelState.suspended_review).all()
        num_suspended = 0
        num_recoverable = 0
        num_hopeless = 0
        for v in vids.all():
            found_venue = False
            found_videographer = False
            for biz in v.businesses.all():
                if biz.business_role_type.slug == 'venue':
                    found_venue = True
                if biz.business_role_type.slug == 'videographer':
                    found_videographer = True
            if not found_venue and not found_videographer:
                num_suspended += 1
            if not found_videographer and found_venue:
                num_hopeless += 1
            if found_videographer:
                num_recoverable += 1
                print()
                v.state = ContentModelState.active
                v.state_desc = None
                v.save()
                #v.post.state = ContentModelState.active
                #v.post.state_desc = None
                #v.post.save()
                print(v.post.slug + " --- revived.")

        print(str(num_suspended) + " don't have both videographer and venue together")
        print(str(num_hopeless) + " don't have videographer")
        print(str(num_recoverable) + " have videographer and have been recovered")

        vids = Video.objects.filter(videos__isnull=True).all()
        for v in vids:
            v.state = ContentModelState.suspended_review
            v.state_desc = ["no description"]
            v.save()

        print(str(vids.count()) + " videos suspended for no video sources at all")