from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar


class Command(BaseCommand):

    def count_es_views(self, es):
        return VideoViewLog.objects.filter(video=es).count()

    def count_bs_views(self, bs):
        return ArticleViewLog.objects.filter(article=bs).count()

    def handle(self, *args, **options):

        # go over all posts, and weigh businesses on their event story/blog views.

        businesses = {}

        Business.objects_all_states.filter(Q(video_views__gt=0) | Q(article_views__gt=0)).\
            update(video_views=0, article_views=0)

        videos = Video.objects_all_states.all()
        with alive_bar(len(videos), "- calc business weight in event stories", length=10, bar="blocks") as bar:
            for es in videos:
                bar()
                for esv in es.businesses.all():
                    if esv.business.id in businesses:
                        businesses[esv.business.id]['es'] += self.count_es_views(es)
                    else:
                        businesses[esv.business.id] = {'es': self.count_es_views(es), 'bs': 0}

        articles = Article.objects_all_states.all()
        with alive_bar(len(articles), "- calc business weight in blog stories", bar="blocks", length=10) as bar:
            for bs in articles:
                bar()
                for bsv in bs.businesses.all():
                    if bsv.id in businesses:
                        businesses[bsv.id]['bs'] += self.count_bs_views(bs)
                    else:
                        businesses[bsv.id] = {'es': 0, 'bs': self.count_bs_views(bs)}

        for business in businesses.keys():
            if businesses[business]['es'] > 1 or businesses[business]['bs'] > 1:
                Business.objects_all_states.filter(id=business).update(video_views=businesses[business]['es'],
                                                                     article_views=businesses[business]['bs'])

