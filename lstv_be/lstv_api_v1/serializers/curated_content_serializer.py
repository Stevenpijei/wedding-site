from lstv_api_v1.models import Properties
from lstv_api_v1.utils.utils import SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL, \
    SERIALIZER_DETAIL_LEVEL_CONTEXT_CARD
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseSerializer
from rest_framework import serializers


#    _____                _           _    _____            _             _
#   / ____|              | |         | |  / ____|          | |           | |
#  | |    _   _ _ __ __ _| |_ ___  __| | | |     ___  _ __ | |_ ___ _ __ | |_
#  | |   | | | | '__/ _` | __/ _ \/ _` | | |    / _ \| '_ \| __/ _ \ '_ \| __|
#  | |___| |_| | | | (_| | ||  __/ (_| | | |___| (_) | | | | ||  __/ | | | |_
#   \_____\__,_|_|  \__,_|\__\___|\__,_|  \_____\___/|_| |_|\__\___|_| |_|\__|
#   / ____|         (_)     | (_)
#  | (___   ___ _ __ _  __ _| |_ _______ _ __
#   \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#   ____) |  __/ |  | | (_| | | |/ /  __/ |
#  |_____/ \___|_|  |_|\__,_|_|_/___\___|_|


class CuratedContentSerializer(LSTVBaseSerializer):
    # a-la-carte items (can be used or omitted individually)
    page_title = serializers.CharField(max_length=100, min_length=3, required=False)
    page_description = serializers.CharField(max_length=500, min_length=3, required=False)
    businesses_title = serializers.CharField(max_length=100, min_length=3, required=False)

    # middle info group (must be all or none)
    middle_info_header_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_header_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_text_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_text_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_image_url = serializers.CharField(max_length=150, min_length=3, required=False)

    # bottom info group (must be all or none)
    bottom_info_header_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_text_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_text_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_image_url_1 = serializers.CharField(max_length=150, min_length=3, required=False)
    bottom_info_image_url_2 = serializers.CharField(max_length=150, min_length=3, required=False)

    def validate(self, data):
        method = getattr(self.request, 'method', None)

        middle_fields = ["middle_info_header_1",
                         "middle_info_header_2",
                         "middle_info_text_1",
                         "middle_info_text_2",
                         "middle_info_image_url"]

        bottom_fields = ["bottom_info_header_1",
                         "bottom_info_text_1",
                         "bottom_info_text_2",
                         "bottom_info_image_url_1",
                         "bottom_info_image_url_2"]

        if any(key in data for key in middle_fields):
            if not all(key in data for key in middle_fields):
                raise serializers.ValidationError(
                    f"if one middle_info field is used, all middle_info fields "
                    f"must be used too ({', '.join(middle_fields)})")

        if any(key in data for key in bottom_fields):
            if not all(key in data for key in bottom_fields):
                raise serializers.ValidationError(
                    f"if one bottom_fields field is used, all bottom_fields fields "
                    f"must be used too ({', '.join(bottom_fields)})")

        return data

    def create(self, validated_data):
        for key in validated_data:
            p = Properties(key=key, value_text=validated_data[key])
            p.save()
            self.element.curated_properties.add(p)

        return {self.element.id}

    def update(self, instance, validated_data):
        fields = ["page_title",
                  "page_description",
                  "businesses_title",
                  "middle_info_header_2",
                  "middle_info_text_1",
                  "middle_info_text_2",
                  "middle_info_image_url",
                  "bottom_info_header_1",
                  "bottom_info_text_1",
                  "bottom_info_text_2",
                  "bottom_info_image_url_1",
                  "bottom_info_image_url_2"]

        for field in fields:
            if validated_data[field]:
                prop = instance.curated_properties.filter(key=field).first()
                if prop:
                    prop.value_text = validated_data[field]
                    prop.save()
                else:
                    prop = Properties(key=field, value_text=validated_data[field])
                    prop.save()
                    instance.curated_properties.add(prop)

            return {"updated": str(instance) + " curated content"}

    def to_representation(self, obj):
        rc = {}
        for prop in obj.curated_properties.all():
            rc[prop.key] = prop.value_text
        return rc
