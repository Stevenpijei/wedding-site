from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.test import APIRequestFactory

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET
from lstv_api_v1.models import TagFamilyType, UserTypeEnum, TagType, User, ContentModelState, TagFamilyGroupType, TagFamilyGroupType
from lstv_api_v1.serializers.curated_content_serializer import CuratedContentSerializer
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer, TagTypeSubscriberSerializer
from lstv_api_v1.serializers.tag_family_type_serializer import TagFamilyTypeSerializer
from lstv_api_v1.views.content_views import ContentSearchView
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView, LSTVGenericAPIViewResourceNotFoundException
from lstv_api_v1.views.utils.user_view_utils import response_40x, API_CACHE_TTL_REALTIME
from django.db.models import F, Count
from lstv_api_v1.views.utils.view_utils import response_20x, response_200, response_500


#   _______            ______              _ _         _______                __      ___               
#  |__   __|          |  ____|            (_) |       |__   __|               \ \    / (_)              
#     | | __ _  __ _  | |__ __ _ _ __ ___  _| |_   _     | |_   _ _ __   ___   \ \  / / _  _____      __
#     | |/ _` |/ _` | |  __/ _` | '_ ` _ \| | | | | |    | | | | | '_ \ / _ \   \ \/ / | |/ _ \ \ /\ / /
#     | | (_| | (_| | | | | (_| | | | | | | | | |_| |    | | |_| | |_) |  __/    \  /  | |  __/\ V  V / 
#     |_|\__,_|\__, | |_|  \__,_|_| |_| |_|_|_|\__, |    |_|\__, | .__/ \___|     \/   |_|\___| \_/\_/  
#               __/ |                           __/ |        __/ | |                                    
#              |___/                           |___/        |___/|_|                                    

class TagFamilyTypeView(LSTVBaseAPIView):
    """
    Tag Family Types view
    """

    permission_classes = [IsAuthenticated]

    allowable_admin_options = {
        "/": ["GET"]
    }

    public_read_lstv_admin_write = {
        "GET": {
            "user_types": [UserTypeEnum.admin],
        }
    }

    permission_scope = {
        "/": public_read_lstv_admin_write
    }

    #    _____ ______ _______ 
    #   / ____|  ____|__   __|
    #  | |  __| |__     | |   
    #  | | |_ |  __|    | |   
    #  | |__| | |____   | |   
    #   \_____|______|  |_|   
                        
    def do_get(self, request, **kwargs):
        user = self.request_params.get('user')
        if not user:
            return response_40x(401, f"Unauthorized")
        if 'tag_group' not in request.query_params:
            return response_40x(400, f"Resource not found")
        
        tag_group = request.query_params['tag_group']
        if tag_group not in ('wedding_tag','lstv_editorial'):
            return response_40x(400, f"Invalid Tag Group")
        elif tag_group == 'wedding_tag':   
            serializer = TagFamilyTypeSerializer(TagFamilyType.objects.filter(tag_group=TagFamilyGroupType.wedding_tag),many=True)
        elif tag_group == 'lstv_editorial':
            serializer = TagFamilyTypeSerializer(TagFamilyType.objects.filter(tag_group=TagFamilyGroupType.lstv_editorial),many=True)

        return response_200(serializer.data)
                        