from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.globals import *

from lstv_api_v1.views.utils.experimental_views_utils import get_us_states_es_weight, get_us_states_business_based_at_weight, \
    get_us_states_business_work_at_weight, get_us_county_es_weight, get_world_es_weight


class GeoStatsView(APIView):
    """
    get all kinds of admin stats
    """

    permission_classes = ([IsAuthenticated])

    def get(self, request, format=None):

        if 'type' in request.query_params:

            # U.S. State

            if request.query_params['type'] == 'us-state-es-weight':
                return get_us_states_es_weight(request.query_params)

            if request.query_params['type'] == 'us-state-business-based-weight':
                return get_us_states_business_based_at_weight(request.query_params)

            if request.query_params['type'] == 'us-state-business-work-weight':
                return get_us_states_business_work_at_weight(request.query_params)

            # U.S. County

            if request.query_params['type'] == 'us-county-es-weight':
                return get_us_county_es_weight(request.query_params)

            # World

            if request.query_params['type'] == 'world-es-weight':
                return get_world_es_weight(request.query_params)

            else:
                return response_40x(404, "resource not found"  )
        else:
            return response_40x(400, LSTV_API_V1_BAD_REQUEST_NO_TYPE_DEFINED, "type")
