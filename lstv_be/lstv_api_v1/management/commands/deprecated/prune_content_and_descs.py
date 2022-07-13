from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError
from bs4 import BeautifulSoup, Comment
import html


class Command(BaseCommand):
    def handle(self, *args, **options):
        videos = Video.objects_all_states.all()
        businesses = Business.objects_all_states.all()

        print(f"{videos.count()} videos with legacy shoppable modules")

        num_good = 0
        num_failed = 0

        with alive_bar(videos.count(), "- pruning HTML and other disturbances from video.content", length=10,
                       bar="blocks") as bar:
            for video in videos:
                soup = BeautifulSoup(video.content, 'html.parser')
                for element in soup(text=lambda text: isinstance(text, Comment)):
                    element.extract()
                for tag in soup.find_all():
                    tag.decompose()
                    # or
                    # tag.extract()
                video.content = html.unescape(str(soup).strip()).replace(r"\r", " ").replace(r"\n", "").replace(
                    r'\"', '"')
                video.content = re.sub(r'^https?:\/\/.*[\r\n]*', '', video.content, flags=re.MULTILINE)
                video.save()
                bar()

        video = None

        with alive_bar(businesses.count(), "- pruning HTML and other disturbances in business descs", length=10,
                       bar="blocks") as bar:
            for business in businesses:
                if business.description:
                    soup = BeautifulSoup(business.description, 'html.parser')
                    for element in soup(text=lambda text: isinstance(text, Comment)):
                        element.extract()

                    for tag in soup.find_all():
                        tag.decompose()
                        # or
                        # tag.extract()
                    business.description = html.unescape(str(soup).strip()).replace(r"\r", " ").replace(r"\n",
                                                                                                        "").replace(
                        r'\"', '"')
                    business.description = re.sub(r'^https?:\/\/.*[\r\n]*', '', business.description,
                                                  flags=re.MULTILINE)
                    business.save()
                bar()
