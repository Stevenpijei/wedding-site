from django.db.models import Sum
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.directory_serializer import DirectorySerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *


class DirectoryView(APIView):
    """
    obtain all business role capacity types
    """
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        timestamp = int(round(DirectoryType.objects.all().order_by('-updated_at').first().updated_at.timestamp(), 0))

        if 'timestamp' in self.request.query_params:
            return response_20x(200, {}, timestamp=timestamp)
        if 'dropdown' in self.request.query_params:
            directories = DirectoryType.objects.filter(show_in_dropdown=True)
        elif 'search_roles' in self.request.query_params:
            directories = DirectoryType.objects.annotate(weight_sum=Sum("role_types__weight_in_videos")).filter(
                show_in_search_roles=True).order_by("-weight_sum")
        else:
            directories = DirectoryType.objects.all()

        serializer = DirectorySerializer(directories, many=True)
        return response_20x(200, serializer.data, timestamp=timestamp)
