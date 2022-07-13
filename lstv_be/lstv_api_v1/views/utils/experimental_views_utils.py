import os

from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_admin import AdminStatsSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
import logging
import time

logger = logging.getLogger('lstv-user-activity-log')


def get_us_states_es_weight(params):

    constraints = json.loads(params['datasetConstraints']) if 'datasetConstraints' in params else None
    data = []
    rc_weight = 0
    states = StateProvince.objects.filter(country__slug='united-states').order_by('-weight_videos')
    for state in states:
        if not constraints:
            rc_weight = state.weight_videos
        else:
            if 'vibe_slugs' in constraints:
                for vibe in constraints['vibe_slugs'].split(','):
                    # weight of es with vibe
                    rc_weight = Video.objects.filter(location__state_province=state, vibes__slug__contains=vibe).count()

        data.append({'name': state.name, 'weight': rc_weight, 'code': state.code})

    if constraints:
        data = sorted(data, key=lambda k: (-k['weight']))

    # rank
    index = 1
    for d in data:
        d['place'] = index
        index += 1

    return response_200(data)


def get_world_es_weight(params):
    data = []
    countries = Country.objects.all().order_by('-weight_videos')
    place = 1
    for country in countries:
        data.append(
            {'name': country.name, 'weight': country.weight_videos, 'code': country.iso3, 'place': place})
        place += 1
    return response_200(data)


def get_us_county_es_weight(params):
    data = []
    counties = County.objects.filter(state_province__country__name='United States').order_by('-weight_videos')
    place = 1
    for county in counties:
        data.append(
            {'name': county.name, 'state': county.state_province.name, 'weight': county.weight_videos,
             'code': county.fips, 'place': place})
        place += 1
    return response_20x(200, data)


def get_us_states_business_based_at_weight(params):
    data = []
    states = StateProvince.objects.filter(country__slug='united-states').order_by(
        '-weight_businesses_based_at')
    place = 1
    for state in states:
        data.append(
            {'name': state.name, 'weight': state.weight_businesses_based_at, 'code': state.code,
             'place': place})
        place += 1
    return response_20x(200, data)


def get_us_states_business_work_at_weight(params):
    data = []

    constraints = json.loads(params['datasetConstraints']) if 'datasetConstraints' in params else None

    if not constraints:
        states = StateProvince.objects.filter(country__slug='united-states').order_by(
            '-weight_businesses_work_at')
        place = 1
        for state in states:
            data.append(
                {'name': state.name, 'weight': state.weight_businesses_work_at, 'code': state.code,
                 'place': place})
            place += 1
        return response_20x(200, data)
    else:
        data = StateProvince.objects.filter(country__slug='united-states')
        states = []
        for d in data:
            rc = {'name': d.name,
                  'code': d.code,
                  'place': 1}
            weight = 0
            if 'business_types' in constraints:
                for role in constraints['business_types'].split(','):
                    role = role.strip()
                    if d.weight_businesses_work_at_role_breakdown and role in d.weight_businesses_work_at_role_breakdown:
                        weight += d.weight_businesses_work_at_role_breakdown[role]
            if 'business_slugs' in constraints:
                for business_slug in constraints['business_slugs'].split(','):
                    business_slug = business_slug.strip()

                    v = Business.objects.filter(slug=business_slug).first()
                    if v:
                        if len(v.worked_at_cache.all()) == 0:
                            v.rebuild_worked_at_location_cache()
                        else:
                            # how many worked_at elements for the state
                            worked_at_state = v.worked_at_cache.filter(state_province=d).first()
                            if worked_at_state:
                                weight += worked_at_state.weight

            rc['weight'] = weight
            states.append(rc)

            # sort with -weight
            states = sorted(states, key=lambda k: (-k['weight']))
            place = 1
            for state in states:
                state['place'] = place
                place += 1

        return response_20x(200, states)


