from .settings import *
import os

RELEASE_STAGE = os.environ.get('RELEASE_STAGE', 'development')

if RELEASE_STAGE == 'staging' or RELEASE_STAGE == 'staging-mig':
    from .settings_staging import *

if RELEASE_STAGE == 'production' or RELEASE_STAGE == 'production-mig':
    from .settings_production import *

print("---------------------------------------------------")
print(f"*** branch:                        : {BRANCH}")
print(f"*** main DB                        : {DATABASES['default']['NAME']}")
print(f"*** version/build                  : {RELEASE_STAGE} ({VERSION})")
print(f"*** default CDN                    : {DEFAULT_CDN}")
print(f"*** default CDN Distro ID          : {DEFAULT_CDN_DISTRIBUTION_ID}")
print(f"*** default CDN bucket url         : {DEFAULT_CDN_BUCKET_URL}")
print(f"*** default CDN bucket name        : {DEFAULT_CDN_BUCKET_NAME}")
print(f"*** default static app bucket name : {DEFAULT_APP_STATIC_BUCKET_NAME}")
print("---------------------------------------------------")