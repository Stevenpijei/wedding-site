from django.conf import settings
import os
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
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
import slack


class VideoPlaybackLogView(APIView):
    """
    record video playback statistics from the field
    """

    permission_classes = ([AllowAny])

    @staticmethod
    def post(request):
        serializer = VideoPlaybackLogViewSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            serializer.create(serializer.validated_data)
            return response_20x(200, {})
        return response_40x(400, serializer)


class AdPlaybackLogView(APIView):
    """
    record ad playback statistics from the field
    """

    permission_classes = ([AllowAny])

    @staticmethod
    # @lstv_request_addons_post
    def post(request):
        serializer = AdPlaybackLogViewSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            serializer.create(serializer.validated_data)
            return response_20x(200, {})
        return response_40x(400, serializer)


class AdPlaybackClickLogView(APIView):
    """
    record ad playback statistics from the field
    """

    permission_classes = ([AllowAny])

    @staticmethod
    def post(request):
        # pre-create ip address
        # create ip address

        ip = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
        if not ip:
            ip = IPAddress(ip=visitor_ip_address(request))
            ip.save()

        ip_dict = {'ip': ip.id}
        ip_dict.update(request.data)

        serializer = AdPlaybackClickLogViewSerializer(data=ip_dict, request=request)

        if serializer.is_valid(raise_exception=True):
            serializer.create(serializer.validated_data)
            return response_20x(200, {})
        return response_40x(400, serializer)


class UserEventView(APIView):
    """
    record (and give chance to respond to..) front end user event
    """

    permission_classes = ([AllowAny])


    @staticmethod
    def post(request):
        if 'unique_guest_uuid' in request.data or 'user_id' in request.data:
            user = None
            if 'unique_guest_uuid' in request.data:
                user = User.objects.filter(former_unique_guest_uuid=request.data['unique_guest_uuid']).first()

            if 'user_id' in request.data:
                user = User.objects.filter(id=request.data['user_id']).first()

            # append IP address onto user payload
            ip_dict = {'ip': visitor_ip_address(request), 'user': user.id if user else None}
            ip_dict.update(request.data)

            serializer = UserEventSerializer(data=ip_dict)

            if serializer.is_valid(raise_exception=True):
                serializer.create(serializer.validated_data)
                return response_20x(200, {})

            return response_40x(400, serializer)
        else:
            return response_40x(400, "must have either user_id or unique_guest_uuid (server cookies). None present in "
                                     "request. Possibly a server issue.")


class ContentWatchLogView(APIView):
    """
    record the viewing of content elements such as event stories, blog stories and channels.
    """

    permission_classes = ([AllowAny])


    @staticmethod
    # @lstv_request_addons_post
    def post(request):
        serializer = ContentWatchLogSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            if serializer.create(serializer.validated_data, request):
                return response_20x(200, {})
            else:
                return response_40x(400, ["No element exists with the element_type/element_id combination"])

        return response_40x(400, serializer.errors)


class UserBufferedEventsView(APIView):
    """
    Buffered user events transmitted to the serve in bulk.
    Those events are not Real-Time critical and are used mainly for stats and bookkeeping.
    """

    permission_classes = ([AllowAny])

    @staticmethod
    # @lstv_request_addons_post
    def post(request):
        serializer = UserBufferedEventsSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True) and serializer.create(serializer.validated_data):
            return response_20x(200, {})
        return response_40x(400, serializer)
