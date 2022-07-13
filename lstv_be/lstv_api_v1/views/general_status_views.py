from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework_condition import last_modified, etag

from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
from lstv_api_v1.utils.legacy_model_utils import isaac_migration_status


class FrontEndSettings(APIView):
    """
    obtain general information usable by all front end users.
    """

    permission_classes = ([AllowAny])

    def my_etag(request):
        settings_obj = Setting.objects.filter(updated_at__isnull=False).order_by("-updated_at").first()
        return hashlib.md5(str(settings_obj.updated_at).encode('utf-8')).hexdigest()

    def my_last_modified(request, *args, **kwargs):
        return datetime(2021, 2, 12, 13, 1, 20, 30)

    #@etag(my_etag)
    def get(self, request, format=None):
        if 'category' in request.query_params:
            settings_obj = Setting.objects.filter(category=request.query_params['category']).order_by("-updated_at")
        else:
            settings_obj = Setting.objects.order_by("-updated_at")

        if len(settings_obj) > 0:
            result = {}
            for setting_instance in settings_obj:
                result[setting_instance.name] = setting_instance.value['value']
            return response_200(result)
        else:
            return response_40x(404, "resource not found")

    def post(self, request, format=None):
        print(request.data['landing_page_video'])
        if 'landing_page_video' in request.data:
            try:
                v = Video.objects.get(pk=request.data['landing_page_video'])
                s = Setting.objects.filter(name='landing_page_video').first()
                if s:
                    s.value = {"value": str(v.id)}
                    s.save()
                return response_20x(200, {})
            except Video.DoesNotExist:
                return response_40x(404, "invalid landing_page_video id")
        return response_40x(404, "landing_page_video not present")


class BusinessRoleTypesView(APIView):
    """
    obtain all business role types and slugs
    """
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        business_roles = BusinessRoleType.objects.all()

        serializer = BusinessRoleTypeSerializer(business_roles, many=True)
        return response_200(serializer.data)


class BusinessCapacityTypesView(APIView):
    """
    obtain all business role capacity types
    """
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        business_capacities = VideoBusinessCapacityType.objects.all()
        serializer = VideoBusinessCapacityTypeSerializer(business_capacities, many=True)
        return response_200(serializer.data)



