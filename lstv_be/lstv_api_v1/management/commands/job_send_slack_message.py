from django.core.management.base import BaseCommand

from lstv_api_v1.tasks.tasks import send_slack_message_or_action


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('-m', '--msg', type=str, help='message to be sent to isaac2-grapevine slack channel')

    def handle(self, *args, **options):
        msg = options['msg']
        send_slack_message_or_action(channel="#isaac2-grapevine",
                                     blocks=[{"type": "section", "text": {"type": "mrkdwn", "text": msg}}])
