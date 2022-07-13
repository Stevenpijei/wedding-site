from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar


class Command(BaseCommand):

    def handle(self, *args, **options):

        # resetting data

        Video.objects_all_states.filter(views__gt=0).update(views=0)
        Article.objects_all_states.filter(views__gt=0).update(views=0)

        videos = Video.objects_all_states.all()
        with alive_bar(len(videos), "- calc event story views", bar="blocks", length=10) as bar:
            for es in videos:
                bar()
                views = VideoViewLog.objects.filter(video=es).count()
                if views:
                    es.views = views
                    es.save()

        articles = Article.objects_all_states.all()
        with alive_bar(len(articles), "- calc blog story views", bar="blocks", length=10) as bar:
            for bs in articles:
                bar()
                views = ArticleViewLog.objects.filter(article=bs).count()
                if views:
                    bs.views = views
                    bs.save()

