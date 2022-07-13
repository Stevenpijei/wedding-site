from rest_framework import serializers

from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer


class AdminStatsSerializer(LSTVBaseSerializer):

    def __init__(self, *args, **kwargs):
        self.params = kwargs.pop('params', None)
        super(AdminStatsSerializer, self).__init__(*args)

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        data = {

        }
        return data

