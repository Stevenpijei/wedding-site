import statistics

from requests import request
from rest_framework import serializers

from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import PropertySerializer, BusinessLocationSerializer
from lstv_api_v1.utils.utils import SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL, SERIALIZER_DETAIL_LEVEL_CONTEXT_FULL
from lstv_api_v1.models import BusinessTeamMemberRoleType, BusinessTeamMemberRolePermissionType, BusinessLocation


class BusinessTeamMemberRolePermissionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessTeamMemberRolePermissionType

        fields = (
            'name',
            'slug',
            'description'
        )


class BusinessTeamMemberRoleSerializer(serializers.ModelSerializer):
    permissions = BusinessTeamMemberRolePermissionTypeSerializer(many=True, read_only=True)

    class Meta:
        model = BusinessTeamMemberRoleType

        fields = (
            'name',
            'slug',
            'permissions'
        )
