from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import F, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.parsers import MultiPartParser, FileUploadParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny

from lstv_api_v1.globals import API_CACHE_TTL_PUBLIC_GET, LSTV_API_V1_BAD_REQUEST_NO_SLUG, API_CACHE_TTL_REALTIME
from lstv_api_v1.models import Video, UserTypeEnum, Location, Country, StateProvince, Place, County, PlaceAltType, \
    CuratedLocation
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.location_subscribers_serializer import LocationSubscribersSerializer
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseAPIView
from lstv_api_v1.views.utils.user_view_utils import create_new_business, response_40x

#   _                     _   _              __      ___
#  | |                   | | (_)             \ \    / (_)
#  | |     ___   ___ __ _| |_ _  ___  _ __    \ \  / / _  _____      __
#  | |    / _ \ / __/ _` | __| |/ _ \| '_ \    \ \/ / | |/ _ \ \ /\ / /
#  | |___| (_) | (_| (_| | |_| | (_) | | | |    \  /  | |  __/\ V  V /
#  |______\___/ \___\__,_|\__|_|\___/|_| |_|     \/   |_|\___| \_/\_/

from lstv_api_v1.views.utils.view_utils import response_20x, response_500, response_200


class LocationView(LSTVBaseAPIView):
    """
    Business view class, handling all business objects for all audiences -- users, businesses, lstv admins, and all
    business sub-views
    """

    allowable_actions = ['subscribers', 'verifySubscription']

    permission_classes = [AllowAny]

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
        },
        "actions": {
            "subscribers": {
                "GET": {
                    "user_types": [UserTypeEnum.admin],
                },
                "POST": {},
                "DELETE": {}
            },
            "verifySubscription": {
                "GET": {}
            }
        }
    }

    permission_scope = {
        "/": public_read_lstv_admin_write,
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

    @staticmethod
    def get_place(country, state_province, place_slug):
        if country and state_province:
            place = Place.objects.filter(slug=place_slug, country=country, state_province=state_province).first()
            if not place:
                place = Place.objects.filter(alternates__type=PlaceAltType.slug, alternates__value=place_slug,
                                             country=country, state_province=state_province).first()
            return place
        if country:
            place = Place.objects.filter(slug=place_slug, country=country).first()
            if not place:
                place = Place.objects.filter(alternates__type=PlaceAltType.slug, alternates__value=place_slug,
                                             country=country).first()
            return place

        place = Place.objects.filter(slug=place_slug).first()
        if not place:
            Place.objects.filter(alternates__type=PlaceAltType.slug, alternates__value=place_slug).first()
        return place

    def get_target_object(self):

        # 3 + action: united-states/california/los-angeles/subscribers
        if self.request_params.get('place') in self.allowable_actions:
            self.request_params['action'] = self.request_params['place']
            self.request_params['place'] = None
            self.request_params['place_or_county'] = self.request_params['county']

        # 2 + action: united-states/california/subscribers
        if self.request_params.get('place_or_county') in self.allowable_actions:
            self.request_params['action'] = self.request_params['place_or_county']
            self.request_params['place_or_county'] = None

        # 1 + action: united-states/subscribers

        if self.request_params.get('place_or_county_or_state_province') in self.allowable_actions:
            self.request_params['action'] = self.request_params['place_or_county_or_state_province']
            self.request_params['place_or_county_or_state_province'] = None
        #
        # print(f"country: {self.permission_params.get('country')}")
        # print(f"state_province: {self.permission_params.get('state_province')}")
        # print(f"county: {self.permission_params.get('county')}")
        # print(f"place: {self.permission_params.get('place')}")
        # print(f"place_or_county_or_state_province: {self.permission_params.get('place_or_county_or_state_province')}")
        # print(f"place_or_county: {self.permission_params.get('place_or_county')}")

        country = None
        state_province = None
        county = None
        place = None

        if self.request_params.get('country'):
            country = Country.objects.filter(slug=self.request_params.get('country')).first()
        if self.request_params.get('state_province') and country:
            state_province = StateProvince.objects.filter(slug=self.request_params.get('state_province'),
                                                          country=country).first()
        if self.request_params.get('county'):
            county = County.objects.filter(slug=self.request_params.get('county')).first()
        if self.request_params.get('place'):
            place = self.get_place(country, state_province,
                                   self.request_params.get('place'))

        if self.request_params.get('place_or_county') and state_province:
            place = self.get_place(country, state_province,
                                   self.request_params.get('place_or_county'))
            if not place:
                county = County.objects.filter(slug=self.request_params.get('place_or_county')).first()
            else:
                county = place.county

        if self.request_params.get('place_or_county_or_state_province'):
            state_province = StateProvince.objects.filter(
                slug=self.request_params.get('place_or_county_or_state_province'),
                country=country).first()
            if not state_province:
                county = County.objects.filter(
                    slug=self.request_params.get('place_or_county_or_state_province')).first()
                if not county:
                    place = self.get_place(country, state_province,
                                           self.request_params.get('place_or_county_or_state_province'))

        # print(f"----")
        # print(f"country: {country}")
        # print(f"state/province: {state_province}")
        # print(f"county: {county}")
        # print(f"place: {place}")
        loc = Location(country=country, state_province=state_province, county=county, place=place,
                       source_desc='location endpoint created')
        return loc

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
        detail_obj_id = self.request_params.get('detail_obj_id')
        detail_obj = self.get_detail_object(objs, sub_obj, detail_obj_id)
        action = self.request_params.get('action')

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
            if not action:
                serializer = LocationSerializer(data=request.data, request=request, element=objs)
                if serializer.is_valid(raise_exception=True):
                    return response_20x(201, serializer.create(serializer.validated_data))
            elif action == 'subscribers':
                target_subscription_obj = objs.get_location_geo_object()
                if target_subscription_obj:
                    if target_subscription_obj.subscribers.filter(id=request.user.id).first():
                        return response_40x(400, f"already subscribed to {str(target_subscription_obj)}")
                    else:
                        target_subscription_obj.subscribers.add(request.user)

                        return response_20x(200, {"subscribed": True})

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
        action = self.request_params['action']
        user = self.request_params.get('user')

        if not objs:
            return response_40x(400, f"resource not found")

        #        __
        #      _/_/
        #    _/_/
        #  _/_/
        # /_/

        if not sub_obj:
            if not action:
                serializer = LocationSerializer(request=request, verbosity=self.verbosity)
                if isinstance(objs, Location):
                    rc = serializer.to_representation(objs)
                    if rc:
                        return response_200(rc)
                    else:
                        return response_40x(400, f"resource not found")
            elif action == 'verifySubscription':
                if not user:
                    return response_40x(401, f"Unauthorized")
                target_subscription_obj = objs.get_location_geo_object()
                if target_subscription_obj:
                    return response_200({"subscribed": target_subscription_obj.subscribers.filter(
                        id=request.user.id).first() is not None}, ttl=API_CACHE_TTL_REALTIME)
            elif action == 'subscribers':
                if not user or user.is_anonymous:
                    return response_40x(401, "unauthorized")
                elif user.user_type != UserTypeEnum.admin:
                    return response_40x(403, "forbidden")

                target_subscription_obj = objs.get_location_geo_object()
                if target_subscription_obj:
                    return response_200(LocationSubscribersSerializer(many=True).to_representation(
                        target_subscription_obj.subscribers.all()))
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
            serializer = LocationSerializer(request=request, data=request.data, element=objs)
            if serializer.is_valid(raise_exception=True):
                rc = serializer.update(objs, serializer.validated_data)
                if rc:
                    return response_20x(200, rc)
                else:
                    return response_40x(404, "this location does not have curated content")

        # catchall (should never happen)
        return response_500("get method did not succeed")

    #   _____  ______ _      ______ _______ ______
    #  |  __ \|  ____| |    |  ____|__   __|  ____|
    #  | |  | | |__  | |    | |__     | |  | |__
    #  | |  | |  __| | |    |  __|    | |  |  __|
    #  | |__| | |____| |____| |____   | |  | |____
    #  |_____/|______|______|______|  |_|  |______|

    def do_delete(self, request, **kwargs):
        sub_obj = self.request_params.get('sub_obj')
        detail_obj_id = self.request_params.get('detail_obj_id')
        user = self.request_params.get('user')
        objs = self.get_target_object()
        action = self.request_params['action']

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
            if not action:
                curated_location = CuratedLocation.objects.filter(place=objs.place,
                                                                  state_province=objs.state_province,
                                                                  county=objs.county,
                                                                  country=objs.country).first()
                if curated_location:
                    curated_location.delete_deep()
                else:
                    return response_40x(404, "the location does not have curated content")
            elif action == 'subscribers':
                target_subscription_obj = objs.get_location_geo_object()
                if target_subscription_obj:
                    if not target_subscription_obj.subscribers.filter(id=request.user.id).first():
                        return response_40x(400, f"user is not subscribed to {target_subscription_obj}")
                    else:
                        target_subscription_obj.subscribers.remove(request.user)
                        return response_20x(200, {})

        # catchall (should never happen)
        return response_500("get delete did not succeed")
