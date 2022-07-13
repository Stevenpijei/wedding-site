from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.tasks.tasks import assign_thumbnail_to_user
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('-e', '--email', type=str, help='email of the user to add an avatar image for')
        parser.add_argument('-u', '--url', type=str, help='URL of the image to be added')


    def handle(self, *args, **options):
        email = options['email']
        url = options['url']


        if not email or not url:
            print("usage: python manage.py assign_avatar_image email={user's email} url={image_url)")
            print("example: python manage.py assign_avatar_image email=ronenmagid@gmail.com url=https://anywhere.com/image.png")
            exit(1)

        user = User.objects.filter(email=email).first()
        if user:
            res = assign_thumbnail_to_user(user, url)
            print(res)
        else:
            print(f"user not found")
