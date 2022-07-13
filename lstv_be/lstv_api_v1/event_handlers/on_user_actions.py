from lstv_api_v1.models import *
from lstv_api_v1.tasks.tasks import job_stash_user_event
from lstv_api_v1.tasks.user_action_handlers import *


class OnUserAction(object):

    @staticmethod
    def log_user_action(user_event, action, stash=False):

        if user_event.data:
            user_event.data['method'] = user_event.method

        new_user_event = UserEventLog(
            created_at=now(),
            domain=user_event.url,
            action=action,
            unique_guest_uuid=user_event.unique_guest_uuid,
            ip=user_event.ip,
            user=user_event.user,
            data=user_event.data)

        # if no user, but unique_guest_uuid exists, try to complete from the user record

        if not user_event.user and user_event.unique_guest_uuid:
            user_event.user = User.objects.filter(former_unique_guest_uuid=user_event.unique_guest_uuid).first()

        # create the user event
        new_user_event.save()

        if stash:
            job_stash_user_event.delay(user_event.id)

        return new_user_event.id

    def on_logout(self, user_event):
        """
        user logs lut
        :param user_event:
        :return:
        """
        self.log_user_action(user_event, "logged out")

    def on_login(self, user_event):
        """
        user logs in
        :param user_event:
        :return:
        """
        if 'email' in user_event.data:
            user = User.objects.filter(email=user_event.data['email']).first()
            user_event.user = user
        self.log_user_action(user_event, "logged in")

    @staticmethod
    def on_reviews(user_event):
        """
        user adds, edits or removes a review
        :param user_event:
        :return:
        """
        print("on_reviews")

    @staticmethod
    def on_businessproperties(user_event):
        print(user_event.method)
        if user_event.method == 'POST':
            business_id = user_event.result.get('result', {}).get('business_id', None)
            if business_id:
                on_business_created.delay(business_id)

    @staticmethod
    def on_business(user_event):
        business_id = user_event.result.get('result', {}).get('id', None)
        if not business_id:
            business_id = user_event.result.get('result', {}).get('business_id', None)

        element = None
        target_object = None
        elements = user_event.request_path.split('/')[3:]

        if len(elements) > 1:
            element = elements[1]

        if len(elements) > 2:
            target_object = elements[2]

        if business_id:
            on_business_updated.delay(business_id, user_event.method, element, user_event.data, target_object,
                                      user_event.id)

    @staticmethod
    def on_userview(user_event):
        if user_event.method == 'POST':
            on_user_created.delay(user_event.user.id, user_event.id)

    @staticmethod
    def on_userproperties(user_event):
        if user_event.method == 'POST':
            on_user_updated.delay(user_event.user.id, user_event.id)

    def on_video(self, user_event):
        print("modification has been made to a video via the /v1/video")
