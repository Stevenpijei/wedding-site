from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer


class LocationSubscribersSerializer(LSTVBaseSerializer):

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'id': obj.id,
                'name': obj.get_full_name_or_email()
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)