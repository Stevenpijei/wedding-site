import hashlib
import requests
import json
from django.conf import settings
from lstv_api_v1.utils.utils import notify_emergency, requires_ready
from lstv_api_v1.models import ContentModelSource, UserTypeEnum


def extract_location(location):
    components = location.get('components')
    state = ''
    country = ''
    for element in components:
        if 'administrative_area_level_1' in element['types']:
            state = element['long_name']
        if 'country' in element['types']:
            country = element['long_name']
    return state, country


class Mailchimp:
    # used as class var to cache tag id
    segment_id = None

    def __init__(self):
        self.list_id = settings.MAILCHIMP_AUDIENCE_ID

        self.ready = False
        has_settings = settings.MAILCHIMP_API_TOKEN and settings.MAILCHIMP_AUDIENCE_ID
        if has_settings:
            self.ready = True
        elif settings.RELEASE_STAGE in ['production', 'production-mig']:
            raise Exception(
                "MAILCHIMP_API_TOKEN AND MAILCHIMP_AUDIENCE_ID must be defined env vars"
            )

    def call_api(self, endpoint, method, querystring = {}, payload = None):
        server = settings.MAILCHIMP_API_TOKEN.split("-")[1]
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {settings.MAILCHIMP_API_TOKEN}"
        }
        response = requests.request(
            method,
            f"https://{server}.api.mailchimp.com/3.0{endpoint}",
            data=json.dumps(payload) if payload else None,
            headers=headers,
            params=querystring
        )
        if response.status_code >= 300:
            notify_emergency(f"error response from mailchimp endpoint {endpoint}: {response.text}")
            raise Exception(f"error response from mailchimp endpoint {endpoint}: {response.text}")
        if response.status_code == 204:
            return True
        return response.json()

    def extract_merge_fields(self, user):
        user_type = ""
        if user.user_type in [UserTypeEnum.consumer, UserTypeEnum.newlywed, UserTypeEnum.soonlywed]:
            user_type = "Consumer"
        elif user.user_type in [UserTypeEnum.business_team_member, UserTypeEnum.business_team_member_onboarding]:
            user_type = "Filmmaker" if "Videographer" in user.team_users.values_list("business__roles__name", flat=True) else "Vendor"

        merge_fields = {
            "EMAIL": user.email,
            "FNAME": user.first_name,
            "LNAME": user.last_name,
            # user_type
            "MMERGE17": user_type,
            # acquisition source
            "MMERGE29": "website-signup",
            # created_at
            "MMERGE30": user.created_at.strftime("%Y-%m-%d"),
        }

        profile = user.get_property("prop_domain_profile")
        if profile and "wedding_date" in profile:
            merge_fields["MMERGE5"] = profile["wedding_date"]
        if profile and "wedding_location" in profile:
            state, country = extract_location(profile["wedding_location"])
            if country == 'United States':
                merge_fields['MMERGE19'] = state
            else:
                merge_fields['MMERGE18'] = country

        return merge_fields

    @requires_ready
    def send_user(self, user):
        merge_fields = self.extract_merge_fields(user)
        querystring = {"skip_merge_validation": True}
        payload = {
            "email_address": user.email,
            "status_if_new": "subscribed",
            "email_type": "html",
            "merge_fields": merge_fields,
        }
        subscriber_hash = user.get_property("mailchimp_hash")
        if not subscriber_hash:
            subscriber_hash = hashlib.md5(user.email.encode("utf-8")).hexdigest()
        response = self.call_api(
            f"/lists/{self.list_id}/members/{subscriber_hash}",
            "PUT",
            querystring,
            payload
        )
        user.set_property("mailchimp_hash", subscriber_hash)

    @requires_ready
    def list_fields(self):
        return self.call_api(
            f"/lists/{self.list_id}/merge-fields",
            "GET",
            {"count": 1000}
        )

    @requires_ready
    def find_list_id(self, list_name):
        response = self.call_api(
            f"/lists/{self.list_id}/segments",
            "GET",
            {"type": "static", "fields": "segments.id,segments.name", "count": 1000}
        )
        it = (m for m in response["segments"] if m["name"] == segment_name)
        match = next(it, None)
        if not match:
            raise Exception(f"Mailchimp list {segment_name} not found")
        Mailchimp.segment_id = match["id"]

    @requires_ready
    def add_user_to_list(self, user):
        querystring = {"skip_duplicate_check": True}
        payload = { "members_to_add": [user.email] }
        self.call_api(
            f"/lists/{self.list_id}/segments/{self.segment_id}",
            "POST",
            querystring,
            payload
        )
