import statistics
from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.models import *


#  ___      ___     __  _       ____  ____    ____  ______  ____  __ __    ___
# |   \    /  _]   /  ]| T     /    T|    \  /    T|      Tl    j|  T  |  /  _]
# |    \  /  [_   /  / | |    Y  o  ||  D  )Y  o  ||      | |  T |  |  | /  [_
# |  D  YY    _] /  /  | l___ |     ||    / |     |l_j  l_j |  | |  |  |Y    _]
# |     ||   [_ /   \_ |     T|  _  ||    \ |  _  |  |  |   |  | l  :  !|   [_
# |     ||     T\     ||     ||  |  ||  .  Y|  |  |  |  |   j  l  \   / |     T
# l_____jl_____j \____jl_____jl__j__jl__j\_jl__j__j  l__j  |____j  \_/  l_____j
#
#   _____   ___  ____   ____   ____  _      ____  _____    ___  ____
#  / ___/  /  _]|    \ l    j /    T| T    l    j|     T  /  _]|    \
# (   \_  /  [_ |  D  ) |  T Y  o  || |     |  T l__/  | /  [_ |  D  )
#  \__  TY    _]|    /  |  | |     || l___  |  | |   __jY    _]|    /
#  /  \ ||   [_ |    \  |  | |  _  ||     T |  | |  /  ||   [_ |    \
#  \    ||     T|  .  Y j  l |  |  ||     | j  l |     ||     T|  .  Y
#   \___jl_____jl__j\_j|____jl__j__jl_____j|____jl_____jl_____jl__j\_j
#


class LSTVDeclarativeAPISerializerException(Exception):
    pass


class LSTVDeclarativeAPISerializer(LSTVBaseSerializer):

    def create(self, validated_data):
        return {}

    def update(self, instance, validated_data):
        return {}

    def get_field_value(self, obj, field_name, obj_field):
        from lstv_api_v1.views.utils.view_utils import LSTV_API_VIEW_FIELD_TYPE_MANY_TO_MANY, \
            LSTV_API_VIEW_FIELD_TYPE_FOREIGN_KEY, LSTV_API_VIEW_FIELD_TYPE_TEXT

        if obj_field:
            # obtain field type and optional get_value function
            field_type = obj_field.get('type', None)
            get_value_func = obj_field.get('get_value_func', None)
            # obtain true field name, where applicable
            field_name = obj_field.get('field_name', field_name)
            # obtain model class
            model_class = obj_field.get('model_class', self.model_class)
            # obtain object name
            object = obj_field.get('object', None)

            if get_value_func:
                # extract the value via calling the get_value_func
                try:
                    return getattr(obj, get_value_func.__name__)()
                except AttributeError:
                    return None
            else:
                if field_type == LSTV_API_VIEW_FIELD_TYPE_MANY_TO_MANY:
                    if not object:
                        raise LSTVDeclarativeAPISerializerException(
                            f"onject definition  {obj_field.get('object', None)} not found")

                    # field is a many to many relationship.

                    # obtain the many many objects
                    objs = getattr(obj, field_name).all()
                    # initialize a serializer matching the type of many to many objects
                    serializer = LSTVDeclarativeAPISerializer(request=self.request,
                                                              view_spec=self.view_spec,
                                                              get_args=self.get_args,
                                                              view_object=self.view_spec.get('objects', {}).get(object,
                                                                                                                None))
                    # append serializer output to rc
                    rc = []
                    for o in objs:
                        rc.append(serializer.to_representation(o))
                    return rc
                if field_type == LSTV_API_VIEW_FIELD_TYPE_FOREIGN_KEY:
                    # fiend value is a foreign Key model instance. Get the value of the field
                    fk_value = getattr(obj, field_name)
                    # initialize serializer for the foreign key object
                    view_object = self.view_spec.get('objects', {}).get(object, None)
                    serializer = LSTVDeclarativeAPISerializer(request=self.request,
                                                              view_spec=self.view_spec,
                                                              get_args=self.get_args,
                                                              view_object=view_object)

                    # if the fk object has one field... just grab the value, otherwise the whole structure.
                    if len(view_object.keys()) == 1:
                        rc = serializer.to_representation(fk_value)
                        return rc[list(view_object.keys())[0]]

                    return serializer.to_representation(fk_value)

                # field is a simply model attribute and will be fetched as such
                if hasattr(obj, field_name):
                    return getattr(obj, field_name)
                else:
                    raise LSTVDeclarativeAPISerializerException(
                        f"the {self.model_class} does not have an attribute named {field_name}")

        else:
            raise LSTVDeclarativeAPISerializerException(
                f"field is not defined in view spec.")

    def to_representation(self, obj):
        rc = {}
        # do we have a view object name?
        if self.view_object:
            # what object is the scope pertaining to?
            # get fields for scope
            for field in self.view_object.keys():
                # find field definition in the view_spec's objects
                obj_field = self.view_object[field]
                # if obj_field is valid continue processing
                if obj_field:
                    # if the verbosity is within acceptable range...
                    if not obj_field.get('verbosity', None) or \
                            verbosity_levels[self.get_args.get('verbosity', REQUEST_GET_SCOPE_FULL)] >= obj_field.get(
                            'verbosity'):
                        # obtain true name field where applicable
                        new_field = self.view_object[field].get('field_name', field)
                        # obtain the  value for the field
                        rc[self.view_object[field].get('public_field_name', new_field)] = \
                            self.get_field_value(obj, new_field, obj_field)
                else:
                    # raise an exception as field wasn't found in object definition
                    raise LSTVDeclarativeAPISerializerException(
                        f"{object} object is either undefined or does not have the {field} field defined.")
            return rc
        else:
            raise LSTVDeclarativeAPISerializerException(f"scope {self.view_scope} does not exist within the "
                                                        f"defined scopes")

    def validate(self, data):
        return data
