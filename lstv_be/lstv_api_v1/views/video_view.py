from django.contrib.postgres.aggregates import StringAgg
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import F, Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.parsers import MultiPartParser, FileUploadParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET, LSTV_API_V1_BAD_REQUEST_NO_SLUG
from lstv_api_v1.models import Video, UserTypeEnum, Message, LikableElementType, Like, ContentFlagElementEnumType, \
    ContentFlag, ContentVerbosityType, ContentModelState, VideoPurposeEnum, TagType
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.photo_serializer import PhotoSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer, BusinessFAQSerializer, \
    BusinessPublicTeamFAQSerializer, ElementLikeSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import VideoBusinessSerializer, TagSerializer
from lstv_api_v1.serializers.video_serializer import VideoSerializer, VideoSourceSerializer
from lstv_api_v1.views.content_views import ContentSearchView
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView, LSTVGenericAPIViewException, \
    LSTVGenericAPIViewUnauthorizedException, LSTVGenericAPIViewResourceNotFoundException
from lstv_api_v1.views.lstv_declarative_api_view import LSTVDeclarativeAPIView
from lstv_api_v1.views.utils.user_view_utils import create_new_business, response_40x, TagTypeSerializer

#  __     ___     _             __     ___
#  \ \   / (_) __| | ___  ___   \ \   / (_) _____      _____
#   \ \ / /| |/ _` |/ _ \/ _ \   \ \ / /| |/ _ \ \ /\ / / __|
#    \ V / | | (_| |  __/ (_) |   \ V / | |  __/\ V  V /\__ \
#     \_/  |_|\__,_|\___|\___/     \_/  |_|\___| \_/\_/ |___/

from lstv_api_v1.views.utils.view_utils import response_20x, response_500, response_200


class VideoView(LSTVBaseAPIView):
    """
    Business view class, handling all business objects for all audiences -- users, businesses, lstv admins, and all
    business sub-views
    """

    permission_classes = [AllowAny]

    allowable_sub_objects = ['location', 'weddingTeam', 'tags', 'vibes', 'videoSource', 'photos', 'qAndA', 'shop',
                             'like']

    allowable_admin_options = {
        "_count": ["GET"]
    }

    admin_only = {
        "user_types": [UserTypeEnum.admin]
    }

    business_role_modified = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['modify-business-roles'],
    }

    public_read_business_owner_write = {
        "GET": {},
        "POST": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        },
        "DELETE": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        },
        "PATCH": {
            "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
            "business_user_permissions": ['edit-business-profile'],
        }
    }

    business_team_management = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['manage-team-members'],
        "field_permissions": {
            "business_slug": {
                "user_types": [UserTypeEnum.admin],
            },
        }
    }

    business_profile_editing = {
        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
        "business_user_permissions": ['edit-business-profile'],

    }

    standard_video_permission = {
        'GET': {},
        'POST': {"ownership": True},
        'PATCH': {"ownership": True},
        'DELETE': {"ownership": True},
    }

    anyone_can_create_and_read_owners_can_modify = {
        'GET': {},
        'POST': {},
        'PATCH': {"ownership": True},
        'DELETE': {"ownership": True},
        "actions": {
            "like": {
                "POST": {},
                "DELETE": {}
            },
            "flag": {
                "POST": {}
            }
        }
    }

    permission_scope = {
        "/": standard_video_permission,
        "location": standard_video_permission,
        "weddingTeam": standard_video_permission,
        "vibes": standard_video_permission,
        "tags": standard_video_permission,
        "videoSource": standard_video_permission,
        "photos": standard_video_permission,
        "qAndA": anyone_can_create_and_read_owners_can_modify,
        "shop": standard_video_permission,
        "like": {
            "GET": {},
            "POST": {},
            "DELETE": {}
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
        if not sub_obj or not detail_obj_id:
            return None
        try:
            if sub_obj == 'subscribers':
                return objs.subscribers.all().filter(id=detail_obj_id).first()
            if sub_obj == 'qAndA':
                return objs.q_and_a.all().filter(id=detail_obj_id).first()
        except ValidationError:
            return None

    def authenticate_user_membership(self, business_team_member_permissions_required):
        return False

    def authenticate_user_ownership_of_object(self):
        user = self.request_params.get('user')
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if user and not user.is_anonymous and user.user_type == UserTypeEnum.admin:
            return True

        if sub_obj == 'qAndA' and detail_obj_id:
            message = Message.objects.filter(id=detail_obj_id).first()
            if message:
                return user.user_type == UserTypeEnum.admin or message.from_user == user
            else:
                raise LSTVGenericAPIViewResourceNotFoundException(f"qAndA id {detail_obj_id} not found")

        return False

    def get_target_object(self):
        # specific business?
        if self.id:
            try:
                obj = Video.objects.filter(id=self.id).first()
                return obj
            except Video.DoesNotExist:
                raise LSTVGenericAPIViewResourceNotFoundException(f"video id {self.id} not found")
            except ValidationError:
                try:
                    obj = Video.objects.filter(post__slug=self.id).first()
                    return obj
                except Video.DoesNotExist:
                    raise LSTVGenericAPIViewResourceNotFoundException(f"video slug {self.id} not found")

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
            serializer = VideoSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #    ____
        #   / __ \  ___      /\
        #  | |  | |( _ )    /  \
        #  | |  | |/ _ \/\ / /\ \
        #  | |__| | (_>  </ ____ \
        #   \___\_\\___/\/_/    \_\

        elif sub_obj == 'qAndA':
            if not action:
                if request.user and request.user.is_in_page_messaging_blocked:
                    return response_40x(403, "Posting messages is unavailable to you at this time.")

                request_data = {
                    **request.data,
                    "element_type": "video",
                    "element_id": objs.id
                }

                serializer = InPageMessagingSerializer(data=request_data, request=request)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(201, serializer.create(serializer.validated_data))
            elif action == 'like':
                if not detail_obj:
                    return response_40x(404, f"q_and_a id {detail_obj_id} not found")
                # do we have a like item for this item?
                old_like = Like.objects.filter(element_type=LikableElementType.q_and_a,
                                               element_id=detail_obj_id,
                                               user=self.request.user).first()
                if old_like:
                    return response_40x(400, "A like record already exists for this user and the q_and_a item")
                else:
                    like = Like(element_type=LikableElementType.q_and_a,
                                element_id=detail_obj_id,
                                user=self.request.user)
                    like.save()
                    Message.objects.filter(id=detail_obj_id).update(likes=(F('likes') + 1))
                    return response_20x(200, {})
            elif action == 'flag':
                if request.user and request.user.is_flagging_blocked:
                    return response_40x(403, "Flagging reviews is unavailable to you at this time.")

                if not detail_obj:
                    return response_40x(403, "q&a item not found")

                if 'complaint' in request.data:
                    past_flag = ContentFlag.objects.filter(element_type=ContentFlagElementEnumType.message,
                                                           element_id=detail_obj_id,
                                                           flagged_by=request.user).first()
                    if past_flag:
                        past_flag.complaint = request.data['complaint']
                        past_flag.save()
                        return response_20x(200, {})
                    else:
                        flagged_message = ContentFlag(
                            element_type=ContentFlagElementEnumType.message,
                            element_id=detail_obj_id,
                            complaint=request.data['complaint'],
                            flagged_by=request.user)
                        flagged_message.save()
                        detail_obj.flags.add(flagged_message)
                        return response_20x(201, {})
                else:
                    return response_40x(400, f"expected complaint fields not sent.")

        #   _      _ _
        #  | |    (_) |
        #  | |     _| | _____
        #  | |    | | |/ / _ \
        #  | |____| |   <  __/
        #  |______|_|_|\_\___|

        elif sub_obj == 'like':
            r = {**request.data,
                 "element_type": LikableElementType.video,
                 "element_id": objs.id,
                 "user": request.user.id}

            serializer = ElementLikeSerializer(data=r, context='post', request=request)
            if serializer.is_valid(raise_exception=True):
                if Like.objects.filter(user=request.user,
                                       element_type=LikableElementType.video,
                                       element_id=objs.id):
                    return response_40x(400, {
                        f"Cannot like a video more than once"})
                serializer.create(serializer.validated_data)
                Video.objects.filter(id=objs.id).update(likes=(F('likes') + 1))
                return response_20x(200, {})

        #   _______
        #  |__   __|
        #     | | __ _  __ _ ___
        #     | |/ _` |/ _` / __|
        #     | | (_| | (_| \__ \
        #     |_|\__,_|\__, |___/
        #               __/ |
        #              |___/

        elif sub_obj == 'tags':
            if 'tags' in request.data:
                _tags = []
                for tag in request.data['tags']:
                    try:
                        t = TagType.objects.get(slug=tag)
                        _tags.append(t)
                    except TagType.DoesNotExist:
                        return response_40x(400, f"{tag} is not a valid tag slug")
                objs.vibes.clear()
                for tag in _tags:
                    objs.vibes.add(tag)
                return response_20x(201, {"tags": request.data['tags']})
            else:
                return response_40x(400, "tags field is missing")

            serializer = TagSerializer(data=request.data, request=request)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

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
        detail_obj_id = self.request_params.get('detail_obj_id')
        action = self.request_params.get('action')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if self.verbosity in [ContentVerbosityType.admin_list, ContentVerbosityType.admin_full,
                              ContentVerbosityType.administration]:
            if not user or user.is_anonymous or user.user_type != UserTypeEnum.admin:
                return response_40x(401, f"not authorized")

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:

            if type(self.id) == str and self.id in self.allowable_admin_options.keys() and self.request.method in \
                    self.allowable_admin_options[self.id]:
                return response_200({
                    "active_count": Video.objects.count(),
                    "active_review_count": Video.objects.filter(state=ContentModelState.active_review).count(),
                    "suspended_review_count": Video.objects_all_states.filter(
                        state=ContentModelState.suspended_review).count(),
                    "suspended_count": Video.objects_all_states.filter(
                        state=ContentModelState.suspended).count(),
                    "deleted_count": Video.objects_all_states.filter(
                        state=ContentModelState.deleted).count(),
                })

            if self.id:
                if objs and isinstance(objs, Video):
                    serializer = VideoSerializer(request=request, verbosity=self.verbosity)
                    return response_200(serializer.to_representation(objs))
                else:
                    return response_40x(400, "resource not found")
            elif request.query_params.get('verbosity', None) in [ContentVerbosityType.admin_list.name,
                                                                 ContentVerbosityType.admin_full.name,
                                                                 ContentVerbosityType.administration.name]:

                state = ContentModelState.active
                scope = request.query_params.get('scope', None)
                try:
                    state = ContentModelState[scope or 'active']
                except KeyError:
                    return response_40x(400, "unrecognized scope")

                videos = Video.objects_all_states.annotate(photo_count=Count('photos', distinct=True)).annotate(
                    q_and_a_count=Count('q_and_a', distinct=True)).annotate(
                    tag_aggregate=StringAgg('vibes__name', ordering="-vibes__weight", delimiter='-')).filter(
                    state=state)

                title_filter = request.query_params.get('title', None)
                location_filter = request.query_params.get('location', None)
                type_filter = request.query_params.get('video_type', None)

                if type_filter == 'promo':
                    videos = videos.filter(videos__purpose=VideoPurposeEnum.business_promo_video)

                if type_filter == 'wedding':
                    videos = videos.filter(videos__purpose=VideoPurposeEnum.video_video)

                if title_filter:
                    videos = videos.filter(title__icontains=title_filter)

                if location_filter:
                    videos = videos.filter(Q(location__place__name__icontains=location_filter) |
                                           Q(location__state_province__name__icontains=location_filter) |
                                           Q(location__country__name__icontains=location_filter))

                if self.sort_order == 'asc':
                    videos = videos.order_by(F(self.sort_field).asc(nulls_last=True))
                else:
                    videos = videos.order_by(F(self.sort_field).desc(nulls_last=True))
                out_of = videos.count()

                rc = []
                for video in videos[int(self.offset):int(self.offset) + int(self.size)]:
                    rc.append(VideoSerializer(video, scope=state, verbosity=self.verbosity).data)

                return response_200(rc, scope={'offset': int(self.offset),
                                               'request_size': int(self.size),
                                               'response_size': len(rc),
                                               'total': out_of})

            else:
                # sub-contractor endpoint :-)
                factory = APIRequestFactory()
                query_params = ""
                for key in request.query_params.keys():
                    query_params += f"&{key}={request.query_params[key]}"
                url = f"/v1/contentSearch?content_type=video{query_params}"
                request = factory.get(url)
                response = ContentSearchView.as_view()(request)
                return response

        #   _                     _   _
        #  | |                   | | (_)
        #  | |     ___   ___ __ _| |_ _  ___  _ __
        #  | |    / _ \ / __/ _` | __| |/ _ \| '_ \
        #  | |___| (_) | (_| (_| | |_| | (_) | | | |
        #  |______\___/ \___\__,_|\__|_|\___/|_| |_|

        elif sub_obj == 'location':
            serializer = LocationSerializer()
            return response_200(serializer.to_representation(objs.location))

        #  __          __      _     _ _               _______
        #  \ \        / /     | |   | (_)             |__   __|
        #   \ \  /\  / /__  __| | __| |_ _ __   __ _     | | ___  __ _ _ __ ___
        #    \ \/  \/ / _ \/ _` |/ _` | | '_ \ / _` |    | |/ _ \/ _` | '_ ` _ \
        #     \  /\  /  __/ (_| | (_| | | | | | (_| |    | |  __/ (_| | | | | | |
        #      \/  \/ \___|\__,_|\__,_|_|_| |_|\__, |    |_|\___|\__,_|_| |_| |_|
        #                                       __/ |
        #                                      |___/

        elif sub_obj == 'weddingTeam':
            return response_200(sorted(VideoBusinessSerializer(many=True).to_representation(objs.get_businesses(None)),
                                       key=lambda k: (not k['premium'], -k['weight'])))

        #   _______
        #  |__   __|
        #     | | __ _  __ _ ___
        #     | |/ _` |/ _` / __|
        #     | | (_| | (_| \__ \
        #     |_|\__,_|\__, |___/
        #               __/ |
        #              |___/

        elif sub_obj == 'tags':
            return response_200(TagTypeSerializer(many=True).to_representation(objs.get_all_tags()))

        #         _     _            _____
        #        (_)   | |          / ____|
        #  __   ___  __| | ___  ___| (___   ___  _   _ _ __ ___ ___
        #  \ \ / / |/ _` |/ _ \/ _ \\___ \ / _ \| | | | '__/ __/ _ \
        #   \ V /| | (_| |  __/ (_) |___) | (_) | |_| | | | (_|  __/
        #    \_/ |_|\__,_|\___|\___/_____/ \___/ \__,_|_|  \___\___|

        elif sub_obj == 'videoSource':
            return response_200(VideoSourceSerializer(many=True).to_representation(objs.get_videos()))

        #   _____  _           _
        #  |  __ \| |         | |
        #  | |__) | |__   ___ | |_ ___  ___
        #  |  ___/| '_ \ / _ \| __/ _ \/ __|
        #  | |    | | | | (_) | || (_) \__ \
        #  |_|    |_| |_|\___/ \__\___/|___/

        elif sub_obj == 'photos':
            return response_200(PhotoSerializer(many=True).to_representation(objs.get_photos()))

        #  __      ___ _
        #  \ \    / (_) |
        #   \ \  / / _| |__   ___  ___
        #    \ \/ / | | '_ \ / _ \/ __|
        #     \  /  | | |_) |  __/\__ \
        #      \/   |_|_.__/ \___||___/

        elif sub_obj == 'vibes':
            return response_200(TagTypeSerializer(many=True).to_representation(objs.get_public_vibes()))

        #    ____
        #   / __ \  ___      /\
        #  | |  | |( _ )    /  \
        #  | |  | |/ _ \/\ / /\ \
        #  | |__| | (_>  </ ____ \
        #   \___\_\\___/\/_/    \_\

        elif sub_obj == 'qAndA':
            if not action:
                return response_200(InPageMessagingSerializer(request=self.request).to_representation(objs.q_and_a))
            elif action == 'like':
                if not user:
                    return response_40x(401, f"Unauthorized")

                old_like = Like.objects.filter(element_type=LikableElementType.q_and_a,
                                               element_id=detail_obj_id,
                                               user=self.request.user).first()
                return response_200({"like": old_like is not None})

        #    _____ _                       _
        #   / ____| |                     (_)
        #  | (___ | |__   ___  _ __  _ __  _ _ __   __ _
        #   \___ \| '_ \ / _ \| '_ \| '_ \| | '_ \ / _` |
        #   ____) | | | | (_) | |_) | |_) | | | | | (_| |
        #  |_____/|_| |_|\___/| .__/| .__/|_|_| |_|\__, |
        #                     | |   | |             __/ |
        #                     |_|   |_|            |___/

        elif sub_obj == 'shop':
            return response_200(ShoppingItemSerializer(many=True).to_representation(objs.shopping_items))

        #   _      _ _
        #  | |    (_) |
        #  | |     _| | _____
        #  | |    | | |/ / _ \
        #  | |____| |   <  __/
        #  |______|_|_|\_\___|

        elif sub_obj == 'like':

            if not user:
                return response_40x(401, f"Unauthorized")

            return response_200({"like": Like.objects.filter(
                element_type=LikableElementType.video,
                element_id=objs.id,
                user=request.user).first() is not None})

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
            serializer = VideoSerializer(context_object='video', request=request, data=request.data,
                                         element=objs.videos.first())
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs.videos.first(), serializer.validated_data))

        #  __          __      _     _ _               _______
        #  \ \        / /     | |   | (_)             |__   __|
        #   \ \  /\  / /__  __| | __| |_ _ __   __ _     | | ___  __ _ _ __ ___
        #    \ \/  \/ / _ \/ _` |/ _` | | '_ \ / _` |    | |/ _ \/ _` | '_ ` _ \
        #     \  /\  /  __/ (_| | (_| | | | | | (_| |    | |  __/ (_| | | | | | |
        #      \/  \/ \___|\__,_|\__,_|_|_| |_|\__, |    |_|\___|\__,_|_| |_| |_|
        #                                       __/ |
        #                                      |___/

        elif sub_obj == 'weddingTeam':
            serializer = VideoSerializer(request=request, context_object='video',
                                         data={
                                             "businesses": request.data['array']
                                         }, element=objs.videos.first())
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs.videos.first(), serializer.validated_data))

        #    ____
        #   / __ \  ___      /\
        #  | |  | |( _ )    /  \
        #  | |  | |/ _ \/\ / /\ \
        #  | |__| | (_>  </ ____ \
        #   \___\_\\___/\/_/    \_\

        elif sub_obj == 'qAndA':
            request_data = {
                **request.data,
                "element_type": "video",
                "element_id": objs.id,
                "message_id": detail_obj_id
            }

            serializer = InPageMessagingSerializer(data=request_data, request=request)
            if serializer.is_valid(raise_exception=True):
                if serializer.update(detail_obj, serializer.validated_data):
                    return response_20x(200, {})

        # catchall (should never happen)
        return response_500("patch method did not succeed")

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
            # THIS IS A REQUEST TO DELETE AN ENTIRE BUSINESS FROM EXISTENCE. extremely destructive. Must be secure.
            if objs:
                objs.delete_deep()
            return response_20x(200, {})

        #    ____
        #   / __ \  ___      /\
        #  | |  | |( _ )    /  \
        #  | |  | |/ _ \/\ / /\ \
        #  | |__| | (_>  </ ____ \
        #   \___\_\\___/\/_/    \_\

        elif sub_obj == 'qAndA':
            if not action:
                if detail_obj:
                    detail_obj.delete()
                    # delete children
                    Message.objects.filter(parent_message_id=detail_obj_id).delete()
                return response_20x(200, {})
            elif action == 'like':
                if not detail_obj:
                    return response_40x(404, f"q_and_a id {detail_obj_id} not found")

                # do we have a like item for this item?
                old_like = Like.objects.filter(element_type=LikableElementType.q_and_a,
                                               element_id=detail_obj_id,
                                               user=self.request.user).first()
                if not old_like:
                    return response_40x(400, "no like record for this user and the q_and_a item")
                else:
                    old_like.delete()
                    Message.objects.filter(id=detail_obj_id).update(likes=(F('likes') - 1))
                    return response_20x(200, {})

        #   _      _ _
        #  | |    (_) |
        #  | |     _| | _____
        #  | |    | | |/ / _ \
        #  | |____| |   <  __/
        #  |______|_|_|\_\___|

        elif sub_obj == 'like':
            like = Like.objects.filter(user=user,
                                       element_type=LikableElementType.video,
                                       element_id=objs.id).first()

            if like:
                like.delete()
                Video.objects.filter(id=objs.id).update(likes=(F('likes') - 1))
                return response_20x(200, {})
            else:
                return response_40x(404, "video has no like record for the user")

        # catchall (should never happen)
        return response_500("delete method did not succeed")
