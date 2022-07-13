from django.core.management.base import BaseCommand
from django.db.models import Count

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight, job_migrate_image_to_s3
from lstv_api_v1.utils.utils import verify_resource_url, verify_image_url


class Command(BaseCommand):
    def handle(self, *args, **options):
        for vs in VideoSource.objects.filter(thumbnail__isnull=True).all():
            image_url = None
            if vs.media_id:
                if vs.type == VideoTypeEnum.jwplayer:
                    image_url = f"https://content.jwplatform.com/thumbs/{vs.media_id}.jpg"
                if vs.type == VideoTypeEnum.vimeo:
                    image_url = f"https://i.vimeocdn.com/video/{vs.media_id}_640.jpg"
            if image_url and verify_image_url(image_url):
                new_image = Image(purpose=ImagePurposeTypes.thumbnail, legacy_url=image_url)
                new_image.save()
                vs.thumbnail = new_image
                vs.save()
                job_migrate_image_to_s3(new_image.id)
                print(f"{vs.id} - {vs.type} - {image_url}")
            else:
                print(f"STILL NEED FIXING - {vs.id} - {vs.type} - {image_url}")
