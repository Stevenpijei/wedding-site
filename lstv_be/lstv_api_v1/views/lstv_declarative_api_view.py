#   ____    ___  ____     ___  ____   ____     __       ____  ____   ____      __ __  ____    ___  __    __
#  /    T  /  _]|    \   /  _]|    \ l    j   /  ]     /    T|    \ l    j    |  T  |l    j  /  _]|  T__T  T
# Y   __j /  [_ |  _  Y /  [_ |  D  ) |  T   /  /     Y  o  ||  o  ) |  T     |  |  | |  T  /  [_ |  |  |  |
# |  T  |Y    _]|  |  |Y    _]|    /  |  |  /  /      |     ||   _/  |  |     |  |  | |  | Y    _]|  |  |  |
# |  l_ ||   [_ |  |  ||   [_ |    \  |  | /   \_     |  _  ||  |    |  |     l  :  ! |  | |   [_ l  `  '  !
# |     ||     T|  |  ||     T|  .  Y j  l \     |    |  |  ||  |    j  l      \   /  j  l |     T \      /
# l___,_jl_____jl__j__jl_____jl__j\_j|____j \____j    l__j__jl__j   |____j      \_/  |____jl_____j  \_/\_/
import re

from django.db.models import Q
from rest_framework import permissions
from rest_framework.views import APIView

from lstv_api_v1.models import UserTypeEnum, ContentVerbosityType
from lstv_api_v1.serializers.lstv_declarative_api_serializer import LSTVDeclarativeAPISerializer, \
    LSTVDeclarativeAPISerializerException
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.views.utils.view_utils import response_40x, LSTV_API_VIEW_SCOPE_ROOT, LSTV_API_VIEW_ORDER_TYPES, \
    response_20x, get_model_element


class LSTVDeclarativeAPIViewPermission(permissions.BasePermission):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        view.parse_request(request)
        if request.method == 'GET':
            return True
        else:
            return bool(
                request.user and request.user.is_authenticated and
                (request.user.user_type == UserTypeEnum.business_team_member or
                 request.user.user_type == UserTypeEnum.admin))


class LSTVDeclarativeAPIView(APIView):
    """
    standard generic api view, supporting getting the request over and a context
    """

    permission_classes = ([LSTVDeclarativeAPIViewPermission])

    def __init__(self, **kwargs):

        self.method = None
        self.permission = None
        self.serializer_class = None
        self.view_scope = None
        self.element_id = None
        self.path = None
        self.get_args = None
        self.element = None

        super(APIView, self).__init__(*kwargs)

    def parse_request(self, request):
        def empty_view(*args, **kwargs):
            return None

        route = request.path.split("/")[3:]
        route_key = "/" + "/".join(route)

        # Define the urlpatterns
        from django.urls import path
        sub_urls = self.view_spec.get('scopes', {}).keys()
        urlpatterns = [path(u, empty_view) for u in sub_urls]

        # Create a resolver
        from django.urls.resolvers import URLResolver, RegexPattern
        resolver = URLResolver(RegexPattern(r'^'), urlpatterns)

        # Match a path
        # Returns a django.urls.resolvers.ResolverMatch object
        result = resolver.resolve(route_key)
        if result:
            self.view_scope = self.view_spec.get('scopes', {}).get(result.route)
            self.method = request.method
            self.path = route_key
            self.permission = self.view_scope.get(self.method, {}).get('permission', None)
            self.get_args = request.query_params

            # what objects are we operating on?

            url_elements = route_key.split("/")
            route_elements = result.route.split("/")

            temp_route = None
            for x in range(0, len(url_elements)):
                if not x:
                    temp_route = "/"
                elif x < 2:
                    temp_route += f"{route_elements[x]}"
                else:
                    temp_route += f"/{route_elements[x]}"
                mthd = self.view_spec.get('scopes', {}).get(temp_route, {}).get(self.method, {})
                if mthd:
                    mc = mthd.get('model_class', self.model_class)

                    # fetch required object(s)

                    element = None
                    if route_elements[x].startswith("<") and route_elements[x].endswith(">"):
                        element = mc.objects.filter(slug=url_elements[x]).first()
                        if not element and validate_uuid(url_elements[x]):
                            element = mc.objects.filter(id=url_elements[x]).first()
                        if not element:
                            return response_40x(404, f"element {url_elements[x]} not found")

                    self.element = element

                else:
                    return response_40x(404, f"endpoint not found")
            #
            # print("---")
            # print(f"element: {self.element}")
            # print(f"view_scope: {self.view_scope}")
            # print(f"model_class: {self.model_class}")
            # print(f"element_id: {self.element_id}")
            # print(f"path: {self.path}")
            # print(f"get_args: {self.get_args}")
            # print(f"permission: {self.permission}")
            # print("---")

            if self.view_scope and self.method and self.permission:
                return None
            else:
                return response_40x(400, f"Request {self.view_scope} URL isn't structured correctly.")
        else:
            return response_40x(404, f"endpoint not found")

    #     __  ____   __ __  ___
    #    /  ]|    \ |  T  T|   \
    #   /  / |  D  )|  |  ||    \
    #  /  /  |    / |  |  ||  D  Y
    # /   \_ |    \ |  :  ||     |
    # \     ||  .  Yl     ||     |
    #  \____jl__j\_j \__,_jl_____j

    def post(self, request, **kwargs):
        error = self.parse_request(request)
        if error:
            return error

        # serializer = self.serializer(request=request, data=request.data)
        # if serializer.is_valid(raise_exception=True):
        #     rc = serializer.create(serializer.validated_data)
        #     if rc:
        #         return response_20x(201, rc)

    def get(self, request, **kwargs):
        error = self.parse_request(request)
        if error:
            return error

        # get objects
        offset = int(self.get_args.get('offset', 0))
        size = int(self.get_args.get('size', 0))
        order = self.get_args.get('order', "az")
        order_by_field = LSTV_API_VIEW_ORDER_TYPES.get(order, "name")

        # is the order by field available on the model class if not revert to "-name"

        if not hasattr(self.model_class, order_by_field.replace("-", "")):
            return response_40x(400, f"order value ({order}) isn't supported by the {self.model_class.__name__}")

        # obtain objects: is this a root level "all objects"? or a particular id?

        if not self.element_id:
            objs = self.model_class.objects.all().order_by(order_by_field)[offset:offset + size]
        else:
            objs = self.model_class.objects.filter(Q(id=self.element_id) | Q(slug=self.element_id)).first()

        # are we using the internal declarative serializer? or a user-defined one?

        try:
            if self.serializer_class:
                serializer = self.serializer_class(request=request,
                                                   verbosity=self.get_args.get('verbosity', ContentVerbosityType.full))
            else:
                serializer = LSTVDeclarativeAPISerializer(request=request,
                                                          get_args=self.get_args,
                                                          view_spec=self.view_spec,
                                                          view_object=self.view_spec.get('objects', {}).get(
                                                              self.view_scope.get(request.method, {}).get(
                                                                  'object', None)))
            if not self.element:
                rc = []
                for o in objs:
                    rc.append(serializer.to_representation(o))
            else:
                rc = serializer.to_representation(self.element)

        except LSTVDeclarativeAPISerializerException as e:
            return response_40x(400, str(e))
        return response_200(rc)

    def patch(self, request, **kwargs):
        target_element = get_model_element(self.get_element_type(request), kwargs.get('id', None),
                                           kwargs.get('slug', None))
        if target_element:
            return self.on_patch(request, self.get_sub_object(request), target_element, **kwargs)
        else:
            return response_40x(404, "element not found")

    def delete(self, request, **kwargs):
        target_element = get_model_element(self.get_element_type(request), kwargs.get('id', None),
                                           kwargs.get('slug', None))
        if target_element:
            return self.on_delete(request, self.get_sub_object(request), target_element, **kwargs)
        else:
            return response_40x(404, "element not found")
