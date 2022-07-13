"""
staging settings override
"""

# SECURITY WARNING: don't run with debug turned on in production!
import os.path
from datetime import timedelta

from lstv_be.settings import SECRET_KEY

DEBUG = False

SRF_COOKIE_HTTPONLY = not DEBUG
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
    'JWT_AUTH_COOKIE_SAMESITE': 'Lax',
    'JWT_IMPERSONATION_COOKIE': None,
    'JWT_DELETE_STALE_BLACKLISTED_TOKENS': True,
}

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django_db_geventpool.backends.postgresql_psycopg2',
        'NAME': os.environ.get('PGDATABASE', 'lstv2'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', ''),
        'HOST': 'lstv-prod.cluster-cloqzmsbciiq.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False,
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'MAX_CONNS': 7
        }
    },
    'read-replicas': {
        'ENGINE': 'django_db_geventpool.backends.postgresql_psycopg2',
        'NAME': os.environ.get('PGDATABASE', 'lstv2'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', ''),
        'HOST': 'lstv-prod.cluster-ro-cloqzmsbciiq.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False,
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'MAX_CONNS': 7
        }
    },
    'migrate': {
        'ENGINE': 'django_db_geventpool.backends.postgresql_psycopg2',
        'NAME': os.environ.get('lstv1', 'lstv1'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', ''),
        'HOST': 'lstv-prod.cluster-cloqzmsbciiq.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False,
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'MAX_CONNS': 7
        }
    },
}



class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        """
        Reads go to a randomly-chosen replica.
        """
        return 'read-replicas'

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
        db_list = ('default', 'read-replicas')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        All non-auth models end up in this pool.
        """
        return True


DATABASE_ROUTERS = ['lstv_be.settings.PrimaryReplicaRouter']

WEB_SERVER_URL = "https://lovestoriestv.com"
APP_SERVER_URL = 'https://app.lovestoriestv.com'

# CDN/S3

DEFAULT_CDN = "https://cdn.lovestoriestv.com"
DEFAULT_CDN_DISTRIBUTION_ID = 'E26CDKBO6YZ9NN'
DEFAULT_CDN_BUCKET_URL = "https://lstv-cdn.s3.us-east-2.amazonaws.com"
DEFAULT_CDN_BUCKET_NAME = "lstv-cdn"
DEFAULT_APP_STATIC_BUCKET_NAME = "lovestoriestv.com"