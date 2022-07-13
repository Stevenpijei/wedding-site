import sys

import unicodedata
from django.core.management.base import BaseCommand
from django.db.models import Count, F

from lstv_api_v1.utils.legacy_model_utils import *
import re
import wget
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        with alive_bar(User.objects.count(), "- hooking ip address to users", bar="blocks",
                       length=10) as bar:
            for u in User.objects.all().iterator():
                logs = RequestLog.objects.filter(Q(user=u) & Q(ip__isnull=False)).values('ip').annotate(
                    count=Count('ip')).order_by("-count")

                for log in logs[0:3]:
                    try:
                        ip = IPAddress.objects.get(pk=log['ip'])
                        u.ip_addresses.add(ip)
                        print(f"{u.email} - {ip.ip} - {log['count']} totals")
                    except IPAddress.DoesNotExist:
                        pass

                bar()
