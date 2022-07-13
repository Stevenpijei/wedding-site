from django.core.management.base import BaseCommand
from lstv_api_v1.models import User, UserTypeEnum
from lstv_api_v1.utils.mailchimp import Mailchimp

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='send user with specified email'
        )
        parser.add_argument(
            '--resend',
            action='store_true',
            help='limit to sending users who have already been sent'
        )
        parser.add_argument(
            '--user-type',
            help='limit sending to a specific user type'
        )
        parser.add_argument(
            '--one',
            action='store_true',
            help='resend one random user who has already been sent'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='do not send users to mailchimp'
        )

    def handle(self, *args, **options):
        user_type = options.get('user_type')
        if user_type and user_type not in ('vendor', 'filmmaker', 'consumer'):
            print("user-type must be vendor, filmmaker, or consumer")
            return

        consumer_types = [UserTypeEnum.consumer, UserTypeEnum.newlywed, UserTypeEnum.soonlywed]
        business_types = [UserTypeEnum.business_team_member, UserTypeEnum.business_team_member_onboarding]

        users = User.objects.all()
        if options['email']:
            users = users.filter(email=options['email'])
        if user_type == 'consumer':
            users = users.filter(user_type__in=consumer_types)
        elif user_type == 'filmmaker':
            users = users.filter(user_type__in=business_types).filter(team_users__business__roles__name='Videographer')
        elif user_type == 'vendor':
            users = users.filter(user_type__in=business_types).exclude(team_users__business__roles__name='Videographer')
        if options['resend']:
            users = users.filter(properties__key='mailchimp_hash')

        if users.count() == 0:
            print('no eligable users found')
            return

        if options['one']:
            users = [users.first()]
        else:
            print(f"sending {users.count()} users")
        
        if options['dry_run']:
            print("dry-run, not sending")
            return

        mc = Mailchimp()
        for user in users:
            mc.send_user(user)
            print(f"sent {user.email}")
