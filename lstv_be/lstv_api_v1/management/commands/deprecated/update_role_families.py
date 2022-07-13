from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    def handle(self, *args, **options):
        # remove role type families from role types
        for rt in BusinessRoleType.objects.all():
            rt.role_family_type = None
            rt.save()

        # clean out role type families
        for rtf in BusinessRoleFamilyType.objects.all():
            rtf.delete()

        # rebuild role type families and hooking up to the correct role type

        for key in business_family_color.keys():
            color = business_family_color[key]
            defs = business_roles[key]
            family = BusinessRoleFamilyType(name=key, bg_color=color, slug=slugify_2(key.replace(" & ", " and ")))
            family.save()

            if defs:
                for d in defs:
                    #print(f"{key} - {color} - Role: {d}")
                    n = d.split('|')
                    print(n[0])
                    role_type = BusinessRoleType.objects.get(slug=slugify_2(n[0]))
                    role_type.role_family_type = family
                    role_type.save()
            else:
                print("Error in getting def")

