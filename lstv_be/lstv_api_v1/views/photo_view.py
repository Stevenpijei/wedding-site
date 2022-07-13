from django.contrib.postgres.aggregates import StringAgg
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import F, Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.parsers import MultiPartParser, FileUploadParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET, LSTV_API_V1_BAD_REQUEST_NO_SLUG
from lstv_api_v1.models import Video, UserTypeEnum, Message, LikableElementType, Like, ContentFlagElementEnumType, \
    ContentFlag, ContentVerbosityType, ContentModelState, VideoPurposeEnum, VideoPhoto, Photo
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.photo_serializer import PhotoSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer, BusinessFAQSerializer, \
    BusinessPublicTeamFAQSerializer, ElementLikeSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import VideoBusinessSerializer, TagSerializer
from lstv_api_v1.serializers.video_serializer import VideoSerializer, VideoSourceSerializer
from lstv_api_v1.views.content_views import ContentSearchView
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView, LSTVGenericAPIViewException, \
    LSTVGenericAPIViewUnauthorizedException, LSTVGenericAPIViewResourceNotFoundException
from lstv_api_v1.views.lstv_declarative_api_view import LSTVDeclarativeAPIView
from lstv_api_v1.views.utils.user_view_utils import create_new_business, response_40x, TagTypeSerializer

#  __     ___     _             __     ___
#  \ \   / (_) __| | ___  ___   \ \   / (_) _____      _____
#   \ \ / /| |/ _` |/ _ \/ _ \   \ \ / /| |/ _ \ \ /\ / / __|
#    \ V / | | (_| |  __/ (_) |   \ V / | |  __/\ V  V /\__ \
#     \_/  |_|\__,_|\___|\___/     \_/  |_|\___| \_/\_/ |___/

from lstv_api_v1.views.utils.view_utils import response_20x, response_500, response_200


class PhotoView(LSTVBaseAPIView):
    """
    Photo view class: handling all photo objects for all audiences -- users, businesses, lstv admins
    """

    permission_classes = [AllowAny]

    allowable_sub_objects = []

    allowable_admin_options = {
        "_count": ["GET"]
    }

    admin_only = {
        "user_types": [UserTypeEnum.admin]
    }

    business_role_modified = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['modify-business-roles'],
    }

    public_read_business_owner_write = {
        "GET": {},
        "POST": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        },
        "DELETE": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        },
        "PATCH": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        }
    }

    business_team_management = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['manage-team-members'],
        "field_permissions": {
            "business_slug": {
                "user_types": [UserTypeEnum.admin],
            },
        }
    }

    business_profile_editing = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['edit-business-profile'],

    }

    standard_video_permission = {
        'GET': {},
        'POST': {"ownership": True},
        'PATCH': {"ownership": True},
        'DELETE': {"ownership": True},
    }

    anyone_can_create_and_read_owners_can_modify = {
        'GET': {},
        'POST': {},
        'PATCH': {"ownership": True},
        'DELETE': {"ownership": True},
        "actions": {
            "like": {
                "POST": {},
                "DELETE": {}
            },
            "flag": {
                "POST": {}
            }
        }
    }

    permission_scope = {
        "/": standard_video_permission,
        "like": {
            "GET": {},
            "POST": {},
            "DELETE": {}
        }
    }

    #    _____      _          _____       _        _ _             _     _           _
    #   / ____|    | |        |  __ \     | |      (_) |           | |   (_)         | |
    #  | |  __  ___| |_ ______| |  | | ___| |_ __ _ _| |______ ___ | |__  _  ___  ___| |_
    #  | | |_ |/ _ \ __|______| |  | |/ _ \ __/ _` | | |______/ _ \| '_ \| |/ _ \/ __| __|
    #  | |__| |  __/ |_       | |__| |  __/ || (_| | | |     | (_) | |_) | |  __/ (__| |_
    #   \_____|\___|\__|      |_____/ \___|\__\__,_|_|_|      \___/|_.__/| |\___|\___|\__|
    #                                                                   _/ |
    #                                                                  |__/

    @staticmethod
    def get_detail_object(objs, sub_obj, detail_obj_id):
        return None

    def authenticate_user_membership(self, business_team_member_permissions_required):
        return False

    def authenticate_user_ownership_of_object(self):
        user = self.request_params.get('user')
        if user and not user.is_anonymous and user.user_type == UserTypeEnum.admin:
            return True
        return False

    def get_target_object(self):
        if self.id and self.id not in self.allowable_admin_options:
            try:
                obj = VideoPhoto.objects.filter(photo_id=self.id).first()
                return obj
            except VideoPhoto.DoesNotExist:
                raise LSTVGenericAPIViewResourceNotFoundException(f"photo id {self.id} not found")

    #   _____   ____   _____ _______
    #  |  __ \ / __ \ / ____|__   __|
    #  | |__) | |  | | (___    | |
    #  |  ___/| |  | |\___ \   | |
    #  | |    | |__| |____) |  | |
    #  |_|     \____/|_____/   |_|

    def do_post(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        action = self.request_params.get('action')
        detail_obj_id = self.request_params.get('detail_obj_id')
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not user:
            return response_40x(401, f"Unauthorized")

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            serializer = PhotoSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

    #    _____ ______ _______
    #   / ____|  ____|__   __|
    #  | |  __| |__     | |
    #  | | |_ |  __|    | |
    #  | |__| | |____   | |
    #   \_____|______|  |_|

    def do_get(self, request, **kwargs):
        rc = []
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        action = self.request_params.get('action')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if self.verbosity in [ContentVerbosityType.admin_list, ContentVerbosityType.admin_full,
                              ContentVerbosityType.administration]:
            if not user or user.is_anonymous or user.user_type != UserTypeEnum.admin:
                return response_40x(401, f"not authorized")

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:

            if type(self.id) == str and self.id in self.allowable_admin_options.keys() and self.request.method in \
                    self.allowable_admin_options[self.id]:
                return response_200({
                    "active_count": VideoPhoto.objects.count()
                })

            if self.id:
                if objs and isinstance(objs, VideoPhoto):
                    serializer = PhotoSerializer(request=request, verbosity=self.verbosity)
                    return response_200(serializer.to_representation(objs))
                else:
                    return response_40x(400, "resource not found")
            elif request.query_params.get('verbosity', None) in [ContentVerbosityType.admin_list.name,
                                                                 ContentVerbosityType.admin_full.name,
                                                                 ContentVerbosityType.administration.name]:

                photos =VideoPhoto.objects.all()

                title_filter = request.query_params.get('title', None)
                business_filter = request.query_params.get('business', None)

                if title_filter:
                    photos = photos.filter(video__title__icontains=title_filter)

                if business_filter:
                    photos = photos.filter(photo__owner_business__name__icontains=business_filter)

                if self.sort_order == 'asc':
                    videos = photos.order_by(F(self.sort_field).asc(nulls_last=True))
                else:
                    videos = photos.order_by(F(self.sort_field).desc(nulls_last=True))
                out_of = videos.count()

                rc = []
                for photo in photos[int(self.offset):int(self.offset) + int(self.size)]:
                    rc.append(PhotoSerializer(photo, verbosity=self.verbosity).data)

                return response_200(rc, scope={'offset': int(self.offset),
                                               'request_size': int(self.size),
                                               'response_size': len(rc),
                                               'total': out_of})

            # else:
            #     # sub-contractor endpoint :-)
            #     factory = APIRequestFactory()
            #     query_params = ""
            #     for key in request.query_params.keys():
            #         query_params += f"&{key}={request.query_params[key]}"
            #     url = f"/v1/contentSearch?content_type=video{query_params}"
            #     request = factory.get(url)
            #     response = ContentSearchView.as_view()(request)
            #     return response

    #   _____     _______ _____ _    _
    #  |  __ \ /\|__   __/ ____| |  | |
    #  | |__) /  \  | | | |    | |__| |
    #  |  ___/ /\ \ | | | |    |  __  |
    #  | |  / ____ \| | | |____| |  | |
    #  |_| /_/    \_\_|  \_____|_|  |_|

    def do_patch(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not objs:
            return response_40x(400, f"resource not found")

        if not sub_obj:
            serializer = VideoSerializer(context_object='video', request=request, data=request.data,
                                         element=objs.videos.first())
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs.videos.first(), serializer.validated_data))

    #   _____  ______ _      ______ _______ ______
    #  |  __ \|  ____| |    |  ____|__   __|  ____|
    #  | |  | | |__  | |    | |__     | |  | |__
    #  | |  | |  __| | |    |  __|    | |  |  __|
    #  | |__| | |____| |____| |____   | |  | |____
    #  |_____/|______|______|______|  |_|  |______|

    def do_delete(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        action = self.request_params.get('action')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            # THIS IS A REQUEST TO DELETE AN ENTIRE BUSINESS FROM EXISTENCE. extremely destructive. Must be secure.
            if objs:
                objs.photo.delete_deep()
                objs.delete()
            return response_20x(200, {})
