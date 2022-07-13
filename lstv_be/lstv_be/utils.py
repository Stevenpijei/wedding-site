from future.backports.datetime import datetime
from rest_framework.views import exception_handler
from django.http import JsonResponse


from lstv_be.settings import *
import jwt


def custom404(request, exception=None):
    return JsonResponse(
        {"success": False,
         "errors": [
             {
                 "field": None,
                 "errors": ["API endpoint doesn't exist."]
             }
         ]}, status=404)


def custom500(request, exception=None):
    return JsonResponse({
        "success": None,
        "errors": [
            {
                "field": None,
                "errors": ["Unexpected server error encountered. We are working to correct the issue"]
            }
        ]
    }, status=500)


def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        new_errors = []
        for field_error in response.data.keys():
            new_errors.append({
                "field": field_error or "generic",
                "errors": response.data[field_error]
            })
        response.data = {"success": False, "errors": new_errors}
    return response


def build_login_user_payload(user):
    from lstv_api_v1.models import UserTypeEnum, BusinessTeamMember
    from lstv_api_v1.serializers.serializers_posts import BusinessRoleTypeSerializer
    from lstv_api_v1.serializers.business_team_member_role_serializers import BusinessTeamMemberRoleSerializer
    rc = {"uid": user.id, "email": user.email, "profile_thumbnail_url": user.get_thumbnail_url(),
          'first_name': user.first_name, 'last_name': user.last_name, 'user_type': user.user_type.name}


    # if user is a team member
    if user.user_type == UserTypeEnum.business_team_member:
        # get business name, roles
        tm = BusinessTeamMember.objects.filter(user=user).first()
        if tm:
            business_serializer = BusinessRoleTypeSerializer(tm.business.roles, many=True)
            permission_serializer = BusinessTeamMemberRoleSerializer(tm.roles, many=True)
            rc['team_member_permissions'] = permission_serializer.data
            rc['business_name'] = tm.business.name
            rc['business_id'] = tm.business.id
            rc['business_slug'] = tm.business.slug
            rc['business_roles'] = business_serializer.data
            rc['subscription_level'] = tm.business.subscription_level.slug if tm.business.subscription_level else "free"
            rc['business_roles'] = business_serializer.data
            rc['business_thumbnail_url'] = tm.business.profile_image.serve_url if tm.business.profile_image else None

    # any special status we want ot communicate back after a login or oauth singup/login?

    if user.user_type == UserTypeEnum.consumer:
        prop = user.properties.filter(key='prop_domain_profile').first()
        if not prop or (('wedding_date' not in prop.value_json or 'wedding_location' not in prop.value_json) and (
                'skip' not in prop.value_json)):
            rc['post-signup-interview-required'] = True

    if user.user_type == UserTypeEnum.business_team_member_onboarding:
            rc['post-signup-interview-required'] = True

    user.last_login = datetime.now()
    user.save()

    return rc


def lstv_jwt_create_response_payload(token, user=None, request=None, issued_at=None):
    from lstv_api_v1.models import User
    decoded = jwt.decode(token, settings.SECRET_KEY)
    username = decoded['username']
    user = User.objects.filter(email=username).first()
    return {"success": True, "result": build_login_user_payload(user)}


def get_image_size_by_url(url):
    try:
        import requests
        from PIL import Image
        from io import BytesIO
        img_data = requests.get(url).content
        im = Image.open(BytesIO(img_data))
        return im.size
    except:
        return None
