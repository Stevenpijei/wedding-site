from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *


class Command(BaseCommand):
    def handle(self, *args, **options):

        posts = Post.objects.filter(type=PostTypeEnum.video)
        for post in posts:
            add_couple_names_properties_to_post(post)
