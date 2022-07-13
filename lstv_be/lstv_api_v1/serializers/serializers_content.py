import json
import statistics

from rest_framework import serializers

from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.models import BusinessTeamMemberRoleType, BusinessTeamMemberRolePermissionType, ShoppingItem, Video, \
    ResourceOrder, ResourceOrderingType


#    _____ _                       _               _____ _
#   / ____| |                     (_)             |_   _| |
#  | (___ | |__   ___  _ __  _ __  _ _ __   __ _    | | | |_ ___ _ __ ___
#   \___ \| '_ \ / _ \| '_ \| '_ \| | '_ \ / _` |   | | | __/ _ \ '_ ` _ \
#   ____) | | | | (_) | |_) | |_) | | | | | (_| |  _| |_| ||  __/ | | | | |
#  |_____/|_| |_|\___/| .__/| .__/|_|_| |_|\__, | |_____|\__\___|_| |_| |_|
#                     | |   | |             __/ |
#    _____           _|_|   |_|_           |___/
#   / ____|         (_)     | (_)
#  | (___   ___ _ __ _  __ _| |_ _______ _ __
#   \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#   ____) |  __/ |  | | (_| | | |/ /  __/ |
#  |_____/ \___|_|  |_|\__,_|_|_/___\___|_|


class ShoppingItemSerializer(LSTVBaseSerializer):
    name = serializers.CharField(max_length=100)
    sold_by = serializers.CharField(max_length=100)
    shop_url = serializers.CharField(max_length=550)
    thumbnail_url = serializers.CharField(max_length=550)
    price = serializers.IntegerField()
    old_price = serializers.IntegerField(required=False)
    discount_label = serializers.CharField(max_length=35, required=False)
    currency_symbol = serializers.CharField(max_length=3, required=False)

    def get_fields(self, *args, **kwargs):
        fields = super(ShoppingItemSerializer, self).get_fields()
        fields['name'].required = self.request.method in ['POST']
        fields['sold_by'].required = self.request.method in ['POST']
        fields['shop_url'].required = self.request.method in ['POST']
        fields['thumbnail_url'].required = self.request.method in ['POST']
        fields['price'].required = self.request.method in ['POST']
        fields['old_price'].required = False
        fields['discount_label'].required = False
        fields['currency_symbol'].required = False
        return fields

    def create(self, validated_data):
        if self.element:
            new_item = ShoppingItem(
                name=validated_data.get('name', None),
                sold_by=validated_data.get('sold_by', None),
                shop_url=validated_data.get('shop_url', None),
                thumbnail_url=validated_data.get('thumbnail_url', None),
                price_cents=validated_data.get('price_cents', None),
                old_price_cents=validated_data.get('old_price_cents', None),
                discount_label=validated_data.get('discount_label', None),
                currency_symbol=validated_data.get('currency_symbol', "$"),
            )
            new_item.save()

            self.element.shopping_items.add(new_item)
            return new_item
        return {}

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def to_representation(self, obj):

        return {
            "id": obj.id,
            "name": obj.name,
            "shop_url": obj.shop_url,
            "sold_by": obj.sold_by,
            "description": obj.description,
            "thumbnail_url": obj.thumbnail_image.get_serve_url() if obj.thumbnail_image else obj.thumbnail_url,
            "price": obj.price,
            "old_price": obj.old_price,
            "discount_label": obj.discount_label,
            "currency_symbol": obj.currency_symbol
        }

    @staticmethod
    def validate_content(value):
        """
        element type is the high level lstv2 entity this is in relation to.
        """
        if len(value) < 100:
            raise serializers.ValidationError("content must be at least 100 characters")
        return value


class BusinessVideoOrderSerializer(LSTVBaseSerializer):
    ordered_videos = serializers.JSONField(required=True)

    def create(self, validated_data):
        ResourceOrder.objects.filter(element_owner=self.element.id).delete()
        videos = validated_data.get('ordered_videos', {})
        for video in videos:
            ro = ResourceOrder(element_owner=self.element.id,
                               video_id=video.get('video_id'),
                               element_type=ResourceOrderingType.video,
                               element_order=video.get('order', 0))
            ro.save()
        return {}

    def validate(self, data):
        videos = data.get('ordered_videos', {})
        for video in videos:
            if Video.objects.filter(id=video.get('video_id', None)).count() == 0:
                raise serializers.ValidationError(f"{video.get('video_id', None)} is an invalid video id")
        return data

    def to_representation(self, obj):
        print(obj)
        return {
            "order": obj.element_order,
            "id": obj.video.videos.first().id if obj.video and obj.video.videos.count() > 0 else None,
            "video_id": obj.video.id,
            "video_slug": obj.video.post.slug,
            "video_title": obj.video.title,
            "video_thumbnail": obj.video.get_thumbnail_url(),
        }
