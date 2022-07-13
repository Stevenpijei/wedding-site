

import statistics
from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import PropertySerializer, \
    BusinessRoleTypeSerializer, BusinessPhoneSerializer, BusinessCohortSerializer, BusinessSocialLinksSerializer, \
    BusinessVenueTypesSerializer, BusinessLocationSerializer, BusinessLocationAndCoverageSerializer, \
    BusinessPublicTeamSerializer, BusinessAssociateBrandsSerializer, BusinessSoldAtSerializer, TagSerializer
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.models import *
from lstv_api_v1.views.utils.view_utils import legacy_url_image


class DirectorySerializer(LSTVBaseSerializer):
    def to_representation(self, obj):

        weight = 0
        if obj.content_type == DirectoryPageClass.business:
            weight = Business.objects.filter(roles__slug__in=[obj.role_types.all().values('slug')]).count()
            # add the number of businesses who served as team members in the capacity roles, if any.
            if len(obj.role_capacity_types.all()) > 0:

                 weight += Business.objects.filter(pk__in=Video.objects.filter(
                    businesses__business_capacity_type__slug__in=obj.role_capacity_types.all().values('slug')).values(
                    "businesses__business")).count()

        if obj.content_type == DirectoryPageClass.video:
            weight = Video.objects.count()

        if obj.content_type == DirectoryPageClass.article:
            weight = Post.objects.filter(visibility=PostVisibilityEnum.public, type=PostTypeEnum.article).count()

        if obj.content_type == DirectoryPageClass.style:
            weight = TagType.objects.filter(tag_family_type__tag_group=TagFamilyGroupType.wedding_tag).count()

        role_types = []
        role_capacity_types = []

        for rt in obj.role_types.all():
            role_types.append(rt.slug)

        for rct in obj.role_capacity_types.all():
            role_capacity_types.append(rct.slug)

        return {
            'id': obj.id,
            'name': obj.name,
            'subtitle_name_plural': obj.subtitle_name_plural,
            'subtitle_name_singular': obj.subtitle_name_singular,
            'description': obj.description,
            'description_location': obj.description_location,
            'content_type': obj.content_type.name,
            'show_in_dropdown': obj.show_in_dropdown,
            'show_search': obj.show_search,
            'show_in_role_search': obj.show_in_search_roles,
            'bg_color': obj.bg_color,
            'slug': obj.slug,
            'priority': obj.priority,
            'weight': weight,
            'role_types': role_types,
            'role_capacity_types': role_capacity_types
        }
