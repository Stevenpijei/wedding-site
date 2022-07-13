from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar
from bs4 import BeautifulSoup
from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup
from lstv_api_v1.utils.business_admin_actions import create_upload_image
class Command(BaseCommand):

    def handle(self, *args, **options):
        articles = Article.objects.all()
        index = 1
        count = 1
        with alive_bar(len(articles), "- Migrating images from Article Content to new cdn", bar="blocks", length=10) as bar:
            for article in articles:
                state = True
                state_desc =  ''
                content = article.content_legacy
                # one off error
                content = content.replace('<img \\r\\nsrc',"<img src")

                # instanciating bs4 content
                soup = BeautifulSoup(content,'html.parser')
                
                # replacing old site images to my temp ftp url for old images
                if state:
                    images_tag = soup.find_all('img')
                    for image_tag in images_tag:
                        try:
                            if 'lovestoriestv.com/wp-content' in image_tag['src'] \
                                or 'd2ef41pp6js8z8.cloudfront.net/uploads' in image_tag['src'] \
                                    or 's3-us-east-2.amazonaws.com/lstv-content/' in image_tag['src']\
                                        or 'lovestoriestv.us/wp-content' in image_tag['src']:
                                image_source = image_tag['src']
                                migrate_url = image_source.replace('https://lovestoriestv.com/wp-content/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('https://d2ef41pp6js8z8.cloudfront.net/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('https://s3-us-east-2.amazonaws.com/lstv-content/wp-content/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('\\"','').replace('\\r\\n','').replace('https://lovestoriestv.us/wp-content/uploads','https://b8da1a10.digital/lstv2_img')
                                create_upload_image(migrate_url,ImagePurposeTypes.photo)
                            elif 'ad.linksynergy' in image_tag['src'] or 'amazon-adsystem' in image_tag['src'] or 'googleusercontent' in image_tag['src']:
                                print('skipping amazon, google or amazom ad images')
                            else:
                                create_upload_image(image_tag['src'].replace('\\"',''),ImagePurposeTypes.photo)
                        except Exception as e:
                            print(e)   
                bar()
