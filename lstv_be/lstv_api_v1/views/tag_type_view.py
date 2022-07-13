from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET
from lstv_api_v1.models import Video, UserTypeEnum, TagType, User, ContentModelState, TagFamilyGroupType, TagFamilyType
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.curated_content_serializer import CuratedContentSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import VideoBusinessSerializer
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer, TagTypeSubscriberSerializer
from lstv_api_v1.serializers.video_serializer import VideoSerializer, VideoSourceSerializer
from lstv_api_v1.views.content_views import ContentSearchView
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView, LSTVGenericAPIViewResourceNotFoundException
from lstv_api_v1.views.utils.user_view_utils import response_40x, API_CACHE_TTL_REALTIME
from django.db.models import F, Count

#   _______            _______                __      ___
#  |__   __|          |__   __|               \ \    / (_)
#     | | __ _  __ _     | |_   _ _ __   ___   \ \  / / _  _____      __
#     | |/ _` |/ _` |    | | | | | '_ \ / _ \   \ \/ / | |/ _ \ \ /\ / /
#     | | (_| | (_| |    | | |_| | |_) |  __/    \  /  | |  __/\ V  V /
#     |_|\__,_|\__, |    |_|\__, | .__/ \___|     \/   |_|\___| \_/\_/
#               __/ |        __/ | |
#              |___/        |___/|_|

from lstv_api_v1.views.utils.view_utils import response_20x, response_200, response_500


class TagTypeView(LSTVBaseAPIView):
    """
    Tag view
    """

    permission_classes = [AllowAny]

    allowable_admin_options = {
        "_count": ["GET"]
    }

    allowable_sub_objects = ['curation', 'subscribers', 'verifySubscription']

    admin_only = {
        "user_types": [UserTypeEnum.admin]
    }

    public_read_lstv_admin_write = {
        "GET": {},
        "POST": {
            "user_types": [UserTypeEnum.admin],
        },
        "DELETE": {
            "user_types": [UserTypeEnum.admin],
        },
        "PATCH": {
            "user_types": [UserTypeEnum.admin],
        }
    }

    permission_scope = {
        "/": public_read_lstv_admin_write,
        "curation": public_read_lstv_admin_write,
        "verifySubscription": {
            "GET": {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member, UserTypeEnum.consumer]
            }
        },
        "subscribers": {
            "GET": {
                "user_types": [UserTypeEnum.admin],
            },
            "POST": {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member, UserTypeEnum.consumer],
                "field_permissions": {
                    "user_id": {
                        "user_types": [UserTypeEnum.admin],
                        "business_user_permissions": ["manage-subscribers"]
                    }
                }
            },
            "DELETE": {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member, UserTypeEnum.consumer],
            }
        }
    }

    #    _____      _          _____       _        _ _             _     _           _
    #   / ____|    | |        |  __ \     | |      (_) |           | |   (_)         | |
    #  | |  __  ___| |_ ______| |  | | ___| |_ __ _ _| |______ ___ | |__  _  ___  ___| |_
    #  | | |_ |/ _ \ __|______| |  | |/ _ \ __/ _` | | |______/ _ \| '_ \| |/ _ \/ __| __|
    #  | |__| |  __/ |_       | |__| |  __/ || (_| | | |     | (_) | |_) | |  __/ (__| |_
    #   \_____|\___|\__|      |_____/ \___|\__\__,_|_|_|      \___/|_.__/| |\___|\___|\__|
    #                                                                   _/ |
    #                                                                  |__/

    @staticmethod
    def get_detail_object(objs, sub_obj, detail_obj_id):
        return None

    def authenticate_user_membership(self, business_team_member_permissions_required):
        return False

    def authenticate_user_ownership_of_object(self):
        return False

    def get_target_object(self):
        if self.id:
            try:
                obj = TagType.objects.filter(slug=self.id).first()
                return obj
            except TagType.DoesNotExist:
                raise LSTVGenericAPIViewResourceNotFoundException(f"tag slug {self.id} not found")

    #   _____   ____   _____ _______
    #  |  __ \ / __ \ / ____|__   __|
    #  | |__) | |  | | (___    | |
    #  |  ___/| |  | |\___ \   | |
    #  | |    | |__| |____) |  | |
    #  |_|     \____/|_____/   |_|

    def do_post(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        action = self.request_params.get('action')
        detail_obj_id = self.request_params.get('detail_obj_id')
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not user:
            return response_40x(401, f"Unauthorized")

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            serializer = TagTypeSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #    _____                _   _
        #   / ____|              | | (_)
        #  | |    _   _ _ __ __ _| |_ _  ___  _ __
        #  | |   | | | | '__/ _` | __| |/ _ \| '_ \
        #  | |___| |_| | | | (_| | |_| | (_) | | | |
        #   \_____\__,_|_|  \__,_|\__|_|\___/|_| |_|

        elif sub_obj == 'curation':
            if objs.curated_properties.count() == 0:
                serializer = CuratedContentSerializer(data=request.data, request=request, element=objs)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(201, serializer.create(serializer.validated_data))
            else:
                return response_40x(400, "tag type already has curated content")

        #    _____       _                   _ _
        #   / ____|     | |                 (_) |
        #  | (___  _   _| |__  ___  ___ _ __ _| |__   ___ _ __ ___
        #   \___ \| | | | '_ \/ __|/ __| '__| | '_ \ / _ \ '__/ __|
        #   ____) | |_| | |_) \__ \ (__| |  | | |_) |  __/ |  \__ \
        #  |_____/ \__,_|_.__/|___/\___|_|  |_|_.__/ \___|_|  |___/

        elif sub_obj == 'subscribers':
            # for lstv-admin users: we allow the explicit addition/deletion of a subscriber, for anyone else it must
            # be the logged in user making the request...

            if 'user_id' in request.data:
                try:
                    user = User.objects.get(id=request.data['user_id'])
                except User.DoesNotExist:
                    return response_40x(400, f"user_id does not pertain to any existing user.")

            s = objs.subscribers.filter(id=user.id).first()
            if s:
                return response_40x(400, f"already a subscriber.")
            objs.subscribers.add(user)
            return response_20x(201, {})

        # catchall (should never happen)
        return response_500("post method did not succeed")

    #    _____ ______ _______
    #   / ____|  ____|__   __|
    #  | |  __| |__     | |
    #  | | |_ |  __|    | |
    #  | |__| | |____   | |
    #   \_____|______|  |_|

    def do_get(self, request, **kwargs):
        rc = []
        sub_obj = self.request_params.get('sub_obj')
        objs = self.get_target_object()

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        if self.id and not objs and self.id not in self.allowable_admin_options.keys():
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            if objs:
                serializer = TagTypeSerializer(request=request, verbosity=self.verbosity)
                return response_200(serializer.to_representation(objs))
            else:
                if not request.user or request.user.is_anonymous or request.user.user_type != UserTypeEnum.admin:
                    return response_40x(401, "unauthorized")
                if self.id and self.id in self.allowable_admin_options.keys():
                    return response_200({
                        "active_count": TagType.objects_all_states.filter(state=ContentModelState.active).count(),
                        "deleted_count": TagType.objects_all_states.filter(state=ContentModelState.deleted).count(),
                        "suggested_count": TagType.objects_all_states.filter(
                            state=ContentModelState.suspended_dmz).count(),
                    })


                scope = ContentModelState.active
                try:
                    scope = ContentModelState[self.scope or 'active']
                except KeyError:
                    pass

                tags = TagType.objects_all_states.annotate(subscriber_count=Count('subscribers')).filter(state=scope)

                if 'tag' in request.query_params:
                    tags = tags.filter(name__icontains=request.query_params['tag'])

                if 'type' in request.query_params:
                    tags = tags.filter(tag_family_type__name__icontains=request.query_params['type'])

                out_of = tags.count()

                if self.sort_order == 'asc':
                    tags = tags.order_by(F(self.sort_field).asc(nulls_last=True))
                else:
                    tags = tags.order_by(F(self.sort_field).desc(nulls_last=True))

                serializer = TagTypeSerializer(request=request, verbosity=self.verbosity, scope=scope)

                rc = []


                for tag in tags[int(self.offset):int(self.offset) + int(self.size)]:
                    rc.append(serializer.to_representation(tag))

                return response_200(rc, scope={'offset': int(self.offset),
                                               'request_size': int(self.size),
                                               'response_size': len(rc),
                                               'total': out_of})

        #    _____                _   _
        #   / ____|              | | (_)
        #  | |    _   _ _ __ __ _| |_ _  ___  _ __
        #  | |   | | | | '__/ _` | __| |/ _ \| '_ \
        #  | |___| |_| | | | (_| | |_| | (_) | | | |
        #   \_____\__,_|_|  \__,_|\__|_|\___/|_| |_|

        elif sub_obj == 'curation':
            serializer = CuratedContentSerializer(request=request, verbosity=self.verbosity)
            return response_200(serializer.to_representation(objs))

        #    _____       _                   _       _   _
        #   / ____|     | |                 (_)     | | (_)
        #  | (___  _   _| |__  ___  ___ _ __ _ _ __ | |_ _  ___  _ __
        #   \___ \| | | | '_ \/ __|/ __| '__| | '_ \| __| |/ _ \| '_ \
        #   ____) | |_| | |_) \__ \ (__| |  | | |_) | |_| | (_) | | | |
        #  |_____/ \__,_|_.__/|___/\___|_|  |_| .__/ \__|_|\___/|_| |_|
        #                                     | |
        #                                     |_|

        elif sub_obj == 'subscribers':
            return response_20x(200, TagTypeSubscriberSerializer().to_representation(list(objs.subscribers.all())))
        elif sub_obj == 'verifySubscription':
            if request.user:
                if objs.subscribers.filter(id=request.user.id):
                    return response_200({"subscribed": True}, ttl=API_CACHE_TTL_REALTIME)
                else:
                    return response_200({"subscribed": False}, ttl=API_CACHE_TTL_REALTIME)
            else:
                return response_40x(401, f"Unauthorized")

        # catchall (should never happen)
        return response_500("get method did not succeed")

    #   _____     _______ _____ _    _
    #  |  __ \ /\|__   __/ ____| |  | |
    #  | |__) /  \  | | | |    | |__| |
    #  |  ___/ /\ \ | | | |    |  __  |
    #  | |  / ____ \| | | |____| |  | |
    #  |_| /_/    \_\_|  \_____|_|  |_|

    def do_patch(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not objs:
            return response_40x(400, f"resource not found")

        if not sub_obj:
            serializer = TagTypeSerializer(request=request, data=request.data, element=objs,partial=True)
            if serializer.is_valid(raise_exception=True):
                rc = serializer.update(objs, serializer.validated_data)                
                if rc:
                    return response_20x(200, rc)

        #    _____                _   _
        #   / ____|              | | (_)
        #  | |    _   _ _ __ __ _| |_ _  ___  _ __
        #  | |   | | | | '__/ _` | __| |/ _ \| '_ \
        #  | |___| |_| | | | (_| | |_| | (_) | | | |
        #   \_____\__,_|_|  \__,_|\__|_|\___/|_| |_|

        elif sub_obj == 'curation':
            serializer = CuratedContentSerializer(request=request, data=request.data, element=objs)
            if serializer.is_valid(raise_exception=True):
                print(json.dumps(request.data, indent=4))        
                rc = serializer.update(objs, serializer.validated_data)
                if rc:
                    return response_20x(200, rc)
                else:
                    return response_40x(404, "this tag type does not have curated content")

        # catchall (should never happen)
        # return response_500()

    #   _____  ______ _      ______ _______ ______
    #  |  __ \|  ____| |    |  ____|__   __|  ____|
    #  | |  | | |__  | |    | |__     | |  | |__
    #  | |  | |  __| | |    |  __|    | |  |  __|
    #  | |__| | |____| |____| |____   | |  | |____
    #  |_____/|______|______|______|  |_|  |______|

    def do_delete(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        action = self.request_params.get('action')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            # 
            if objs:
                objs.delete()
            return response_20x(200, {})                                           

        #    _____                _   _
        #   / ____|              | | (_)
        #  | |    _   _ _ __ __ _| |_ _  ___  _ __
        #  | |   | | | | '__/ _` | __| |/ _ \| '_ \
        #  | |___| |_| | | | (_| | |_| | (_) | | | |
        #   \_____\__,_|_|  \__,_|\__|_|\___/|_| |_|

        elif sub_obj == 'curation':
            if objs.curated_properties.count() > 0:
                for ci in objs.curated_properties.all():
                    ci.delete()
                objs.curated_properties.clear()
                return response_20x(200, {})
            else:
                return response_40x(404, "this tag type does not have curated content")

        #    _____       _                   _ _
        #   / ____|     | |                 (_) |
        #  | (___  _   _| |__  ___  ___ _ __ _| |__   ___ _ __ ___
        #   \___ \| | | | '_ \/ __|/ __| '__| | '_ \ / _ \ '__/ __|
        #   ____) | |_| | |_) \__ \ (__| |  | | |_) |  __/ |  \__ \
        #  |_____/ \__,_|_.__/|___/\___|_|  |_|_.__/ \___|_|  |___/

        # for lstv-admin users: we allow the explicit addition/deletion of a subscriber, for anyone else it must
        # be the logged in user making the request...
        elif sub_obj == 'subscribers':
            if detail_obj_id:
                try:
                    user = User.objects.get(id=detail_obj_id)
                except User.DoesNotExist:
                    return response_40x(400, f"user_id does not pertain to any user.")

            if objs.subscribers.filter(id=user.id).count() < 1:
                return response_40x(400, f"user is not a subscriber")

            objs.subscribers.remove(user)
            return response_20x(200, {})

        # catchall (should never happen)
        return response_500("delete method did not succeed")
