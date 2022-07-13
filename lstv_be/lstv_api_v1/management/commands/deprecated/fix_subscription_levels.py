from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    def handle(self, *args, **options):
        cursor = connections['migrate'].cursor()
        cursor.execute("select * from terms where term_tier > 0")
        premiums = get_dict(cursor)
        cursor.close()
        print(f"{len(premiums)} LSTV1 vendors are premium")
        for term in premiums:
            b = Business.objects.filter(legacy_term_id=term['term_id']).first()
            if b:
                #print(f"{b.name} ({term['term_id']}) is {term['term_tier']}")
                b.subscription_level = BusinessSubscriptionLevel.objects.get(slug='plus')
                b.set_premium_membership(True)
                b.save()

        # check directly.

        vendors = ['Kleinfeld Bridal',
                   'BloomBar',
                   'BloomBar',
                   'MG Hair and Makeup',
                   'buffr',
                   'Blue Opal Jazz',
                   'Zingerman\'s Cornman Farms',
                   'A Day Like No Other',
                   'Fiore Press Letterpress',
                   'Clementine Studio',
                   'Cinestory Films',
                   'DUWAYNE',
                   'Selva Resort',
                   'MG Hair and Makeup',
                   'Concetta Films',
                   'Anchored Films',
                   'StopGoLove',
                   'Bridal Reflections',
                   'Key Moment Films',
                   'Jainé Kershner Photography',
                   'Mavinhouse Events',
                   'NST Pictures',
                   'byPensa',
                   'Electric Love Studios',
                   'Blue Room Photography',
                   'BloomBar',
                   'Griffin & Griffin',
                   'ACouplePuns',
                   'The Day by Adrian Toto',
                   'The Day by Ira Lippke',
                   'Wedding Words',
                   'The Vow Whisperer',
                   'Ladurée',
                   'Films Nouveau',
                   'Ali Barone Events',
                   'Beautini',
                   'Gardenhouse Films',
                   'The Celebration Artist',
                   'A Colored Mind Wedding Films',
                   'Lauren Addison Jewelry',
                   'PGP Wedding Films',
                   'Modern Love Productions',
                   'Emlan Events',
                   'Photohouse Films']

        for vendor in vendors:
            b = Business.objects.filter(slug__iexact=slugify_2(vendor)).first()
            if not b:
                print(f"{vendor} not found")
            else:
                b.subscription_level = BusinessSubscriptionLevel.objects.get(slug='plus')
                b.set_premium_membership(True)
                b.save()