from django.core.management.base import BaseCommand

from lstv_api_v1.tasks.tasks import job_alert_cto


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('-s', '--subject', type=str, help='subject of the message')
        parser.add_argument('-f', '--func', type=str, help='function sent from')
        parser.add_argument('-m', '--message', type=str, help='the message')

    def handle(self, *args, **options):
        message = options['message']
        the_func = options['func']
        subject = options['subject']

        job_alert_cto.delay(subject, the_func, message)


