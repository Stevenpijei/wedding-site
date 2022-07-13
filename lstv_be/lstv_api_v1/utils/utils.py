import time
from json import JSONDecodeError
from uuid import uuid4

import urllib3
from jwplatform.errors import *
import isodate
import requests
import re

from jwplatform.v1.errors import JWPlatformRateLimitExceededError, JWPlatformNotFoundError
from timezonefinder import TimezoneFinder
from unidecode import unidecode
import jwplatform.v1
from django.db.models import Count, Subquery, OuterRef, F
from lstv_api_v1.globals import *
from lstv_api_v1.models import *
from itertools import chain

from lstv_api_v1.utils.model_utils import *
import bugsnag
import logging
from django.conf import settings
from django.core.cache import caches
from rest_framework.test import APIRequestFactory, CoreAPIClient
from lstv_be.settings import WEB_SERVER_URL, RELEASE_STAGE, VERSION

SERIALIZER_DETAIL_LEVELS = ['slug', 'full', 'card']
SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL = 'slug'
SERIALIZER_DETAIL_LEVEL_CONTEXT_FULL = 'full'
SERIALIZER_DETAIL_LEVEL_CONTEXT_CARD = 'card'


def set_volatile_value(key, value, ttl_min):
    cache = caches['volatile']
    cache.set(key, value, ttl_min * 60)


def get_volatile_value(key):
    cache = caches['volatile']
    return cache.get(key)


def delete_volatile_value(key):
    cache = caches['volatile']
    return cache.delete(key)


def create_image_from_base64(filename, base64str):
    from PIL import Image
    import base64
    from io import BytesIO
    base64data = base64str.replace(' ', '+')
    im = Image.open(BytesIO(base64.b64decode(base64data)))
    filename = f"{filename}.{im.format.lower()}"
    im.save(filename, quality=90)
    return filename


def upload_image_to_cdn(filename, folder, purpose):
    from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3
    from PIL import Image as PILImage
    import os
    if os.path.exists(filename):
        im = PILImage.open(filename)
        aspect_ratio = im.width / im.height

        orig_url = upload_file_to_aws_s3(f"{filename}", folder, filename)

        # mobile
        mobile_width = Image.url_appendix_dict.get(ImageDeviceTypes.phone, {}).get(purpose, None)
        im_mbl = im.resize([mobile_width, int(mobile_width / aspect_ratio)])
        filename_mobile = filename.replace("-orig", "-mbl")
        im_mbl.save(filename_mobile, quality=90)
        upload_file_to_aws_s3(filename_mobile, folder, filename_mobile)

        # tablet
        tablet_width = Image.url_appendix_dict.get(ImageDeviceTypes.tablet, {}).get(purpose, None)
        im_tablet = im.resize([tablet_width, int(tablet_width / aspect_ratio)])
        filename_tablet = filename.replace("-orig", "-tab")
        im_tablet.save(filename_tablet, quality=90)
        upload_file_to_aws_s3(filename_tablet, folder, filename_tablet)

        # desktop
        desktop_width = Image.url_appendix_dict.get(ImageDeviceTypes.desktop, {}).get(purpose, None)
        im_desktop = im.resize([desktop_width, int(desktop_width / aspect_ratio)])
        filename_desktop = filename.replace("-orig", "-dsk")
        im_desktop.save(filename_desktop, quality=90)
        upload_file_to_aws_s3(filename_desktop, folder, filename_desktop)

        # cleanup

        if filename and os.path.exists(filename):
            os.remove(filename)
        if filename_mobile and os.path.exists(filename_mobile):
            os.remove(filename_mobile)
        if filename_mobile and os.path.exists(filename_tablet):
            os.remove(filename_tablet)
        if filename_desktop and os.path.exists(filename_desktop):
            os.remove(filename_desktop)

        return orig_url


def convert_legacy_blog_content(article):
    regex = r'(\<script.*\</script\>|\<script.*/\>)'
    rc = []
    breakdown = re.split(regex, article.content_legacy)
    if article.post.slug == 'how-to-plan-a-lesbian-wedding':
        breakdown = re.split(regex, article.content_legacy.replace("\\n", "").replace("\\r", ""))

    video_encountered = False

    for content_str in breakdown:
        if content_str.strip():
            if '<script' in content_str:
                if 'content.jwplatform.com' in content_str:
                    player_and_media_id = re.compile('\w+(?=-)|(?<=-)\w+').findall(content_str)
                    # print(player_and_media_id)
                    if len(player_and_media_id) == 2:
                        rc.append({'type': 'video', 'player_id': player_and_media_id[1],
                                   'media_id': player_and_media_id[0], 'auto_play': not video_encountered})
                        video_encountered = True
            else:
                rc.append({'type': 'legacy_html',
                           'content': content_str})

    article.content = rc
    article.save()
    return rc


def convert_legacy_blog_content_with_soup(content):
    rc = []
    rc.append({'type': 'legacy_html',
               'content': content})
    return rc


def get_messaging_thread_id(from_user, to_user):
    rc = uuid4()

    past_message = Message.objects.filter(from_user=from_user, to_user=to_user).first()
    if past_message:
        rc = past_message.thread_id

    return rc


def get_sender_name_from_session(request):
    if request.user and not request.user.is_anonymous:
        return request.user.get_full_name_or_email(), request.user
    else:
        return None, None


def get_short_date_from_video_id(video_id):
    from datetime import datetime
    try:
        video = Video.objects.get(pk=video_id)
        wedding_date = video.event_date
        readable_date = datetime.strptime(str(wedding_date.value_date), "%Y-%m-%d").strftime("%B %Y")
        return f" {readable_date} "
    except Video.DoesNotExist:
        return " "
    except:
        return " "


def suffix(d):
    return 'th' if 11 <= d <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(d % 10, 'th')


def get_verbose_date_format(date):
    date_obj = datetime.strptime(date, '%Y-%m-%d')
    return date_obj.strftime("%A, %B {S}, %Y").replace('{S}', str(date_obj.day) + suffix(date_obj.day))


def get_bride_groom_names_from_post_slug(url):
    url = strip_url(url)
    post = Post.objects.filter(slug=url).first()
    if post:
        first = post.properties.filter(key="spouse_1").exclude(value_text="").first().value_text
        second = post.properties.filter(key="spouse_2").exclude(value_text="").first().value_text
        return first + " & " + second
    return None


def get_business_email_from_business_record(business_slug):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    try:
        business = Business.objects.get(slug=business_slug)
        if settings.DEBUG:
            return None, "ronen+debug@lovestoriestv.com"
        else:
            return business.get_contact_for_inquiry()
    except Business.DoesNotExist:
        job_alert_cto("can't get business email for inquiry", "get_business_email_from_business_record",
                      f"business slug: {business_slug}")
        return None, None


def strip_url(url):
    if url.count('/') > 0 and len(url) > 1:
        if url[0] == '/':
            url = url[1:]
        if url[-1] == '/':
            url = url[0:-1]
        return url
    else:
        return url


def get_page_type_from_url(url):
    if '/business/' in url:
        return PAGE_TYPE_BUSINESS
    try:
        post = Post.objects.get(slug=strip_url(url))
        # print(post.type)
        if post.type == PostTypeEnum.video:
            return PAGE_TYPE_VIDEO
        if post.type == PostTypeEnum.article:
            return PAGE_TYPE_ARTICLE
        if post.type == PostTypeEnum.page:
            return PAGE_TYPE_CUSTOM_PAGE
    except Post.DoesNotExist:
        pass

    return PAGE_TYPE_BUSINESS


def breakdown_google_location(location):
    if location and 'components' in location:
        elements = {}
        for element in location['components']:
            if 'country' in element['types'] and element['short_name'] != 'US':
                elements['country'] = element['short_name']

            if 'administrative_area_level_1' in element['types']:
                elements['state_region'] = element['short_name']

            if 'administrative_area_level_2' in element['types']:
                elements['county'] = element['long_name']

            if any(key in ['locality', 'sublocality', 'administrative_area_level_3'] for key in element['types']):
                elements['place'] = element['long_name']

        if 'formatted' in location:
            formatted_elements = location['formatted'].split(",")

            if len(formatted_elements) == 4:
                print(formatted_elements)
                elements['street_address'] = formatted_elements[0]
        return elements
    else:
        return None


def build_location_from_google_places(location):
    breakdown = breakdown_google_location(location)
    if breakdown:
        street_address = None
        country = None
        state_province = None
        place = None

        if 'street_address' in breakdown:
            if 'street_address' in breakdown:
                street_address = breakdown['street_address']

        if 'country' in breakdown:
            country = Country.objects.filter(iso2=breakdown['country']).first()

        if 'state_region' in breakdown:
            if country:
                state_province = StateProvince.objects.filter(
                    Q(code=breakdown['state_region']) | Q(name=breakdown['state_region']), country=country).first()
            else:
                if 'place' in breakdown:
                    place = Place.objects.filter(
                        Q(Q(name=breakdown['place']) | Q(name=f"{breakdown['place'].replace(' Township', '')}"))
                        & Q(state_province__code=breakdown['state_region'])).first()
                    if place:
                        state_province = place.state_province
                        country = place.country

        if not place and 'place' in breakdown:
            if not country and not state_province:
                place = Place.objects.filter(name=breakdown['place']).first()
            if country and not state_province:
                place = Place.objects.filter(name=breakdown['place'], country=country).first()
            if country and state_province:
                place = Place.objects.filter(name=breakdown['place'], country=country,
                                             state_province=state_province).first()

        # look for a location like that...
        if street_address:
            location_obj = Location.objects.filter(address1=street_address, country=country,
                                                   state_province=state_province, place=place).first()
        else:
            location_obj = Location.objects.filter(country=country, state_province=state_province, place=place).first()

        if location_obj:
            return location_obj
        else:
            location_obj = Location(country=country, state_province=state_province, place=place,
                                    address1=street_address)
            location_obj.save()
            return location_obj
    else:
        return None


def get_human_readable_google_location(location):
    location_breakdown = breakdown_google_location(location)
    if location_breakdown is not None and len(location_breakdown) > 0:
        if 'country' in location_breakdown and 'state_region' in location_breakdown and 'place' in location_breakdown \
                and 'county' in location_breakdown:
            return f"{location_breakdown['place']}, {location_breakdown['state_region']}, " \
                   f"{location_breakdown['country']} ({location_breakdown['county']})"
        if 'country' in location_breakdown and 'state_region' in location_breakdown and 'place' in location_breakdown:
            return f"{location_breakdown['place']}, {location_breakdown['state_region']}, " \
                   f"{location_breakdown['country']}"
        elif 'state_region' in location_breakdown and 'place' in location_breakdown and 'county' in location_breakdown:
            return f"{location_breakdown['place']}, {location_breakdown['state_region']} ({location_breakdown['county']})"
        elif 'state_region' in location_breakdown and 'place' in location_breakdown:
            return f"{location_breakdown['place']}, {location_breakdown['state_region']}"
        elif 'place' in location_breakdown and 'country' in location_breakdown:
            return f"{location_breakdown['place']}, {location_breakdown['country']}"
        elif 'place' in location_breakdown:
            return f"{location_breakdown['place']}"
    else:
        return "Location undisclosed"


def get_bride_groom_email_from_post_slug(url):
    # print(url)
    url = strip_url(url)
    user = None
    post = Post.objects.filter(slug=url).first()
    if not post and url == '/':
        main_video_setting = Setting.objects.get(name=SETTING_MAIN_VIDEO_POST)
        if main_video_setting:
            video = Video.objects.get(id=main_video_setting.value['value'])
            if video:
                post = video.post

    if post:
        email = post.properties.filter(key="legacy_bride_or_groom_email").exclude(value_text="").first()
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass

            if settings.DEBUG:
                return "ronen+debug@lovestoriestv.com", user
            else:
                return email, user
        else:
            if settings.DEBUG:
                return "ronen+debug@lovestoriestv.com", user
            else:
                return "bookings@lovestoriestv.com", user
    else:
        return None, None


def get_image_size_from_url(url):
    from PIL import Image
    from urllib.request import urlopen
    try:
        img = Image.open(urlopen(url))
        return img.size[0], img.size[1]
    except:
        return 0, 0


def ip_to_geo_location(ip):
    response = requests.get(url="http://api.ipstack.com/" + ip,
                            params={"access_key": "4bb209a0ca36b360d370260d54ed1715"})
    if response.status_code == 200:
        data = response.json()

        location = Location()

        if 'country_name' in data and not data['country_name'] is None and not data[
            'country_name'].isspace():
            location.legacy_country = data['country_name']

        if 'region_name' in data and not data['region_name'] is None and not data['region_name'].isspace():
            location.legacy_state_province = data['country_name'] = data['region_name']

        if 'city' in data and not data['city'] is None and not data['city'].isspace():
            location.legacy_city = data['city']

        if 'zip' in data:
            location.zipcode = data['zip']

        # attempt to get geo db fixes

        if complete_address_from_geo_db(location):
            return location

    return None


def get_location_for_ip(ip_record):
    old_location = None
    # delete old location if any...
    if ip_record.location:
        old_location = ip_record.location
    location = ip_to_geo_location(ip_record.ip)
    if location:
        location.legacy_city = None
        location.legacy_state_province = None
        location.legacy_country = None
        location.source_desc = 'ip-to-geo (' + ip_record.ip + ')'
        location.save()
        ip_record.location = location
        ip_record.processed = True
        ip_record.save()
    else:
        ip_record.processed = True
        ip_record.save()
    if old_location:
        old_location.delete()

    return ip_record


def stash_element(extra, severity, element, data=None):
    # geo info

    logger = logging.getLogger('lstv-user-activity-log')

    # print(element)

    if not element.ip.processed:
        element.ip = get_location_for_ip(element.ip)

    if element.ip.location:
        extra['geo'] = {
        }
        if element.ip.location.country:
            extra['geo']['country_code'] = element.ip.location.country.iso3
            extra['geo']['country_name'] = element.ip.location.country.name
        if element.ip.location.state_province:
            extra['geo']['tate_province_code'] = element.ip.location.state_province.code
            extra['geo']['state_province_name'] = element.ip.location.state_province.name
        if element.ip.location.place:
            extra['geo']['place_name'] = element.ip.location.place.name
            extra['geo']['timezone'] = element.ip.location.place.timezone
            extra['geo']['postal_code'] = element.ip.location.zipcode
            extra['geo']['location'] = {
                'lat': float(element.ip.location.lat),
                'lon': float(element.ip.location.long)
            }

    if data:
        extra.update(element.data)

    if severity == UserEventSeverityEnum.fatal:
        logger.fatal('', extra=extra)
    if severity == UserEventSeverityEnum.error:
        logger.error('', extra=extra)
    if severity == UserEventSeverityEnum.warning:
        logger.warning('', extra=extra)
    if severity == UserEventSeverityEnum.info:
        logger.info('', extra=extra)
    else:
        logger.debug('', extra=extra)

    # print("stashing " + str(element.__class__) + " :" + str(element.id))

    # tagged as migrated
    element.migrated_to_log_cluster = True
    element.save()


def report_issue(issue):
    bugsnag.notify(Exception(issue))


def asciify(text):
    return unidecode(text)


def get_preview_text_from_html(html, slug):
    import html2text
    h2t = html2text.HTML2Text()
    h2t.ignore_links = True
    h2t.bypass_tables = True
    h2t.ignore_images = True
    h2t.single_line_break = True
    h2t.skip_internal_links = True

    # strip HTML..
    rc = h2t.handle(html)[0:220]

    # prune...
    return re.sub('_[^>]+_', '', rc).strip() + '...'


def obtain_url_for_card_grid_section(search_type):
    # # print(search_type)
    if search_type.content_search_type == ContentSearchQuerySourcingType.vibe_to_video:
        if len(search_type.search_items) == 1:
            return "/vibe/" + search_type.search_items[0]
        if len(search_type.search_items) > 1:
            rc = "/vibes"
            idx = 0
            for search_item in search_type.search_items:
                rc = rc + "&" + search_item + "=" + str(idx)
                idx += 1
            return rc
    if search_type.content_search_type == ContentSearchQuerySourcingType.business_to_video:
        if len(search_type.search_items) == 1:
            return "/business/" + search_type.search_items[0]
        if len(search_type.search_items) > 1:
            rc = "/businesses"
            idx = 0
            for search_item in search_type.search_items:
                rc = rc + "&" + search_item + "=" + str(idx)
                idx += 1
            return rc

    return None


def obtain_location_via_google(city, state_province, country):
    location = Location()
    results = get_google_place_info(city, state_province, country)

    if results and len(results) > 0:
        for result in results['results']:

            # if no single city can be picked given the search city/state/country...
            tf = TimezoneFinder(in_memory=True)

            city_name = None
            city_name_short = None
            state_province_name = None
            country_name = None
            pos_lat = None
            pos_long = None

            if 'geometry' in result and 'location' in result['geometry']:
                pos_lat = result['geometry']['location']['lat']
                pos_long = result['geometry']['location']['lng']

            for address_component in result['address_components']:
                if 'locality' in address_component['types'] or 'natural_feature' in address_component['types']:
                    city_name = address_component['long_name']
                    city_name_short = address_component['short_name']

                if 'administrative_area_level_1' in address_component['types']:
                    state_province_name = address_component['long_name']

                if 'country' in address_component['types']:
                    country_name = address_component['long_name']

            if not city_name:
                for address_component in result['address_components']:
                    if 'administrative_area_level_3' in address_component['types']:
                        city_name = address_component['long_name']

            if not city_name:
                for address_component in result['address_components']:
                    if 'administrative_area_level_2' in address_component['types']:
                        city_name = address_component['long_name']

            logging.getLogger('migration').info(
                "[OK ] location! -- Found city/place in Google: {} ({}, {}) - search: {} ({}, {})".format(
                    city_name if city_name else "n/a",
                    state_province_name if state_province_name else "n/a",
                    country_name if country_name else "n/a",
                    city if city else "n/a",
                    state_province if state_province else "n/a",
                    country if country else "n/a"
                ))

            state_province_fk = None
            country_fk = None

            if state_province_name:
                state_province_fk = StateProvince.objects.filter(name__iexact=state_province_name).first()

                if not state_province_fk:
                    state_province_fk = StateProvince.objects.filter(
                        name_ascii__iexact=state_province_name).first()
                    if not state_province_fk:
                        logging.getLogger('migration').warning(
                            "[NOK] location! -- Google state/province not in geo_db: {} ({}, {}) - search: {} ({}, {})".format(
                                city_name if city_name else "n/a",
                                state_province_name if state_province_name else "n/a",
                                country_name if country_name else "n/a",
                                city if city else "n/a",
                                state_province if state_province else "n/a",
                                country if country else "n/a"
                            ))

            if country_name:
                country_fk = Country.objects.filter(name__iexact=country_name).first()

                if not country_fk:
                    logging.getLogger('migration').warning(
                        "[NOK] location! -- Google country not in geo_db: {} ({}, {}) - search: {} ({}, {})".format(

                            city_name if city_name else "n/a",
                            state_province_name if state_province_name else "n/a",
                            country_name if country_name else "n/a",
                            city if city else "n/a",
                            state_province if state_province else "n/a",
                            country if country else "n/a"
                        ))

            if city_name and country_fk:

                # does it exist?
                new_city = Place.objects.filter(name=city_name,
                                                state_province=state_province_fk,
                                                country=country_fk).first()
                if not new_city:
                    new_city = Place(name=city_name,
                                     slug=slugify(city_name),
                                     name_ascii=asciify(city_name),
                                     alt_names=[
                                         city_name_short] if city_name_short and city_name_short.lower() !=
                                                             city_name.lower() else None,
                                     alt_names_ascii=[asciify(
                                         city_name_short)] if city_name_short and city_name_short.lower() !=
                                                              city_name.lower() else None,
                                     lat=pos_lat,
                                     long=pos_long,
                                     state_province=state_province_fk,
                                     country=country_fk,
                                     timezone=tf.timezone_at(lng=pos_long, lat=pos_lat),
                                     source=PlaceSource.google)
                    new_city.save()

                location.place = new_city
                location.state_province = state_province_fk
                location.country = country_fk
                return location

    return location


def select_location(cities, city, state_province, country):
    location = Location()

    for city_obj in cities:
        match = False
        if city and state_province and country and city_obj.state_province and city_obj.country:
            match = city_obj.name.lower().strip() == city.lower().strip() and \
                    city_obj.state_province.name.lower().strip() == state_province.lower().strip() and \
                    city_obj.country.name.lower().strip() == country.lower().strip()
        elif city and country and city_obj.country and not state_province:
            match = city_obj.name.lower().strip() == city.lower().strip() and \
                    city_obj.country.name.lower().strip() == country.lower().strip()
        elif city and not country and not state_province:
            match = True

        if match:
            logging.getLogger('migration').info(
                "[OK ] location! -- from multi-city: {} ({}, {}) - search: {} ({}, {})".format(
                    city_obj.name if city_obj.name else "n/a",
                    city_obj.state_province.name if city_obj.state_province else "n/a",
                    city_obj.country.name if city_obj.country else "n/a",
                    city if city else "n/a",
                    state_province if state_province else "n/a",
                    country if country else "n/a"
                ))

            location.place = city_obj
            location.state_province = city_obj.state_province
            location.country = city_obj.country

    return location


def obtain_location_for_cities(cities, city, state_province, country):
    location = Location()
    if len(cities) == 1:
        logging.getLogger('migration').info(
            "[OK ] location! -- Found single city: {} ({}, {}) - search: {} ({}, {})".format(
                cities[0].name if cities[0].name else "n/a",
                cities[0].state_province.name if cities[0].state_province else "n/a",
                cities[0].country.name if cities[0].country else "n/a",
                city if city else "n/a",
                state_province if state_province else "n/a",
                country if country else "n/a"
            ))
        location.place = cities[0]
        location.state_province = cities[0].state_province
        location.country = cities[0].country
        return location

    elif len(cities) > 1:
        location = select_location(cities, city, state_province, country)
        if not location.has_content():
            logging.getLogger('migration').warning(
                "[NOK] location! -- Cant find in alt_db, trying Google - search: {} ({}, {})".format(
                    city if city else "n/a",
                    state_province if state_province else "n/a",
                    country if country else "n/a"
                ))
            return obtain_location_via_google(city, state_province, country)

    return location


def sift_through_countries_singular(country):
    location = Location()
    if country:
        country = country.strip()

        countries = Country.objects.filter(
            Q(name__iexact=country) |
            Q(name_ascii__iexact=country) |
            Q(slug=slugify(country)))

        if len(countries) == 1:
            location.place = None
            location.state_province = None
            location.country = countries[0]
        else:
            if country == 'Great Britain (UK)' or country == 'UK':
                return sift_through_countries_singular('United Kingdom')
            if country == 'USA':
                return sift_through_countries_singular('United States')
            if country == 'Bahamas':
                return sift_through_countries_singular('Bahamas, The')
            if country == 'South Korea':
                return sift_through_countries_singular('Korea, South')
            if country == 'Virgin Islands, U.S.':
                return sift_through_countries_singular('U.S. Virgin Islands')

    return location


def sift_through_cities_singular(city):
    location = Location()
    if city:
        city = city.strip()

        cities = Place.objects.filter(
            Q(name__iexact=city) |
            Q(name_ascii__iexact=city) |
            Q(slug=slugify(city)) |
            Q(alt_names__icontains=city))

        if len(cities) == 1:
            location.place = cities[0]
            location.state_province = cities[0].state_province
            location.country = cities[0].country
    return location


def sift_through_cities(city, state_province, country):
    if city:
        city = city.strip()
    if state_province:
        state_province = state_province.strip()
    if country:
        country = country.strip()

    cities = Place.objects.filter(
        Q(name__iexact=city) |
        Q(name_ascii__iexact=city) |
        Q(slug=slugify(city))).order_by('-population_urban')

    if not cities:

        # do we have "st. " or "st " or dots?
        if 'st.' in city.lower():
            city = city.lower().replace('st.', 'saint')
            return sift_through_cities(city, state_province, country)
        if 'st ' in city.lower():
            city = city.lower().replace('st ', 'saint ')
            return sift_through_cities(city, state_province, country)
        if '.' in city:
            city = city.lower().replace('.', '')
            return sift_through_cities(city, state_province, country)

        # no results, turn to Google...
        return obtain_location_via_google(city, state_province, country)
    else:
        return obtain_location_for_cities(cities, city, state_province, country)


def sift_through_state_provinces(state_province, country):
    state_province_obj = None

    # trying to look for province and country together...

    if country:
        state_province_obj = StateProvince.objects.filter(
            (
                    Q(name__iexact=state_province) |
                    Q(name_ascii__iexact=state_province) |
                    Q(slug=slugify(state_province)))).filter(
            (
                    Q(country__name__iexact=country) |
                    Q(country__name_ascii__iexact=country) |
                    Q(country__slug=slugify(country))
            )
        ).first()

    # print(state_province_obj)

    # if failed -- try just province...

    if not state_province_obj:
        state_province_obj = StateProvince.objects.filter(
            Q(name__iexact=state_province) |
            Q(name_ascii__iexact=state_province) |
            Q(slug=slugify(state_province))).first()

    if not state_province_obj:
        # could it be a country in the state_province field?
        return sift_through_countries_singular(state_province)
    else:
        return Location(state_province=state_province_obj,
                        country=state_province_obj.country)


def sift_through_countries(country):
    country_obj = Country.objects.filter(
        Q(name__iexact=country) |
        Q(name_ascii__iexact=country) |
        Q(slug=slugify(country))).first()

    if not country_obj:
        if country == 'Great Britain (UK)' or country == 'UK':
            return sift_through_countries('United Kingdom')
        if country == 'USA':
            return sift_through_countries('United States')
        if country == 'Bahamas':
            return sift_through_countries('Bahamas, The')
        if country == 'South Korea':
            return sift_through_countries('Korea, South')
        if country == 'Virgin Islands, U.S.':
            return sift_through_countries('U.S. Virgin Islands')

    if not country_obj:
        return Location()
    else:
        return Location(country=country_obj)


def complete_address_from_geo_db(address):
    rc_address = Location()

    if address:
        if not address.has_content():
            if address.legacy_city:
                rc_address = sift_through_cities(
                    address.legacy_city,
                    address.legacy_state_province,
                    address.legacy_country)
            if not rc_address.has_content():
                if address.legacy_state_province:
                    rc_address = sift_through_state_provinces(
                        address.legacy_state_province,
                        address.legacy_country)
                if not rc_address.has_content():
                    if address.legacy_country:
                        rc_address = sift_through_countries(address.legacy_country)

            if rc_address.has_content():
                address.place = rc_address.place
                address.state_province = rc_address.state_province
                address.country = rc_address.country
                address.sanitized = True
                return True
            else:
                # Nada. try being creative...city name in state? this happened before...
                if address.legacy_state_province:
                    rc_address = sift_through_cities_singular(address.legacy_state_province)
                    address.place = rc_address.place
                    address.state_province = rc_address.state_province
                    address.country = rc_address.country
                    address.sanitized = True
                    return True

                # country in state?
                if address.legacy_state_province:
                    rc_address = sift_through_countries_singular(address.legacy_state_province)
                    address.place = rc_address.place
                    address.state_province = rc_address.state_province
                    address.country = rc_address.country
                    address.sanitized = True
                    return True
    return False


def location_convert_url_path_to_components(path):
    if path.startswith('/'):
        path = path[1:]
    path = path.split('/')
    location_struct = {}
    # 1: country
    # 2: country, place_or_county_or_state_province
    # 3: country, state_province, place_or_county
    # 4: country, state_province, county, place
    if len(path) < 1:
        return None

    location_struct['country'] = path[0]
    if len(path) == 2:
        location_struct['place_or_county_or_state_province'] = path[1]

    if len(path) == 3:
        location_struct['state_province'] = path[1]
        location_struct['place_or_county'] = path[2]
    if len(path) == 4:
        location_struct['state_province'] = path[1]
        location_struct['county'] = path[2]
        location_struct['place'] = path[3]

    return location_struct


def get_location_data_from_url_path(path):
    from lstv_api_v1.views.location_view import LocationView
    rc = None
    if path:
        location_struct = location_convert_url_path_to_components(path)
        if len(location_struct) > 0:
            factory = APIRequestFactory()
            request = factory.get(f"/v1/location/{path}")
            response = LocationView.as_view()(request, **location_struct)
            response.render()
            if response.status_code == 200:
                return response.data.get('result', None)
    return rc


def get_location_data_from_url_path_as_object(path):
    response = get_location_data_from_url_path(path)
    if response:
        location_class = response.get('classification', None)
        if location_class:
            location = Location()
            if 'country_id' in response:
                try:
                    location.country = Country.objects.get(pk=response['country_id'])
                except Country.DoesNotExist:
                    pass
            if 'state_province_id' in response:
                try:
                    location.state_province = StateProvince.objects.get(pk=response['state_province_id'])
                except StateProvince.DoesNotExist:
                    pass
            if 'county_id' in response:
                try:
                    location.county = County.objects.get(pk=response['county_id'])
                except County.DoesNotExist:
                    pass
            if 'place_id' in response:
                try:
                    location.place = Place.objects.get(pk=response['place_id'])
                except Place.DoesNotExist:
                    pass
            return location
    return None


def get_videos_from_location(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    rc = []
    if not search_type.search_items or not search_type.search_items[0]:
        return [], 0

    response = get_location_data_from_url_path(search_type.search_items[0])
    order_by = get_sort_strong_from_sort_method(search_type)
    if response:
        location_class = response.get('classification', None)
        if location_class:
            if location_class == 'place':

                qs = Video.objects.filter(
                    is_draft=False,
                    post__visibility=PostVisibilityEnum.public,
                    post__state__in=[ContentModelState.active,
                                     ContentModelState.active_review],
                    location__place__slug=response.get('place_slug'))

                if response.get('state_province_slug', None) and qs.count():
                    qs = qs.filter(location__state_province__slug=response.get('state_province_slug'))

                if response.get('county_slug', None):
                    qs = qs.filter(location__county__slug=response.get('county_slug'))

                if response.get('country_slug', None):
                    qs = qs.filter(location__country__slug=response.get('country_slug'))

                qs = qs.annotate(vibe_count=Count('vibes')).annotate(video_count=Count('videos')).filter(
                    vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                    video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS)

                if search_type.exclude_items:
                    qs = qs.exclude(post__slug__in=search_type.exclude_items)

                out_of = qs.count()
                qs = qs.order_by(order_by)[offset:offset + size]

                for es in qs:
                    rc.append(VideoSerializer(es, verbosity=verbosity).data)

            if location_class == 'state_province':
                qs = Video.objects.filter(
                    is_draft=False,
                    post__visibility=PostVisibilityEnum.public,
                    post__state__in=[ContentModelState.active,
                                     ContentModelState.active_review],
                    location__state_province__slug=response.get('state_province_slug'))

                if response.get('country_slug', None):
                    qs = qs.filter(location__country__slug=response.get('country_slug'))

                qs = qs.annotate(vibe_count=Count('vibes')).annotate(video_count=Count('videos')).filter(
                    vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                    video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS)

                if search_type.exclude_items:
                    qs = qs.exclude(post__slug__in=search_type.exclude_items)

                out_of = qs.count()
                qs = qs.order_by(order_by)[offset:offset + size]

                for es in qs.all():
                    rc.append(VideoSerializer(es, verbosity=verbosity).data)

            if location_class == 'county':

                qs = Video.objects.filter(
                    is_draft=False,
                    post__visibility=PostVisibilityEnum.public,
                    post__state__in=[ContentModelState.active,
                                     ContentModelState.active_review],
                    location__county__slug=response.get('county_slug'))

                if response.get('state_province_slug', None) and qs.count():
                    qs = qs.filter(location__state_province__slug=response.get('state_province_slug'))

                if response.get('country_slug', None):
                    qs = qs.filter(location__country__slug=response.get('country_slug'))

                qs = qs.annotate(vibe_count=Count('vibes')).annotate(video_count=Count('videos')).filter(
                    vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                    video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS)

                if search_type.exclude_items:
                    qs = qs.exclude(post__slug__in=search_type.exclude_items)
                out_of = qs.count()
                qs = qs.order_by(order_by)[offset:offset + size]

                for es in qs.all():
                    rc.append(VideoSerializer(es, verbosity=verbosity).data)

            if location_class == 'country':
                qs = Video.objects.filter(
                    is_draft=False,
                    post__visibility=PostVisibilityEnum.public,
                    post__state__in=[ContentModelState.active,
                                     ContentModelState.active_review],
                    location__country__slug=response.get('country_slug'),
                ).annotate(vibe_count=Count('vibes')).annotate(video_count=Count('videos')).filter(
                    vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                    video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS)

                if search_type.exclude_items:
                    qs = qs.exclude(post__slug__in=search_type.exclude_items)

                out_of = qs.count()
                qs = qs.order_by(order_by)[offset:offset + size]

                for es in qs:
                    rc.append(VideoSerializer(es, verbosity=verbosity).data)
    return rc, out_of


def get_videos_from_venue_type(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    # do we have search_items?
    rc = []
    if search_type.search_items:
        sort_field = get_sort_strong_from_sort_method(search_type)
        if sort_field:
            vids = Video.objects.filter(
                is_draft=False,
                businesses__business__venue_types__slug__in=search_type.search_items).annotate(
                vibe_count=Count('vibes')).annotate(video_count=Count('videos')).filter(
                post__visibility=PostVisibilityEnum.public,
                post__state__in=[ContentModelState.active,
                                 ContentModelState.active_review],
                vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS).order_by(sort_field)
            out_of = vids.count()

            if search_type.exclude_items:
                vids = vids.exclude(post__slug__in=search_type.exclude_items)

            for es in vids[offset:offset + size]:
                rc.append(VideoSerializer(es, verbosity=verbosity).data)
    return rc, out_of


def get_photos(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    rc = []
    out_of = 0

    from lstv_api_v1.serializers.photo_serializer import PhotoSerializer
    out_of = 0
    sort_field = get_sort_strong_from_sort_method(search_type)
    photos = VideoPhoto.objects.all()

    if search_type.limit_to_tags:
        vids = Video.objects.filter(vibes__slug__in=search_type.limit_to_tags).distinct().values(
            'photos').all()
        photos = photos.exclude(~Q(photo__pk__in=vids))

    if search_type.limit_to_locations:
        print()
        for location in search_type.limit_to_locations:
            loc = get_location_data_from_url_path_as_object(location)
            if loc:
                if loc.country:
                    vids = Video.objects.filter(location__country=loc.country).distinct().values(
                        'photos').all()
                    photos = photos.exclude(~Q(photo__pk__in=vids))
                if loc.state_province:
                    vids = Video.objects.filter(location__state_province=loc.state_province).distinct().values(
                        'photos').all()
                    photos = photos.exclude(~Q(photo__pk__in=vids))
                if loc.county:
                    vids = Video.objects.filter(location__county=loc.county).distinct().values(
                        'photos').all()
                    photos = photos.exclude(~Q(photo__pk__in=vids))
                if loc.place:
                    vids = Video.objects.filter(location__place=loc.place).distinct().values(
                        'photos').all()
                    photos = photos.exclude(~Q(photo__pk__in=vids))

    if search_type.limit_to_business:
        photos = photos.exclude(~Q(photo__owner_business__slug__in=search_type.limit_to_business))

    out_of = photos.count()
    return PhotoSerializer(verbosity=verbosity, many=True).to_representation(
        photos.order_by('photo__image__legacy_url', sort_field).distinct('photo__image__legacy_url')[
        offset:offset + size]), out_of


def get_articles(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.article_serializer import ArticleSerializer
    out_of = 0
    sort_field = get_sort_strong_from_sort_method(search_type)
    articles = Post.objects.filter(type=PostTypeEnum.article, visibility=PostVisibilityEnum.public)

    if search_type.limit_to_tags:
        articles = articles.exclude(~Q(pk__in=
        Article.objects.filter(tags__slug__in=search_type.limit_to_tags).values(
            'post__pk')))

    if search_type.limit_to_locations:
        for location in search_type.limit_to_locations:
            loc = get_location_data_from_url_path_as_object(location)
            if loc:
                if loc.country:
                    articles = articles.exclude(~Q(pk__in=
                    Article.objects.filter(locations__country=loc.country).values(
                        'post__pk')))
                if loc.state_province:
                    articles = articles.exclude(~Q(pk__in=
                    Article.objects.filter(locations__state_province=loc.state_province).values(
                        'post__pk')))
                if loc.county:
                    articles = articles.exclude(~Q(pk__in=
                    Article.objects.filter(locations__county=loc.county).values(
                        'post__pk')))
                if loc.place:
                    articles = articles.exclude(~Q(pk__in=
                    Article.objects.filter(locations__place=loc.place).values(
                        'post__pk')))

    if search_type.limit_to_business:
        articles = articles.exclude(~Q(pk__in=
        Article.objects.filter(businesses__slug__in=search_type.limit_to_business).values(
            'post__pk')))

    out_of = articles.count()
    return ArticleSerializer(articles.order_by(sort_field)[offset:offset + size], many=True,
                             verbosity=verbosity).data, out_of


def get_businesses_for_location_based_at(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    rc = []
    out_of = 0

    if not search_type.search_items or len(search_type.search_items) < 1:
        return [], 0

    location = get_location_data_from_url_path_as_object(search_type.search_items[0])
    if not location:
        return [], 0

    businesses = Business.objects.all()

    if search_type.limit_to_business_roles:
        businesses = businesses.filter(roles__slug__in=search_type.limit_to_business_roles)
    if search_type.exclude_business_roles:
        businesses = businesses.exclude(roles__slug__in=search_type.exclude_business_roles)

    if location.country:
        businesses = businesses.filter(business_locations__country=location.country)
    if location.state_province:
        businesses = businesses.filter(business_locations__state_province=location.state_province)
    if location.county:
        businesses = businesses.filter(business_locations__county=location.county)
    if location.place:
        businesses = businesses.filter(business_locations__place=location.place)

    if search_type.exclude_items:
        businesses = businesses.exclude(slug__in=search_type.exclude_items)

    out_of = businesses.count()

    for business in businesses[offset:offset + size]:
        serializer = BusinessSerializer(business, verbosity=verbosity)
        rc.append(serializer.data)
    return rc, out_of


def filter_businesses_down_based_on_location(businesses, scope, loc):
    print("-----------------")
    print(loc.place)
    print(loc.county)
    print(loc.state_province)
    print(loc.country)
    print("-----------------")
    backup = businesses
    initial_size = businesses.count()

    if not scope or scope == ContentBusinessLocationScope.based_at:
        if loc.place:
            businesses = businesses.filter(business_locations__place=loc.place)
        if loc.county and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(business_locations__county=loc.county)

        if loc.state_province and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(business_locations__state_province=loc.state_province)
        if loc.country and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(business_locations__country=loc.country)

    elif scope == ContentBusinessLocationScope.worked_at:
        if loc.place:
            businesses = Business.objects.filter(worked_at_cache__location__place=loc.place)
        if loc.county and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(worked_at_cache__location__county=loc.county)

        if loc.state_province and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(worked_at_cache__location__state_province=loc.state_province)

        if loc.country and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(worked_at_cache__location__country=loc.country)

    elif scope == ContentBusinessLocationScope.worked_or_based_at:
        if loc.place:
            businesses = businesses.filter(
                Q(worked_at_cache__location__place=loc.place) | Q(business_locations__place=loc.place))
        if loc.county and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(
                Q(worked_at_cache__location__county=loc.county) | Q(business_locations__county=loc.county))

        if loc.state_province and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(Q(worked_at_cache__location__state_province=loc.state_province) | Q(
                business_locations__state_province=loc.state_province))

        if loc.country and businesses.count() == initial_size or businesses.count() == 0:
            businesses = backup
            businesses = businesses.filter(
                Q(worked_at_cache__location__country=loc.country) | Q(business_locations__country=loc.country))

    return businesses


def search_for_businesses_in_location(scope, loc, search_term=None):
    businesses = Business.objects.none()
    if not scope or scope == ContentBusinessLocationScope.based_at:
        if loc.place:
            businesses = Business.objects.filter(business_locations__place=loc.place)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.county:
            businesses = Business.objects.filter(business_locations__county=loc.county)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.state_province:
            businesses = Business.objects.filter(business_locations__state_province=loc.state_province)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))
        if businesses.count() == 0 and loc.country:
            businesses = Business.objects.filter(business_locations__country=loc.country)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

    elif scope == ContentBusinessLocationScope.worked_at:
        if loc.place:
            businesses = Business.objects.filter(worked_at_cache__location__place=loc.place)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))
        if businesses.count() == 0 and loc.county:
            businesses = Business.objects.filter(worked_at_cache__location__county=loc.county)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.state_province:
            businesses = Business.objects.filter(worked_at_cache__location__state_province=loc.state_province)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.country:
            businesses = Business.objects.filter(worked_at_cache__location__country=loc.country)
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

    elif scope == ContentBusinessLocationScope.worked_or_based_at:
        if loc.place:
            businesses = Business.objects.filter(
                Q(worked_at_cache__location__place=loc.place) | Q(business_locations__place=loc.place))
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.county:
            businesses = Business.objects.filter(
                Q(worked_at_cache__location__county=loc.county) | Q(business_locations__county=loc.county))
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.state_province:
            businesses = Business.objects.filter(Q(worked_at_cache__location__state_province=loc.state_province) | Q(
                business_locations__state_province=loc.state_province))
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

        if businesses.count() == 0 and loc.country:
            businesses = Business.objects.filter(
                Q(worked_at_cache__location__country=loc.country) | Q(business_locations__country=loc.country))
            if search_term:
                businesses = businesses.exclude(~Q(name__icontains=search_term))

    return businesses


def get_businesses_with_filters(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    def build_sort_hash_with_loc(n, loc):
        based_level = 4

        never_existed = uuid4()

        blocs = n.business_locations.filter(Q(place=(loc.place or never_existed))
                                            | Q(county=(loc.county or never_existed))
                                            | Q(state_province=(loc.state_province or never_existed))
                                            | Q(country=(loc.country or never_existed)))

        if blocs.count() > 0:
            for bloc in blocs:
                if bloc.place == loc.place and based_level > 0:
                    based_level = 0

                if bloc.county == loc.county and based_level > 1:
                    based_level = 1

                if bloc.state_province == loc.state_province and based_level > 2:
                    based_level = 2

                if bloc.country == loc.country and based_level > 3:
                    based_level = 3

        subscription_level = n.subscription_level.numerical_value if n.subscription_level else 4
        return f"{9 - subscription_level}-{based_level}-{100000 - n.weight_videos:07d}"

    def build_sort_hash(n):
        subscription_level = n.subscription_level.numerical_value if n.subscription_level else 4
        return f"{9 - subscription_level}-{100000 - n.weight_videos:07d}"

    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    rc = []
    out_of = 0
    sort_field = get_sort_strong_from_sort_method(search_type)
    locs = []

    businesses = Business.objects.all()

    if search_type.exclude_items:
        businesses = businesses.exclude(slug__in=search_type.exclude_items)

    if search_type.limit_to_business_roles:
        businesses = businesses.filter(roles__slug__in=search_type.limit_to_business_roles)
    if search_type.exclude_business_roles:
        businesses = businesses.exclude(roles__slug__in=search_type.exclude_business_roles)

    if search_type.limit_to_business_role_capacity:
        businesses = businesses.filter(pk__in=Video.objects.filter(
            businesses__business_capacity_type__slug__in=search_type.limit_to_business_role_capacity).values(
            "businesses__business"))

    if search_type.limit_to_tags:
        # get the businesses who worked on this vibe
        vids = Video.objects.filter(vibes__slug__in=search_type.limit_to_tags).distinct().values(
            'businesses__business')
        businesses = businesses.exclude(~Q(pk__in=vids))

    if search_type.limit_to_locations:

        for location in search_type.limit_to_locations:
            loc = get_location_data_from_url_path_as_object(location)
            if loc:
                locs.append(loc)
                businesses = filter_businesses_down_based_on_location(businesses, search_type.business_location_scope,
                                                                      loc)
        businesses = businesses.distinct()
        if len(locs) > 0:
            businesses = sorted(businesses.all(), key=lambda n: build_sort_hash_with_loc(n, locs[0]))
            out_of = len(businesses)
            for business in businesses[offset:offset + size]:
                serializer = BusinessSerializer(business, verbosity=verbosity)
                rc.append(serializer.data)
            return rc, out_of

    if not sort_field:
        sort_field = '-weight_videos'

    businesses = businesses.distinct()
    out_of = businesses.count()
    for business in businesses.order_by('-subscription_level__numerical_value', sort_field)[offset:offset + size]:
        serializer = BusinessSerializer(business, verbosity=verbosity)
        rc.append(serializer.data)
    return rc, out_of

    # businesses = businesses.order_sorted(businesses.all(), key=lambda n: build_sort_hash(n))


def get_premium_businesses(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    rc = []
    out_of = 0

    businesses = Business.objects.filter(subscription_level__numerical_value__gte=1).order_by(
        '-subscription_level__numerical_value', '?')
    out_of = businesses.count()
    for business in businesses[offset:offset + size]:
        serializer = BusinessSerializer(business, verbosity=verbosity)
        rc.append(serializer.data)
    return rc, out_of


def get_businesses_from_vibe(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    out_of = 0
    rc = []
    # get sort field for this scenario
    sort_field = get_sort_strong_from_sort_method(search_type)
    # get all business slugs

    if not search_type.search_items:
        return [], 0

    if search_type.limit_to_business_roles:

        vids = Video.objects.filter(vibes__slug__in=search_type.search_items,
                                    businesses__business__roles__slug__in=search_type.limit_to_business_roles).values(
            'businesses__business__slug').annotate(biz_weight=Count('businesses__business__slug')).order_by(
            '-biz_weight', 'businesses__business__slug')
        out_of = vids.count()
        if search_type.exclude_items:
            vids = vids.exclude(businesses__business__slug=search_type.exclude_items)
        vids = vids[offset:offset + size]

    elif search_type.exclude_business_roles:
        vids = Video.objects.filter(vibes__slug__in=search_type.search_items,
                                    businesses__business__roles__slug__notin=search_type.exclude_business_roles).values(
            'businesses__business__slug').annotate(biz_weight=Count('businesses__business__slug')).order_by(
            '-biz_weight', 'businesses__business__slug')
        out_of = vids.count()
        if search_type.exclude_items:
            vids = vids.exclude(businesses__business__slug=search_type.exclude_items)
        vids = vids[offset:offset + size]

    else:
        print(search_type.search_items)
        vids = (Video.objects.filter(vibes__slug__in=search_type.search_items).values(
            'businesses__business__slug')).annotate(biz_weight=Count('businesses__business__slug')).order_by(
            '-biz_weight', 'businesses__business__slug')
        out_of = vids.count()

        if search_type.exclude_items:
            vids = vids.exclude(businesses__business__slug__in=search_type.exclude_items)

        vids = vids[offset:offset + size]

    if verbosity == ContentVerbosityType.slug:
        for business in vids:
            rc.append({'slug': business.get('businesses__business__slug'),
                       'weight': business['biz_weight']})
        return rc, out_of
    else:
        businesses_rc = []
        for business in vids:
            try:
                business_obj = Business.objects.get(slug=business.get('businesses__business__slug'))
                businesses_rc.append(
                    BusinessSerializer().to_representation(business_obj))

            except Business.DoesNotExist:
                pass
        return businesses_rc, out_of


def get_videos_from_fixed_list(search_type, offset, size, verbosity):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    rc = []
    out_of = 0
    if search_type.fixed_content_items:
        out_of = len(search_type.fixed_content_items)
        videos = Video.objects.filter(post__slug__in=search_type.fixed_content_items)
        for video in videos[offset:offset + size]:
            serializer = VideoSerializer(video, verbosity=ContentVerbosityType.slug)
            rc.append(serializer.data)
    else:
        report_issue("CardGrid rows may be misconfigured")

    return rc, out_of


def get_businesses_from_fixed_list(search_type, offset, size, verbosity):
    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    rc = []
    out_of = 0
    if search_type.fixed_content_items:
        out_of = len(search_type.fixed_content_items)
        businesses = Business.objects.filter(slug__in=search_type.fixed_content_items)
        # # print(businesses)
        for business in businesses[offset:offset + size]:
            serializer = BusinessSerializer(business, verbosity=ContentVerbosityType.slug)
            rc.append(serializer.data)
    else:
        report_issue("CardGrid rows may be misconfigured")

    return rc, out_of


def get_vibe_from_fixed_list(search_type, offset, size):
    from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer

    if search_type.fixed_content_items:
        # print(search_type.fixed_content_items)
        vibes = TagType.objects.filter(slug__in=search_type.fixed_content_items)
        if vibes.count() > 0:
            return TagTypeSerializer(vibes, many=True, verbosity=ContentVerbosityType.slug).data
        else:
            return []


def job_refresh_most_watched_30d_videos_x_days(context, number_of_days, force_refresh=False):
    context_obj = AggregationCache.objects.filter(context=context).first()

    if not context_obj:
        # create it
        context_obj = AggregationCache(context=context, ttl_hours=number_of_days * 24)
        context_obj.save()

    start_date = datetime.now(timezone.utc) - timedelta(days=number_of_days)
    interval = None

    if context_obj.data_timestamp:
        interval = datetime.now(timezone.utc) - context_obj.data_timestamp

    if force_refresh or context_obj.ttl_hours is None or interval is None or \
            interval.total_seconds() / 3600 > context_obj.ttl_hours:

        # remove previous cache if available
        AggregationCacheData.objects.filter(aggregation_cache=context_obj).delete()

        # obtain group of most popular 100 posts in the last 30 days
        objects = VideoViewLog.objects.values(
            'video').filter(created_at__date__gte=start_date,
                            video__is_draft=False,
                            video__post__visibility=PostVisibilityEnum.public).annotate(
            cc=Count('video'), cvi=Count('video__vibes', distinct=True), cvid=Count(
                'video__videos', distinct=True)).filter(
            cvi__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
            cvid__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS).order_by('-cc')[:100]

        for obj in objects:
            new_cache_record = AggregationCacheData(aggregation_cache=context_obj,
                                                    object_id=obj['video'],
                                                    value=obj['cc'])
            new_cache_record.save()

        context_obj.data_timestamp = datetime.now(timezone.utc)
        context_obj.save()


def get_sort_strong_from_sort_method(card_grid_item):
    sort_method = card_grid_item.content_sort_method
    content_search = card_grid_item.content_search_type
    content_type = card_grid_item.content_type

    # TAGS
    if content_type == ContentSearchQueryType.tag:
        if sort_method == ContentSearchQueryOrderType.importance:
            return "-importance"
        if sort_method == ContentSearchQueryOrderType.weight:
            return "-weight"

    # BUSINESS

    if content_type == ContentSearchQueryType.business:
        if sort_method == ContentSearchQueryOrderType.weight:
            return "-weight_videos"
        if sort_method == ContentSearchQueryOrderType.weight_photos:
            return "-weight_photos"
        if sort_method == ContentSearchQueryOrderType.weight_articles:
            return "-weight_articles"

    # VIDEOS
    if content_type == ContentSearchQueryType.video:
        if sort_method == ContentSearchQueryOrderType.most_recent:
            return "event_date"
        if sort_method == ContentSearchQueryOrderType.most_watched:
            return "views"
        if sort_method == ContentSearchQueryOrderType.most_watched_30d:
            return "views"

    # PHOTO
    if content_type == ContentSearchQueryType.photo:
        if sort_method == ContentSearchQueryOrderType.most_recent:
            return "-photo__created_at"
        pass

    # ARTICLE
    if content_type == ContentSearchQueryType.article:
        pass

    # GENERIC/DEPRECATED

    if sort_method == ContentSearchQueryOrderType.weight and content_search == ContentSearchQuerySourcingType.vibe_to_business:
        return "-weight"
    elif sort_method == ContentSearchQueryOrderType.most_recent:
        return "-created_at"
    elif sort_method == ContentSearchQueryOrderType.most_recently_updated:
        return "-updated_at"
    elif sort_method == ContentSearchQueryOrderType.random:
        return "?"

    # newest, by default, if nothing else specified.
    return "-created_at"


def get_videos_most_watched_30d(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    rc = []

    # obtain cached list of most popular videos in the last 30 days

    videos = AggregationCacheData.objects.filter(
        aggregation_cache__context=LSTV_CACHE_MOST_WATCHED_VIDEOS_30_DAYS).order_by('-value')
    out_of = videos.count()
    videos = videos[offset:offset + size]

    if len(videos) == 0:
        # create it... (force refresh)
        job_refresh_most_watched_30d_videos_x_days(LSTV_CACHE_MOST_WATCHED_VIDEOS_30_DAYS, 30, True)

    for video in videos:
        es = Video.objects.filter(pk=video.object_id).first()
        if es:
            rc.append(VideoSerializer(es, verbosity=verbosity).data)
    return rc, out_of


def get_videos_most_watched(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    rc = []

    vids = Video.objects.filter(
        pk__in=Video.objects.annotate(vibe_count=Count('vibes'), video_count=Count('videos')).filter(
            is_draft=False,
            post__visibility=PostVisibilityEnum.public,
            post__state=ContentModelState.active)
    ).order_by("-views")
    out_of = vids.count()
    vids = vids[offset:offset + size]
    for es in vids:
        rc.append(VideoSerializer(es, verbosity=verbosity).data)

    return rc, out_of


def get_videos_most_recent(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    rc = []
    out_of = 0

    vids = Video.objects.filter(
        pk__in=Video.objects.annotate(vibe_count=Count('vibes'), video_count=Count('videos')).filter(
            is_draft=False,
            post__visibility=PostVisibilityEnum.public,
            post__state=ContentModelState.active).exclude(
            post__state=ContentModelState.suspended_review).exclude(post__state=ContentModelState.suspended).
            exclude(post__state=ContentModelState.deleted).exclude(
            post__state=ContentModelState.pending)).order_by("-post__created_at")

    if search_type.exclude_items:
        vids = vids.exclude(post__slug__in=search_type.exclude_items)

    out_of = vids.count()

    for es in vids[offset:offset + size]:
        rc.append(VideoSerializer(es, verbosity=verbosity).data)

    return rc, out_of


def get_videos_from_business(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    rc = []

    if search_type.search_items:
        sort_field = get_sort_strong_from_sort_method(search_type)
        if sort_field:

            business_owner_ids = []
            for search_item in search_type.search_items:
                try:
                    business_owner_ids.append(Business.objects.get(slug=search_item).id)
                except:
                    pass

            order_subquery = ResourceOrder.objects.filter(
                video_id=OuterRef('pk'), element_owner__in=business_owner_ids).values_list('element_order', flat=True)

            objs = Video.objects.annotate(vid_order=order_subquery).filter(
                is_draft=False,
                post__visibility=PostVisibilityEnum.public,
                post__state__in=[ContentModelState.active,
                                 ContentModelState.active_review],
                businesses__business__slug__in=search_type.search_items
            ).distinct()

            if sort_field == "?":
                objs = objs.order_by(sort_field)
            else:
                objs = objs.order_by('vid_order', F(sort_field).desc(nulls_last=True))

            if search_type.exclude_items:
                objs = objs.exclude(post__slug__in=search_type.exclude_items)

            out_of = objs.count()
            for es in objs[offset: offset + size]:
                rc.append(VideoSerializer(es, verbosity=verbosity).data)

    return rc, out_of


def get_videos_from_vibe(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    out_of = 0
    rc = []
    if search_type.search_items:
        sort_field = get_sort_strong_from_sort_method(search_type)
        if sort_field:
            vids = Video.objects.filter(
                pk__in=Video.objects.annotate(vibe_count=Count('vibes'), video_count=Count('videos')).filter(
                    is_draft=False,
                    post__visibility=PostVisibilityEnum.public,
                    post__state__in=[ContentModelState.active,
                                     ContentModelState.active_review],
                    vibes__slug__in=search_type.search_items,
                    vibe_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES,
                    video_count__gte=LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS)
            )
            if sort_field == "?":
                vids = vids.order_by(sort_field)
            else:
                vids = vids.order_by(F(sort_field).desc(nulls_last=True))

            out_of = vids.count()

            if search_type.exclude_items:
                vids = vids.exclude(post__slug__in=search_type.exclude_items)

            for es in vids[offset:offset + size]:
                rc.append(VideoSerializer(es, verbosity=verbosity).data)
    return rc, out_of


def get_tags(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer
    out_of = TagType.objects.count()
    sort_field = get_sort_strong_from_sort_method(search_type)
    tags = TagType.objects.filter(tag_family_type__tag_group=TagFamilyGroupType.wedding_tag, weight__gte=1)

    print(verbosity)

    if search_type.exclude_items:
        tags = tags.exclude(slug__in=search_type.exclude_items)

    return TagTypeSerializer(verbosity=verbosity, many=True).to_representation(
        tags.order_by(sort_field)[offset:offset + size]), out_of


def get_custom_content(search_type, offset=0, size=10, verbosity=ContentVerbosityType.slug):
    # print(search_type.__dict__)
    data = []
    out_of = 0

    #  __      ___     _
    #  \ \    / (_)   | |
    #   \ \  / / _  __| | ___  ___  ___
    #    \ \/ / | |/ _` |/ _ \/ _ \/ __|
    #     \  /  | | (_| |  __/ (_) \__ \
    #      \/   |_|\__,_|\___|\___/|___/

    if search_type.content_type == ContentSearchQueryType.video:
        # find event stories for a given vibe
        if search_type.content_search_type == ContentSearchQuerySourcingType.fixed_video_list:
            data, out_of = get_videos_from_fixed_list(search_type, offset, size, verbosity)

        if search_type.content_search_type == ContentSearchQuerySourcingType.vibe_to_video:
            data, out_of = get_videos_from_vibe(search_type, offset, size, verbosity)

        # find event stories with a given business
        if search_type.content_search_type == ContentSearchQuerySourcingType.business_to_video:
            data, out_of = get_videos_from_business(search_type, offset, size, verbosity)

        # return event stories for a given venue type
        if search_type.content_search_type == ContentSearchQuerySourcingType.venue_type_to_video:
            data, out_of = get_videos_from_venue_type(search_type, offset, size, verbosity)

        # return event stories occurring in a specific location
        if search_type.content_search_type == ContentSearchQuerySourcingType.location_to_video:
            data, out_of = get_videos_from_location(search_type, offset, size, verbosity)

        # return event stories for other types of requests...
        if search_type.content_search_type == ContentSearchQuerySourcingType.none:
            # most recent ones...
            if search_type.content_sort_method == ContentSearchQueryOrderType.most_recent:
                data, out_of = get_videos_most_recent(search_type, offset, size, verbosity)
            # most popular ones (based on number of views)
            if search_type.content_sort_method == ContentSearchQueryOrderType.most_watched_30d:
                data, out_of = get_videos_most_watched_30d(search_type, offset, size, verbosity)
            if search_type.content_sort_method == ContentSearchQueryOrderType.most_watched:
                data, out_of = get_videos_most_watched(search_type, offset, size, verbosity)
    #   ____            _
    #  |  _ \          (_)
    #  | |_) |_   _ ___ _ _ __   ___  ___ ___  ___  ___
    #  |  _ <| | | / __| | '_ \ / _ \/ __/ __|/ _ \/ __|
    #  | |_) | |_| \__ \ | | | |  __/\__ \__ \  __/\__ \
    #  |____/ \__,_|___/_|_| |_|\___||___/___/\___||___/

    elif search_type.content_type == ContentSearchQueryType.business:

        if search_type.content_search_type is ContentSearchQuerySourcingType.none:
            data, out_of = get_businesses_with_filters(search_type, offset, size, verbosity)

        # DEPRECATED -- TO BE REMOVED SOON
        if search_type.content_search_type is ContentSearchQuerySourcingType.location_to_business_based_at:
            data, out_of = get_businesses_for_location_based_at(search_type, offset, size, verbosity)
        if search_type.content_search_type is ContentSearchQuerySourcingType.premium:
            data, out_of = get_premium_businesses(search_type, offset, size, verbosity)
        if search_type.content_search_type == ContentSearchQuerySourcingType.vibe_to_business:
            data, out_of = get_businesses_from_vibe(search_type, offset, size, verbosity)
        if search_type.content_search_type == ContentSearchQuerySourcingType.fixed_business_list:
            data, out_of = get_businesses_from_fixed_list(search_type, offset, size, verbosity)

    #   _____  _           _
    #  |  __ \| |         | |
    #  | |__) | |__   ___ | |_ ___  ___
    #  |  ___/| '_ \ / _ \| __/ _ \/ __|
    #  | |    | | | | (_) | || (_) \__ \
    #  |_|    |_| |_|\___/ \__\___/|___/

    elif search_type.content_type == ContentSearchQueryType.photo:
        data, out_of = get_photos(search_type, offset, size, verbosity)

    #   _______
    #  |__   __|
    #     | | __ _  __ _ ___
    #     | |/ _` |/ _` / __|
    #     | | (_| | (_| \__ \
    #     |_|\__,_|\__, |___/
    #               __/ |
    #              |___/

    elif search_type.content_type == ContentSearchQueryType.tag:
        data, out_of = get_tags(search_type, offset, size, verbosity)

    #                 _   _      _
    #      /\        | | (_)    | |
    #     /  \   _ __| |_ _  ___| | ___  ___
    #    / /\ \ | '__| __| |/ __| |/ _ \/ __|
    #   / ____ \| |  | |_| | (__| |  __/\__ \
    #  /_/    \_\_|   \__|_|\___|_|\___||___/

    elif search_type.content_type == ContentSearchQueryType.article:
        data, out_of = get_articles(search_type, offset, size, verbosity)

    return data, out_of


def verify_resource_url(url):
    try:
        response = requests.head(url=url)
        redirect_url = None
        if response.status_code in [301, 307, 308]:
            if 'Location' in response.headers:
                url = response.headers['Location']
                redirect_url = url
                response = requests.head(url=url)

        if 400 <= response.status_code <= 499:
            response = requests.get(url=url)
            return response.status_code == 200, redirect_url

        return response.status_code == 200, redirect_url
    except urllib3.exceptions.HeaderParsingError:
        return True, None
    except:
        return False, None


def verify_image_url(url):
    try:
        response = requests.get(url=url)
        return response.status_code == 200
    except:
        return False


def verify_vimeo_video(media_id):
    duration = -1

    try:
        response = requests.get(
            url="https://api.vimeo.com/videos/" + media_id,
            headers={
                "Authorization": "Bearer 8967e4c040b1b78d446924f26a5ed3fb",
            },
        )

        if response.status_code == 429:
            time.sleep(3)
            return verify_vimeo_video(media_id), duration

        try:
            result = json.loads(response.content.decode('utf-8'))

            if 'invalid_parameters' in result:
                for field in result['invalid_parameters']:
                    if 'field' in field:
                        if field['field'] == 'password':
                            return False, duration

            if response.status_code == 404:
                response = requests.head(url="https://player.vimeo.com/video/" + media_id)
                # get duration
                if 'duration' in result:
                    duration = result['duration']
                return response.status_code == 200, duration

            # get duration
            if 'duration' in result:
                duration = result['duration']

            return response.status_code == 200, duration
        except JSONDecodeError:
            # # print("JSONDecodeError: " + media_id)
            return False, duration

    except requests.exceptions.RequestException:
        return False, duration


def verify_youtube_video(media_id):
    duration = -1
    try:
        response = requests.get(
            url="https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "contentDetails, snippet",
                "id": media_id,
                "key": "AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8",
            },
        )

        result = json.loads(response.content.decode('utf-8'))

        if 'items' in result:
            for item in result['items']:
                if 'contentDetails' in item:
                    dur = isodate.parse_duration(item['contentDetails']['duration'])
                    duration = dur.total_seconds()

        return result['pageInfo']['totalResults'] > 0, duration

    except requests.exceptions.RequestException:
        return False, duration


def get_jwplayer_video_state(media_id):
    jwplatform_client = jwplatform.v1.Client('V72as4qu', 'eKsaEHkDXX1Tu2IcwRwhggh6')
    rc = {
        "height": None,
        "width": None,
        "size": None,
        "duration": None,
        "exists": True
    }

    while True:
        try:
            # try to get the max height/width
            response = jwplatform_client.videos.conversions.list(video_key=media_id)
            for conv in response.get('conversions', []):
                if not rc['width'] or conv.get('width', 0) > rc['width']:
                    rc['width'] = conv.get('width')
                if not rc['height'] or conv.get('height', 0) > rc['height']:
                    rc['height'] = conv.get('height')
            # get size/duration
            response = jwplatform_client.videos.show(video_key=media_id)
            rc['duration'] = response.get('video', {}).get('duration')
            rc['size'] = response.get('video', {}).get('size')
            return rc
        except JWPlatformRateLimitExceededError:
            time.sleep(4)
        except JWPlatformNotFoundError:
            rc['exists'] = False
            return rc
        except:
            return rc


def get_google_place_info(city, state, country):
    search_str = ""
    if city:
        search_str = search_str + city
    if state and state.lower() != 'state':
        search_str = search_str + ", " + state
    if country:
        search_str = search_str + " " + country

    try:
        response = requests.get(
            url="https://maps.googleapis.com/maps/api/geocode/json",
            params={
                "address": search_str,
                "sensor": "false",
                "key": "AIzaSyBiXsAitMI2NKEaZ_sHSDcVsWjTR83gYkw"
            },
        )

        results = json.loads(response.content.decode('utf-8'))

        if len(results['results']) > 0:
            return results

        return None

    except requests.exceptions.RequestException:
        return None


def verify_url_with_key_phrase(url, key_phrase=None):
    words_to_try = ['wedding', 'venue', 'ceremony', 'reception', 'event']

    try:
        response = requests.get(url=url)
        if response.status_code == 200:
            if key_phrase is not None:
                response_str = response.content.decode('utf-8', errors='replace').lower()
                index = response_str.find(key_phrase.lower().strip())
                if index == -1:
                    # try without spaces.
                    index = response_str.find(key_phrase.replace(" ", "").lower()) != -1
                    if index == -1:
                        # last try -- is one of the following keywords in the landing page?
                        for word in words_to_try:
                            if response_str.find(word) != -1:
                                return True
                        return False
                    return index != -1
                return index != -1
            else:
                return True

    except requests.exceptions.RequestException:
        return None


def get_all_jwplayer_videos():
    jwplatform_client = jwplatform.v1.Client('V72as4qu', 'eKsaEHkDXX1Tu2IcwRwhggh6')
    offset = 0
    num = 0
    rc = []

    while True:
        try:
            response = jwplatform_client.videos.list(result_offset=offset)
            if len(response['videos']) > 0:
                for vids in response['videos']:
                    v = {'media_id': vids['key'],
                         'size': vids['size']}
                    rc.append((v))
                    num = num + 1
            # # print(str(num) + " videos")
            else:
                break
            offset = offset + 50
        except JWPlatformRateLimitExceededError:
            # just try again...after waiting...
            # print("** rate limit. waiting 4 secs...")
            time.sleep(4)

    return rc


def lstv_request_addons_get(func):
    from lstv_api_v1.views.utils.view_utils import visitor_ip_address

    def wrapper(self, request):
        # obtain IP and attach to request
        ip = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
        if not ip:
            ip = IPAddress(ip=visitor_ip_address(request))
            ip.save()

        if request.method != 'GET':
            request.data['ip'] = ip.id

            if 'logged_in_user_id' in request.data:
                try:
                    user = User.objects.filter(id=request.data['logged_in_user_id']).first()
                    if user:
                        request.data['user'] = user.id
                        return func(self, request)

                except User.DoesNotExist:
                    pass

            if 'unique_guest_uuid' in request.data:
                try:
                    user = User.objects.filter(former_unique_guest_uuid=request.data['unique_guest_uuid']).first()
                    if user:
                        request.data['user'] = user.id

                except User.DoesNotExist:
                    pass

        return func(self, request)

    return wrapper


def lstv_request_addons_post(func):
    from lstv_api_v1.views.utils.view_utils import visitor_ip_address
    def wrapper(request):
        # obtain IP and attach to request
        ip = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
        if not ip:
            ip = IPAddress(ip=visitor_ip_address(request))
            ip.save()

        if request.method != 'GET':
            request.data['ip'] = ip.id

            if 'logged_in_user_id' in request.data:
                try:
                    user = User.objects.filter(id=request.data['logged_in_user_id']).first()
                    if user:
                        request.data['user'] = user.id
                        return func(request)

                except User.DoesNotExist:
                    pass

            if 'unique_guest_uuid' in request.data:
                try:
                    user = User.objects.filter(former_unique_guest_uuid=request.data['unique_guest_uuid']).first()
                    if user:
                        request.data['user'] = user.id

                except User.DoesNotExist:
                    pass

        return func(request)

    return wrapper


def retire_tag_type_and_replace_with_another(retired_tag_slug, replace_with_tag_slug):
    old = TagType.objects.filter(slug=retired_tag_slug).first()
    new = TagType.objects.filter(slug=replace_with_tag_slug).first()
    if not old and not new:
        print(f"tag retire/replace: can't find old tag {retired_tag_slug} and new tag {replace_with_tag_slug}")
    elif not old:
        print(f"tag retire/replace: can't find old tag {retired_tag_slug}")
    elif not new:
        print(f"tag retire/replace: can't find new tag {replace_with_tag_slug}")

    if not old or not new:
        return

    for video in Video.objects.filter(vibes=old).all():
        video.vibes.remove(old)
        video.vibes.add(new)
        print(f"found {old.slug} in {video.post.slug}")

    old.delete()


def retire_tag(retired_tag_slug):
    old = TagType.objects.filter(slug=retired_tag_slug).first()
    if not old:
        print(f"tag retire/replace: can't find old tag {retired_tag_slug}")
    else:
        for video in Video.objects.filter(vibes=old).all():
            video.vibes.remove(old)
            print(f"found {old.slug} in {video.post.slug}")
        old.delete()


def purge_business_and_replace_video_team_tag_with_tag(business_slug, tag_slug):
    business = Business.objects.filter(slug=business_slug).first()
    tag = TagType.objects.filter(slug=tag_slug).first()

    if not business and not tag:
        print(f"business purge/replace-with tag: cant find business {business_slug} and tag {tag_slug}")
    elif not business:
        print(f"business purge/replace-with tag: cant find business {business_slug}")
    elif not tag:
        print(f"business purge/replace-with tag: cant find tag {tag_slug}")

    if not business or not tag:
        return

    for video in Video.objects.filter(businesses__business=business).all():
        print(f"video {video.post.slug} carries business {business.name}")
        r = video.businesses.filter(business=business).first()
        if r:
            video.businesses.remove(r)
            r.delete()
        video.vibes.add(tag)
        business.delete()


def get_parent_role_slugs_from_role_capacity_slugs(capacities):
    rc = []
    for cap in capacities:
        brc = VideoBusinessCapacityType.objects.filter(slug=cap).first()
        if brc:
            rc.append(brc.business_role_type.slug)
    return rc


def notify_emergency(message, image_url=None, image_desc=None):
    if RELEASE_STAGE not in ['production', 'production-mig']:
        return

    message = f":exclamation: `{RELEASE_STAGE}/{VERSION}`: {message}"
    notify_slack("isaac-emergency-channel", message, image_url, image_desc)


def notify_grapevine(message, image_url=None, image_desc=None):
    channel_id = (
        "isaac2-grapevine"
        if RELEASE_STAGE in ['production', 'production-mig']
        else "isaac-grapevine-test"
    )
    notify_slack(channel_id, message, image_url, image_desc)


def notify_slack(channel_id, message, image_url=None, image_desc=None):
    from lstv_api_v1.tasks.tasks import send_slack_message_or_action

    if not image_url:
        send_slack_message_or_action(channel=channel_id,
                                     blocks=[{"type": "section", "text": {"type": "mrkdwn", "text": message}}])
    else:
        send_slack_message_or_action(channel=channel_id,
                                     blocks=[{"type": "section", "text": {"type": "mrkdwn", "text": message}},
                                             {
                                                 "type": "image",
                                                 "title": {
                                                     "type": "plain_text",
                                                     "text": image_desc or "Image",
                                                     "emoji": True,
                                                 },
                                                 "image_url": image_url,
                                                 "alt_text": image_desc or "Image"
                                             },
                                             ])


def requires_ready(func):
    def go(self, *args, **kwargs):
        if self.ready:
            return func(self, *args, **kwargs)

    return go


def send_user_welcome_email(user):
    from lstv_api_v1.tasks.tasks import job_send_sendgrid
    job_send_sendgrid.delay(
        "donotreply@lovestoriestv.com",
        f"Love Stories TV",
        user.email,
        user.get_full_name(),
        None,
        "d-66ac385636544c008b1caddaa2ac4b7f", {
            'lstv_name': 'Love Stories TV',
            'lstv_email': 'donotreply@lovestoriestv.com',
            'first_name': user.first_name,
            'Sender_Name': 'Love Stories TV',
            'Sender_Address': '228 Park Ave S',
            'Sender_City': 'New York',
            'Sender_State': 'New York',
            'Sender_Zip': '10003-1502',
        }
    )


def send_business_welcome_email(user, business):
    from lstv_api_v1.tasks.tasks import job_send_sendgrid
    is_filmmaker = business.roles.filter(slug='videographer').exists()
    template_id = 'd-ff072131745c40008ce2bed60f9ab2ac' if is_filmmaker else 'd-b8bad414e72443e2b009040744b19e0a'


    job_send_sendgrid.delay(
        "donotreply@lovestoriestv.com",
        f"Love Stories TV",
        user.email,
        user.get_full_name(),
        None,
        template_id,
        {
            'lstv_name': 'Love Stories TV',
            'lstv_email': 'donotreply@lovestoriestv.com',
            'first_name': user.first_name,
            'Sender_Name': 'Love Stories TV',
            'Sender_Address': '228 Park Ave S',
            'Sender_City': 'New York',
            'Sender_State': 'New York',
            'Sender_Zip': '10003-1502',
        }
    )
