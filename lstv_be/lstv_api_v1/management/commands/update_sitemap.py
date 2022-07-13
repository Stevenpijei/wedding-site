from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar
from bs4 import BeautifulSoup, Comment
from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3
from lstv_api_v1.utils.utils import get_location_for_ip, notify_grapevine
from django.contrib.sitemaps.views import sitemap, index as sitemap_index
from rest_framework.test import APIRequestFactory
import requests
import urllib.request
from lstv_be import settings
from lstv_be.settings import WEB_SERVER_URL, APP_SERVER_URL, DEFAULT_APP_STATIC_BUCKET_NAME


class Command(BaseCommand):

    def handle(self, *args, **options):
        # get initial sitemap index
        url = f"{APP_SERVER_URL}/v1/sitemap.xml"
        print(url)
        response = requests.request("GET", url)

        soup = BeautifulSoup(response.text, "html.parser")
        maps = soup.find_all('loc')

        for map in maps:
            m = map.get_text()
            filename = m.split('/')[-1]
            split = filename.split("?")
            if len(split) > 1:
                filename = split[0].replace(".xml", f"{split[1].replace('p=','')}.xml")
            print(f"fetching  -  {m}   -->  {filename} ->  {DEFAULT_APP_STATIC_BUCKET_NAME}/{filename}")
            map.string = f"{WEB_SERVER_URL}/{filename}"
            urllib.request.urlretrieve(m, filename)
            upload_file_to_aws_s3(filename, "", filename, 'public-read', True, DEFAULT_APP_STATIC_BUCKET_NAME)

        # print index with modified links
        text_file = open("sitemap_index.xml", "w")
        n = text_file.write(str(soup))
        text_file.close()
        upload_file_to_aws_s3("sitemap_index.xml", "./", "sitemap_index.xml", 'public-read', True, DEFAULT_APP_STATIC_BUCKET_NAME)
        notify_grapevine(":world_map: sitemap auto-updated on production")
