import json
import uuid

from json import JSONDecodeError

import jwt
from bugsnag.django.utils import MiddlewareMixin
from django.conf import settings

from django.urls import resolve
from django.utils.datastructures import MultiValueDictKeyError

from lstv_api_v1.globals import COOKIE_MAX_AGE_LOGGED_IN_USER
from lstv_api_v1.models import RequestLog, IPAddress, User
from lstv_api_v1.views.utils.view_utils import visitor_ip_address
from lstv_api_v1.event_handlers import on_user_actions
import re
from http import cookies

cookies.Morsel._reserved["samesite"] = "SameSite"
OLD_CHROME_REGEX = r"(Chrome|Chromium)\/((5[1-9])|6[0-6])"


class LSTVRequestResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response  # One-time configuration and initialization.
        self.query_params = None

    @staticmethod
    def request_response_event_processor(request_log):
        # request log based?
        if request_log:
            try:
                if request_log.result_code in [200, 201] and request_log.method in ['POST', 'DELETE', 'PATCH']:
                    url = request_log.url
                    url_elements = request_log.url.split("/")
                    if len(url_elements) > 1:
                        url = url_elements[0].lower()
                    processor_class = getattr(on_user_actions, 'OnUserAction')
                    processor = processor_class()
                    method = getattr(processor, 'on_' + url)
                    method(request_log)
            except AttributeError:
                pass

    def process_view(self, request, view_func, view_args, view_kwargs):
        self.query_params = view_kwargs

    def __call__(self, request):

        # Code to be executed for each request before
        # the view (and later middleware) are called.

        unique_guest_uuid = None

        body = {}

        try:
            if len(request.body) > 0:
                body = json.loads(request.body.decode('utf-8'))
        except json.decoder.JSONDecodeError:
            pass
        except UnicodeDecodeError:
            pass

        if 'unique_guest_uuid' in body:
            unique_guest_uuid = body['unique_guest_uuid']
            del body['unique_guest_uuid']

        if not unique_guest_uuid and request.GET and 'unique_guest_uuid' in request.GET:
            unique_guest_uuid = request.GET['unique_guest_uuid']

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        if resolve(request.path) != '' and resolve(request.path).url_name:
            url_name = resolve(request.path).url_name.lower()
        else:
            url_name = request.path

        if '/v1/' in request.path and url_name != 'userEvent':

            # censor password, if any.
            if 'password' in body:
                body.pop('password')

            if 'new_password' in body:
                body.pop('new_password')

            user = request.user if (not request.user.is_anonymous and request.user) else None

            # get pre-formatted results
            try:
                result = json.loads(response.rendered_content.decode('utf-8'))
            except JSONDecodeError:
                result = ""
            except AttributeError:
                result = ""

            # create an event

            cookies_in = request.COOKIES
            cookies_out = response.cookies

            # missing user? unique_guest_uuid?

            if not unique_guest_uuid:
                if cookies_in and 'unique_guest_uuid' in cookies_in:
                    unique_guest_uuid = cookies_in['unique_guest_uuid']
                elif cookies_out and 'unique_guest_uuid' in cookies_out:
                    unique_guest_uuid = cookies_out['unique_guest_uuid']

            if not unique_guest_uuid:
                if cookies_out and 'unique_guest_uuid' in cookies_out:
                    unique_guest_uuid = cookies_out['unique_guest_uuid']
                elif cookies_out and 'unique_guest_uuid' in cookies_out:
                    unique_guest_uuid = cookies_out['unique_guest_uuid']

            if not user and unique_guest_uuid:
                # look up user from unique_guest_uuid if applicable
                user = User.objects.filter(former_unique_guest_uuid=unique_guest_uuid).first()

            ip_obj = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
            if not ip_obj:
                ip_obj = IPAddress(ip=visitor_ip_address(request))
                ip_obj.save()
            event = RequestLog(method=request.method, data=body if body != {} else request.GET,
                               result_code=response.status_code, url=url_name, request_path=request.path,
                               ip=ip_obj, result=result if request.method != 'GET' else None, user=user,
                               cookies_in=cookies_in, cookies_out=cookies_out,
                               unique_guest_uuid=unique_guest_uuid)
            event.save()

            # fire a user_event from the request
            if event.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
                self.request_response_event_processor(event)

        return response


class LSTVHTTPOnlyCookiesMiddleware:
    """

    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # same-site = None introduced for Chrome 80 breaks for Chrome 51-66
        # Refer (https://www.chromium.org/updates/same-site/incompatible-clients)
        user_agent = request.META.get("HTTP_USER_AGENT")
        if not (user_agent and re.search(OLD_CHROME_REGEX, user_agent)):
            for name, value in response.cookies.items():
                if not value.get("samesite"):
                    value["samesite"] = "Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
                    value["secure"] = not settings.DEBUG  # fixes plain set_cookie(name, value)

        if response.status_code == 401 or (request.path == '/v1/tokenRefresh' and response.status_code == 400):
            response.status_code = 401
            response.content = b'{"error": "unauthorized"}'
            response['Content-Length'] = 25

        if response.status_code == 403:
            response.content = b'{"error": "forbidden"}'
            response['Content-Length'] = 22

        # first indication of authentication failure -- remove "logged_in_user_id" cookie

        if response.status_code == 401:
            response.delete_cookie(
                "logged_in_user_id",
                path=settings.SESSION_COOKIE_PATH,
                domain=settings.SESSION_COOKIE_DOMAIN,
                samesite="Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
            )

        if response.status_code == 401:
            response.delete_cookie(
                "token",
                path=settings.SESSION_COOKIE_PATH,
                domain=settings.SESSION_COOKIE_DOMAIN,
                samesite="Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
            )

        if 'unique_guest_uuid' not in request.COOKIES:
            response.set_cookie(
                "unique_guest_uuid",
                request.COOKIES['unique_guest_uuid'] if 'unique_guest_uuid' in request.COOKIES else uuid.uuid4(),
                max_age=COOKIE_MAX_AGE_LOGGED_IN_USER,
                httponly=not settings.DEBUG,
                secure=not settings.DEBUG,
                samesite="Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
            )
            response.set_cookie(
                "ugu",
                uuid.uuid4(),
                max_age=COOKIE_MAX_AGE_LOGGED_IN_USER,
                httponly=False,
                secure=False,
                samesite="Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
            )

        if request.path == '/v1/login' and response.status_code == 200:
            for name, value in response.cookies.items():
                if name == 'token':
                    decoded = jwt.decode(value.value, settings.SECRET_KEY)
                    username = decoded['username']
                    user = User.objects.filter(email=username).first()
                    if user:
                        if 'unique_guest_uuid' in request.COOKIES:
                            if user.former_unique_guest_uuid != request.COOKIES['unique_guest_uuid']:
                                user.former_unique_guest_uuid = request.COOKIES['unique_guest_uuid']
                                user.save()
                        response.set_cookie(
                            "logged_in_user_id",
                            user.id,
                            httponly=not settings.DEBUG,
                            max_age=COOKIE_MAX_AGE_LOGGED_IN_USER,
                            secure=not settings.DEBUG,
                            samesite="Lax" if settings.RELEASE_STAGE != 'staging' else 'None'
                        )
                    return response

        return response


class LSTVFixDRFJSONTokenSearchIssue(MiddlewareMixin):
    """
    for Django Rest Framework JWT's POST "/token-refresh" endpoint --- check for a 'token' in the request.COOKIES
    and if, add it to the body payload.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, *view_args, **view_kwargs):
        work_data = None
        change = False

        # put the IP address on the incoming request
        ip = IPAddress.objects.filter(ip=visitor_ip_address(request)).first()
        if not ip:
            ip = IPAddress(ip=visitor_ip_address(request))
            ip.save()

        if request.method == 'GET':
            request.GET._mutable = True
            request.GET['ip'] = str(ip.id)
            for field in ['fixed_content_items',
                          'exclude_items',
                          'search_items',
                          'limit_to_business_roles',
                          'exclude_business_roles',
                          'limit_to_locations',
                          'limit_to_tags',
                          'limit_to_business_role_capacity',
                          'limit_to_business']:
                if field in request.GET:
                    request.GET[field] = request.GET[field].replace(" ", "").split(',')

        if request.method != 'GET':
            if request.body:
                try:
                    work_data = json.loads(request.body)
                    if type(work_data) == list:
                        work_data = {"array": work_data}
                    work_data['ip'] = str(ip.id)
                except JSONDecodeError:
                    try:
                        work_data = json.loads(request.POST['payload'])
                        work_data['ip'] = str(ip.id)
                    except JSONDecodeError:
                        work_data = {"ip": str(ip.id)}
                    except MultiValueDictKeyError:
                        work_data = {"ip": str(ip.id)}
                except UnicodeDecodeError:
                    return None

            else:
                work_data = {"ip": str(ip.id)}

            # centrally, make sure we don't get whitespaces around strings when POSTED in data. This will save a lot
            # of code, and grief in the future as folks copy/paste business names and other fields which we've seen
            # inject unnecessary whitespaces which have to be stripped out.

            for field in work_data:
                if type(work_data[field]) == str:
                    work_data[field] = work_data[field].strip()
                    if field == 'business_roles':
                        work_data[field] = work_data[field].replace(" ", "").split(',')

            change = True

        if 'unique_guest_uuid' in request.COOKIES or 'logged_in_user_id' in request.COOKIES:
            if request.method == 'GET':
                if 'unique_guest_uuid' in request.COOKIES:
                    request.GET['unique_guest_uuid'] = request.COOKIES['unique_guest_uuid']
                if 'logged_in_user_id' in request.COOKIES:
                    request.GET['logged_in_user_id'] = request.COOKIES['logged_in_user_id']

            if request.method != 'GET':
                if 'unique_guest_uuid' in request.COOKIES or 'logged_in_user_id' in request.COOKIES:
                    if 'unique_guest_uuid' in request.COOKIES:
                        work_data['unique_guest_uuid'] = request.COOKIES['unique_guest_uuid']
                    if 'logged_in_user_id' in request.COOKIES:
                        work_data['logged_in_user_id'] = request.COOKIES['logged_in_user_id']

        if request.path in ['/v1/tokenRefresh', '/v1/logout'] and 'token' in request.COOKIES:
            if not work_data:
                try:
                    work_data = json.loads(request.body)
                except json.decoder.JSONDecodeError:
                    work_data = {}
            work_data['token'] = request.COOKIES['token']
            work_data['ip'] = str(ip.id)
            change = True

        if change:
            request._body = json.dumps(work_data).encode('utf-8')

        return None
