from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        posts = Post.objects_all_states.filter(visibility=PostVisibilityEnum.draft)
        with alive_bar(len(posts), "- repairing post draft visibility", bar="blocks", length=10) as bar:
            for post in posts:
                post.visibility = PostVisibilityEnum.unlisted
                post.save()
                video = Video.objects_all_states.filter(post=post).first()
                if video:
                    video.is_draft = True
                    video.visibility = PostVisibilityEnum.unlisted
                    video.save()
                bar()
