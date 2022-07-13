from datetime import datetime, timezone

from django.test import TestCase

from lstv_api_v1.models import User, UserTypeEnum, Properties
from lstv_api_v1.utils.mailchimp import Mailchimp


detroit = {
    "position": { "lat": "42.331427", "long": "-83.0457538" },
    "formatted": "Detroit, MI, USA",
    "components": [
        {
            "types": ["locality", "political"],
            "long_name": "Detroit",
            "short_name": "Detroit"
        },
        {
            "types": ["administrative_area_level_2", "political"],
            "long_name": "Wayne County", 
            "short_name": "Wayne County"
        },
        {
            "types": ["administrative_area_level_1", "political"],
            "long_name": "Michigan",
            "short_name": "MI"
        },
        {
            "types": ["country", "political"],
            "long_name": "United States",
            "short_name": "US"
        }
    ]
}

bon_echo = {
    "position": {"lat":"44.899968","long":"-77.203733"},
    "formatted": "Bon Echo, ON K0H 1K0, Canada",
    "components": [
        {
            "types": ["locality", "political"],
            "long_name": "Bon Echo",
            "short_name": "Bon Echo"
        },
        {
            "types": ["administrative_area_level_3", "political"],
            "long_name": "North Frontenac",
            "short_name": "North Frontenac"
        },
        {
            "types": ["administrative_area_level_2", "political"],
            "long_name": "Frontenac County",
            "short_name": "Frontenac County"
        },
        {
            "types": ["administrative_area_level_1", "political"],
            "long_name": "Ontario",
            "short_name": "ON"
        },
        {
            "types": ["country", "political"],
            "long_name": "Canada",
            "short_name": "CA"
        },
        {
            "types": ["postal_code"],
            "long_name": "K0H 1K0",
            "short_name": "K0H 1K0"
        }
    ]
}

class MailchimpTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            user_type=UserTypeEnum.soonlywed,
            first_name="Mickey",
            last_name="Mouse",
            email="mickeymouse@example.com",
        )
        self.mailchimp = Mailchimp()

    def test_merge_fields_us_wedding(self):
        self.user.properties.add(Properties.objects.create(
            key="prop_domain_profile",
            value_json={
                "wedding_date": "3-Apr-2021",
                "wedding_location": detroit,
            }
        ))
        merge_fields = self.mailchimp.extract_merge_fields(self.user)
        created_at = datetime.utcnow().strftime("%Y-%m-%d")
        self.assertEqual({
            "EMAIL": "mickeymouse@example.com",
            "FNAME": "Mickey",
            "LNAME": "Mouse",
            "MERGE17": "Engaged Bride or Groom",
            "MERGE29": "website-signup",
            "MERGE30": created_at,
            "MERGE5": "3-Apr-2021",
            "MERGE19": "Michigan",
        }, merge_fields)

    def test_merge_fields_foreign_wedding(self):
        self.user.properties.add(Properties.objects.create(
            key="prop_domain_profile",
            value_json={
                "wedding_date": "3-Apr-2021",
                "wedding_location": bon_echo,
            }
        ))
        merge_fields = self.mailchimp.extract_merge_fields(self.user)
        created_at = datetime.utcnow().strftime("%Y-%m-%d")
        self.assertEqual({
            "EMAIL": "mickeymouse@example.com",
            "FNAME": "Mickey",
            "LNAME": "Mouse",
            "MERGE17": "Engaged Bride or Groom",
            "MERGE29": "website-signup",
            "MERGE30": created_at,
            "MERGE5": "3-Apr-2021",
            "MERGE18": "Canada",
        }, merge_fields)

