from lstv_api_v1.models import ContentVerbosityType, ContentModelState
from lstv_api_v1.serializers.curated_content_serializer import CuratedContentSerializer
from lstv_api_v1.utils.utils import SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL, \
    SERIALIZER_DETAIL_LEVEL_CONTEXT_CARD
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseSerializer
from lstv_api_v1.models import TagFamilyType
from rest_framework import serializers


#   _______            ______              _ _         _______                  _____           _       _ _              
#  |__   __|          |  ____|            (_) |       |__   __|                / ____|         (_)     | (_)             
#     | | __ _  __ _  | |__ __ _ _ __ ___  _| |_   _     | |_   _ _ __   ___  | (___   ___ _ __ _  __ _| |_ _______ _ __ 
#     | |/ _` |/ _` | |  __/ _` | '_ ` _ \| | | | | |    | | | | | '_ \ / _ \  \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#     | | (_| | (_| | | | | (_| | | | | | | | | |_| |    | | |_| | |_) |  __/  ____) |  __/ |  | | (_| | | |/ /  __/ |   
#     |_|\__,_|\__, | |_|  \__,_|_| |_| |_|_|_|\__, |    |_|\__, | .__/ \___| |_____/ \___|_|  |_|\__,_|_|_/___\___|_|   
#               __/ |                           __/ |        __/ | |                                                     
#              |___/                           |___/        |___/|_|                                                     



class TagFamilyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagFamilyType
        fields = (
            'slug',
            'name',
            'tag_group'
        )
    pass