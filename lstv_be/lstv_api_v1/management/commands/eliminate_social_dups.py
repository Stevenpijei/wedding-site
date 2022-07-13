from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    def handle(self, *args, **options):

        with alive_bar(Business.objects.filter(Q(social_links__gt=0)).count(),
                       "- eliminating business social links dupes", length=10, bar="blocks") as bar:
            dup_biz = 0
            for biz in Business.objects.filter(social_links__gt=0):
                snl = {}
                found_dup = False
                for sl in biz.social_links.all():
                    if not sl.social_network.slug in snl:
                        snl[sl.social_network.slug] = sl.profile_account
                    else:
                        print(
                           f"duplicate in {biz.name}: -{sl.social_network.name}- 1: -{sl.profile_account}-"
                           f"  2: -{snl[sl.social_network.slug]}-")
                        found_dup = True
                        if sl.profile_account.lower() == snl[sl.social_network.slug].lower():
                            biz.social_links.remove(sl)
                            sl.delete()

                if found_dup:
                    dup_biz += 1

                bar()

            print(f"{dup_biz} businesses with duplicate social link types")
