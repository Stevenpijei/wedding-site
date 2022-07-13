from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar
from bs4 import BeautifulSoup
from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup
import re
from markdownify import markdownify as md
class Command(BaseCommand):
    
    def handle(self, *args, **options):
        articles = Article.objects.all()
        index = 1
        with alive_bar(len(articles), "- Repairing Article Content", bar="blocks", length=10) as bar:
            for article in articles:
                # maintains state, description and if to convert
                state = True
                state_desc =  set()
                convert = True
                content = article.content_legacy
                # one off errors
                woobox_tag = re.findall(r'\[woobox\s\w+\]',content,re.MULTILINE)
                if content == '' or len(woobox_tag)>0:
                    state = False
                    state_desc.add('Empty content legacy')
                    convert=False
                content = content.replace('<img \\r\\nsrc',"<img src")
                caption_tags = re.findall(r'\[\/*caption[\s\w=\\"]*\]',content)
                for caption_tag in caption_tags:
                    content = content.replace(caption_tag,'')
                ol_tags = re.findall(r'<ol\s+start=\\"\d\\">',content)
                if len(ol_tags) > 0:
                    state_desc.add('malformed ol tags')

                # changing [jwplayer media_id] to {video|media_id}
                videos_jwp = re.findall(r'\[jwplayer\s\w+\]',content,re.MULTILINE)
                for video_jwp in videos_jwp:
                    original_jwp_wp = video_jwp
                    video_jwp = video_jwp.replace('[jwplayer ','')
                    video_jwp = video_jwp.replace(']','}')
                    media_id = video_jwp[:-1]
                    temp_tag = '{video|' + video_jwp
                    content = content.replace(original_jwp_wp,temp_tag)
                    wp_jwp = VideoSource.objects.filter(media_id=media_id)
                    if len(wp_jwp)==0:
                        v = VideoSource(
                            status=VideoStatusEnum.ready,
                            media_id=media_id,
                            type=VideoTypeEnum.jwplayer)
                        v.save()

                #inline vimeo:
                videos_vimeo = re.findall(r'\\r\\nhttps://vimeo.com/\d+\\r\\n',content,re.MULTILINE)
                for video_vimeo in videos_vimeo:
                    video_vimeo_media_id = video_vimeo.split('/')[3].replace('\\r\\n','')
                    vimeo_video_inline = VideoSource.objects.filter(media_id=video_vimeo_media_id)
                    if len(vimeo_video_inline)==0:
                        v = VideoSource(
                            status=VideoStatusEnum.ready,
                            media_id=video_vimeo_media_id,
                            type=VideoTypeEnum.vimeo)
                        v.save()
                    content = content.replace(video_vimeo,'{video|'+video_vimeo_media_id+'}')
                
                # note: replacing \r\n in text with newline, can change later if need by FE
                # surprisingly crlf works well with markdown parser
                # content = content.replace('\\r\\n','')
                
                # instanciating bs4 content
                soup = BeautifulSoup(content,'html.parser')

                # replacing instagram post_id
                insta_embeds = soup.find_all('blockquote')
                for insta_embed in insta_embeds:
                    insta_href = insta_embed.find_all('a')
                    insta_post_link = insta_href[0]['href']
                    content = content.replace(str(insta_embed),'{ig_post|'+str(insta_post_link.split('/')[4])+'}')
                    insta_embed.replace_with('{ig_post|'+str(insta_post_link.split('/')[4])+'}')

                # script tag modification
                script_tags = soup.find_all('script')
                for script_tag in script_tags:
                    try:
                        # fixing jwpalyer script embed
                        if 'jwplatform.com/players/' in script_tag['src'] or 'jwplayer.com/players/' in script_tag['src']:
                            script_media_id = script_tag['src'].split('/')[4].split('-')[0]
                            script_tag.replace_with('{video|' + script_media_id + '}')
                        # removing remenants of instagram post embed and lstv embed
                        elif 'instagram.com/en_US/embeds.js' in script_tag['src'] or 'js/lstvembed.js' in script_tag['src'] or 'instagram.com/embed.js' in script_tag['src']:
                            script_tag.replace_with('')
                        elif any(script_content in script_tag['src'] for script_content in ('woobox','typeform','viralsweep','amzn','amazon','cnevids')):
                            raise Exception
                    except Exception as e:
                        state_desc.add('Script tag parsing error')
                        state_desc.add('Woobox giveaway script embed' if 'woobox' in str(script_tag) else '')
                        state_desc.add('Typeform script embed' if 'typeform' in str(script_tag) else '')
                        state_desc.add('Viralsweep script embed' if 'viralsweep' in str(script_tag) else '')
                        state_desc.add('amzn script embed' if 'amzn' in str(script_tag) else '')
                        state_desc.add('cne vids script embed' if 'cnevids' in str(script_tag) else '')
                        state = False
                        convert = False

                #continuing image tags parsing if convert is True
                if convert:
                    images_tag = soup.find_all('img')
                    for image_tag in images_tag:
                        try:
                            # migrating images to new cdn, note: https://b8da1a10.digital/ is my site
                            if 'lovestoriestv.com/wp-content' in image_tag['src'] \
                                or 'd2ef41pp6js8z8.cloudfront.net/uploads' in image_tag['src'] \
                                    or 's3-us-east-2.amazonaws.com/lstv-content/' in image_tag['src']\
                                        or 'lovestoriestv.us/wp-content' in images_tag['src']:
                                image_source = image_tag['src']
                                migrated_url = image_source.replace('https://lovestoriestv.com/wp-content/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('https://d2ef41pp6js8z8.cloudfront.net/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('https://s3-us-east-2.amazonaws.com/lstv-content/wp-content/uploads','https://b8da1a10.digital/lstv2_img')\
                                                .replace('\\"','').replace('\\r\\n','').replace('https://lovestoriestv.us/wp-content/uploads','https://b8da1a10.digital/lstv2_img')
                            else:
                               migrated_url = image_source.replace('\\"','')
                            cdn_image_url = Image.objects.filter(legacy_url = migrated_url)
                            if len(cdn_image_url) > 0:
                                image_tag['src'] = cdn_image_url[0].serve_url
                            else:
                                convert = False
                                state_desc.add('Image not migrated to cdn')
                        except:
                            state_desc.add('image tag parsing error')
                            state = False
                            convert = False
                
                # continuing to prepare iframe tags
                if convert:
                    iframes = soup.find_all('iframe')
                    for iframe in iframes:
                        try:
                            if 'https://www.youtube.com/embed/' in str(iframe['src']):
                                if len(iframe['src']) < 46:
                                   yt_media_id = (iframe['src'].split('/')[4])[:-2]
                                else:
                                    yt_media_id = iframe['src'][iframe['src'].find('embed/')+6:iframe['src'].find('?')]
                                iframe.replace_with('{video|' + yt_media_id + '}')
                                yt_video_iframe = VideoSource.objects.filter(media_id=yt_media_id)
                                if len(yt_video_iframe)==0:
                                    v = VideoSource(
                                        status=VideoStatusEnum.ready,
                                        media_id=yt_media_id,
                                        type=VideoTypeEnum.youtube)
                                    v.save()
                            elif 'https://player.vimeo.com/video/' in str(iframe['src']):
                                if len(iframe['src']) < 45:
                                   vimeo_media_id = (iframe['src'].split('/')[4])[:-2]
                                else:
                                    vimeo_media_id = iframe['src'][iframe['src'].find('video/')+6:iframe['src'].find('?')]
                                iframe.replace_with('{video|' + vimeo_media_id + '}')
                                vimeo_video_iframe = VideoSource.objects.filter(media_id=vimeo_media_id)
                                if len(vimeo_video_iframe)==0:
                                    v = VideoSource(
                                        status=VideoStatusEnum.ready,
                                        media_id=vimeo_media_id,
                                        type=VideoTypeEnum.vimeo)
                                    v.save()
                            elif 'http://content.jwplatform.com/players/' in str(iframe['src']):
                                jwp_media_id = (iframe['src'].split('/')[4]).split('-')[0]
                                iframe.replace_with('{video|' + jwp_media_id + '}')
                                jwp_video_iframe = VideoSource.objects.filter(media_id=jwp_media_id)
                                if len(jwp_video_iframe)==0:
                                    v = VideoSource(
                                        status=VideoStatusEnum.ready,
                                        media_id=jwp_media_id,
                                        type=VideoTypeEnum.jwplayer)
                                    v.save()
                            else:
                                iframe['src'] = iframe['src'].replace('//html5-player','https://html5-player')
                                iframe.replace_with('{iframe|' + iframe['src'].strip('\\"//') + '}')
                        except:
                            state_desc.add('iframe parsing error')
                            state = False
                            convert = False

                # salvaging/rescuing old lstv tags
                if convert:
                    hrefs = soup.find_all('a')
                    for href in hrefs:

                        try:
                            href['href'] = href['href'].replace('\\"','')
                            link = href['href']
                            if 'https://lovestoriestv.com/' in link:
                                href['href'] = link.replace('\\"','')
                                if '?p=' in link:
                                    legacy_post_id = link.split('=')[1].split('&')[0][:-2]
                                    legacy_post = Post.objects.filter(legacy_post_id=legacy_post_id)
                                    if len(legacy_post)>0:
                                        href['href'] = '/' + legacy_post[0].slug
                                    else:
                                        state = False
                                        state_desc.add('Old wordpress lstv dead link')
                                elif '/20' in link:

                                    state = False
                                    state_desc.add('Old wordpress lstv dead link')
                                elif '/wedding' in link:
                                    url_rescue_flag = True
                                    continue_flag = True
                                    #trying for businesses slug
                                    business = Business.objects.filter(legacy_url=link.replace('https://lovestoriestv.com','').replace('wedding-videographer','wedding/videographer'))
                                    if len(business)>0:
                                        href['href'] = '/business/' + business[0].slug
                                        continue_flag = False
                                    else:
                                        url_rescue_flag = False
                                    #trying for post slug
                                    if continue_flag:
                                        post = Post.objects.filter(legacy_url=link.replace('https://lovestoriestv.com',''))
                                        if len(post)>0:
                                            href['href'] = '/' + post[0].slug
                                            continue_flag = True
                                        else:
                                            url_rescue_flag = False
                                    #trying style
                                    if continue_flag:
                                        tag_type = TagType.objects.filter(legacy_url=link.replace('https://lovestoriestv.com',''))
                                        if len(tag_type)>0:
                                            href['href'] = '/style/' + tag_type[0].slug
                                            continue_flag = False
                                        else:
                                            url_rescue_flag = False
                                    if not url_rescue_flag and continue_flag:
                                        state = False
                                        state_desc.add('Old wordpress lstv dead link')
                        except Exception as e:
                            state = False
                            state_desc.add('link tag parsing error')
                            convert = False
                
                # continuing to mark tables for review
                if convert:
                    table = soup.find_all('table')
                    if len(table) > 0:
                        state_desc.add('Table found, check if header exists, else add |-| for each column')
                        state = False

                if convert:
                    try:
                        content_md = md(str(soup))
                        article.content_md = content_md
                    except Exception as e:
                        state_desc.add('Markdown convert error')
                        state = False
                if not state:
                    article.state = ContentModelState.suspended_review
                article.state_desc = list(state_desc)if len(state_desc)>0 else None
                article.save()
                bar()
