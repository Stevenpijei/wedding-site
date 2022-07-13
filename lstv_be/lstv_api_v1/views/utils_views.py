from django.db import connections
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.globals import *
from lstv_api_v1.utils.legacy_model_utils import get_dict
from lstv_api_v1.utils.model_utils import quick_verify_email_address


class SayHello(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        result = {
            'name': 'LSTV Application Server',
            'version': settings.VERSION,
            'host': os.environ.get("HOSTNAME", default="dev host machine")
        }
        return response_20x(200, result, ttl=API_CACHE_TTL_REALTIME)


class VetEmail(APIView):
    """
    obtain information about the home page main video.
    """

    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if 'email' in request.query_params:
            valid, error = is_valid_email_syntax(request.query_params['email'])
            if valid:
                result = quick_verify_email_address(request.query_params['email'])
                return response_200({"email": request.query_params['email'],
                                     "acceptable": result.status.name in ['valid', 'catch_all', 'do_not_mail'],
                                     "status": result.status.name}, ttl=API_CACHE_TTL_NEAR_REALTIME)
            else:
                return response_40x(400, error or "email field is badly structured.")
        return response_40x(400, "email field required", "email")


class LegacyTermUUIDView(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if 'uuid' not in request.query_params:
            return response_40x(400, "uuid field is badly structured.")

        cursor = connections['migrate'].cursor()
        cursor.execute(f"select term_id from terms where term_uuid = '{request.query_params['uuid']}'")
        r = get_dict(cursor)
        cursor.close()

        for result in r:
            term_id = result.get('term_id', None)
            if term_id:
                b = Business.objects.filter(legacy_term_id=term_id).first()
                if b:
                    return response_200({"url": f"{WEB_SERVER_URL}/business/{b.slug}"}, ttl=API_CACHE_TTL_RARELY_CHANGES)

        return response_40x(400, "unknown uuid")


