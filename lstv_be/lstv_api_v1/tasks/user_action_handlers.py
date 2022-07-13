from __future__ import absolute_import, unicode_literals

from lstv_api_v1.tasks.tasks import job_alert_cto
from lstv_api_v1.utils.utils import verify_resource_url, verify_url_with_key_phrase, ip_to_geo_location, \
    complete_address_from_geo_db, stash_element, get_location_for_ip, report_issue, notify_emergency
from lstv_be.celery_app import app
from lstv_api_v1.utils.legacy_model_utils import *
from django.db.models import Q
import sendgrid
import os
from django.db.models import F
from lstv_api_v1.utils.hubspot import Hubspot
from uuid import UUID
from lstv_api_v1.utils.mailchimp import Mailchimp


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_user_reviews(user_event_log_id):
    print("on_user_review")


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_user_like(user_event_log_id):
    print("on_user_like")


#   ______            _ _      _ _     ______               _
#  |  ____|          | (_)    (_) |   |  ____|             | |
#  | |__  __  ___ __ | |_  ___ _| |_  | |____   _____ _ __ | |_ ___
#  |  __| \ \/ / '_ \| | |/ __| | __| |  __\ \ / / _ \ '_ \| __/ __|
#  | |____ >  <| |_) | | | (__| | |_  | |___\ V /  __/ | | | |_\__ \
#  |______/_/\_\ .__/|_|_|\___|_|\__| |______\_/ \___|_| |_|\__|___/
#              | |
#              |_|


# New business created

@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_business_created(self, business_id):
    try:
        new_business = Business.objects.using('default').get(pk=business_id)
        # handle...
        print(f"new business: {new_business.name}")
        hubspot = Hubspot()
        hubspot.update_business(new_business)
        hubspot.update_team_members(new_business)

    except Business.DoesNotExist:
        notify_emergency(f"on_business_created cannot load business id {business_id}")


# Existing business updated

@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_business_updated(self, business_id, action, element, data, target_object, event_id):
    try:
        updated_business = Business.objects_all_states.using('default').get(pk=business_id)

        # handle...
        print(f"updated business: {updated_business.name}")
        print(data)
        print(action)
        print(element)
        print(target_object)
        hubspot = Hubspot()
        if element is None:
            hubspot.update_business(updated_business)
        if element == "teamMembers":
            uuid = UUID(target_object)
            team_member = updated_business.team_members.filter(user__id=uuid).first()
            if team_member:
                hubspot.update_team_member(team_member)

    except Business.DoesNotExist:
        notify_emergency(
            f"on_business_updated cannot load business id {business_id} in response to req. log id {event_id}")


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_user_created(self, user_id, event_id):
    try:
        user = User.objects.using('default').get(pk=user_id)
        Mailchimp().send_user(user)
    except User.DoesNotExist:
        notify_emergency(
            f"on_user_updated cannot load user id {user_id} in response to req. log id {event_id}")


@app.task(bind=True, retry_kwargs={'max_retries': 10, 'countdown': 5})
def on_user_updated(self, user_id, event_id):
    try:
        user = User.objects.using('default').get(pk=user_id)
        Mailchimp().send_user(user)
    except User.DoesNotExist:
        notify_emergency(
            f"on_user_updated cannot load user id {user_id} in response to req. log id {event_id}")
