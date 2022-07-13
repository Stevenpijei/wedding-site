from django.contrib.postgres.aggregates import StringAgg
from django.db.models import F, Value, Subquery, OuterRef
from django.db.models.functions import Concat
from rest_framework.permissions import AllowAny
from rest_framework.decorators import *
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
import logging

from lstv_api_v1.utils.utils import notify_grapevine, send_user_welcome_email
from lstv_be.utils import build_login_user_payload

logger = logging.getLogger('lstv-user-activity-log')


class UserView(APIView):
    """
    Create User
    """

    permission_classes = ([AllowAny])

    def get(self, request, **kwarg):
        if not request.user or request.user.is_anonymous or request.user.user_type != UserTypeEnum.admin:
            return response_40x(401, "unauthorized")

        print(kwarg)
        if 'action' in kwarg and kwarg.get('action', None) == '_count':
            return response_200({
                "active_count": User.objects.count(),
                "active_review_count": User.objects.filter(state=ContentModelState.active_review).count(),
                "suspended_review_count": User.objects_all_states.filter(
                    state=ContentModelState.suspended_review).count(),
                "suspended_count": User.objects_all_states.filter(
                    state=ContentModelState.suspended).count(),
                "deleted_count": User.objects_all_states.filter(
                    state=ContentModelState.deleted).count(),
            })

        if all(key in request.query_params for key in ['size', 'offset']):
            sort_order = request.query_params.get('sort_order', 'desc')
            sort_field = LSTV_API_SORT_FIELD_TRANSLATION.get(request.query_params.get('sort_field', None),
                                                             request.query_params.get('sort_field', 'created_at'))
            scope = request.query_params.get('scope', 'active')
            search = request.query_params.get('search', None)
            user_type = request.query_params.get('user_type', None)

            try:
                sc = ContentModelState[scope]
            except KeyError:
                return response_40x(400, f"{scope} is an invalid scope")

            if scope in ['active', 'active_review']:
                model = User.objects.filter(state=sc)
            else:
                model = User.objects_all_states.filter(state=sc)
            offset = int(request.query_params.get('offset', 0))
            size = int(request.query_params.get('size', 20))

            if sort_order == 'desc':
                users = model.annotate(
                    full_name=Concat('first_name', Value(' '), 'last_name')).order_by(
                    F(sort_field).desc(nulls_last=True)).distinct()
            else:
                users = model.annotate(
                    full_name=Concat('first_name', Value(' '), 'last_name')).order_by(
                    F(sort_field).asc(nulls_last=True)).distinct()
            if search:
                users = users.annotate(search_name=Concat('first_name', Value(' '), 'last_name')).filter(
                    Q(search_name__icontains=search) | Q(email__icontains=search))
            if user_type:
                user_types = []
                for ut in user_type.split(','):
                    try:
                        user_types.append(UserTypeEnum[ut])
                    except KeyError:
                        return response_40x(400, f"{ut} is not a valid user type")

                users = users.filter(user_type__in=user_types)
            query_total = users.count()

            serializer = UserSerializer(data=request.data, request=request)
            rc = []

            for user in users[offset:offset + size]:
                rc.append(serializer.to_representation(user))
            return response_200(rc, scope={
                        "offset": offset,
                        "request_size": size,
                        "response_size": len(rc),
                        "total": query_total
                    }, ttl=0)

        else:
            return response_40x(400, "size and offset are required")

        return response_200({}, ttl=0)

    def post(self, request):
        serializer = UserSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            user, token = serializer.create(serializer.validated_data)
            if user:
                if not token:
                    return response_20x(201, {"email": user.email})
                if token:
                    if user.is_new and user.user_type == UserTypeEnum.consumer:
                        send_user_welcome_email(user)
                        notify_grapevine(f":standing_person::skin-tone-2: New consumer joined: {user.get_full_name_or_email()} ({user.email})",
                                         user.profile_image.get_serve_url() if user.profile_image else None)
                    return response_20x(
                        201 if user.is_new else 200, build_login_user_payload(user), token=token, user=user)
            else:
                if 'oauth_payload' in request.data:
                    return response_40x(400,
                                        "expired or externally modified oauth token used.", "oauth_payload")
                else:
                    return response_40x(400, "unable to create user")
        return response_40x(400, serializer)
