from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv

from lstv_be.settings import DEFAULT_CDN


class Command(BaseCommand):
    thumbs = []

    def find_thumbnail(self, tag_slug):
        video_source = VideoSource.objects.filter(
            pk__in=Video.objects.filter(Q(vibes__slug=tag_slug) &
                                        ~Q(videos__thumbnail__serve_url__in=self.thumbs)).order_by(
                '-created_at').values_list(
                'videos', flat=True)).order_by('-created_at').first()
        if video_source:
            print(f"tag_slug {tag_slug}  - {video_source} ==> {video_source.thumbnail}")
            return video_source.thumbnail.get_serve_url()
        else:
            # I prefer duplicates to a no-thumbnail at all if there is only one video/thumbnail for that tag
            # and it's already used in another video.
            video_source = VideoSource.objects.filter(
                pk__in=Video.objects.filter(vibes__slug=tag_slug).order_by('-created_at').values_list(
                    'videos', flat=True)).order_by('-created_at').first()
            if video_source:
                return video_source.thumbnail.get_serve_url()

        return f"{DEFAULT_CDN}/images/site/nothumb.jpg"

    def handle(self, *args, **options):
        for tag in TagType.objects.all():
            if tag.thumbnail:
                tag.thumbnail.delete()
                tag.thumbnail = None
                tag.save()

        for tag in TagType.objects.filter(thumbnail__isnull=True).all().order_by("-weight"):
            print(f"{tag.name} - {tag.weight} - {tag.weight_videos}")
            thumbnail_url = self.find_thumbnail(tag.slug)
            self.thumbs.append(thumbnail_url)
            if not tag.thumbnail:
                image = Image(serve_url=thumbnail_url, purpose=ImagePurposeTypes.thumbnail)
                image.save()
                tag.thumbnail = image
                tag.save()
