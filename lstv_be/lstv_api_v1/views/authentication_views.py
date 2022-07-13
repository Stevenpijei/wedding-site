from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *

from lstv_api_v1.utils.utils import set_volatile_value, get_volatile_value, delete_volatile_value
from lstv_api_v1.tasks.tasks import job_send_sendgrid
from lstv_be.settings import WEB_SERVER_URL


class LogoutView(APIView):
    permission_classes = ([AllowAny])

    def post(self, request, format=None):
        return response_20x(200, {}, delete_cookies=['token', 'logged_in_user_id'])


class VerifyToken(APIView):
    permission_classes = ([IsAuthenticated])

    def get(self, request, format=None):
        result = {
            'result': 'valid'}
        return response_200(result, ttl=API_CACHE_TTL_REALTIME)


class VerifyPasswordChangeToken(APIView):
    permission_classes = ([AllowAny])

    def post(self, request, format=None):
        if 'code' in request.data:
            token = get_volatile_value(f"forgot-pw-for-{request.data['code']}")
            if token:
                return response_20x(200, {'code': request.data['code']})
            else:
                return response_40x(404, {'code not valid'})
        else:
            return response_40x(400, {'no code in the request'})


class PasswordResetRequestView(APIView):
    """
    Ask for a new password in case of forgetting it....
    """
    permission_classes = ([AllowAny])

    def post(self, request, format=None):
        if 'email' in request.data:
            user = get_user_from_email(request.data['email'])
            if user:
                # cache password reset code for 10 min.
                code = uuid.uuid4()
                set_volatile_value(f"forgot-pw-for-{code}", user.id, 120)

                job_send_sendgrid.delay("donotreply@lovestoriestv.com", "Love Stories TV (Password Recovery)",
                                        user.email,
                                        user.first_name or "Buddy", "Forgot your Love Stories TV Password?",
                                        "d-0459dfbda19e40df8b20c6c546c514f2", {
                                            'lstv_name': 'Love Stories TV (Password Recovery)',
                                            'lstv_email': 'donotreply@lovestoriestv.com',
                                            'subject': 'Forgot your Love Stories TV Password',
                                            "to_name": user.first_name,
                                            "cta_url": f"{WEB_SERVER_URL}/setNewPassword?code={code}",
                                            "hidden_message": "Choose a new password!"
                                        })

        return response_20x(200, {})


class PasswordResetActionView(APIView):
    """
    Replace the old forgotten password with a new one
    """
    permission_classes = ([AllowAny])

    def post(self, request, format=None):
        if 'code' in request.data and 'new_password' in request.data:
            code = f"forgot-pw-for-{request.data['code']}"
            user_id = get_volatile_value(code)
            if user_id:
                try:
                    user = User.objects.get(pk=user_id)
                    if generic_validate_password(request.data['new_password'], None):
                        user.set_password(request.data['new_password'])
                        user.save()
                        delete_volatile_value(code)
                        return response_20x(200, {})
                    else:
                        return response_40x(400,
                                            LSTV_API_V1_PASSWORD_NOT_STRONG, "new_password")
                except User.DoesNotExist:
                    return response_40x(400,
                                        LSTV_API_V1_USER_RECORD_NO_LONGER_EXISTS)
            else:
                return response_40x(400,
                                    LSTV_API_V1_PASSWORD_RESET_LINK_EXPIRED, "code")
        else:
            return response_40x(400, "code and new_password fields required")


class VerifyAccountClaim(APIView):
    """
        Check whether an account claim link exists.
    """

    permission_classes = ([AllowAny])

    @staticmethod
    def get(request):
        if 'code' in request.query_params:
            try:
                b = Business.objects.get(account_claimed_at__isnull=True,
                                         account_claim_code=request.query_params.get('code', None))
                return response_200({
                    "business_id": b.id,
                    "code": request.query_params.get('code', None),
                    "business_slug": b.slug,
                    "business_name": b.name,
                }, ttl=0)
            except Business.DoesNotExist:
                return response_40x(400, "invalid, non-existent or expired claim code")


class VerifyPasswordChangCode(APIView):
    """
    Check whether a password change token is still valid.
    """

    permission_classes = ([AllowAny])

    @staticmethod
    def post(request):
        if 'code' in request.data:
            code = f"forgot-pw-for-{request.data['code']}"
            user_id = get_volatile_value(code)
            if user_id:
                user = User.objects.filter(pk=user_id).first()
                if user:
                    return response_20x(200,
                                        {'code': request.data['code'], 'valid': True})
            return response_40x(400, "user no longer exists on the system")
        else:
            return response_40x(400, "request missing code", "code")
