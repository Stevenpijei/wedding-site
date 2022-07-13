from bs4 import BeautifulSoup, Comment
from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
import re
import html

from lstv_api_v1.utils.utils import verify_resource_url, verify_image_url


class Command(BaseCommand):
    def handle(self, *args, **options):
        cursor = connections['migrate'].cursor()
        cursor.execute(
            "select * from posts where post_status = 'publish' and post_type = 'post' and post_content like '%lstv-shoppable-container%';")
        result = get_dict(cursor)
        cursor.close()
        print(
            "POST ID,TITLE,TYPE,URL,ITEM DESCRIPTION, ITEM IMAGE URL, ITEM CTA TEXT, ITEM CTA URL,CTA URL VALID, ITEM IMAGE URL, IMAGE URL OK")
        for r in result:
            soup = BeautifulSoup(r['post_content'], 'html.parser')
            divs = soup.findAll("div", {"class": "lstv-shoppable-item"})
            for div in divs:
                image = divs[0].img['src']
                desc = div.find('div', attrs={'class': 'lstv-shoppable-item-desc'})
                cta = div.find('div', attrs={'class': 'lstv-shoppable-item-cta'})
                try:
                    cta_url = cta.a['href']
                except (KeyError, AttributeError):
                    cta_url = "n/a"

                if cta_url.strip().endswith("/"):
                    cta_url = cta_url.strip()[:-1]
                if image.strip().endswith("/"):
                    image = image.strip()[:-1]

                cta_ok, redirect = verify_resource_url(cta_url)
                image_ok = verify_image_url(image)

                post_type = "video page"
                idx = r['post_title'].find(" + ")
                if idx == -1:
                    post_type = "blog page"

                print(
                    f"{r['ID']},{r['post_title'].replace(',', '-')},{post_type},https://lovestoriestv.com/{r['post_name']},"
                    f"{desc.text if desc else 'n/a'},{image},{cta.text if cta else 'n/a'},{cta_url},{cta_ok},{image},{image_ok}")
