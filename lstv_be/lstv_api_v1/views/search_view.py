from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.directory_serializer import DirectorySerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer
from lstv_api_v1.utils.utils import get_location_data_from_url_path_as_object, \
    get_parent_role_slugs_from_role_capacity_slugs, search_for_businesses_in_location


class SearchView(APIView):
    """
    obtain all business role capacity types
    """
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        search_type = request.query_params.get('type', None)
        if not search_type:
            search_type = 'all'
        else:
            search_type = search_type.lower()
            if search_type not in ['all', 'business', 'tag', 'directory']:
                return response_40x(400, f"when you specify type, it must be either all, business, tag or directory")
        term = request.query_params.get('term', None)
        if not term:
            return response_40x(400, "no search term included")

        rc = {'found': {},
              'directories': [],
              'businesses': [],
              'tags': []}

        if search_type in ['all', 'directory']:
            # directory pages

            dirs = DirectoryType.objects.filter(name__icontains=term)
            rc['found']['directories'] = dirs.count()
            serializer = DirectorySerializer()
            for dir in dirs.all():
                rc['directories'].append(serializer.to_representation(dir))

        if search_type in ['all', 'tag']:
            tags = TagType.objects.filter(name__icontains=term).order_by("-weight")
            serializer = TagTypeSerializer(verbosity=ContentVerbosityType.search_hint)
            rc['found']['tags'] = tags.count()
            for tag in tags.all():
                rc['tags'].append(serializer.to_representation(tag))

        if search_type in ['all', 'business']:
            # individual businesses
            limit_to_locations = request.query_params.get('limit_to_locations', None)
            limit_to_business_roles = request.query_params.get('limit_to_business_roles', None)
            exclude_business_roles = request.query_params.get('exclude_business_roles', None)
            limit_to_business_role_capacity = request.query_params.get('limit_to_business_role_capacity', None)

            business_location_scope = ContentBusinessLocationScope.based_at
            if request.query_params.get('business_location_scope', None):
                try:
                    business_location_scope = ContentBusinessLocationScope[
                        request.query_params.get('business_location_scope')]
                except:
                    return response_40x(400,
                                        f"business_location_scope {request.query_params.get('business_location_scope')}")

            businesses = Business.objects.filter(name__unaccent__icontains=term)
            if limit_to_locations:
                for location in limit_to_locations:
                    loc = get_location_data_from_url_path_as_object(location)
                    if loc:
                        businesses = search_for_businesses_in_location(business_location_scope, loc, term)

            if limit_to_business_role_capacity:
                businesses = businesses.exclude(~Q(pk__in=Video.objects.filter(
                    businesses__business_capacity_type__slug__in=limit_to_business_role_capacity).values(
                    "businesses__business")))
                if businesses.count() == 0:
                    businesses = businesses.exclude(
                        ~Q(roles__slug__in=get_parent_role_slugs_from_role_capacity_slugs(limit_to_business_role_capacity)))

            if limit_to_business_roles:
                businesses = businesses.exclude(~Q(roles__slug__in=limit_to_business_roles))
            if exclude_business_roles:
                businesses = businesses.exclude(Q(roles__slug__in=exclude_business_roles))

            if businesses.count() > 0:
                rc['found']['businesses'] = businesses[:15].count()
                serializer = BusinessSerializer(verbosity=ContentVerbosityType.search_hint)
                for business in businesses.all().order_by(
                        '-subscription_level__numerical_value',
                        '-weight_videos')[:15]:
                    rc['businesses'].append(serializer.to_representation(business))
        return response_200(rc, ttl=0)
