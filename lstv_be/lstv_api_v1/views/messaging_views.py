from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import *

from lstv_api_v1.serializers.serializers_messaging import ContactBrideGroomSerializer, InPageMessagingSerializer, \
    ContactBusinessSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *


class ContactBusinessView(APIView):
    """
    Contact a business: starts/continues a messaging thread with a given business.
    """

    permission_classes = ([IsAuthenticated])

    @staticmethod
    def post(request):
        if request.user and request.user.is_inquiry_blocked:
            return response_40x(403, "Business Inquiries are unavailable to you at this time.")
        serializer = ContactBusinessSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            success = serializer.create(serializer.validated_data)
            if success:
                return response_20x(200, {})
            else:
                return response_40x(400, "issues creating message")

        return response_40x(400, serializer)


class ContactBrideGroomView(APIView):
    """
    Contact a business: starts/continues a messaging thread with a bride/groom
    """

    permission_classes = ([IsAuthenticated])

    @staticmethod
    def post(request):
        serializer = ContactBrideGroomSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            success = serializer.create(serializer.validated_data)
            if success:
                return response_20x(200, {})
            else:
                return response_40x(400, "issues creating message")

        return response_40x(400, serializer)


