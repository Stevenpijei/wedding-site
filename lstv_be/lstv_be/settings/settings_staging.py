"""
staging settings override
"""

# SECURITY WARNING: don't run with debug turned on in production!
import os.path
import random
from datetime import timedelta

import dj_database_url

from lstv_be.settings import SECRET_KEY

DEBUG = False

CSRF_COOKIE_HTTPONLY = not DEBUG
CSRF_COOKIE_SAMESITE = 'None'

JWT_AUTH = {
    'JWT_ENCODE_HANDLER':
        'rest_framework_jwt.utils.jwt_encode_payload',
    'JWT_DECODE_HANDLER':
        'rest_framework_jwt.utils.jwt_decode_token',
    'JWT_PAYLOAD_HANDLER':
        'rest_framework_jwt.utils.jwt_create_payload',
    'JWT_PAYLOAD_GET_USERNAME_HANDLER':
        'rest_framework_jwt.utils.jwt_get_username_from_payload_handler',
    'JWT_RESPONSE_PAYLOAD_HANDLER':
        'lstv_be.utils.lstv_jwt_create_response_payload',
    'JWT_PAYLOAD_INCLUDE_USER_ID': True,
    'JWT_SECRET_KEY': SECRET_KEY,
    'JWT_GET_USER_SECRET_KEY': None,
    'JWT_PUBLIC_KEY': None,
    'JWT_PRIVATE_KEY': None,
    'JWT_ALGORITHM': 'HS256',
    'JWT_VERIFY': True,
    'JWT_VERIFY_EXPIRATION': True,
    'JWT_LEEWAY': 0,
    'JWT_EXPIRATION_DELTA': timedelta(days=30),
    'JWT_AUDIENCE': None,
    'JWT_ISSUER': None,
    'JWT_ALLOW_REFRESH': True,
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=90),
    'JWT_AUTH_HEADER_PREFIX': 'Bearer',
    'JWT_AUTH_COOKIE': 'token',
    'JWT_AUTH_COOKIE_SECURE': not DEBUG,
    'JWT_AUTH_COOKIE_SAMESITE': 'None',
    'JWT_IMPERSONATION_COOKIE': None,
    'JWT_DELETE_STALE_BLACKLISTED_TOKENS': True,
}


RELEASE_STAGE = os.environ.get('RELEASE_STAGE', 'development')

ALLOWED_HOSTS = ['*']

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        '500/day': '500/day',
    },
    'NON_FIELD_ERRORS_KEY': None,
    'EXCEPTION_HANDLER': 'lstv_be.utils.custom_exception_handler',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
}

DATABASES = {
    'default': {
        'ENGINE': 'django_db_geventpool.backends.postgresql_psycopg2',
        'NAME': os.environ.get('PGDATABASE', 'lstv2'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', ''),
        'HOST': 'lstv2-staging-instance-1-us-east-2b.cloqzmsbciiq.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False,
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'MAX_CONNS': 10
        }
    },
    'read-replica': {
        'ENGINE': 'django_db_geventpool.backends.postgresql_psycopg2',
        'NAME': os.environ.get('PGDATABASE', 'lstv2'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', ''),
        'HOST': 'lstv2-staging-instance-1.cloqzmsbciiq.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False,
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'MAX_CONNS': 10
        }
    },

}


class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        """
        Reads go to a randomly-chosen replica.
        """
        if RELEASE_STAGE != 'staging-mig':
            return random.choice(['default', 'read-replica'])
        else:
            return 'default'

    def db_for_write(self, model, **hints):
        """
        Writes always go to primary.
        """
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Relations between objects are allowed if both objects are
        in the primary/replica pool.
        """
        db_list = ('default', 'read-replica', 'read-replica-2', 'read-replica-3')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        All non-auth models end up in this pool.
        """
        return True


DATABASE_ROUTERS = ['lstv_be.settings.PrimaryReplicaRouter']

WEB_SERVER_URL = "https://lstvtest.com"
APP_SERVER_URL = "https://app.lstvtest.com"