from django.conf import settings
from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts, get_post_vibes, get_post_categories, business_parent_cats


class Command(BaseCommand):
    def handle(self, *args, **options):

        tags = ['COVID-19 Love Stories', 'Holiday Weddings & Love Stories', 'Top 50 Weddings of 2019']

        for tag in tags:
            try:
                t = TagType(name=tag, slug=slugify(tag),
                            tag_family_type=TagFamilyType.objects.get(slug='lstv-editorial'))
                t.save()
            except:
                pass

        posts = get_posts('video')
        index = 1
        with alive_bar(len(posts), "- Plugging missing tags in posts", bar="blocks", length=10) as bar:
            for post in posts:
                post_cats = get_post_categories(post['ID' if settings.DEBUG else 'id'])
                for post_cat in post_cats:
                    if post_cat.get('name') in tags:
                        video = Video.objects.filter(
                            post__legacy_post_id=post['ID' if settings.DEBUG else 'id']).first()
                        if video:
                            tobj = TagType.objects.filter(slug=slugify(post_cat['name'])).first()
                            if tobj:
                                if not video.vibes.filter(pk=tobj.id):
                                    print(
                                        f"video id: {video.id} {post_cat.get('name')} in {post['ID' if settings.DEBUG else 'id']} - "
                                        f"{post['post_title']}")
                                    video.vibes.add(tobj)

                bar()
