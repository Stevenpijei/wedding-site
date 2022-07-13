from abc import abstractmethod

from django.conf import settings
import os
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_admin import AdminStatsSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
import logging
import time

from lstv_api_v1.serializers.video_serializer import VideoSerializer


class ShoppingItemView(LSTVEntityDependantDataAPIView):
    """
    CRUD for a shopping item
    """
    permission_classes = ([PublicReadAdminWrite])

    def on_post(self, request, element):
        serializer = ShoppingItemSerializer(data=request.data, request=request, element=element)
        if serializer.is_valid(raise_exception=True):
            serializer.create(serializer.validated_data)
            return response_20x(201, {})

    def on_get(self, request, element):
        rc = []
        for item in element.shopping_items.all():
            rc.append(ShoppingItemSerializer().to_representation(item))
        return response_200(rc)

    def on_patch(self, request):
        try:
            element = get_model_element('shopping_item', request.data.get('shopping_item_id', None))
        except BaseException:
            return response_40x(400, ["can't find a shopping element with given shopping_item_id"], "shoppping_item_id")
        serializer = ShoppingItemSerializer(data=request.data, request=request, element=element)
        if serializer.is_valid(raise_exception=True):
            serializer.update(element, serializer.validated_data)
            return response_20x(200, {})

    def on_delete(self, request):
        try:
            instance = get_model_element('shopping_item', request.data.get('shopping_item_id', None))
            instance.delete()
            return response_20x(200, {})
        except BaseException as e:
            return response_40x(400, str(e))


class DiscoverView(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, get_cache_ttl=60, format=None):
        domain = None
        if 'domain' in request.query_params:
            domain = Discover.objects.filter(type=DiscoverElementTypeEnum.domain,
                                             slug=request.query_params['domain']).first()
        else:
            domain = Discover.objects.filter(type=DiscoverElementTypeEnum.domain, slug='standard').first()
        if domain:
            serializer = DiscoverSerializer(domain)
            return response_200(serializer.data)
        else:
            return response_40x(404, "Discover domain not found.")


class HomeCardSectionView(APIView):
    """
    obtain home page video section detailed information
    """

    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if 'target' in request.query_params or (
                request.query_params.get('verbosity', '') == 'admin'):
            verbosity = ContentVerbosityType.full
            if 'verbosity' in request.query_params and request.query_params.get('verbosity') == 'admin':
                verbosity = ContentVerbosityType.administration

            # obtain the card sections
            target = request.query_params.get('target', None)
            if verbosity == ContentVerbosityType.administration:
                sections = ContentSearchQuery.objects.filter(
                    Q(target="logged_in_home_page") | Q(target="logged_out_home_page")).all().order_by(
                    *['group', 'order'])
            else:
                sections = ContentSearchQuery.objects.filter(target=target).all().order_by(*['group', 'order'])
            if len(sections) > 0:
                serializer = UserFacingCardGridTypesSerializer(sections, request=request, verbosity=verbosity)
                return response_200(serializer.data)
            else:
                return response_40x(404, "resource not found")
        else:
            return response_40x(400, LSTV_API_V1_BAD_REQUEST_NO_CARD_GRID_SECTION_TARGET, "target")

    def post(self, request, format=None):
        serializer = UserFacingCardGridTypesSerializer(
            data=request.data, request=request, verbosity=ContentVerbosityType.administration
        )
        if serializer.is_valid(raise_exception=True):
            return response_20x(201, serializer.create(serializer.validated_data))


class ContentSearchView(APIView):
    """
    obtain custom content objects (typically to populate grids)
    """

    permission_classes = ([AllowAny])

    def get(self, request, format=None):

        if ('content_type' in request.query_params and (
                'content_sort_method' in request.query_params or 'sort_field' in request.query_params)) or \
                'query_id' in request.query_params:

            verbosity = ContentVerbosityType.slug
            content_search_type = ContentSearchQuerySourcingType.none
            business_location_scope = ContentBusinessLocationScope.based_at
            content_type = None
            content_sort_method = ContentSearchQueryOrderType.most_recent

            if 'query_id' in request.query_params:
                try:
                    data = ContentSearchQuery.objects.get(id=request.query_params['query_id'])
                except ContentSearchQuery.DoesNotExist:
                    return response_40x(404, LSTV_API_V1_CONTENT_REQUEST_NOT_FOUND)
            else:
                try:
                    if 'verbosity' in request.query_params:
                        verbosity = ContentVerbosityType[request.query_params['verbosity']]
                except KeyError:
                    return response_40x(400, f"unknown verbosity: {request.query_params['verbosity']}")

                try:
                    if 'content_search_type' in request.query_params:
                        content_search_type = ContentSearchQuerySourcingType[
                            request.query_params['content_search_type']]

                except KeyError:
                    return response_40x(400,
                                        f"unknown content_search_type: {request.query_params['content_search_type']}")

                try:
                    if 'content_type' in request.query_params:
                        content_type = ContentSearchQueryType[
                            request.query_params['content_type']]

                except KeyError:
                    return response_40x(400,
                                        f"unknown content_type: {request.query_params['content_type']}")

                try:
                    if 'business_location_scope' in request.query_params:
                        business_location_scope = ContentBusinessLocationScope[
                            request.query_params['business_location_scope']]

                except KeyError:
                    return response_40x(400,
                                        f"unknown business_location_scope: {request.query_params['business_location_scope']}")

                try:
                    if 'content_sort_method' in request.query_params:
                        content_sort_method = ContentSearchQueryOrderType[
                            request.query_params['content_sort_method']]

                except KeyError:
                    return response_40x(400,
                                        f"unknown content_sort_method: {request.query_params['content_sort_method']}")

                data = ContentSearchQuery(
                    verbosity=verbosity,
                    content_type=content_type,
                    content_search_type=content_search_type,
                    search_items=request.query_params[
                        'search_items'] if 'search_items' in request.query_params else None,
                    exclude_items=request.query_params[
                        'exclude_items'] if 'exclude_items' in request.query_params else None,
                    fixed_content_items=request.query_params[
                        'fixed_content_items'] if 'fixed_content_items' in request.query_params else None,
                    content_sort_method=content_sort_method,
                    limit_to_business_roles=request.query_params.get('limit_to_business_roles', None),
                    exclude_business_roles=request.query_params.get('exclude_business_roles', None),
                    limit_to_business_role_capacity=request.query_params.get('limit_to_business_role_capacity', None),
                    limit_to_tags=request.query_params.get('limit_to_tags', None),
                    limit_to_business=request.query_params.get('limit_to_business', None),
                    business_location_scope=business_location_scope,
                    limit_to_locations=request.query_params.get('limit_to_locations', None))

            items, out_of = get_custom_content(data, int(request.query_params.get('offset', 0)),
                                               int(request.query_params.get('size', 8)),
                                               verbosity)

            if len(items) > 0:
                return response_200(items, scope={'offset': int(request.query_params.get('offset', 0)),
                                                  'request_size': int(request.query_params.get('size', 8)),
                                                  'response_size': len(items),
                                                  'total': out_of})
            else:
                return response_20x(200, [])
        else:
            return response_40x(400, LSTV_API_V1_BAD_CONTENT_REQUEST)


class SlugContentView(APIView):
    """
    obtain all post information.
    """

    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if 'slug' in request.query_params:
            if 'verbosity' in request.query_params:
                try:
                    verbosity = ContentVerbosityType[request.query_params['verbosity']]
                except KeyError:
                    return response_40x(400, f"unknown verbosity: {request.query_params['verbosity']}")
            else:
                verbosity = ContentVerbosityType.full

            items = []

            for item in request.query_params['slug'].split(','):
                element = get_slug_content(item, verbosity, request)
                if element:
                    items.append(element)

            if len(items) > 0:
                if len(items) == 1:
                    redirect_slug = get_redirect_slug_for_short_url(request.query_params['slug'])
                    if redirect_slug:
                        return response_200({'slug': redirect_slug}, ttl=API_CACHE_TTL_REALTIME)

                    return response_200(items[0])
                if len(items) > 1:
                    return response_200(items)
            else:
                return response_40x(404, "resource not found")
        else:
            return response_40x(400, LSTV_API_V1_BAD_REQUEST_NO_SLUG, "slug")


class MainVideoView(APIView):
    """
    obtain the main event story for the home page
    """
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        try:
            # obtain main video post
            main_video_setting = Setting.objects.get(name=SETTING_MAIN_VIDEO_POST)

            if main_video_setting:
                # obtain event story
                video = Video.objects.get(id=main_video_setting.value['value'])
                if video:
                    return response_200(VideoSerializer().to_representation(video))

        except (Video.DoesNotExist, Setting.DoesNotExist):
            return response_40x(400, "no main video defined")
