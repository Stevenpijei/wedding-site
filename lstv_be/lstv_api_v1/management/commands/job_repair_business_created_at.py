from django.core.management.base import BaseCommand
from django.db import connections

from lstv_api_v1.models import *
from alive_progress import alive_bar
import csv

from lstv_api_v1.utils.legacy_model_utils import get_dict


class Command(BaseCommand):

    def handle(self, *args, **options):
        rows = []
        with alive_bar(Business.objects.all().count(), "gathering businesses", bar="blocks", length=10) as bar:
            for business in Business.objects.all().iterator():
                cursor = connections['migrate'].cursor()

                cursor.execute("select user_registered from terms left join usermeta on usermeta.meta_key = "
                               "'your_business_name' and usermeta.meta_value like terms.name left join users "
                               "on users.id = usermeta.user_id where terms.name = %s", (business.name,))
                views = get_dict(cursor)
                cursor.close()
                if len(views) > 0:
                    if views[0].get('user_registered'):
                        business.predate_created_at(views[0].get('user_registered'))
                    else:
                        cursor = connections['migrate'].cursor()
                        cursor.execute("select created_at, name from terms where name like %s", (business.name,))
                        views = get_dict(cursor)
                        if len(views) > 0:
                            if views[0].get('created_at'):
                                business.predate_created_at(views[0].get('created_at'))
                business.save()
                bar()
