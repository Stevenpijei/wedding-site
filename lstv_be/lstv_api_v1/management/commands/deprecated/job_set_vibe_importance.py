from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.tasks.tasks import job_build_video_preview, job_migrate_image_to_s3
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    def handle(self, *args, **options):
        for tag in TagType.objects.all().iterator():

            tag.importance = "1".zfill(5)

            if tag.tag_family_type.slug == 'culture-religion':
                tag.importance = "10".zfill(5) + "-" + str(tag.weight).zfill(5)

            if tag.slug in ['jewish', 'catholic', 'muslim']:
                tag.importance = "11".zfill(5) + "-" + str(tag.weight).zfill(5)

            if tag.slug == 'gay' or tag.slug == 'lesbian':

                tag.importance = "9".zfill(5) + "-" + str(tag.weight).zfill(5)

            if tag.tag_family_type.slug == 'special-moments':
                tag.importance = "8".zfill(5) + "-" + str(tag.weight).zfill(5)

            if tag.tag_family_type.slug == 'wedding-style':
                tag.importance = "7".zfill(5) + "-" + str(tag.weight).zfill(5)

            tag.save()
