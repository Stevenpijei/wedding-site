from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer, ElementLikeSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
from lstv_api_v1.tasks.tasks import job_alert_cto

import statistics


