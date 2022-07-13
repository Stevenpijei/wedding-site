from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
from PIL import Image, UnidentifiedImageError
import requests


class Command(BaseCommand):

    allowed_image_types = ['thumbnail', 'background', 'banner', 'profile_avatar', 'logo', 'photo']

    def add_arguments(self, parser):
        parser.add_argument('-u', '--url', type=str, help='url for the source file')
        parser.add_argument('-t', '--type', type=str, help='image type (thumbnail, banner, profile_avatar, '
                                                           'logo, or photo')

    def handle(self, *args, **options):
        source_url = options['url']
        type = options['type']

        if not source_url or not type:
            print("you must specify an image url and a type. Example: --url=http://test.com/myfile.jpg --type=thumbnail")
            exit(1)

        if type not in self.allowed_image_types:
            print(f"{type} is an invalid type, allowed types are {', '.join(self.allowed_image_types)}")
            exit(1)

        print(f"verifying {type} at: {source_url}")

        try:
            if source_url.startswith("http"):
                im = Image.open(requests.get(source_url, stream=True).raw)
            else:
                im = Image.open(source_url)
        except UnidentifiedImageError:
            print(f"{source_url} could not be found or processed as an image")
            exit(1)

        print(im)
