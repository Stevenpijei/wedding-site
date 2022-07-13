from uuid import UUID

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import F, Case, When, Value, CharField
from django.db.models.functions import Lower, Concat
from django.db.models import F
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET, LSTV_API_V1_BAD_REQUEST_NO_SLUG, API_CACHE_TTL_REALTIME
from lstv_api_v1.serializers.business_photo_serializer import BusinessPhotoSerializer
from lstv_api_v1.serializers.business_serializer import BusinessSerializer, BusinessOrganizedEventsSerializer, \
    BusinessAccountClaimSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer, BusinessVideoOrderSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer, BusinessFAQSerializer, \
    BusinessPublicTeamFAQSerializer
from lstv_api_v1.serializers.serializers_messaging import ContactBusinessSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.video_serializer import VideoSerializer
from lstv_api_v1.serializers.video_source_serializer import VideoSourceSerializer, BusinessVideoSerializer
from lstv_api_v1.tasks.user_action_handlers import on_business_updated
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView, LSTVGenericAPIViewException, \
    LSTVGenericAPIViewUnauthorizedException, LSTVGenericAPIViewResourceNotFoundException

#  ____   __ __   _____ ____  ____     ___   _____  _____     __ __  ____    ___  __    __
# |    \ |  T  T / ___/l    j|    \   /  _] / ___/ / ___/    |  T  |l    j  /  _]|  T__T  T
# |  o  )|  |  |(   \_  |  T |  _  Y /  [_ (   \_ (   \_     |  |  | |  T  /  [_ |  |  |  |
# |     T|  |  | \__  T |  | |  |  |Y    _] \__  T \__  T    |  |  | |  | Y    _]|  |  |  |
# |  O  ||  :  | /  \ | |  | |  |  ||   [_  /  \ | /  \ |    l  :  ! |  | |   [_ l  `  '  !
# |     |l     | \    | j  l |  |  ||     T \    | \    |     \   /  j  l |     T \      /
# l_____j \__,_j  \___j|____jl__j__jl_____j  \___j  \___j      \_/  |____jl_____j  \_/\_/
from lstv_be.settings import WEB_SERVER_URL
from lstv_be.utils import build_login_user_payload


class BusinessView(LSTVBaseAPIView):
    """
    Business view class, handling all business objects for all audiences -- users, businesses, lstv admins, and all
    business sub-views
    """

    query_total = 0

    permission_classes = [AllowAny]

    allowable_sub_objects = ['roles', 'faq', 'cohorts', 'reviews', 'subscribers', 'venueTypes',
                             'profileImage', 'teamMembers', 'publicTeam', 'publicTeamFaq', 'phones', 'soldAt',
                             'associateBrands', 'coverageLocations', 'businessLocations', 'socialLinks', 'tags',
                             'properties', 'verifySubscription', 'contact', 'organizedEvents', 'videos', 'photos',
                             'shopping', 'accountClaim', 'videoOrder']

    allowable_admin_options = {
        "_count": ["GET"]
    }

    allowable_scopes = ['active', 'active_review', 'suspended_review', 'deleted', 'vendor_suggested']

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

    permission_scope = {
        "/": {
            'GET': {
                # "field_permissions": {
                # 	"offset": {
                # 		"user_types": [UserTypeEnum.admin],
                # 	}
                # }
            },
            'POST': {
                "user_types": [UserTypeEnum.admin]
            },
            'PATCH': {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                "business_user_permissions": ['edit-business-profile'],
                "field_permissions": {
                    "business_name": {
                        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                        "business_user_permissions": ["rename-the-business"]
                    },
                    "subscription_level": {
                        "user_types": [UserTypeEnum.admin],
                    }
                }
            },
            'DELETE': {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                "business_user_permissions": ['close-business-account']
            }
        },
        "roles": {
            "GET": {},
            "POST": business_role_modified,
            "DELETE": business_role_modified,
            "PATCH": business_role_modified,
        },

        "subscribers": {
            "GET": {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                "business_user_permissions": ['manage-subscribers'],
            },
            "POST": {
                "field_permissions": {
                    "user_id": {
                        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                        "business_user_permissions": ["manage-subscribers"]
                    }
                }
            },
            "DELETE": {
                "field_permissions": {
                    "detailobj": {
                        "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member],
                        "business_user_permissions": ["manage-subscribers"]
                    },
                }
            },
        },
        "reviews": {
            "GET": {},
            "POST": {},
            "DELETE": {
                "ownership": True,
            },
            "PATCH": {
                "ownership": True
            },
            "actions": {
                "like": {
                    "GET": {
                        "user_types": [UserTypeEnum.admin],
                    },
                    "POST": {},
                    "DELETE": {}
                },
                "flag": {
                    "POST": {}
                }
            }
        },
        "faq": public_read_business_owner_write,
        "businessLocations": public_read_business_owner_write,
        "coverageLocations": public_read_business_owner_write,
        "teamMembers": {
            "GET": business_team_management,
            "POST": business_team_management,
            "PATCH": business_team_management,
            "DELETE": business_team_management,
        },
        "publicTeam": {
            "GET": {},
            "POST": business_team_management,
            "DELETE": business_team_management,
            "PATCH": business_team_management,
        },
        "publicTeamFaq": {
            "GET": {},
            "POST": business_team_management,
            "DELETE": business_team_management,
            "PATCH": business_team_management,
        },
        "phones": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "socialLinks": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "venueTypes": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "associateBrands": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "soldAt": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "photos": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "shopping": {
            "GET": {},
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "videos": {
            "GET": business_profile_editing,
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
        },
        "tags": {
            "GET": {},
            "POST": admin_only,
            "DELETE": admin_only,
            "PATCH": admin_only,
        },
        "organizedEvents": {
            "GET": {},
            "POST": admin_only,
            "DELETE": admin_only,
            "PATCH": admin_only,
        },
        "verifySubscription": {
            "GET": {
                "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member, UserTypeEnum.consumer]
            }
        },
        "contact": {
            "POST": {},
            # "POST": {
            #     "user_types": [UserTypeEnum.admin, UserTypeEnum.business_team_member, UserTypeEnum.consumer]
            # }
        },
        "accountClaim": {
            "GET": {},
            "POST": {}
        },
        "videoOrder": {
            "GET": business_profile_editing,
            "POST": business_profile_editing,
            "DELETE": business_profile_editing,
            "PATCH": business_profile_editing,
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
            if sub_obj == 'roles':
                return BusinessRoleType.objects.filter(slug=detail_obj_id).first()
            if sub_obj == 'reviews':
                return objs.reviews.all().filter(id=detail_obj_id).first()
            if sub_obj == 'faq':
                return objs.faq.all().filter(id=detail_obj_id).first()
            if sub_obj == 'businessLocations':
                return objs.business_locations.all().filter(id=detail_obj_id).first()
            if sub_obj == 'coverageLocations':
                return objs.coverage_locations.all().filter(id=detail_obj_id).first()
            if sub_obj == 'teamMembers':
                return objs.team_members.all().filter(user_id=detail_obj_id).first()
            if sub_obj == 'publicTeam':
                return objs.public_team.all().filter(id=detail_obj_id).first()
            if sub_obj == 'publicTeamFaq':
                return objs.public_team_faq.all().filter(id=detail_obj_id).first()
            if sub_obj == 'phones':
                return objs.business_phones.all().filter(id=detail_obj_id).first()
            if sub_obj == 'photos':
                return objs.business_photos.all().filter(id=detail_obj_id).first()
            if sub_obj == 'socialLinks':
                return objs.social_links.all().filter(id=detail_obj_id).first()
            if sub_obj == 'venueTypes':
                return objs.venue_types.all().filter(slug=detail_obj_id).first()
            if sub_obj == 'associateBrands':
                return objs.associate_brands.all().filter(id=detail_obj_id).first()
            if sub_obj == 'soldAt':
                return objs.sold_at_businesses.all().filter(slug=detail_obj_id).first()
            if sub_obj == 'tags':
                return objs.tags.all().filter(slug=detail_obj_id).first()
            if sub_obj == 'organizedEvents':
                return objs.organized_events.all().filter(id=detail_obj_id).first()
            if sub_obj == 'videos':
                return VideoSource.objects.filter(owner_business=objs, id=detail_obj_id).first()

            return None
        except ValidationError:
            return None

    def authenticate_user_membership(self, business_team_member_permissions_required):
        objs = self.get_target_object()
        user = self.request_params.get('user')
        if user.user_type == UserTypeEnum.admin:
            return True
        mm = BusinessTeamMember.objects.filter(business=objs, user=user).first()
        if mm:
            if not business_team_member_permissions_required:
                return True
            else:
                return any(key in business_team_member_permissions_required for key in mm.get_permissions())
        else:
            return False

    def authenticate_user_ownership_of_object(self):
        user = self.request_params.get('user')
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        objs = self.get_target_object()
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)

        if sub_obj == 'reviews' and detail_obj:
            return user.user_type == UserTypeEnum.admin or detail_obj.review.from_user == user

        return False

    def get_target_object(self):
        if not self.offset and not self.size and self.request_params.get('id'):
            # administrative options
            if self.request_params.get('id') in self.allowable_admin_options.keys():
                if self.request.method in self.allowable_admin_options.get(self.request_params.get('id'), None):
                    return self.request_params.get('id')
        if self.offset and self.size and not self.request_params.get('sub_obj'):
            state = ContentModelState.active
            if self.scope:
                try:
                    state = ContentModelState[self.scope or 'active']
                except KeyError:
                    return None

            if state == ContentModelState['active']:
                state = [ContentModelState['active'], ContentModelState['active_review']]
            else:
                state = [state]

            if 'search_term' in self.request.query_params:
                objs = Business.objects_all_states.filter(state__in=state,
                                                          name__unaccent__icontains=self.request.query_params[
                                                              'search_term'])
            else:
                objs = Business.objects_all_states.filter(state__in=state).all()

            if 'roles' in self.request.query_params and len(self.request.query_params.get('roles')) > 0:
                roles = self.request.query_params['roles'].split(",")
                objs = objs.filter(roles__slug__in=roles)

            if 'paid' in self.request.query_params:
                objs = objs.filter(subscription_level__numerical_value__gte=1)

            if self.verbosity in [ContentVerbosityType.admin_list, ContentVerbosityType.admin_full,
                                  ContentVerbosityType.administration]:
                if self.sort_order == 'asc':
                    objs = objs.annotate(claim_status=Concat('account_claimed_at', Value('-'), 'account_claim_code',
                                                             output_field=CharField()), ).order_by(
                        F(self.sort_field).asc(nulls_last=True))
                else:
                    objs = objs.annotate(claim_status=Concat('account_claimed_at', Value('-'), 'account_claim_code',
                                                             output_field=CharField()), ).order_by(
                        F(self.sort_field).desc(nulls_last=True))
            else:
                objs = objs.order_by('-subscription_level__numerical_value', '-weight_videos')

            self.query_total = objs.count()

            objs = objs[int(self.offset):int(self.offset) + int(self.size)]

            return objs
        # specific business?
        if self.id:
            try:
                obj = Business.objects.filter(id=self.id).first()
                return obj
            except Business.DoesNotExist:
                raise LSTVGenericAPIViewResourceNotFoundException(f"business id {self.id} not found")
            except ValidationError:
                try:
                    obj = Business.objects.filter(slug=self.id).first()
                    return obj
                except Business.DoesNotExist:
                    raise LSTVGenericAPIViewResourceNotFoundException(f"business slug {self.id} not found")

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
        if not user and sub_obj not in ['contact', 'accountClaim']:
            return response_40x(401, f"Unauthorized")

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            serializer = BusinessSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __              __
        #      _/_/  _________  / /__  _____
        #    _/_/   / ___/ __ \/ / _ \/ ___/
        #  _/_/    / /  / /_/ / /  __(__  )
        # /_/     /_/   \____/_/\___/____/

        elif sub_obj == 'roles':
            serializer = BusinessRoleTypeSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __              __                   _ __                       _____    _
        #      _/_/  _______  __/ /_  _______________(_) /_  ___  __________   _/_/   |  | |
        #    _/_/   / ___/ / / / __ \/ ___/ ___/ ___/ / __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/    (__  ) /_/ / /_/ (__  ) /__/ /  / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/     /____/\__,_/_.___/____/\___/_/  /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                   |_|      /_/

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

        #        __                  _
        #      _/_/  ________ _   __(_)__ _      _______
        #    _/_/   / ___/ _ \ | / / / _ \ | /| / / ___/
        #  _/_/    / /  /  __/ |/ / /  __/ |/ |/ (__  )
        # /_/     /_/   \___/|___/_/\___/|__/|__/____/

        elif sub_obj == 'reviews':
            serializer = ReviewsSerializer(data=request.data, request=request, element=objs, sub_element=detail_obj,
                                           action=action)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __   ____
        #      _/_/  / __/___ _____ _
        #    _/_/   / /_/ __ `/ __ `/
        #  _/_/    / __/ /_/ / /_/ /
        # /_/     /_/  \__,_/\__, /
        #                      /_/

        elif sub_obj == 'faq':
            serializer = BusinessFAQSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #       __              _     _ _   _______                   ______
        #      / /             | |   | (_) |__   __|                 |  ____|
        #     / /   _ __  _   _| |__ | |_  ___| | ___  __ _ _ __ ___ | |__ __ _  __ _
        #    / /   | '_ \| | | | '_ \| | |/ __| |/ _ \/ _` | '_ ` _ \|  __/ _` |/ _` |
        #   / /    | |_) | |_| | |_) | | | (__| |  __/ (_| | | | | | | | | (_| | (_| |
        #  /_/     | .__/ \__,_|_.__/|_|_|\___|_|\___|\__,_|_| |_| |_|_|  \__,_|\__, |
        #          | |                                                             | |
        #          |_|                                                             |_|

        elif sub_obj == 'publicTeamFaq':
            serializer = BusinessPublicTeamFAQSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __   __               _                      __                     __  _
        #      _/_/  / /_  __  _______(_)___  ___  __________/ /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / __ \/ / / / ___/ / __ \/ _ \/ ___/ ___/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /_/ / /_/ (__  ) / / / /  __(__  |__  ) /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/    _/_.___/\__,_/____/_/_/ /_/\___/____/____/_____/\____/\___/\__,_/\__/_/\____/_/ /_/

        elif sub_obj == 'businessLocations':
            serializer = BusinessLocationAndCoverageSerializer(data=request.data, request=request, element=objs,
                                                               request_context='location')
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __                                              __                     __  _
        #      _/_/  _________ _   _____  _________ _____ ____  / /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / ___/ __ \ | / / _ \/ ___/ __ `/ __ `/ _ \/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /__/ /_/ / |/ /  __/ /  / /_/ / /_/ /  __/ /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/      \___/\____/|___/\___/_/   \__,_/\__, /\___/_____/\____/\___/\__,_/\__/_/\____/_/ /_/
        #                                         /____/

        elif sub_obj == 'coverageLocations':
            serializer = BusinessLocationAndCoverageSerializer(data=request.data, request=request, element=objs,
                                                               request_context='coverage')
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __   ______                     __  ___               __                       _____    _
        #      _/_/  /_  __/__  ____ _____ ___  /  |/  /__  ____ ___  / /_  ___  __________   _/_/   |  | |
        #    _/_/     / / / _ \/ __ `/ __ `__ \/ /|_/ / _ \/ __ `__ \/ __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/      / / /  __/ /_/ / / / / / / /  / /  __/ / / / / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/       /_/  \___/\__,_/_/ /_/ /_/_/  /_/\___/_/ /_/ /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                                  |_|      /_/

        elif sub_obj == 'teamMembers':
            serializer = BusinessTeamMembersSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __               __    ___     ______
        #      _/_/  ____  __  __/ /_  / (_)___/_  __/__  ____ _____ ___
        #    _/_/   / __ \/ / / / __ \/ / / ___// / / _ \/ __ `/ __ `__ \
        #  _/_/    / /_/ / /_/ / /_/ / / / /__ / / /  __/ /_/ / / / / / /
        # /_/     / .___/\__,_/_.___/_/_/\___//_/  \___/\__,_/_/ /_/ /_/
        #        /_/

        elif sub_obj == 'publicTeam':
            serializer = BusinessPublicTeamSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __         __
        #      _/_/  ____  / /_  ____  ____  ___  _____
        #    _/_/   / __ \/ __ \/ __ \/ __ \/ _ \/ ___/
        #  _/_/    / /_/ / / / / /_/ / / / /  __(__  )
        # /_/     / .___/_/ /_/\____/_/ /_/\___/____/
        #        /_/

        elif sub_obj == 'phones':
            serializer = BusinessPhoneSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __                   _       ____    _       __
        #      _/_/  _________  _____(_)___ _/ / /   (_)___  / /_______
        #    _/_/   / ___/ __ \/ ___/ / __ `/ / /   / / __ \/ //_/ ___/
        #  _/_/    (__  ) /_/ / /__/ / /_/ / / /___/ / / / / ,< (__  )
        # /_/     /____/\____/\___/_/\__,_/_/_____/_/_/ /_/_/|_/____/

        elif sub_obj == 'socialLinks':
            serializer = BusinessSocialLinksSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __                             ______
        #      _/_/  _   _____  ____  __  _____/_  __/_  ______  ___  _____
        #    _/_/   | | / / _ \/ __ \/ / / / _ \/ / / / / / __ \/ _ \/ ___/
        #  _/_/     | |/ /  __/ / / / /_/ /  __/ / / /_/ / /_/ /  __(__  )
        # /_/       |___/\___/_/ /_/\__,_/\___/_/  \__, / .___/\___/____/
        #                                         /____/_/

        elif sub_obj == 'venueTypes':
            serializer = BusinessVenueTypesSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __                              _       __           ______                       __
        #      _/_/  ____ _______________  _____(_)___ _/ /____  ____/ / __ )_________ _____  ____/ /____
        #    _/_/   / __ `/ ___/ ___/ __ \/ ___/ / __ `/ __/ _ \/ __  / __  / ___/ __ `/ __ \/ __  / ___/
        #  _/_/    / /_/ (__  |__  ) /_/ / /__/ / /_/ / /_/  __/ /_/ / /_/ / /  / /_/ / / / / /_/ (__  )
        # /_/      \__,_/____/____/\____/\___/_/\__,_/\__/\___/\__,_/_____/_/   \__,_/_/ /_/\__,_/____/

        elif sub_obj == 'associateBrands':
            serializer = BusinessAssociateBrandsSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __              __    _____   __
        #      _/_/  _________  / /___/ /   | / /_
        #    _/_/   / ___/ __ \/ / __  / /| |/ __/
        #  _/_/    (__  ) /_/ / / /_/ / ___ / /_
        # /_/     /____/\____/_/\__,_/_/  |_\__/

        elif sub_obj == 'soldAt':
            serializer = BusinessSoldAtSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #        __   __
        #      _/_/  / /_____ _____ ______
        #    _/_/   / __/ __ `/ __ `/ ___/
        #  _/_/    / /_/ /_/ / /_/ (__  )
        # /_/      \__/\__,_/\__, /____/

        elif sub_obj == 'tags':
            serializer = TagSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #                     __             __
        #   _________  ____  / /_____ ______/ /_
        #  / ___/ __ \/ __ \/ __/ __ `/ ___/ __/
        # / /__/ /_/ / / / / /_/ /_/ / /__/ /_
        # \___/\____/_/ /_/\__/\__,_/\___/\__/
        #

        elif sub_obj == 'contact':
            serializer = ContactBusinessSerializer(data=request.data, request=request)
            if serializer.is_valid(raise_exception=True):
                success = serializer.create(serializer.validated_data)
                if success:
                    return response_20x(200, {})
                else:
                    return response_40x(400, "issues creating message")

        #                               _             _ ______               _
        #                              (_)           | |  ____|             | |
        #    ___  _ __ __ _  __ _ _ __  _ _______  __| | |____   _____ _ __ | |_ ___
        #   / _ \| '__/ _` |/ _` | '_ \| |_  / _ \/ _` |  __\ \ / / _ \ '_ \| __/ __|
        #  | (_) | | | (_| | (_| | | | | |/ /  __/ (_| | |___\ V /  __/ | | | |_\__ \
        #   \___/|_|  \__, |\__,_|_| |_|_/___\___|\__,_|______\_/ \___|_| |_|\__|___/
        #              __/ |
        #             |___/

        elif sub_obj == 'organizedEvents':
            serializer = BusinessOrganizedEventsSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #         _     __
        #  _   __(_)___/ /__  ____  _____
        # | | / / / __  / _ \/ __ \/ ___/
        # | |/ / / /_/ /  __/ /_/ (__  )
        # |___/_/\__,_/\___/\____/____/

        elif sub_obj == 'videos':
            serializer = VideoSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        #                                   _    _____ _       _
        #                                  | |  / ____| |     (_)
        #    __ _  ___ ___ ___  _   _ _ __ | |_| |    | | __ _ _ _ __ ___
        #   / _` |/ __/ __/ _ \| | | | '_ \| __| |    | |/ _` | | '_ ` _ \
        #  | (_| | (_| (_| (_) | |_| | | | | |_| |____| | (_| | | | | | | |
        #   \__,_|\___\___\___/ \__,_|_| |_|\__|\_____|_|\__,_|_|_| |_| |_|

        elif sub_obj == 'accountClaim':
            if detail_obj_id == 'accept':
                serializer = BusinessAccountClaimSerializer(data=request.data, request=request, element=objs)
                if serializer.is_valid(raise_exception=True):
                    user, token = serializer.create(serializer.validated_data)
                    if user and token:
                        return response_20x(
                            200, build_login_user_payload(user), token=token, user=user)
                    else:
                        return response_40x(400, "something's up with account claim")
            else:
                if user and user.user_type == UserTypeEnum.admin:
                    if objs.account_claimed_at is None:
                        if not objs.account_claim_code:
                            objs.account_claim_code = uuid.uuid4()
                            objs.account_claim_code_created_at = datetime.now().replace(tzinfo=timezone.utc)
                            objs.save()

                        if objs.account_claim_code:
                            return response_200({
                                "business_id": objs.id,
                                "business_slug": objs.slug,
                                "account_claim_url_created_at": objs.account_claim_code_created_at,
                                "account_claim_url": f"{WEB_SERVER_URL}/account-claim?code={objs.account_claim_code}"
                            }, ttl=0)
                    else:
                        return response_40x(400, "Account already claimed")
                else:
                    return response_40x(403, "Prohibited")

        #  __      ___     _               ____          _
        #  \ \    / (_)   | |             / __ \        | |
        #   \ \  / / _  __| | ___  ___   | |  | |_ __ __| | ___ _ __
        #    \ \/ / | |/ _` |/ _ \/ _ \  | |  | | '__/ _` |/ _ \ '__|
        #     \  /  | | (_| |  __/ (_) | | |__| | | | (_| |  __/ |
        #      \/   |_|\__,_|\___|\___/   \____/|_|  \__,_|\___|_|

        elif sub_obj == 'videoOrder':
            serializer = BusinessVideoOrderSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        elif sub_obj == 'photos':
            serializer = BusinessPhotoSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(201, serializer.create(serializer.validated_data))

        # --------------------------------------------------------------------------------------------------

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

        if sub_obj and not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            serializer = BusinessSerializer(request=request, verbosity=self.verbosity, scope=self.scope)
            if isinstance(objs, Business):
                return response_200(serializer.to_representation(objs))
            else:
                if type(objs) == str and objs == '_count':
                    return response_200({
                        "active_count": Business.objects.count(),
                        "active_review_count": Business.objects.filter(state=ContentModelState.active_review).count(),
                        "suspended_review_count": Business.objects_all_states.filter(
                            state=ContentModelState.suspended_review).count(),
                        "suspended_count": Business.objects_all_states.filter(
                            state=ContentModelState.suspended).count(),
                        "deleted_count": Business.objects_all_states.filter(
                            state=ContentModelState.deleted).count(),
                        "vendor_suggested": Business.objects_all_states.filter(
                            state=ContentModelState.suspended_dmz).count()
                    })
                if objs:
                    for obj in objs:
                        rc.append(serializer.to_representation(obj))
                else:
                    return response_40x(400, "resource not found")

                state = ContentModelState.active
                if self.scope:
                    try:
                        state = ContentModelState[self.scope or 'active']
                    except KeyError:
                        pass

                if 'search_term' in request.query_params:
                    num = Business.objects_all_states.filter(state=state,
                                                             name__icontains=request.query_params[
                                                                 'search_term']).order_by(
                        self.order_by_field).count()
                else:
                    num = Business.objects_all_states.filter(state=state).count()

                return response_200(rc,
                                    scope={
                                        "offset": int(self.offset),
                                        "request_size": int(self.size),
                                        "response_size": len(objs),
                                        "total": num
                                    }
                                    )

        #        __              __
        #      _/_/  _________  / /__  _____
        #    _/_/   / ___/ __ \/ / _ \/ ___/
        #  _/_/    / /  / /_/ / /  __(__  )
        # /_/     /_/   \____/_/\___/____/

        elif sub_obj == 'roles':
            return response_200(BusinessRoleTypeSerializer(many=True).to_representation(objs.roles.all()))

        #        __              __                   _ __                       _____    _
        #      _/_/  _______  __/ /_  _______________(_) /_  ___  __________   _/_/   |  | |
        #    _/_/   / ___/ / / / __ \/ ___/ ___/ ___/ / __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/    (__  ) /_/ / /_/ (__  ) /__/ /  / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/     /____/\__,_/_.___/____/\___/_/  /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                   |_|      /_/

        elif sub_obj == 'subscribers':
            return response_200(BusinessSubscribersSerializer().to_representation(list(objs.subscribers.all())))

        elif sub_obj == 'verifySubscription':
            if request.user:
                if objs.subscribers.filter(id=request.user.id):
                    return response_200({"subscribed": True}, ttl=API_CACHE_TTL_REALTIME)
                else:
                    return response_200({"subscribed": False}, ttl=API_CACHE_TTL_REALTIME)
            else:
                return response_40x(401, f"Unauthorized")

        #        __                  _
        #      _/_/  ________ _   __(_)__ _      _______
        #    _/_/   / ___/ _ \ | / / / _ \ | /| / / ___/
        #  _/_/    / /  /  __/ |/ / /  __/ |/ |/ (__  )
        # /_/     /_/   \___/|___/_/\___/|__/|__/____/

        elif sub_obj == 'reviews':
            if not action:
                return response_200(ReviewsSerializer().to_representation(list(objs.reviews.all())))
            else:
                if not detail_obj:
                    return response_40x(400, "review object not found")
                like = Like.objects.filter(user=user, element_type=LikableElementType.review,
                                           element_id=detail_obj.id).first()

                return response_200({"like": like is not None})

        #        __   ____
        #      _/_/  / __/___ _____ _
        #    _/_/   / /_/ __ `/ __ `/
        #  _/_/    / __/ /_/ / /_/ /
        # /_/     /_/  \__,_/\__, /
        #                      /_/

        elif sub_obj == 'faq':
            return response_200(BusinessFAQSerializer(
                request=request,
                request_context=MessageContextTypeEnum.business_faq).to_representation(objs.faq))

        #       __              _     _ _   _______                   ______
        #      / /             | |   | (_) |__   __|                 |  ____|
        #     / /   _ __  _   _| |__ | |_  ___| | ___  __ _ _ __ ___ | |__ __ _  __ _
        #    / /   | '_ \| | | | '_ \| | |/ __| |/ _ \/ _` | '_ ` _ \|  __/ _` |/ _` |
        #   / /    | |_) | |_| | |_) | | | (__| |  __/ (_| | | | | | | | | (_| | (_| |
        #  /_/     | .__/ \__,_|_.__/|_|_|\___|_|\___|\__,_|_| |_| |_|_|  \__,_|\__, |
        #          | |                                                             | |
        #          |_|                                                             |_|

        elif sub_obj == 'publicTeamFaq':
            return response_200(BusinessPublicTeamFAQSerializer(
                request=request,
                request_context=MessageContextTypeEnum.business_team_faq).to_representation(objs.public_team_faq))

        #        __   __               _                      __                     __  _
        #      _/_/  / /_  __  _______(_)___  ___  __________/ /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / __ \/ / / / ___/ / __ \/ _ \/ ___/ ___/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /_/ / /_/ (__  ) / / / /  __(__  |__  ) /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/    _/_.___/\__,_/____/_/_/ /_/\___/____/____/_____/\____/\___/\__,_/\__/_/\____/_/ /_/

        elif sub_obj == 'businessLocations':
            return response_200(BusinessLocationAndCoverageSerializer(
                many=True, request_context='location').to_representation(
                BusinessLocation.objects.filter(business=objs)))

        #        __                                              __                     __  _
        #      _/_/  _________ _   _____  _________ _____ ____  / /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / ___/ __ \ | / / _ \/ ___/ __ `/ __ `/ _ \/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /__/ /_/ / |/ /  __/ /  / /_/ / /_/ /  __/ /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/      \___/\____/|___/\___/_/   \__,_/\__, /\___/_____/\____/\___/\__,_/\__/_/\____/_/ /_/
        #                                         /____/

        elif sub_obj == 'coverageLocations':
            return response_200(BusinessLocationAndCoverageSerializer(
                many=True, request_context='coverage').to_representation(
                objs.coverage_locations.all()))

        #        __   ______                     __  ___               __                       _____    _
        #      _/_/  /_  __/__  ____ _____ ___  /  |/  /__  ____ ___  / /_  ___  __________   _/_/   |  | |
        #    _/_/     / / / _ \/ __ `/ __ `__ \/ /|_/ / _ \/ __ `__ \/ __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/      / / /  __/ /_/ / / / / / / /  / /  __/ / / / / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/       /_/  \___/\__,_/_/ /_/ /_/_/  /_/\___/_/ /_/ /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                                  |_|      /_/
        elif sub_obj == 'teamMembers':
            return response_200(BusinessTeamMembersSerializer(many=True).to_representation(objs.team_members.all()))

        #        __               __    ___     ______
        #      _/_/  ____  __  __/ /_  / (_)___/_  __/__  ____ _____ ___
        #    _/_/   / __ \/ / / / __ \/ / / ___// / / _ \/ __ `/ __ `__ \
        #  _/_/    / /_/ / /_/ / /_/ / / / /__ / / /  __/ /_/ / / / / / /
        # /_/     / .___/\__,_/_.___/_/_/\___//_/  \___/\__,_/_/ /_/ /_/
        #        /_/

        elif sub_obj == 'publicTeam':
            return response_200(BusinessPublicTeamSerializer(many=True).to_representation(objs.public_team.all()))

        #        __         __
        #      _/_/  ____  / /_  ____  ____  ___  _____
        #    _/_/   / __ \/ __ \/ __ \/ __ \/ _ \/ ___/
        #  _/_/    / /_/ / / / / /_/ / / / /  __(__  )
        # /_/     / .___/_/ /_/\____/_/ /_/\___/____/
        #        /_/

        elif sub_obj == 'phones':
            return response_200(BusinessPhoneSerializer(many=True).to_representation(objs.business_phones.all()))
        #        __                   _       ____    _       __
        #      _/_/  _________  _____(_)___ _/ / /   (_)___  / /_______
        #    _/_/   / ___/ __ \/ ___/ / __ `/ / /   / / __ \/ //_/ ___/
        #  _/_/    (__  ) /_/ / /__/ / /_/ / / /___/ / / / / ,< (__  )
        # /_/     /____/\____/\___/_/\__,_/_/_____/_/_/ /_/_/|_/____/

        elif sub_obj == 'socialLinks':
            return response_200(BusinessSocialLinksSerializer(many=True).to_representation(objs.social_links.all()))

        #        __                             ______
        #      _/_/  _   _____  ____  __  _____/_  __/_  ______  ___  _____
        #    _/_/   | | / / _ \/ __ \/ / / / _ \/ / / / / / __ \/ _ \/ ___/
        #  _/_/     | |/ /  __/ / / / /_/ /  __/ / / /_/ / /_/ /  __(__  )
        # /_/       |___/\___/_/ /_/\__,_/\___/_/  \__, / .___/\___/____/
        #                                         /____/_/

        elif sub_obj == 'venueTypes':
            return response_200(BusinessVenueTypesSerializer(many=True).to_representation(objs.venue_types.all()))

        #        __                              _       __           ______                       __
        #      _/_/  ____ _______________  _____(_)___ _/ /____  ____/ / __ )_________ _____  ____/ /____
        #    _/_/   / __ `/ ___/ ___/ __ \/ ___/ / __ `/ __/ _ \/ __  / __  / ___/ __ `/ __ \/ __  / ___/
        #  _/_/    / /_/ (__  |__  ) /_/ / /__/ / /_/ / /_/  __/ /_/ / /_/ / /  / /_/ / / / / /_/ (__  )
        # /_/      \__,_/____/____/\____/\___/_/\__,_/\__/\___/\__,_/_____/_/   \__,_/_/ /_/\__,_/____/

        elif sub_obj == 'associateBrands':
            return response_200(BusinessAssociateBrandsSerializer(many=True).to_representation(
                objs.associate_brands.all()))

        #        __              __    _____   __
        #      _/_/  _________  / /___/ /   | / /_
        #    _/_/   / ___/ __ \/ / __  / /| |/ __/
        #  _/_/    (__  ) /_/ / / /_/ / ___ / /_
        # /_/     /____/\____/_/\__,_/_/  |_\__/

        elif sub_obj == 'soldAt':
            return response_200(BusinessSoldAtSerializer(many=True).to_representation(
                objs.sold_at_businesses.all()))
        #        __   __
        #      _/_/  / /_____ _____ ______
        #    _/_/   / __/ __ `/ __ `/ ___/
        #  _/_/    / /_/ /_/ / /_/ (__  )
        # /_/      \__/\__,_/\__, /____/
        #                   /____/

        elif sub_obj == 'tags':
            return response_200(TagSerializer(many=True).to_representation(
                objs.tags.all()))

        #                               _             _ ______               _
        #                              (_)           | |  ____|             | |
        #    ___  _ __ __ _  __ _ _ __  _ _______  __| | |____   _____ _ __ | |_ ___
        #   / _ \| '__/ _` |/ _` | '_ \| |_  / _ \/ _` |  __\ \ / / _ \ '_ \| __/ __|
        #  | (_) | | | (_| | (_| | | | | |/ /  __/ (_| | |___\ V /  __/ | | | |_\__ \
        #   \___/|_|  \__, |\__,_|_| |_|_/___\___|\__,_|______\_/ \___|_| |_|\__|___/
        #              __/ |
        #             |___/

        elif sub_obj == 'organizedEvents':
            return response_200(BusinessOrganizedEventsSerializer(many=True).to_representation(
                objs.organized_events.all()))

        #            __          __
        #     ____  / /_  ____  / /_____  _____
        #    / __ \/ __ \/ __ \/ __/ __ \/ ___/
        #   / /_/ / / / / /_/ / /_/ /_/ (__  )
        #  / .___/_/ /_/\____/\__/\____/____/
        # /_/

        elif sub_obj == 'photos':
            return response_200(BusinessPhotoSerializer(many=True).to_representation(
                list(BusinessPhoto.objects.filter(business=objs))))

        #         _     __
        #  _   __(_)___/ /__  ____  _____
        # | | / / / __  / _ \/ __ \/ ___/
        # | |/ / / /_/ /  __/ /_/ (__  )
        # |___/_/\__,_/\___/\____/____/

        elif sub_obj == 'videos':
            video_sources = VideoSource.objects.filter(owner_business=objs).all().order_by('-created_at')

            type_filter = request.query_params.get('video_type', None)

            if type_filter == 'promo':
                video_sources = video_sources.filter(purpose=VideoPurposeEnum.business_promo_video)

            if type_filter == 'wedding':
                video_sources = video_sources.filter(purpose=VideoPurposeEnum.video_video)

            total = video_sources.count()
            wedding_total = VideoSource.objects.filter(owner_business=objs,
                                                       purpose=VideoPurposeEnum.video_video).count()
            promo_total = VideoSource.objects.filter(owner_business=objs,
                                                     purpose=VideoPurposeEnum.business_promo_video).count()
            serializer = BusinessVideoSerializer(verbosity=self.verbosity)
            rc = []
            if not detail_obj and not detail_obj_id:
                for video_source in video_sources[int(self.offset):int(self.offset) + int(self.size)]:
                    rc.append(serializer.to_representation(video_source))
                return response_200(rc, scope={"offset": int(self.offset),
                                               "total": total,
                                               "wedding_total": wedding_total,
                                               "promo_total": promo_total,
                                               "request_size": int(self.size),
                                               "response_size": len(rc)})
            elif detail_obj_id and not detail_obj:
                return response_40x(404, f"resource not found")
            elif detail_obj:
                return response_200(serializer.to_representation(detail_obj))

        #          __                      _
        #    _____/ /_  ____  ____  ____  (_)___  ____ _
        #   / ___/ __ \/ __ \/ __ \/ __ \/ / __ \/ __ `/
        #  (__  ) / / / /_/ / /_/ / /_/ / / / / / /_/ /
        # /____/_/ /_/\____/ .___/ .___/_/_/ /_/\__, /
        #                 /_/   /_/            /____/

        elif sub_obj == 'shopping':
            return response_200(ShoppingItemSerializer(many=True).to_representation(objs.shopping_items))

        #  __      ___     _               ____          _
        #  \ \    / (_)   | |             / __ \        | |
        #   \ \  / / _  __| | ___  ___   | |  | |_ __ __| | ___ _ __
        #    \ \/ / | |/ _` |/ _ \/ _ \  | |  | | '__/ _` |/ _ \ '__|
        #     \  /  | | (_| |  __/ (_) | | |__| | | | (_| |  __/ |
        #      \/   |_|\__,_|\___|\___/   \____/|_|  \__,_|\___|_|

        elif sub_obj == 'videoOrder':
            vo = ResourceOrder.objects.filter(
                video__state__in=[ContentModelState.active, ContentModelState.active_review], element_owner=objs.id,
                element_type=ResourceOrderingType.video).order_by(
                'element_order')
            return response_200(BusinessVideoOrderSerializer(many=True).to_representation(vo))

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

        if not user:
            return response_40x(401, f"Unauthorized")

        if not objs or (detail_obj_id and not detail_obj):
            return response_40x(400, f"resource not found")

        if not sub_obj:
            serializer = BusinessSerializer(request=request, data=request.data, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __              __
        #      _/_/  _________  / /__  _____
        #    _/_/   / ___/ __ \/ / _ \/ ___/
        #  _/_/    / /  / /_/ / /  __(__  )
        # /_/     /_/   \____/_/\___/____/

        elif sub_obj == 'roles':
            serializer = BusinessRoleTypeSerializer(data=request.data, request=request, element=objs,
                                                    sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __                  _
        #      _/_/  ________ _   __(_)__ _      _______
        #    _/_/   / ___/ _ \ | / / / _ \ | /| / / ___/
        #  _/_/    / /  /  __/ |/ / /  __/ |/ |/ (__  )
        # /_/     /_/   \___/|___/_/\___/|__/|__/____/

        elif sub_obj == 'reviews':
            review_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)
            if review_obj:
                serializer = ReviewsSerializer(request=request, data=request.data, element=review_obj)
                if serializer.is_valid(raise_exception=True):
                    success = serializer.update(review_obj, serializer.validated_data)
                    if success:
                        return response_20x(200, {
                            'business_id': objs.id
                        })
                return response_20x(200, {
                    "business_id": objs.id
                })
            else:
                return response_40x(400, f"invalid review id")

        #        __   ____
        #      _/_/  / __/___ _____ _
        #    _/_/   / /_/ __ `/ __ `/
        #  _/_/    / __/ /_/ / /_/ /
        # /_/     /_/  \__,_/\__, /
        #                      /_/

        elif sub_obj == 'faq':
            faq_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)
            if faq_obj:
                serializer = BusinessFAQSerializer(request=request, request_context='faq', data=request.data,
                                                   element=faq_obj)
                if serializer.is_valid(raise_exception=True):
                    success = serializer.update(faq_obj, serializer.validated_data)
                    if success:
                        return response_20x(200, {
                            "business_id": objs.id
                        })
            else:
                return response_40x(400, f"invalid faq id")

        #       __              _     _ _   _______                   ______
        #      / /             | |   | (_) |__   __|                 |  ____|
        #     / /   _ __  _   _| |__ | |_  ___| | ___  __ _ _ __ ___ | |__ __ _  __ _
        #    / /   | '_ \| | | | '_ \| | |/ __| |/ _ \/ _` | '_ ` _ \|  __/ _` |/ _` |
        #   / /    | |_) | |_| | |_) | | | (__| |  __/ (_| | | | | | | | | (_| | (_| |
        #  /_/     | .__/ \__,_|_.__/|_|_|\___|_|\___|\__,_|_| |_| |_|_|  \__,_|\__, |
        #          | |                                                             | |
        #          |_|

        elif sub_obj == 'publicTeamFaq':
            faq_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)
            if faq_obj:
                serializer = BusinessPublicTeamFAQSerializer(request=request, request_context='public_team_faq',
                                                             data=request.data,
                                                             element=faq_obj)
                if serializer.is_valid(raise_exception=True):
                    success = serializer.update(faq_obj, serializer.validated_data)
                    if success:
                        return response_20x(200, {
                            "business_id": objs.id
                        })
            else:
                return response_40x(400, f"invalid public team faq id")

        #        __   __               _                      __                     __  _
        #      _/_/  / /_  __  _______(_)___  ___  __________/ /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / __ \/ / / / ___/ / __ \/ _ \/ ___/ ___/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /_/ / /_/ (__  ) / / / /  __(__  |__  ) /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/    _/_.___/\__,_/____/_/_/ /_/\___/____/____/_____/\____/\___/\__,_/\__/_/\____/_/ /_/

        elif sub_obj == 'businessLocations':
            serializer = BusinessLocationAndCoverageSerializer(data=request.data, request=request, element=objs,
                                                               request_context='location')
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __                                              __                     __  _
        #      _/_/  _________ _   _____  _________ _____ ____  / /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / ___/ __ \ | / / _ \/ ___/ __ `/ __ `/ _ \/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /__/ /_/ / |/ /  __/ /  / /_/ / /_/ /  __/ /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/      \___/\____/|___/\___/_/   \__,_/\__, /\___/_____/\____/\___/\__,_/\__/_/\____/_/ /_/
        #                                         /____/
        elif sub_obj == 'coverageLocations':
            serializer = BusinessLocationAndCoverageSerializer(data=request.data, request=request, element=objs,
                                                               request_context='coverage')
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __               __    ___     ______
        #      _/_/  ____  __  __/ /_  / (_)___/_  __/__  ____ _____ ___
        #    _/_/   / __ \/ / / / __ \/ / / ___// / / _ \/ __ `/ __ `__ \
        #  _/_/    / /_/ / /_/ / /_/ / / / /__ / / /  __/ /_/ / / / / / /
        # /_/     / .___/\__,_/_.___/_/_/\___//_/  \___/\__,_/_/ /_/ /_/
        #        /_/

        elif sub_obj == 'publicTeam':
            if detail_obj:
                serializer = BusinessPublicTeamSerializer(data=request.data, request=request, element=detail_obj)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(200, serializer.update(detail_obj, serializer.validated_data))
            else:
                return response_40x(400, "no public team element by that id")

        #        __         __
        #      _/_/  ____  / /_  ____  ____  ___  _____
        #    _/_/   / __ \/ __ \/ __ \/ __ \/ _ \/ ___/
        #  _/_/    / /_/ / / / / /_/ / / / /  __(__  )
        # /_/     / .___/_/ /_/\____/_/ /_/\___/____/
        #        /_/

        elif sub_obj == 'phones':
            if detail_obj:
                serializer = BusinessPhoneSerializer(data=request.data, request=request, element=detail_obj)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(200, serializer.update(detail_obj, serializer.validated_data))
            else:
                return response_40x(400, "no business phone record by that id")

        #            __          __
        #     ____  / /_  ____  / /_____  _____
        #    / __ \/ __ \/ __ \/ __/ __ \/ ___/
        #   / /_/ / / / / /_/ / /_/ /_/ (__  )
        #  / .___/_/ /_/\____/\__/\____/____/
        # /_/

        elif sub_obj == 'photos':
            serializer = BusinessPhotoSerializer(data=request.data, request=request, element=objs,
                                                 sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(detail_obj, serializer.validated_data))

        #        __                   _       ____    _       __
        #      _/_/  _________  _____(_)___ _/ / /   (_)___  / /_______
        #    _/_/   / ___/ __ \/ ___/ / __ `/ / /   / / __ \/ //_/ ___/
        #  _/_/    (__  ) /_/ / /__/ / /_/ / / /___/ / / / / ,< (__  )
        # /_/     /____/\____/\___/_/\__,_/_/_____/_/_/ /_/_/|_/____/

        elif sub_obj == 'socialLinks':
            if detail_obj:
                serializer = BusinessSocialLinksSerializer(data=request.data, request=request, element=objs,
                                                           sub_element=detail_obj)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(200, serializer.update(detail_obj, serializer.validated_data))
            else:
                return response_40x(400, "no social link record by that id")

        #        __                             ______
        #      _/_/  _   _____  ____  __  _____/_  __/_  ______  ___  _____
        #    _/_/   | | / / _ \/ __ \/ / / / _ \/ / / / / / __ \/ _ \/ ___/
        #  _/_/     | |/ /  __/ / / / /_/ /  __/ / / /_/ / /_/ /  __(__  )
        # /_/       |___/\___/_/ /_/\__,_/\___/_/  \__, / .___/\___/____/
        #                                         /____/_/

        elif sub_obj == 'venueTypes':
            serializer = BusinessVenueTypesSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __                              _       __           ______                       __
        #      _/_/  ____ _______________  _____(_)___ _/ /____  ____/ / __ )_________ _____  ____/ /____
        #    _/_/   / __ `/ ___/ ___/ __ \/ ___/ / __ `/ __/ _ \/ __  / __  / ___/ __ `/ __ \/ __  / ___/
        #  _/_/    / /_/ (__  |__  ) /_/ / /__/ / /_/ / /_/  __/ /_/ / /_/ / /  / /_/ / / / / /_/ (__  )
        # /_/      \__,_/____/____/\____/\___/_/\__,_/\__/\___/\__,_/_____/_/   \__,_/_/ /_/\__,_/____/

        elif sub_obj == 'associateBrands':
            if detail_obj:
                serializer = BusinessAssociateBrandsSerializer(data=request.data, request=request, element=objs,
                                                               sub_element=detail_obj)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(200, serializer.update(detail_obj, serializer.validated_data))
            else:
                return response_40x(400, "no associated brand by that id")

        #        __              __    _____   __
        #      _/_/  _________  / /___/ /   | / /_
        #    _/_/   / ___/ __ \/ / __  / /| |/ __/
        #  _/_/    (__  ) /_/ / / /_/ / ___ / /_
        # /_/     /____/\____/_/\__,_/_/  |_\__/

        elif sub_obj == 'soldAt':
            serializer = BusinessSoldAtSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #        __   __
        #      _/_/  / /_____ _____ ______
        #    _/_/   / __/ __ `/ __ `/ ___/
        #  _/_/    / /_/ /_/ / /_/ (__  )
        # /_/      \__/\__,_/\__, /____/
        #                   /____/

        elif sub_obj == 'tags':
            serializer = TagSerializer(data=request.data, request=request, element=objs)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(objs, serializer.validated_data))

        #                               _             _ ______               _
        #                              (_)           | |  ____|             | |
        #    ___  _ __ __ _  __ _ _ __  _ _______  __| | |____   _____ _ __ | |_ ___
        #   / _ \| '__/ _` |/ _` | '_ \| |_  / _ \/ _` |  __\ \ / / _ \ '_ \| __/ __|
        #  | (_) | | | (_| | (_| | | | | |/ /  __/ (_| | |___\ V /  __/ | | | |_\__ \
        #   \___/|_|  \__, |\__,_|_| |_|_/___\___|\__,_|______\_/ \___|_| |_|\__|___/
        #              __/ |
        #             |___/

        elif sub_obj == 'organizedEvents':
            serializer = BusinessOrganizedEventsSerializer(data=request.data, request=request, element=objs,
                                                           sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(detail_obj, serializer.validated_data))

        #  __      ___     _
        #  \ \    / (_)   | |
        #   \ \  / / _  __| | ___  ___  ___
        #    \ \/ / | |/ _` |/ _ \/ _ \/ __|
        #     \  /  | | (_| |  __/ (_) \__ \
        #      \/   |_|\__,_|\___|\___/|___/

        elif sub_obj == 'videos':
            serializer = VideoSerializer(data=request.data, request=request, element=objs,
                                         sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(detail_obj, serializer.validated_data))

        #        __   ______                     __  ___               __                       _____    _
        #      _/_/  /_  __/__  ____ _____ ___  /  |/  /__  ____ ___  / /_  ___  __________   _/_/   |  | |
        #    _/_/     / / / _ \/ __ `/ __ `__ \/ /|_/ / _ \/ __ `__ \/ __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/      / / /  __/ /_/ / / / / / / /  / /  __/ / / / / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/       /_/  \___/\__,_/_/ /_/ /_/_/  /_/\___/_/ /_/ /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                                  |_|      /_/

        elif sub_obj == 'teamMembers':
            serializer = BusinessTeamMembersSerializer(data=request.data, request=request, element=objs,
                                                       sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                return response_20x(200, serializer.update(detail_obj, serializer.validated_data))

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

        if not user:
            return response_40x(401, f"Unauthorized")

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

        #        __              __
        #      _/_/  _________  / /__  _____
        #    _/_/   / ___/ __ \/ / _ \/ ___/
        #  _/_/    / /  / /_/ / /  __(__  )
        # /_/     /_/   \____/_/\___/____/

        elif sub_obj == 'roles':
            serializer = BusinessRoleTypeSerializer(data=request.data, request=request, element=objs,
                                                    sub_element=detail_obj)
            if serializer.is_valid(raise_exception=True):
                if detail_obj in (list(objs.roles.all())):
                    objs.roles.remove(detail_obj)
                    return response_20x(200, {})

        #        __              __                   _ __                       _____    _
        #      _/_/  _______  __/ /_  _______________(_) /_  ___  __________   _/_/   |  | |
        #    _/_/   / ___/ / / / __ \/ ___/ ___/ ___/ / __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/    (__  ) /_/ / /_/ (__  ) /__/ /  / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/     /____/\__,_/_.___/____/\___/_/  /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                   |_|      /_/

        elif sub_obj == 'subscribers':
            # for lstv-admin users: we allow the explicit addition/deletion of a subscriber, for anyone else it must
            # be the logged in user making the request...

            if detail_obj_id:
                try:
                    user = User.objects.get(id=detail_obj_id)
                except User.DoesNotExist:
                    return response_40x(400, f"user_id does not pertain to any user.")

            if objs.subscribers.filter(id=user.id).count() < 1:
                return response_40x(400, f"user is not a subscriber")

            objs.subscribers.remove(user)
            return response_20x(200, {})

        #        __                  _
        #      _/_/  ________ _   __(_)__ _      _______
        #    _/_/   / ___/ _ \ | / / / _ \ | /| / / ___/
        #  _/_/    / /  /  __/ |/ / /  __/ |/ |/ (__  )
        # /_/     /_/   \___/|___/_/\___/|__/|__/____/

        elif sub_obj == 'reviews':
            if not action:
                # remove the faq object from the element
                if detail_obj:
                    objs.reviews.remove(detail_obj)
                    detail_obj.review.delete()
                    detail_obj.delete()
                    return response_20x(200, {})
                else:
                    return response_40x(400, f"invalid review id")
            else:
                if action == 'like':
                    if not detail_obj:
                        return response_40x(404, "review object not found")
                    like = Like.objects.filter(user=user, element_type=LikableElementType.review,
                                               element_id=detail_obj.id).first()
                    if like:
                        like.delete()
                        Message.objects.filter(id=detail_obj.review.id).update(likes=(F('likes') - 1))
                        return response_20x(200, {})
                    else:
                        return response_40x(400, "user does not have a like record for this resource")

        #        __   ____
        #      _/_/  / __/___ _____ _
        #    _/_/   / /_/ __ `/ __ `/
        #  _/_/    / __/ /_/ / /_/ /
        # /_/     /_/  \__,_/\__, /
        #                      /_/

        elif sub_obj == 'faq':
            # remove the faq object from the element
            if detail_obj:
                objs.faq.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"invalid faq id")

        #       __              _     _ _   _______                   ______
        #      / /             | |   | (_) |__   __|                 |  ____|
        #     / /   _ __  _   _| |__ | |_  ___| | ___  __ _ _ __ ___ | |__ __ _  __ _
        #    / /   | '_ \| | | | '_ \| | |/ __| |/ _ \/ _` | '_ ` _ \|  __/ _` |/ _` |
        #   / /    | |_) | |_| | |_) | | | (__| |  __/ (_| | | | | | | | | (_| | (_| |
        #  /_/     | .__/ \__,_|_.__/|_|_|\___|_|\___|\__,_|_| |_| |_|_|  \__,_|\__, |
        #          | |                                                             | |
        #          |_|

        elif sub_obj == 'publicTeamFaq':
            # remove the faq object from the element
            if detail_obj:
                objs.public_team_faq.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"invalid public team faq id")

        #        __   __               _                      __                     __  _
        #      _/_/  / /_  __  _______(_)___  ___  __________/ /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / __ \/ / / / ___/ / __ \/ _ \/ ___/ ___/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /_/ / /_/ (__  ) / / / /  __(__  |__  ) /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/    _/_.___/\__,_/____/_/_/ /_/\___/____/____/_____/\____/\___/\__,_/\__/_/\____/_/ /_/

        elif sub_obj == 'businessLocations':
            # remove the faq object from the element
            if detail_obj:
                objs.business_locations.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"invalid location id")

        #        __                                              __                     __  _
        #      _/_/  _________ _   _____  _________ _____ ____  / /   ____  _________ _/ /_(_)___  ____
        #    _/_/   / ___/ __ \ | / / _ \/ ___/ __ `/ __ `/ _ \/ /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
        #  _/_/    / /__/ /_/ / |/ /  __/ /  / /_/ / /_/ /  __/ /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
        # /_/      \___/\____/|___/\___/_/   \__,_/\__, /\___/_____/\____/\___/\__,_/\__/_/\____/_/ /_/
        #                                         /____/
        elif sub_obj == 'coverageLocations':
            # remove the faq object from the element
            if detail_obj:
                objs.business_locations.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"invalid location id")

        #        __   ______                     __  ___               __                       _____    _
        #      _/_/  /_  __/__  ____ _____ ___  /  |/  /__  ____ ___  / /_  ___  __________   _/_/   |  | |
        #    _/_/     / / / _ \/ __ `/ __ `__ \/ /|_/ / _ \/ __ `__ \/ __ \/ _ \/ ___/ ___/  / // /| |  / /
        #  _/_/      / / /  __/ /_/ / / / / / / /  / /  __/ / / / / / /_/ /  __/ /  (__  )  / // ___ | / /
        # /_/       /_/  \___/\__,_/_/ /_/ /_/_/  /_/\___/_/ /_/ /_/_.___/\___/_/  /____/  / //_/  |_|/_/
        #                                                                                  |_|      /_/

        elif sub_obj == 'teamMembers':
            if detail_obj and detail_obj.user and detail_obj.user.id == user.id:
                return response_40x(400, f"you may not delete yourself")
            if detail_obj and detail_obj.user and detail_obj.user.id != user.id:
                detail_obj.user.delete_deep()
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no team member id in the url or id invalid")

        #        __               __    ___     ______
        #      _/_/  ____  __  __/ /_  / (_)___/_  __/__  ____ _____ ___
        #    _/_/   / __ \/ / / / __ \/ / / ___// / / _ \/ __ `/ __ `__ \
        #  _/_/    / /_/ / /_/ / /_/ / / / /__ / / /  __/ /_/ / / / / / /
        # /_/     / .___/\__,_/_.___/_/_/\___//_/  \___/\__,_/_/ /_/ /_/
        #        /_/

        elif sub_obj == 'publicTeam':
            if detail_obj:
                objs.public_team.remove(detail_obj)
                detail_obj.delete_deep()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no public team record by that id")

        #        __         __
        #      _/_/  ____  / /_  ____  ____  ___  _____
        #    _/_/   / __ \/ __ \/ __ \/ __ \/ _ \/ ___/
        #  _/_/    / /_/ / / / / /_/ / / / /  __(__  )
        # /_/     / .___/_/ /_/\____/_/ /_/\___/____/
        #        /_/

        elif sub_obj == 'phones':
            if detail_obj:
                objs.business_phones.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no phone record by that id")

        #       __        _           _
        #      / /       | |         | |
        #     / /   _ __ | |__   ___ | |_ ___  ___
        #    / /   | '_ \| '_ \ / _ \| __/ _ \/ __|
        #   / /    | |_) | | | | (_) | || (_) \__ \
        #  /_/     | .__/|_| |_|\___/ \__\___/|___/
        #          | |
        #          |_|

        elif sub_obj == 'photos':
            if detail_obj:
                BusinessPhoto.objects.filter(photo_id=detail_obj_id).delete()
                detail_obj.delete_deep()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no business photo record by that id")

        #        __                   _       ____    _       __
        #      _/_/  _________  _____(_)___ _/ / /   (_)___  / /_______
        #    _/_/   / ___/ __ \/ ___/ / __ `/ / /   / / __ \/ //_/ ___/
        #  _/_/    (__  ) /_/ / /__/ / /_/ / / /___/ / / / / ,< (__  )
        # /_/     /____/\____/\___/_/\__,_/_/_____/_/_/ /_/_/|_/____/

        elif sub_obj == 'socialLinks':
            if detail_obj:
                objs.social_links.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no social link record by that id")

        #        __                             ______
        #      _/_/  _   _____  ____  __  _____/_  __/_  ______  ___  _____
        #    _/_/   | | / / _ \/ __ \/ / / / _ \/ / / / / / __ \/ _ \/ ___/
        #  _/_/     | |/ /  __/ / / / /_/ /  __/ / / /_/ / /_/ /  __(__  )
        # /_/       |___/\___/_/ /_/\__,_/\___/_/  \__, / .___/\___/____/
        #                                         /____/_/

        elif sub_obj == 'venueTypes':
            if detail_obj:
                objs.venue_types.remove(detail_obj)
                detail_obj.delete()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no venue type record by that id")

        #        __                              _       __           ______                       __
        #      _/_/  ____ _______________  _____(_)___ _/ /____  ____/ / __ )_________ _____  ____/ /____
        #    _/_/   / __ `/ ___/ ___/ __ \/ ___/ / __ `/ __/ _ \/ __  / __  / ___/ __ `/ __ \/ __  / ___/
        #  _/_/    / /_/ (__  |__  ) /_/ / /__/ / /_/ / /_/  __/ /_/ / /_/ / /  / /_/ / / / / /_/ (__  )
        # /_/      \__,_/____/____/\____/\___/_/\__,_/\__/\___/\__,_/_____/_/   \__,_/_/ /_/\__,_/____/

        elif sub_obj == 'associateBrands':
            if detail_obj:
                objs.associate_brands.remove(detail_obj)
                detail_obj.delete_deep()
                return response_20x(200, {})
            else:
                return response_40x(400, f"no associate brand by that id")

        #        __              __    _____   __
        #      _/_/  _________  / /___/ /   | / /_
        #    _/_/   / ___/ __ \/ / __  / /| |/ __/
        #  _/_/    (__  ) /_/ / / /_/ / ___ / /_
        # /_/     /____/\____/_/\__,_/_/  |_\__/

        elif sub_obj == 'soldAt':
            if detail_obj:
                objs.sold_at_businesses.remove(detail_obj)
                return response_20x(200, {})
            else:
                return response_40x(400, f"no associate brand by that id")

        #        __   __
        #      _/_/  / /_____ _____ ______
        #    _/_/   / __/ __ `/ __ `/ ___/
        #  _/_/    / /_/ /_/ / /_/ (__  )
        # /_/      \__/\__,_/\__, /____/
        #                   /____/

        elif sub_obj == 'tags':
            if detail_obj:
                objs.tags.remove(detail_obj)
                return response_20x(200, {})
            else:
                return response_40x(400, f"no tag by that slug")

        #                               _             _ ______               _
        #                              (_)           | |  ____|             | |
        #    ___  _ __ __ _  __ _ _ __  _ _______  __| | |____   _____ _ __ | |_ ___
        #   / _ \| '__/ _` |/ _` | '_ \| |_  / _ \/ _` |  __\ \ / / _ \ '_ \| __/ __|
        #  | (_) | | | (_| | (_| | | | | |/ /  __/ (_| | |___\ V /  __/ | | | |_\__ \
        #   \___/|_|  \__, |\__,_|_| |_|_/___\___|\__,_|______\_/ \___|_| |_|\__|___/
        #              __/ |
        #             |___/

        elif sub_obj == 'organizedEvents':
            if detail_obj:
                objs.organized_events.remove(detail_obj)
                return response_20x(200, {})
            else:
                return response_40x(400, f"no organized_event by that id")

        #  __      ___     _
        #  \ \    / (_)   | |
        #   \ \  / / _  __| | ___  ___  ___
        #    \ \/ / | |/ _` |/ _ \/ _ \/ __|
        #     \  /  | | (_| |  __/ (_) \__ \
        #      \/   |_|\__,_|\___|\___/|___/

        elif sub_obj == 'videos':
            if detail_obj:

                # delete video
                print(detail_obj)
                videos = VideoVideo.objects.filter(video_source=detail_obj)
                for vid in videos:
                    vid.video.post.delete()
                    vid.video.delete()
                    vid.delete()
                detail_obj.delete_deep()

                ResourceOrder.objects.filter(video=vid.video).delete()

                return response_20x(200, {"id": detail_obj.id})
            else:
                return response_40x(400, f"no video by that id")

        # catchall (should never happen)
        return response_500("delete method did not succeed")
