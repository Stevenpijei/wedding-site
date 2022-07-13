from time import time
from rest_framework.response import Response
from django.conf import settings

from lstv_api_v1.globals import COOKIE_MAX_AGE_LOGGED_IN_USER
from lstv_api_v2.views.globals import COOKIE_MAX_AGE_TOKEN, API_CACHE_TTL_STANDARD


def response(success, http_code, result, errors,  **kwargs):
    response_obj = {'success': success,
                    'timestamp': kwargs.get('timestamp', int(time())),
                    }
    if 'scope' in kwargs:
        response_obj['scope'] = kwargs['scope']

    if success:
        response_obj['result'] = result
    if errors:
        response_obj['errors'] = errors

    response = Response(response_obj,
                        status=http_code)

    if 'user' in kwargs and 'token' in kwargs:
        response.set_cookie(
            'token',
            kwargs['token'],
            httponly=True,
            max_age=COOKIE_MAX_AGE_TOKEN,
            secure=not settings.DEBUG,
            samesite="Lax"
        )
        response.set_cookie(
            'logged_in_user_id',
            str(kwargs['user'].id),
            httponly=True,
            max_age=COOKIE_MAX_AGE_LOGGED_IN_USER,
            secure=not settings.DEBUG,
            samesite="Lax"
        )

    if 'delete_cookies' in kwargs:
        for cookie in kwargs['delete_cookies']:
            response.delete_cookie(
                cookie,
                path=settings.SESSION_COOKIE_PATH,
                domain=settings.SESSION_COOKIE_DOMAIN,
                samesite="Lax"
            )

    response["Cache-Control"] = f"max-age={kwargs.get('ttl', API_CACHE_TTL_STANDARD)}"
    return response


def success(http_code, result,  **kwargs):
    return response(True, http_code, result, None,  **kwargs)


def failed(http_code, error_message, **kwargs):
    errors = []
    # multiple errors in a list
    if type(error_message) == list:
        for err in error_message:

            if type(err) == dict:

                for field in err.keys():
                    errors.append({
                        "field": field,
                        "message": err[field]
                    })
            else:
                errors.append(err)
    else:
        # single error
        if type(error_message) == dict:
            for field in error_message.keys():
                errors.append({
                    "field": field,
                    "message": error_message[field]
                })
        else:
            errors = [error_message]
    return response(False, http_code, None, errors, **kwargs)

