import os

from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_admin import AdminStatsSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
import logging
import time


def create_new_business(business_name, roles, location, user=None):
    from lstv_api_v1.utils.utils import build_location_from_google_places
    """
    create a new business account and hook up to founding business team member user
    :param business_name: the business name
    :param roles: array of roles the business performs
    :param location: google-places output for location
    :param user: the team member user created for this business (optional)
    :return: new business object created
    """

    # create business
    new_business = Business(name=business_name, slug=slugify(business_name))
    new_business.subscription_level = BusinessSubscriptionLevel.objects.filter(slug='free').first()
    new_business.save()

    if 'google' in location or 'components' in location:
        vl = BusinessLocation(business=new_business, location=build_location_from_google_places(location))
        vl.save()

    elif 'location_id' in location:
        loc = Location.objects.filter(id=location['location_id']).first()
        if loc:
            vl = BusinessLocation(business=new_business, location=loc)
            vl.save()

    # attach roles

    for role in roles:
        role_obj = BusinessRoleType.objects.filter(slug=role).first()
        if role_obj:
            new_business.roles.add(role_obj)

    if user:
        # attach user

        team_member = BusinessTeamMember(user=user, business=new_business)
        team_member.save()
        admin_full = BusinessTeamMemberRoleType.objects.filter(slug='admin').first()
        team_member.roles.add(admin_full)

        user.user_type = UserTypeEnum.business_team_member
        user.save()

    return new_business
