import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(Business.objects_all_states.count(), "- fixing business social", bar="blocks",
                       length=10) as bar:
            fb = SocialNetworkTypes.objects.get(slug='facebook')
            ig = SocialNetworkTypes.objects.get(slug='instagram')
            tk = SocialNetworkTypes.objects.get(slug='tiktok')
            if not fb or not ig or not tk:
                print("cant locate social network defs on the database")
                exit(1)
            for v in Business.objects_all_states.all().iterator():
                bar()
                for prop in v.properties.all():
                    if prop.key in ['legacy_your_business_facebook', 'legacy_your_business_instagram',
                                    'legacy_your_business_website', 'legacy_your_business_tiktok']:

                        if prop.key == 'legacy_your_business_website':
                            if '.' in prop.value_text:
                                v.website = prop.value_text.strip().lower()
                                v.save()
                        else:
                            if prop.value_text.lower() != 'n/a':
                                prop.value_text = prop.value_text.replace("@", "")
                                if '/' in prop.value_text:
                                    arr = prop.value_text.split("/")
                                    rc = []
                                    for a in arr:
                                        if len(a) > 0:
                                            rc.append(a)
                                    prop.value_text = rc[-1].strip()

                                if ' ' not in prop.value_text and len(prop.value_text) <= 100:
                                    if prop.key == 'legacy_your_business_facebook':
                                        fbsn = SocialLink(social_network=fb,
                                                          profile_account=prop.value_text)
                                        fbsn.save()
                                        v.social_links.add(fbsn)
                                    if prop.key == 'legacy_your_business_instagram':
                                        igsn = SocialLink(social_network=ig,
                                                          profile_account=prop.value_text)
                                        igsn.save()
                                        v.social_links.add(igsn)
                                    if prop.key == 'legacy_your_business_tiktok':
                                        tksn = SocialLink(social_network=tk,
                                                          profile_account=prop.value_text)
                                        tksn.save()
                                        v.social_links.add(tksn)
