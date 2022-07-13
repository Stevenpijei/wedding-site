import requests
import json
from django.conf import settings
from lstv_api_v1.models import BusinessLocationType, ContentModelState, BusinessTeamMember
from lstv_api_v1.utils.utils import notify_emergency, requires_ready

class Hubspot:
    def __init__(self):
        self.ready = bool(settings.HUBSPOT_API_KEY)
        if not self.ready:
            if settings.RELEASE_STAGE in ['production', 'production-mig']:
                raise Exception("HUBSPOT_API_KEY must be a defined env var")
            print("HUBSPOT_API_KEY not defined, not sending to hubspot")

    def call_api(self, endpoint, method, payload):
        querystring = { "hapikey":settings.HUBSPOT_API_KEY}
        headers = {
            'accept': "application/json",
            'content-type': "application/json"
        }
        response = requests.request(
            method,
            f"https://api.hubapi.com/{endpoint}",
            data=json.dumps(payload),
            headers=headers,
            params=querystring
        )
        if response.status_code >= 300:
            error_msg = f"error response from hubspot endpoint {endpoint}: {response.status_code} {response.text}"
            name = payload.get('properties', {}).get('name')
            if name:
                error_msg += f" (for name {name})"
            email = payload.get('properties', {}).get('email')
            if email:
                error_msg += f" (for email {email})"
            notify_emergency(error_msg)
            raise Exception(error_msg)
        if response.status_code == 204:
            return True
        return response.json()

    @requires_ready
    def find_company_by_name(self, name):
        payload = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "name",
                    "operator": "EQ",
                    "value": name,
                }]
            }]
        }
        response = self.call_api(
            "crm/v3/objects/companies/search", "POST", payload
        )
        if response['total'] == 0:
            return None
        return response['results'][0]

    @requires_ready
    def ensure_business(self, business):
        if not business.properties.filter(key='hubspot_id').exists():
            self.update_business(business)

    @requires_ready
    def update_business(self, business):
        details = {
            "name": business.name,
            "description": business.description,
            "domain": business.website,
            "business_page": f"https://lovestoriestv.com/business/{business.slug}",
            "vendor_category_type": ", ".join(business.roles.values_list("name", flat=True)),
            "weight": business.weight_videos,
        }
        phone = business.business_phones.first()
        if phone:
            details["phone"] = phone.number
        location = business.business_locations.filter(
            businesslocation__location_type=BusinessLocationType.main,
        ).first()
        if location:
            details["address 1"] = location.address1
            details["address 2"] = location.address2
            details["city"] = location.place.name if location.place else location.legacy_city
            if location.state_province:
                details["state"] = location.state_province.code_name()
            details["zip"] = location.zipcode

        if not business.get_property('hubspot_id'):
            in_hubspot = self.find_company_by_name(business.name)
            if in_hubspot:
                business.set_property('hubspot_id', in_hubspot['id'])

        company_hubspot_id = business.get_property('hubspot_id')
        if not company_hubspot_id:
            response = self.call_api(
                "crm/v3/objects/companies", "POST", {"properties": details}
            )
            company_hubspot_id = response['id']
            business.set_property("hubspot_id", company_hubspot_id)
        else:
            url = f"crm/v3/objects/companies/{company_hubspot_id}"
            response = self.call_api(url, "PATCH", {"properties": details})

    @requires_ready
    def update_team_members(self, business):
        team_members = BusinessTeamMember.objects.filter(business=business).select_related('user')
        for team_member in team_members:
            self.update_team_member(team_member)

    @requires_ready
    def ensure_team_member(self, team_member):
        if not team_member.user.get_property("hubspot_id"):
            self.update_team_member(team_member)

    @requires_ready
    def find_contact_by_email(self, email):
        payload = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "email",
                    "operator": "EQ",
                    "value": email,
                }]
            }]
        }
        response = self.call_api(
            "crm/v3/objects/contacts/search", "POST", payload
        )
        if response['total'] == 0:
            return None
        return response['results'][0]
    
    @requires_ready
    def update_team_member(self, team_member):
        business = team_member.business
        self.ensure_business(business)
        company_hubspot_id = team_member.business.get_property("hubspot_id")

        user = team_member.user
        details = {
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "company": business.name,
            "business_page_channel_link": f"https://lovestoriestv.com/business/{business.slug}",
            "video_weight": business.weight_videos,
            "vendor_category_type": ", ".join(business.roles.values_list("name", flat=True)),
            "website": business.website,
        }
        location = business.business_locations.filter(
            businesslocation__location_type=BusinessLocationType.main,
        ).first()
        if location:
            if location.place:
                details["city"] = location.place.name
            elif location.legacy_city:
                details["city"] = location.legacy_city
            if location.state_province:
                details["state"] = location.state_province.name
            if location.country:
                details["country"] = location.country.name
        if user.mobile_phone:
            details["phone number"] = user.mobile_phone.number

        contact_hubspot_id = user.get_property("hubspot_id")
        if not contact_hubspot_id:
            in_hubspot = self.find_contact_by_email(user.email)
            if in_hubspot:
                contact_hubspot_id = in_hubspot['id']
                user.set_property('hubspot_id', contact_hubspot_id)

        if not contact_hubspot_id:
            response = self.call_api(
                "crm/v3/objects/contacts", "POST", {"properties": details}
            )
            contact_hubspot_id = response['id']
            user.set_property("hubspot_id", contact_hubspot_id)

            self.associate_contact_and_company(contact_hubspot_id, company_hubspot_id)
        else:
            url = f"crm/v3/objects/contacts/{contact_hubspot_id}"
            response = self.call_api(url, "PATCH", {"properties": details})
            self.associate_contact_and_company(contact_hubspot_id, company_hubspot_id)

    @requires_ready
    def associate_contact_and_company(self, contact_id, company_id):
        # associate company and contact
        self.call_api(
            "crm-associations/v1/associations/create-batch",
            "PUT",
            [
                {
                    "fromObjectId": contact_id,
                    "toObjectId": company_id,
                    "category": "HUBSPOT_DEFINED",
                    "definitionId": 1
                },
                {
                    "fromObjectId": company_id,
                    "toObjectId": contact_id,
                    "category": "HUBSPOT_DEFINED",
                    "definitionId": 2
                },
            ]
        )
