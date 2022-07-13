from dataclasses import dataclass
from django.test import TestCase
import json
import uuid

from lstv_api_v1.models import Message
from lstv_api_v1.views.webhooks_views import sendgrid_hook

def make_webhook_body(message_id):
    return {
        'array': [
            {
                'email': 'example@test.com',
                'timestamp': 1618580396,
                'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
                'event': 'delivered',
                'category': ['cat facts'],
                'sg_event_id': 'IHOZoSgPDR9l3MQvaK6-cg==',
                'sg_message_id': message_id,
                'response': '250 OK'
            },
            {
                'email': 'example@test.com',
                'timestamp': 1618580396,
                'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
                'event': 'open',
                'category': ['cat facts'],
                'sg_event_id': 'S9BWK3s-VEqm6rbzoQheFA==',
                'sg_message_id': message_id,
                'useragent': 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
                'ip': '255.255.255.255'
            },
            {
                'email': 'example@test.com',
                'timestamp': 1618580396,
                'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
                'event': 'click',
                'category': ['cat facts'],
                'sg_event_id': 'c06UQlZpALmcz7I1-TZNSw==',
                'sg_message_id': message_id,
                'useragent': 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
                'ip': '255.255.255.255',
                'url': 'http://www.sendgrid.com/'
            },
            {
                'email': 'example@test.com',
                'timestamp': 1618580396,
                'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
                'event': 'spamreport',
                'category': ['cat facts'],
                'sg_event_id': '83ofnNpb5P7I4D5FDGDEbQ==',
                'sg_message_id': message_id
            },
            {
                'email': 'example@test.com',
                'timestamp': 1618580396,
                'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
                'event': 'unsubscribe',
                'category': ['cat facts'],
                'sg_event_id': 'V4yzWl6lH9bEhlW-KETUQw==',
                'sg_message_id': message_id
            },
        ],
        'ip': '096c683a-f920-408e-9c16-e222aacf6f04'
    }


@dataclass
class FakeRequest:
    method: str
    body: bytes


class SendgridWebhookTests(TestCase):
    def setUp(self):
        self.message = Message.objects.create(
            thread_id=uuid.uuid4(),
            processor_message_id=str(uuid.uuid4()),
            delivered_at=None,
            opened_at=None,
            clicked_at=None,
            spam_at=None,
            unsubscribed_at=None,
        )

    def test_timestamps(self):
        webhook_body = make_webhook_body(self.message.processor_message_id)
        request = FakeRequest('POST', json.dumps(webhook_body).encode('utf-8'))
        sendgrid_hook(request)
        self.message.refresh_from_db()
        self.assertIsNotNone(self.message.delivered_at)
        self.assertIsNotNone(self.message.opened_at)
        self.assertIsNotNone(self.message.clicked_at)
        self.assertIsNotNone(self.message.spam_at)
        self.assertIsNotNone(self.message.unsubscribed_at)
