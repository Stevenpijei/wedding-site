from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from bugsnag.celery import connect_failure_handler
from bugsnag import django as bugsnag_django
# set the default Django settings module for the 'celery' program.
from lstv_be.settings import BASE_DIR, VERSION, RELEASE_STAGE

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lstv_be.settings')

app = Celery('lstv_be')

# BugSnag

# bugsnag.configure(
#         app_version=VERSION,
#         project_root=BASE_DIR,
#         release_stage=RELEASE_STAGE,
#         notify_release_stages=['staging', 'production', 'development']
# )


# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

bugsnag_django.configure()
connect_failure_handler()

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
