import hashlib
import secrets

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET, API_CACHE_TTL_REALTIME, API_CACHE_TTL_NEAR_REALTIME
from lstv_api_v1.models import UserTypeEnum, BusinessTeamMember
from lstv_api_v1.utils.utils import get_volatile_value, delete_volatile_value
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView
from lstv_api_v1.views.utils.user_view_utils import response_40x, set_volatile_value, \
    response_20x
from lstv_api_v1.views.utils.view_utils import response_200
from lstv_api_v1.tasks.tasks import job_queue_video_for_jwp
from lstv_api_v1.utils.aws_utils import get_upload_pre_signed_url, delete_file_from_aws_s3, \
    delete_full_path_from_aws_s3, aws_s3_move_file_to_another_key
from django.conf import settings
from slugify import slugify
from lstv_api_v1.utils.aws_utils import aws_s3_change_file_acl


class PreAuthorizeUserVideoUploadView(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if not self.request.user or request.user.is_anonymous:
            return response_40x(401, "unauthorized")

        if not request.user.user_type == UserTypeEnum.business_team_member and not \
                request.user.user_type == UserTypeEnum.admin:
            return response_40x(403, "forbidden")

        if 'filename' in request.query_params and len(request.query_params['filename'].split(".")) > 1:
            filename = request.query_params['filename'].lower().strip()

            # find the business
            business_hash = "lstv-admin"
            team_member = BusinessTeamMember.objects.filter(user=request.user, business__isnull=False).first()
            if team_member:
                business_hash = team_member.business.get_hash()

            extension = filename.split('.')[-1]
            filename = f"{business_hash}-{filename.split('.')[0]}"

            if extension in ['mp4', 'm4v', 'f4v', 'mpeg', 'mov', 'webm']:
                if len(filename.split("/")) > 1:
                    filename = filename.split("/")[-1]

                # requesting authorization to upload
                upload_url = get_upload_pre_signed_url(
                    settings.DEFAULT_CDN_BUCKET_NAME, f"videos/uploads/{filename}.{extension}"
                )

                # retain
                token = secrets.token_hex(5)

                set_volatile_value(f"video-upload-{token}",
                                   {"filename": filename + "." + extension,
                                    "path": upload_url.split("?")[0],
                                    "token": token,
                                    "business_id": team_member.business.id if team_member else None,
                                    "business_name": team_member.business.name if team_member else None,
                                    "user_name": team_member.user.get_full_name_or_email() if team_member and team_member.user else None,
                                    "user_id": request.user.id}, 2880)

                return response_200({"upload_url": upload_url, "temporary_token": token}, ttl=API_CACHE_TTL_REALTIME)

        return response_40x(400, "filename must be part of the request. Just filename and extension "
                                 "of mp4, m4v, f4v, mpeg, mov or webm")


def validate_token(func):
    def check_token(self, request, **kwargs):
        if not self.request.user or request.user.is_anonymous:
            return response_40x(401, "unauthorized")
        if not request.user.user_type == UserTypeEnum.business_team_member and not \
                request.user.user_type == UserTypeEnum.admin:
            return response_40x(403, "forbidden")

        token = kwargs.get('token', None)
        token_value = get_volatile_value(f"video-upload-{token}")
        if not token_value:
            return response_40x(400, f"token {token} cannot be found")
        kwargs['token'] = token
        kwargs['token_value'] = token_value
        return func(self, request, **kwargs)

    return check_token


class RemoveUploadedVideo(LSTVBaseAPIView):
    permission_classes = ([AllowAny])

    @validate_token
    def delete(self, request, **kwargs):
        # remove the video
        url = kwargs.get('token_value').get('path', None)
        if url:
            delete_full_path_from_aws_s3(url)
        delete_volatile_value(f"video-upload-{kwargs.get('token')}")

        return response_20x(200, {})


class QueueVideoProcessingView(LSTVBaseAPIView):
    permission_classes = ([AllowAny])

    @validate_token
    def post(self, request, **kwargs):
        token = kwargs.get('token', None)
        token_value = kwargs.get('token_value', None)
        if token_value.get('queued', None):
            return response_40x(400,
                                f"video already queued for processing. use GET "
                                f"/v1/checkVideoProcessing/{token} to check its status")
        job_queue_video_for_jwp(token, token_value)
        return response_20x(200, {})


class CheckVideoProcessingView(APIView):
    permission_classes = ([AllowAny])

    @validate_token
    def get(self, request, **kwargs):
        token = kwargs.get('token', None)
        token_value = kwargs.get('token_value', None)
        media_id = token_value.get('media_id', None)
        filename = token_value.get('filename', None)
        ready = False
        initial_ready = False
        thumbnail_url = None
        # JWP transcoding status
        if media_id:
            status = get_volatile_value(f"video-status-{media_id}")
            ready = status and status.get('state', None) == 'complete'
            initial_ready = status and (status.get('state', None) == 'initial' or ready)

            if ready or initial_ready:
                thumbnail_url = f"https://assets-jpcust.jwpsrv.com/thumbs/{media_id}.jpg"

        return response_200(
            {'filename': filename, 'media_id': media_id, 'token': token, 'ready': ready, 'initial_ready': initial_ready,
             'thumbnail_url': thumbnail_url},
            ttl=API_CACHE_TTL_NEAR_REALTIME)


class PreAuthorizePhotoUploadView(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        if not self.request.user or request.user.is_anonymous:
            return response_40x(401, "unauthorized")

        if not request.user.user_type == UserTypeEnum.business_team_member and not \
                request.user.user_type == UserTypeEnum.admin:
            return response_40x(403, "forbidden")

        if 'filename' in request.query_params and len(request.query_params['filename'].split(".")) > 1:
            filename = request.query_params['filename'].lower().strip()

            extension = filename.split('.')[-1]
            filename = slugify(f"{secrets.token_hex(5)}-{filename.split('.')[0]}")
            key = f"photos/uploads/{filename}.{extension}"

            if extension in ['gif', 'jpg', 'jpeg', 'png', 'svg']:
                if len(filename.split("/")) > 1:
                    filename = filename.split("/")[-1]

                # requesting authorization to upload
                upload_url = get_upload_pre_signed_url(settings.DEFAULT_CDN_BUCKET_NAME, key)

                return response_200({"upload_url": upload_url,
                                     "key": key,
                                     "download_url": f"{settings.DEFAULT_CDN}/{key}"},
                                    ttl=API_CACHE_TTL_REALTIME)

        return response_40x(400, "filename must be part of the request and must have extension "
                                 "of gif, jpg, jpeg, png, or svg")
