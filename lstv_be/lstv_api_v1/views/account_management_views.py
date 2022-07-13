from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.business_team_member_role_serializers import BusinessTeamMemberRoleSerializer
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
from lstv_api_v1.tasks.user_action_handlers import on_business_created
from lstv_api_v1.utils.utils import notify_grapevine, send_business_welcome_email
from lstv_api_v1.views.utils.user_view_utils import create_new_business
from lstv_be.settings import WEB_SERVER_URL


class BusinessFaqView(LSTVEntityDependantDataAPIView):
    permission_classes = ([PublicReadBusinessWrite])

    def __init__(self, *args, **kwargs):
        super(BusinessFaqView, self).__init__(element_type="business")

    def on_post(self, request, element):
        serializer = InPageMessagingSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            success = serializer.create(serializer.validated_data)
            if success:
                return response_20x(201, {})
            else:
                return response_500("issues creating message")

    def on_get(self, request, element):
        response = InPageMessagingSerializer(request=request).to_representation(element.faq)
        return response_200(response)

    def on_patch(self, request):
        serializer = InPageMessagingSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            try:
                instance = get_model_element("message", serializer.validated_data.get('message_id', None))
                if request.user.id != instance.from_user.id and not request.user.is_lstv_admin():
                    return response_40x(403, "this isn't your message to modify.")
                success = serializer.update(instance, serializer.validated_data)
                if success:
                    return response_20x(200, {})
                else:
                    return response_500("issues creating message")
            except BaseException as e:
                return response_40x(400, str(e))

    def on_delete(self, request):
        serializer = InPageMessagingSerializer(data=request.data, request=request)
        if serializer.is_valid(raise_exception=True):
            try:
                instance = get_model_element("message", serializer.validated_data.get('message_id', None))
                if request.user.id != instance.from_user.id and not request.user.is_lstv_admin():
                    return response_40x(403, "this message isn't yours to delete.")
                instance.delete()
                return response_20x(200, {})
            except BaseException as e:
                return response_40x(400, str(e))


class UserPropertiesView(APIView):
    """
    get all kinds of admin stats
    """

    permission_classes = ([IsAuthenticated])

    @staticmethod
    def post(request, format=None):
        if not request.user:
            return response_40x(403, "Unable to locate user record")
        if 'value' in request.data and 'skip' in request.data['value'] and request.data['value']['skip']:
            # print("skipping")
            props = request.user.properties.filter(key=f"prop_domain_{request.data['domain']}").first()
            if props:
                props.value_json = {"skip": True}
                props.save()
            else:
                props = Properties(key=f"prop_domain_{request.data['domain']}", value_json={"skip": True})
                props.save()
                request.user.properties.add(props)
            return response_20x(200, {})

        if 'domain' in request.data and 'value' in request.data and isinstance(request.data['value'], dict):
            user = request.user
            props = user.properties.filter(key=f"prop_domain_{request.data['domain']}").first()
            if props:
                props.value_json = request.data['value']
                props.save()
            else:
                props = Properties(key=f"prop_domain_{request.data['domain']}", value_json=request.data['value'])
                props.save()
                user.properties.add(props)
                notify_grapevine(
                    f":pencil2: Sign-up answers consumer for {user.get_full_name_or_email()} ({user.email})\rWedding Date:"
                    f" {request.data['value'].get('wedding_date', 'skipped')} :white_small_square: "
                    f"Wedding Location: "
                    f"{request.data['value'].get('wedding_location', {}).get('formatted', 'skipped')}")
            return response_20x(200, {})
        else:
            return response_40x(400, "both domain and value (JSON) fields must be sent")

    def get(self, request, format=None):
        if 'domain' in request.query_params:
            user = request.user
            props = user.properties.filter(key='prop_domain_' + request.query_params['domain']).first()
            if props:
                return response_200({"updated": int(round(props.updated_at.timestamp(), 0)),
                                     "for": user.email, "value": props.value_json}, ttl=API_CACHE_TTL_REALTIME)
            else:
                return response_40x(400, "no such properties domain for the user. you can create one.")
        else:
            return response_40x(400, "domain field missing (properties domain)")


class BusinessPropertiesView(APIView):
    """
    complete business registration
    """

    permission_classes = ([IsAuthenticated])

    @staticmethod
    def post(request, format=None):
        if not request.user:
            return response_40x(403, "Unable to locate user record")
        else:
            if 'business_name' in request.data and 'location' in request.data and 'business_roles' in request.data:
                if BusinessTeamMember.objects.filter(user=request.user).count() > 0:
                    return response_40x(400, "logged in user already assigned to a business.")
                business = Business.objects.filter(name__iexact=request.data['business_name']).first()
                if not business:
                    business = create_new_business(request.data['business_name'], request.data['business_roles'],
                                                   request.data['location'], request.user)

                    if business:
                        tm_permissions = None
                        tm = BusinessTeamMember.objects.filter(user=request.user).first()
                        if tm:
                            tm_permissions = BusinessTeamMemberRoleSerializer(tm.roles, many=True).data

                        send_business_welcome_email(request.user, business)
                        notify_grapevine(f":briefcase: New business joined: `{request.user.get_full_name_or_email()}` "
                                         f"({request.user.email})\n:white_small_square: "
                                         f"Business Name: `<{WEB_SERVER_URL}/business/{business.slug}|{business.name}>` "
                                         f"\n:white_small_square: location: `{business.business_locations.first()}` "
                                         f"\n:white_small_square: Roles: `{business.get_roles_as_text()}`",
                                         request.user.profile_image.get_serve_url() if request.user.profile_image else None)

                        return response_20x(200, {
                            "business_name": business.name,
                            "business_id": business.id,
                            "business_slug": business.slug,
                            "business_thumbnail_url": business.profile_image.serve_url if business.profile_image else None,
                            "team_member_permissions": tm_permissions,
                            "business_roles": BusinessRoleTypeSerializer(business.roles,
                                                                         many=True).data})
                    else:
                        return response_500("Unexpected problems creating the business. Please try again later.")
                else:
                    return response_40x(400,
                                        'Business name already exists. Please email '
                                        '<a href="mailto:linnea@lovestoriestv.com">Linnea</a> to resolve this.',
                                        'business_name')
            else:
                return response_40x(400, "business_name, location and business_roles are required")
