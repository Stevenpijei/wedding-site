from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    def handle(self, *args, **options):
        pass
        # with alive_bar(Business.objects.count(), "- patching subscriptions level", length=10, bar="blocks") as bar:
        #     for business in Business.objects.all():
        #         if business.has_premium_membership():
        #             business.subscription_level = plus
        #         else:
        #             business.subscription_level = free
        #         business.save()
        #         bar()
