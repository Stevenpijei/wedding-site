import hashlib
import hmac
import urllib
from abc import abstractmethod
from time import time

import boto3
import botocore
from botocore.config import Config
from botocore.exceptions import ClientError
from django.http import HttpResponseNotFound, HttpResponseServerError
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.views import APIView

from lstv_api_v1.globals import COOKIE_MAX_AGE_LOGGED_IN_USER, COOKIE_MAX_AGE_TOKEN, get_allowed_model_elements, \
    ELEMENT_TYPE_AND_ID_MUST_BE_VALID, ELEMENT_ID_NOT_FOUND, API_CACHE_TTL_STANDARD
from lstv_api_v1.models import *
from django.core.exceptions import ValidationError
from django.db.models import Count
import re
from django.conf import settings
import requests
import os
from urllib.parse import urlparse

#   ____    ___  ____     ___  ____   ____     __       ____  ____   ____         __ __  ____    ___  __    __
#  /    T  /  _]|    \   /  _]|    \ l    j   /  ]     /    T|    \ l    j       |  T  |l    j  /  _]|  T__T  T
# Y   __j /  [_ |  _  Y /  [_ |  D  ) |  T   /  /     Y  o  ||  o  ) |  T  _____ |  |  | |  T  /  [_ |  |  |  |
# |  T  |Y    _]|  |  |Y    _]|    /  |  |  /  /      |     ||   _/  |  | |     ||  |  | |  | Y    _]|  |  |  |
# |  l_ ||   [_ |  |  ||   [_ |    \  |  | /   \_     |  _  ||  |    |  | l_____jl  :  ! |  | |   [_ l  `  '  !
# |     ||     T|  |  ||     T|  .  Y j  l \     |    |  |  ||  |    j  l         \   /  j  l |     T \      /
# l___,_jl_____jl__j__jl_____jl__j\_j|____j \____j    l__j__jl__j   |____j         \_/  |____jl_____j  \_/\_/
#
#  ____     ___  ____   ___ ___  ____   _____  _____ ____   ___   ____    _____
# |    \   /  _]|    \ |   T   Tl    j / ___/ / ___/l    j /   \ |    \  / ___/
# |  o  ) /  [_ |  D  )| _   _ | |  T (   \_ (   \_  |  T Y     Y|  _  Y(   \_
# |   _/ Y    _]|    / |  \_/  | |  |  \__  T \__  T |  | |  O  ||  |  | \__  T
# |  |   |   [_ |    \ |   |   | |  |  /  \ | /  \ | |  | |     ||  |  | /  \ |
# |  |   |     T|  .  Y|   |   | j  l  \    | \    | j  l l     !|  |  | \    |
# l__j   l_____jl__j\_jl___j___j|____j  \___j  \___j|____j \___/ l__j__j  \___j


LSTV_API_VIEW_SCOPE_ROOT = '/'
LSTV_API_VIEW_PERMISSION_PUBLIC_READ = "permission_public_read"
LSTV_API_VIEW_PERMISSION_LSTV_ADMIN = "permission_lstv_admin"
LSTV_API_VIEW_PERMISSION_LSTV_ADMIN_OR_OWNER = "permission_lstv_owner_or_admin"

LSTV_API_VIEW_FIELD_TYPE_UUID = "uuid"
LSTV_API_VIEW_FIELD_TYPE_TEXT = "text"
LSTV_API_VIEW_FIELD_TYPE_SLUG = "slug"
LSTV_API_VIEW_FIELD_TYPE_INTEGER = "integer"
LSTV_API_VIEW_FIELD_TYPE_FLOAT = "float"
LSTV_API_VIEW_FIELD_TYPE_DATE = "date"
LSTV_API_VIEW_FIELD_TYPE_DATETIME = "datetime"
LSTV_API_VIEW_FIELD_TYPE_OBJECT = "object"
LSTV_API_VIEW_FIELD_TYPE_OBJECT_ARRAY = "object_array"
LSTV_API_VIEW_FIELD_TYPE_FOREIGN_KEY = "foreign_key"
LSTV_API_VIEW_FIELD_OBJECT_FUNCTION = "object_function"
LSTV_API_VIEW_FIELD_BOOLEAN = "object_boolean"
LSTV_API_VIEW_FIELD_TYPE_MANY_TO_MANY = "many_to_many"
LSTV_API_VIEW_FIELD_TYPE_MANY_TO_MANY = "many_to_many"
LSTV_API_VIEW_FIELD_TYPE_FOREIGN_KEY = "foreign_key"

LSTV_API_SORT_FIELD_TRANSLATION = {
    "subscription_level": "subscription_level__numerical_value",
    "location": "business_locations__place__name",
    "video_location": "location__place__name",
    "roles": "roles__slug",
    "suggested_by": "dmz_originating_business__slug",
    "video_title": "dmz_originating_video__title",
    "issue": "state_reason",
    "title": "title",
    "event_date": "event_date",
    "video_owner": "videos__owner_business__name",
    "views": "views",
    "video_issue": "state_desc",
    "likes": "likes",
    "tags": "tag_aggregate",
    "photos": "photo_count",
    "q_and_a": "q_and_a_count",
    "user_phone": "mobile_phone__number",
    "user_business_name": "team_users__business__name",
    "user_location": "ip_addresses__location__place__name",
    "subscribers": "subscriber_count",
    "tag_type": "tag_family_type__slug"
}

LSTV_API_VIEW_ORDER_TYPES = {
    "random": "?",
    "az": "name",
    "za": "-name",
    "mostRecent": "-created_at",
    "most_recent": "-created_at",

    "mostTenured": "created_at",
    "most_tenured": "created_at",

    "mostLiked": "-likes",
    "leastLiked": "likes",
    "mostFollowed": "-",
    "leasFollowed": "likes",
    "mostWatched": "-views",
    "mostUsed": "-weight",
    "leastWatched": "-views",
    "mostVideos": "-weight_videos",
    "leastVideos": "weight_videos",
    "mostArticleMentions": "-weight_articles",
    "lastArticleMentions": "weight_articles",
    "custom": "custom",
}


#  .d8888b.   .d8888b.  Y88b   d88P
# d88P  Y88b d88P  Y88b  Y88b d88P
#        888 888    888   Y88o88P
#      .d88P 888    888    Y888P
#  .od888P"  888    888    d888b
# d88P"      888    888   d88888b
# 888"       Y88b  d88P  d88P Y88b
# 888888888   "Y8888P"  d88P   Y88b


def response_20x(http_code, result, **kwargs):
    response_obj = {'success': True,
                    'timestamp': kwargs.get('timestamp', int(time())),
                    }

    if 'scope' in kwargs:
        response_obj['scope'] = kwargs['scope']

    response_obj['result'] = result

    response = Response(response_obj,
                        status=http_code)

    if 'user' in kwargs and 'token' in kwargs:
        response.set_cookie(
            'token',
            kwargs['token'],
            httponly=True,
            max_age=COOKIE_MAX_AGE_TOKEN,
            secure=not settings.DEBUG,
            samesite="Lax"
        )
        response.set_cookie(
            'logged_in_user_id',
            str(kwargs['user'].id),
            httponly=True,
            max_age=COOKIE_MAX_AGE_LOGGED_IN_USER,
            secure=not settings.DEBUG,
            samesite="Lax"
        )

    if 'delete_cookies' in kwargs:
        for cookie in kwargs['delete_cookies']:
            response.delete_cookie(
                cookie,
                path=settings.SESSION_COOKIE_PATH,
                domain=settings.SESSION_COOKIE_DOMAIN,
                samesite="Lax"
            )

    response["Cache-Control"] = f"max-age={kwargs.get('ttl', API_CACHE_TTL_STANDARD)}"
    return response


def response_200(result, **kwargs):
    response = response_20x(200, result, **kwargs)
    response["Cache-Control"] = f"max-age={kwargs.get('ttl', API_CACHE_TTL_STANDARD)}"
    return response


#     d8888   .d8888b.  Y88b   d88P
#    d8P888  d88P  Y88b  Y88b d88P
#   d8P 888  888    888   Y88o88P
#  d8P  888  888    888    Y888P
# d88   888  888    888    d888b
# 8888888888 888    888   d88888b
#       888  Y88b  d88P  d88P Y88b
#       888   "Y8888P"  d88P   Y88b

def response_40x(http_code, errors, field=None):
    if isinstance(errors, list) and field is None:
        return Response({'success': False,
                         'errors': errors},
                        status=http_code)

    if isinstance(errors, str) and field:
        return Response({'success': False,
                         'errors': [{
                             "field": field or "generic",
                             "errors": [errors]
                         }]},
                        status=http_code)

    else:
        return Response({'success': False,
                         'errors': [{
                             "field": field or "generic",
                             "errors": [errors] if errors else None
                         }]},
                        status=http_code)


#   _____  ___   ___
#  | ____|/ _ \ / _ \
#  | |__ | | | | | | |
#  |___ \| | | | | | |
#   ___) | |_| | |_| |
#  |____/ \___/ \___/


def response_500(error):
    return Response({'success': False,
                     'errors': error},
                    status=500)


#   _    _ _   _ _
#  | |  | | | (_) |
#  | |  | | |_ _| |___
#  | |  | | __| | / __|
#  | |__| | |_| | \__ \
#   \____/ \__|_|_|___/


def get_user_from_email(email_address):
    return User.objects.filter(email=email_address).first()


def legacy_url_image(thumbnail):
    if thumbnail:
        return thumbnail
    else:
        return f"{DEFAULT_CDN}/images/site/nothumb.jpg"


def obtain_ip_dict(request):
    ip = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
    if not ip:
        ip = IPAddress(ip=visitor_ip_address(request))
        ip.save()

    ip_dict = {'ip': ip.id}
    ip_dict.update(request.data)

    return ip_dict


class PublicReadBusinessWrite(permissions.BasePermission):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        else:
            return bool(
                request.user and request.user.is_authenticated and \
                (request.user.user_type == UserTypeEnum.business_team_member or
                 request.user.user_type == UserTypeEnum.admin))


class PublicReadAuthenticatedWrite(permissions.BasePermission):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        else:
            return bool(request.user and request.user.is_authenticated)


class AuthenticatedOnly(permissions.BasePermission):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class NeedAdminLogin(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {}
    default_code = 'not_authenticated'


class PublicReadAdminWrite(permissions.BasePermission):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        if request.method == 'GET' or (
                request.user and request.user.is_authenticated and request.user.user_type == UserTypeEnum.admin):
            return True
        raise NeedAdminLogin()


class GetOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


def not_found_view(request):
    """
    replacement view for 404 error.
    :param request:
    :return:
    """
    return HttpResponseNotFound("Invalid Endpoint")


def server_error_view(request):
    """
    replacement view for 500 error.
    :param request:
    :return:
    """
    return HttpResponseServerError(
        "Server Error. Please Contact back-end team.")


def visitor_ip_address(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_composite_elements_binding(params):
    if 'root_type' in params:
        if params['root_type'] == 'business' and 'slug' in params:
            binding = CompositeContentBinding.objects.filter(slug='root_business').first()
            if binding:
                return binding
    return None


def get_object_from_type_slug(type, slug):
    from lstv_api_v1.serializers.business_serializer import BusinessSerializer
    if type == 'business':
        business = Business.objects.filter(slug=slug).first()
        if business:
            serializer = BusinessSerializer(business)
            return serializer.data, business
    return None, None


def get_video_from_auto_selector(method, unique_guest_uuid, user=None):
    return Video.objects.filter(pk__in=Video.objects.annotate(business_count=Count('businesses')).filter(
        is_draft=False,
        post__visibility=PostVisibilityEnum.public,
        visibility=PostVisibilityEnum.public,
        business_count__gte=4)).order_by('?')[:1].first()


def get_video_from_id(id):
    if id:
        # fetch
        try:
            return Video.objects.get(id=id)
        except Video.DoesNotExist:
            return None
        except:
            return None
    return None


def get_redirect_slug_for_short_url(slug):
    # event stories
    try:
        es = Video.objects.get(short_url_token=slug)
        return es.post.slug
    except Video.DoesNotExist:
        pass

    # blog stories
    try:
        bs = Article.objects.get(short_url_token=slug)
        return bs.post.slug
    except Article.DoesNotExist:
        pass

    return None


def get_vibe_from_slug(slug):
    rc = None

    if slug:
        # sanitize slug
        slug = slug.lower().strip().replace('/', '')
        # fetch
        rc = TagType.objects.filter(slug=slug, tag_family_type__tag_group=TagFamilyGroupType.wedding_tag).first()

    return rc


def get_post_from_slug(slug):
    from lstv_api_v1.models import Post
    rc = None

    if slug:
        # sanitize slug
        slug = slug.lower().strip().replace('/', '')
        # fetch
        rc = Video.objects.filter(post__slug=slug, is_draft=False).first()
        if not rc:
            rc = Post.objects.filter(type=PostTypeEnum.article, slug=slug).first()
    return rc


def get_business_from_slug(slug):
    rc = None
    if slug:
        # sanitize slug
        slug = slug.lower().strip()
        # fetch
        rc = Business.objects.filter(slug=slug).first()

    return rc


def return_user_from_uuid(uuid):
    try:
        user = User.objects.filter(id=uuid).first()
        if not user:
            return None
        else:
            return user

    except ValidationError:
        return None


def extract_timestamp(request):
    if 'timestamp' in request.query_params:
        return int(float(request.query_params['timestamp']))
    return None


def should_use_local_client_cache(request, latest_timestamp):
    return False


# ts = extract_timestamp(request)
# if not ts:
#     ts = 0
# return (int(ts)) >= (int(latest_timestamp))


def fill_in_business_description_params(business, param):
    if param == 'business_name':
        return business.name
    if param == 'business_roles_singulars':
        return business.get_roles_as_text(True)
    elif param == 'business_business_location':
        return business.get_business_location_as_text()
    elif param == 'business_works_at':
        return business.get_works_at_locations_as_text()
    else:
        return None


def build_business_description(business, template):
    rc = ""

    if business and template:
        parts = re.findall("\[(.*?)\]", template)
        for part in parts:
            params = re.findall("\{{(.*?)\}}", part)
            include_part = True
            for param in params:
                fill_in_text = fill_in_business_description_params(business, param)
                if fill_in_text:
                    part = part.replace("{{" + param + "}}", fill_in_text)
                else:
                    include_part = False
            if include_part:
                rc += " " + part
        return rc.replace(" , ", ", ").replace(" . ", ". ").strip()

    return None


def get_data_from_composite_content_factory(root_type, element_type, options, model_object):
    from lstv_api_v1.serializers.video_serializer import VideoSerializer
    from lstv_api_v1.serializers.serializers_posts import VIDEO_SERIALIZER_CCE_MAIN_VIDEO
    if element_type == CompositeContentElementType.channel_main_video.name:
        if root_type == 'business':
            # find most recent main video

            # explicit legacy post id?
            es = None

            legacy_channel_id = model_object.properties.filter(key='legacy_channel_post_id').first()
            if legacy_channel_id:
                es = Video.objects.filter(post__legacy_post_id=legacy_channel_id.value_text).first()
                if not es:
                    # lstv2 defined event story

                    channel_es = model_object.properties.filter(key='channel_main_video').first()
                    if channel_es:
                        es = Video.objects.filter(id=channel_es.value_text).first()
                        if es:
                            return {'video': VideoSerializer().to_representation(es)}

                    es = Video.objects.filter(is_draft=False,
                                              post__visibility=PostVisibilityEnum.public,
                                              post__state__in=[ContentModelState.active,
                                                               ContentModelState.active_review],
                                              event_date__isnull=False,
                                              businesses__business__slug=model_object.slug).order_by(
                        '-properties__value_date').first()

            if es:
                return {'video': VideoSerializer(
                    context=VIDEO_SERIALIZER_CCE_MAIN_VIDEO).to_representation(es)}
            else:
                # lstv2 defined direct video (non-event-story)

                videos = VideoSource.objects.filter(owner_business=model_object,
                                                    purpose=VideoPurposeEnum.business_promo_video)
                videos_json = []
                if videos:
                    for video in videos:
                        vid = VideoSerializer().to_representation(video)
                        videos_json.append(vid)
                    return {'promo-videos': videos_json}

        return None

    if root_type == 'business' and element_type == CompositeContentElementType.business_info_grid.name:
        # channel description

        # channel_description = model_object.properties.filter(key='channel_description').first()
        # if channel_description:
        #     return {'channel_description': channel_description.value_text}

        # legacy channel description?

        # channel_description = model_object.properties.filter(key='legacy_your_business_description').first()
        # if channel_description:
        #     return {'channel_description': channel_description.value_text}

        # generate channel description:
        return build_business_description(model_object, options['alternate_description_template'])

    return None


def user_business_inquiry_record(user):
    # obtain number of approvals/rejections

    approvals = Message.objects.filter(message_context=MessageContextTypeEnum.business_inquiry,
                                       from_user=user).count()
    rejections = Message.objects_all_states.filter(state=ContentModelState.deleted,
                                                   message_context=MessageContextTypeEnum.business_inquiry,
                                                   from_user=user).count()
    return approvals, rejections


def get_model_element(element_type, element_id, element_slug=None):
    from lstv_api_v1.serializers.serializers_utils import validate_uuid
    from lstv_api_v1.models import Business, Video, Review, ShoppingItem

    if element_id and not validate_uuid(element_id):
        return None

    if element_type and (element_id or element_slug):
        if element_type in get_allowed_model_elements:
            rc = None
            if element_type == 'video':
                rc = Video.objects.filter(Q(id=element_id) | Q(slug=element_slug)).first()

            if element_type == 'message':
                rc = Message.objects.filter(Q(id=element_id)).first()

            if element_type == 'business' or element_type == 'business':
                rc = Business.objects.filter(Q(id=element_id) | Q(slug=element_slug)).first()

            if element_type == 'review':
                rc = Review.objects.filter(Q(id=element_id)).first()

            if element_type == 'shopping_item':
                rc = ShoppingItem.objects.filter(id=element_id).first()

            return rc

    return None


def past_date_label(date):
    rc = "Just now"

    def plural_or_singular(item, weight):
        if weight == 1:
            return item
        else:
            return item + "s"

    if not date:
        return None
    secs_delta = datetime.now().replace(tzinfo=timezone.utc) - date
    secs_delta = secs_delta.total_seconds()

    if 0 < secs_delta <= 10:  # 0 - 9  secs
        rc = "just now"
    elif 11 < secs_delta <= 30:  # 10 - 29 secs
        rc = "a few secs ago"
    elif 31 < secs_delta <= 60:  # 30 - 59 secs
        rc = "about a minute ago"
    elif 61 < secs_delta <= 3600:  # 60 secs - 1 hr
        rc = f"{int(secs_delta / 60)} {plural_or_singular('minute', int(secs_delta / 60))} ago"
    elif 3601 < secs_delta <= 7200:  # 1 hr - 2 hours
        rc = f"about an hour ago"
    elif 7201 < secs_delta <= 86400:  # 2 hr - 1 day
        rc = f"{int(secs_delta / (60 * 60))} {plural_or_singular('hour', int(secs_delta / (60 * 60)))} ago"
    elif 86401 < secs_delta <= (86400 * 7):  # 1 day - 1 week
        rc = f"{int(secs_delta / 86400)} {plural_or_singular('day', int(secs_delta / 86400))} ago"
    elif (86400 * 7) + 1 < secs_delta <= (86400 * 7 * 4):  # 1 week - 1 month
        rc = f"{int(secs_delta / (86400 * 7))} {plural_or_singular('week', int(secs_delta / (86400 * 7)))} ago"
    elif (86400 * 7 * 4) + 1 < secs_delta <= (86400 * 7 * 4 * 12):  # 1 month - 1 years
        rc = f"{(int(secs_delta / (86400 * 7 * 4)))} " \
             f"{plural_or_singular('month', int((secs_delta / (86400 * 7 * 4))))} ago"
    elif (86400 * 7 * 4 * 12) + 1 <= secs_delta < (86400 * 7 * 4 * 24):  # 1 year - 2 years
        rc = f"over a year ago"
    elif (86400 * 7 * 4 * 24) + 1 <= secs_delta:  # 2 year - ...
        rc = f"{(secs_delta / (86400 * 7 * 52))} {plural_or_singular('year', int(secs_delta / (86400 * 7 * 52)))} ago"

    if rc.startswith("1 "):
        rc = rc.replace("1 ", "a ")
    return rc


class LSTVEntityDependantDataAPIView(APIView):

    def __init__(self, **kwargs):
        self.element_type = kwargs.pop('element_type', None)
        super(LSTVEntityDependantDataAPIView, self).__init__(*kwargs)

    @abstractmethod
    def on_post(self, request, element):
        pass

    @abstractmethod
    def on_get(self, request, element):
        pass

    @abstractmethod
    def on_patch(self, request):
        pass

    @abstractmethod
    def on_delete(self, request):
        pass

    def fetch_target_element(self, request):
        if request.method == 'GET':
            if self.element_type is None and 'element_type' not in request.query_params and 'element_id' not \
                    in request.query_params:
                return None
            element_type = request.query_params.get('element_type', self.element_type)
            element_id = request.query_params.get('element_id', None)
        else:
            if 'element_type' not in request.data and 'element_id' not in request.data:
                return None
            element_type = request.data.get('element_type', self.element_type)
            element_id = request.data.get('element_id', None)

        try:
            return get_model_element(element_type, element_id)
        except BaseException:
            return None

    def post(self, request):
        element = self.fetch_target_element(request)
        if not element:
            return response_40x(400,
                                ELEMENT_TYPE_AND_ID_MUST_BE_VALID if not self.element_type else ELEMENT_ID_NOT_FOUND)
        return self.on_post(request, element)

    def get(self, request):
        element = self.fetch_target_element(request)
        if not element:
            return response_40x(400,
                                ELEMENT_TYPE_AND_ID_MUST_BE_VALID if not self.element_type else ELEMENT_ID_NOT_FOUND)
        return self.on_get(request, element)

    def patch(self, request):
        return self.on_patch(request)

    def delete(self, request):
        return self.on_delete(request)
