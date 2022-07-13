import sys

import unicodedata
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def modify(self, query):
        with alive_bar(query.count(),
                       "- rebuilding works_at locations", bar="blocks", length=10) as bar:
            for role in query.all():
                role.name = role.name.replace(" - ", "-")
                role.name = role.name.replace(" / ", "/")
                if role.singular:
                    role.singular = role.singular.replace(" / ", "/")
                if role.plural:
                    role.plural = role.plural.replace(" / ", "/")

                if role.singular:
                    role.singular = role.singular.replace("/Provider", "")

                if not role.singular:
                    role.singular = role.name

                name = role.singular or role.name
                if name.endswith('y'):
                    name = name[:-1] + "ies"
                elif name.endswith('s'):
                    name = name[:-1] + "es"
                elif name.endswith('ch'):
                    name = name + "es"
                else:
                    name += "s"

                name = name.replace("Artist/", "Artists/")
                role.plural = name
                role.save()

                bar()


    def handle(self, *args, **options):
        self.modify(BusinessRoleType.objects.all())
        self.modify(VideoBusinessCapacityType.objects.all())
