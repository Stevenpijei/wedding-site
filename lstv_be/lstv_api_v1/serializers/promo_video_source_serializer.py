from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.views.utils.view_utils import legacy_url_image


class PromoVideoSourceSerializer(LSTVBaseSerializer):

    def create(self, validated_data):
        return super(PromoVideoSourceSerializer).create(validated_data)

    def update(self, instance, validated_data):
        return super(PromoVideoSourceSerializer).update(instance, validated_data)

    def to_representation(self, obj):
        return {
            'id': obj.video_source.id,
            'title': obj.title,
            'description': obj.description,
            'order': obj.order,
            'type': obj.video_source.type.name,
            'media_id': obj.video_source.media_id,
            'duration': obj.video_source.duration,
            'width': obj.video_source.width,
            'height': obj.video_source.height,
            'thumbnail_url': legacy_url_image(obj.video_source.thumbnail.get_serve_url())
        }