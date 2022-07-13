from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo


class Command(BaseCommand):

    def handle(self, *args, **options):
        articles = Article.objects.filter(locations__isnull=False)
        print(f"{articles.count()} articles with locations out of {Article.objects.count()}")
        for article in articles.all():
            for location in article.locations.all():
                if location.has_content():
                    pass
                else:
                    article.locations.remove(location)
                    location.delete(hard=True)
