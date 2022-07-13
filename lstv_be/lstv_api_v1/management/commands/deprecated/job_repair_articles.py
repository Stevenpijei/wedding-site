from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        posts = get_posts('article')
        index = 1
        with alive_bar(len(posts), "- Repairing Article Content", bar="blocks", length=10) as bar:
            for post in posts:
                # get LSTV2 article to match
                articles = Article.objects.filter(post__slug=post['post_name'])
                for article in articles:
                    #article.content_legacy = post['post_content']
                    #article.save()
                    article.content = convert_legacy_blog_content_with_soup(article.content_legacy)
                    article.save()
                bar()
