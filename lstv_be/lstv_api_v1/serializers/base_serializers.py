from collections import OrderedDict

from rest_framework import serializers

from lstv_api_v1.models import ContentVerbosityType

time_stamp_format = "%Y-%m-%d %H:%M:%S UTC"

REQUEST_CONTEXT_BUSINESS_ROLES = 'roles'


class LSTVBaseSerializer(serializers.Serializer):
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        self.verbosity = kwargs.pop('verbosity', ContentVerbosityType.full)
        self.element = kwargs.pop('element', None)
        self.sub_element = kwargs.pop('sub_element', None)
        self.request_context = kwargs.pop('request_context', None)
        self.action = kwargs.pop('action', None)
        self.scope = kwargs.pop('scope', 'active')
        self.context_object = kwargs.pop('context_object', None)

        if self.request:
            self.request_method = self.request.method
        super().__init__(*args, **kwargs)

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass


class TimeBasedSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'request' in kwargs:
            self.request = kwargs.pop('request', None)
            self.element = kwargs.pop('element', None)
        super().__init__(*args, **kwargs)

    created_at = serializers.DateTimeField(format=time_stamp_format, required=False)
    updated_at = serializers.DateTimeField(format=time_stamp_format, required=False)


class TimeBasedSerializerOnlyCreate(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'request' in kwargs:
            self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    created_at = serializers.DateTimeField(format=time_stamp_format,
                                           required=False)
