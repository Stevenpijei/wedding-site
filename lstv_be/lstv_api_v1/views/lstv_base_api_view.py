from lstv_api_v1.serializers.serializers_posts import *


class LSTVGenericAPIViewException(Exception):
    pass


class LSTVGenericAPIViewResourceNotFoundException(Exception):
    pass


class LSTVGenericAPIViewExceptionFatal(Exception):
    pass


class LSTVGenericAPIViewUnauthorizedException(Exception):
    pass


class LSTVBaseAPIView(APIView):

    def __init__(self, **kwargs):

        self.offset = None
        self.size = None
        self.order = None
        self.order_by_field = None
        self.sort_field = None
        self.sort_order = None
        self.get_args = None
        self.id = None
        self.scope = None
        self.slug = None
        self.verbosity = None
        self.request = None
        self.request_params = None
        self.kwargs = kwargs
        super(APIView, self).__init__(*kwargs)

    def get_request_params(self):
        if self.request:
            return {  # generic
                'method': self.request.method,
                'id': self.kwargs.get('id', None).strip() if self.kwargs.get('id') else None,
                'user': self.request.user if not self.request.user.is_anonymous else None,
                'sub_obj': self.kwargs.get('subobj', None).strip() if self.kwargs.get('subobj') else None,
                'detail_obj_id': self.kwargs.get('subid', None).strip() if self.kwargs.get('subid') else None,
                'action': self.kwargs.get('action', None).strip() if self.kwargs.get('action') else None,
                # location
                'country': self.kwargs.get('country', None).strip() if self.kwargs.get('country') else None,
                'state_province': self.kwargs.get('state_province', None).strip() if self.kwargs.get(
                    'state_province') else None,
                'county': self.kwargs.get('county', None).strip() if self.kwargs.get(
                    'county') else None,
                'place': self.kwargs.get('place', None).strip() if self.kwargs.get(
                    'place') else None,
                'place_or_county': self.kwargs.get('place_or_county', None).strip() if self.kwargs.get(
                    'place_or_county') else None,
                'place_or_county_or_state_province': self.kwargs.get('place_or_county_or_state_province',
                                                                     None).strip() if self.kwargs.get(
                    'place_or_county_or_state_province') else None,
                'scope': self.kwargs.get('scope', None)
            }
        return {}

    @staticmethod
    def authenticate_user_membership(business_team_member_permissions_required):
        return False

    @staticmethod
    def authenticate_user_ownership_of_object():
        return False

    #         _         _                  _
    #        | |       | |                | |
    #    __ _| |__  ___| |_ _ __ __ _  ___| |_
    #   / _` | '_ \/ __| __| '__/ _` |/ __| __|
    #  | (_| | |_) \__ \ |_| | | (_| | (__| |_
    #   \__,_|_.__/|___/\__|_|  \__,_|\___|\__|

    def do_post(self, request, **kwargs):
        raise LSTVGenericAPIViewExceptionFatal("do_post not overridden")

    def do_get(self, request, **kwargs):
        raise LSTVGenericAPIViewExceptionFatal("do_get not overridden")

    def do_patch(self, request, **kwargs):
        raise LSTVGenericAPIViewExceptionFatal("do_patch not overridden")

    def do_delete(self, request, **kwargs):
        raise LSTVGenericAPIViewExceptionFatal("do_delete not overridden")

    #   _____                    _         _
    #  |  __ \                  (_)       (_)
    #  | |__) |__ _ __ _ __ ___  _ ___ ___ _  ___  _ __  ___
    #  |  ___/ _ \ '__| '_ ` _ \| / __/ __| |/ _ \| '_ \/ __|
    #  | |  |  __/ |  | | | | | | \__ \__ \ | (_) | | | \__ \
    #  |_|   \___|_|  |_| |_| |_|_|___/___/_|\___/|_| |_|___/

    def is_permitted(self):
        if not self.permission_scope:
            return True

        scope = self.permission_scope.get(
            self.request_params['sub_obj'] if self.request_params['sub_obj'] else "/")
        if not scope:
            return False

        method = self.request_params.get('method', None)
        action = self.request_params.get('action', None)
        user = self.request_params.get('user', None)
        request_scope = scope.get(method, None)
        action_scope = scope.get('actions', None)
        detail_obj_id = self.request_params.get('detail_obj_id', None)

        # authenticating the action. Is it allowed?
        if action:
            if action_scope and action_scope.get(action, None):
                if action_scope[action].get(method, {}) is not None:
                    return True
                else:
                    return False
            else:
                return False

        if request_scope is not None:

            if 'ownership' in request_scope:
                if not user:
                    return False
                if not self.authenticate_user_ownership_of_object():
                    return False

            if request_scope.get('user_types', None):
                if not user:
                    return False
                if user.user_type not in request_scope['user_types']:
                    return False

                # # business_team_members must be members of the business_object
                # if user.user_type == UserTypeEnum.business_team_member:
                #     if not self.authenticate_user_membership(
                #             request_scope.get('business_user_permissions', None)):
                #         print(f"user is NOT a member of the business")
                #         return False

            if request_scope.get('field_permissions', None):

                for field in request_scope.get('field_permissions').keys():
                    f = request_scope.get('field_permissions').get(field)

                    if (method in ['POST', 'PATCH'] and field in self.request.data) or (
                            method == 'GET' and field in self.request.query_params):
                        if not user:
                            return False
                        # field based user restrictions?
                        if f.get('user_types', None) and user.user_type not in f.get('user_types'):
                            print(f"{field} cannot be posted/patched by user type {user.user_type}")
                            return False

                        # field based business team member restrictions?
                        if user.user_type == UserTypeEnum.business_team_member:
                            if not user:
                                return False
                            if f.get('business_user_permissions', None) and user.user_type not in f.get(
                                    'business_user_permissions'):
                                if not self.authenticate_user_membership(
                                        f.get('business_user_permissions', None)):
                                    return False
                    if method == 'DELETE':
                        if not user:
                            return False
                        if field == 'detailobj' and detail_obj_id:
                            if f.get('user_types', None) and user.user_type not in f.get('user_types'):
                                return False

                            if user.user_type == UserTypeEnum.business_team_member:
                                if f.get('business_user_permissions', None) and user.user_type not in f.get(
                                        'business_user_permissions'):

                                    if not self.authenticate_user_membership(
                                            f.get('business_user_permissions', None)):
                                        return False

            # user is permitted to take the action
            return True
        else:
            return False

    #                       _
    #                      | |
    #    ___ _ __ _   _  __| |
    #   / __| '__| | | |/ _` |
    #  | (__| |  | |_| | (_| |
    #   \___|_|   \__,_|\__,_|

    def set_interal_data(self, request, **kwargs):

        # get objects
        self.request = request
        # get permission params
        self.request_params = self.get_request_params()

        # collect query params and other url path elements
        self.get_args = request.query_params
        self.offset = self.get_args.get('offset', None)
        try:
            self.verbosity = ContentVerbosityType[(self.get_args.get('verbosity', 'full'))]
        except KeyError:
            self.verbosity = ContentVerbosityType.full

        self.size = self.get_args.get('size', None)
        self.order_by_field = LSTV_API_VIEW_ORDER_TYPES.get(self.get_args.get('order', "most_recent"))

        self.sort_field = LSTV_API_SORT_FIELD_TRANSLATION.get(
            self.get_args.get('sort_field', "created_at")) or self.get_args.get('sort_field', "created_at")
        self.sort_order = self.get_args.get('sort_order', 'desc')
        self.scope = request.query_params.get('scope', 'active')
        self.id = kwargs.get('id', None).strip() if kwargs.get('id') else None

    def post(self, request, **kwargs):

        self.set_interal_data(request, **kwargs)

        try:
            if self.is_permitted():
                return self.do_post(request, **kwargs)
            else:
                return response_40x(403, {})
        except LSTVGenericAPIViewResourceNotFoundException as e:
            return response_40x(404, str(e))
        except LSTVGenericAPIViewException as e:
            return response_40x(400, str(e))
        except LSTVGenericAPIViewUnauthorizedException as e:
            return response_40x(401, str(e))
        except LSTVGenericAPIViewExceptionFatal as e:
            return response_500(str(e))

    def get(self, request, **kwargs):
        self.set_interal_data(request, **kwargs)
        if self.request_params:
            if self.request_params.get('sub_obj') is not None and self.request_params.get(
                    'sub_obj') not in self.allowable_sub_objects:
                return response_40x(400,
                                    f"/{self.request_params.get('sub_obj')} isn't a recognized url path element.")

        try:
            if self.is_permitted():

                return self.do_get(request, **kwargs)
            else:
                return response_40x(403, {})
        except LSTVGenericAPIViewResourceNotFoundException as e:
            return response_40x(404, str(e))
        except LSTVGenericAPIViewException as e:
            return response_40x(400, str(e))
        except LSTVGenericAPIViewUnauthorizedException as e:
            return response_40x(401, str(e))
        except LSTVGenericAPIViewExceptionFatal as e:
            return response_500(str(e))

    def patch(self, request, **kwargs):
        self.set_interal_data(request, **kwargs)

        try:
            if self.is_permitted():
                return self.do_patch(request, **kwargs)
            else:
                return response_40x(403, {})

        except LSTVGenericAPIViewResourceNotFoundException as e:
            return response_40x(404, str(e))
        except LSTVGenericAPIViewException as e:
            return response_40x(400, str(e))
        except LSTVGenericAPIViewUnauthorizedException as e:
            return response_40x(401, str(e))
        except LSTVGenericAPIViewExceptionFatal as e:
            return response_500(str(e))

    def delete(self, request, **kwargs):
        self.set_interal_data(request, **kwargs)

        try:
            if self.is_permitted():
                return self.do_delete(request, **kwargs)
            else:
                return response_40x(403, {})
        except LSTVGenericAPIViewResourceNotFoundException as e:
            return response_40x(404, str(e))
        except LSTVGenericAPIViewException as e:
            return response_40x(400, str(e))
        except LSTVGenericAPIViewUnauthorizedException as e:
            return response_40x(401, str(e))
        except LSTVGenericAPIViewExceptionFatal as e:
            return response_500(str(e))
