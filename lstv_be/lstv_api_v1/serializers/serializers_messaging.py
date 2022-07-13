from uuid import UUID

from rest_framework import serializers

from lstv_api_v1.globals import PAGE_TYPE_BUSINESS, PAGE_TYPE_VIDEO
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.utils.slack_action_processor import prepare_slack_action
from lstv_api_v1.tasks.tasks import send_slack_message_or_action, job_alert_cto
from lstv_api_v1.utils.utils import get_bride_groom_email_from_post_slug, get_sender_name_from_session, \
    get_messaging_thread_id, get_business_email_from_business_record, get_page_type_from_url, \
    get_bride_groom_names_from_post_slug, get_short_date_from_video_id, get_human_readable_google_location, \
    get_verbose_date_format, notify_grapevine
from lstv_api_v1.models import *
from lstv_api_v1.views.utils.view_utils import user_business_inquiry_record, past_date_label
from lstv_be.settings import SLACK_CHANNEL_BUSINESS_INQUIRIES, ISAAC_CONTEXT_BUSINESS_INQUIRY, WEB_SERVER_URL, \
    SLACK_CHANNEL_BUSINESS_INQUIRIES_PRE_APPROVED, ISAAC_CONTEXT_BUSINESS_INQUIRY_PRE_APPROVED, \
    SLACK_CHANNEL_BUSINESS_INQUIRIES_TEST
from django.conf import settings


class InPageMessagingSerializer(LSTVBaseSerializer):
    element_type = serializers.CharField()
    element_id = serializers.UUIDField()
    content = serializers.CharField()
    parent_message_id = serializers.UUIDField(required=False)
    message_id = serializers.UUIDField(required=False)

    parent_message_thread_id = None
    parent_element = None

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or DELETE we do not require most of the mandatory fields.
        """
        fields = super(InPageMessagingSerializer, self).get_fields()

        fields['element_type'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        fields['element_id'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        fields['content'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        fields['message_id'].required = self.request and getattr(self.request, 'method', None) in ['PATCH', 'DELETE']

        return fields

    def create(self, validated_data):
        new_message = Message(
            message_context=self.request_context,
            thread_id=self.parent_message_thread_id or uuid.uuid4(),
            message_content=validated_data['content'],
            from_user=self.request.user or None,
            parent_message_id=validated_data.get('parent_message_id', None)
        )
        new_message.save()
        self.parent_element.q_and_a.add(new_message)
        return self.append_message([], new_message)

    def update(self, instance, validated_data):
        if 'content' in self.request.data:
            instance.message_content = validated_data.get('content', None)
        instance.edited_at = datetime.now().replace(tzinfo=timezone.utc)
        instance.save()
        return instance

    @staticmethod
    def append_message(target, message):
        m = {
            "posted_at_label": past_date_label(message.created_at),
            "posted_at": int(message.created_at.timestamp()),
            "edited_at": int(message.updated_at.timestamp()),
            "author": message.from_user.get_full_name_or_email(),
            "author_id": message.from_user.id,
            "author_thumbnail_url": message.from_user.profile_image.get_serve_url() if message.from_user.profile_image else None,
            "message_id": message.id,
            "thread_id": message.thread_id,
            "content": message.message_content,
            "likes": message.likes,
            "parent_message_id": message.parent_message_id,
            "replies": []
        }
        target.append(m)
        return m

    def to_representation(self, obj):
        rc = []

        for message in obj.all().order_by('created_at'):
            if message.parent_message_id is None:
                self.append_message(rc, message)

                if self.request_context and self.request_context in [MessageContextTypeEnum.business_faq,
                                                                     MessageContextTypeEnum.business_team_faq]:
                    del rc[-1]['author']
                    del rc[-1]['author_id']
                    del rc[-1]['author_thumbnail_url']
                    msg_id = rc[-1]['message_id']
                    del rc[-1]['message_id']
                    if self.request_context == MessageContextTypeEnum.business_faq:
                        rc[-1]['business_faq_id'] = msg_id
                    if self.request_context == MessageContextTypeEnum.business_team_faq:
                        rc[-1]['business_public_team_faq_id'] = msg_id
                    del rc[-1]['thread_id']
                    del rc[-1]['parent_message_id']
                    del rc[-1]['replies']
                    del rc[-1]['likes']
            else:
                # thread with parent
                for msg in rc:
                    if msg['message_id'] == message.parent_message_id:
                        self.append_message(msg['replies'], message)
                    if len(msg['replies']) > 0:
                        for reply in msg['replies']:
                            if reply['message_id'] == message.parent_message_id:
                                self.append_message(msg['replies'], message)

        return rc

    def validate(self, data):
        if self.request.method == 'POST':
            if 'element_type' in data and 'element_id' in data:
                if data['element_type'] == 'video':
                    self.parent_element = Video.objects.filter(id=data['element_id']).first()
                    if not self.parent_element:
                        raise serializers.ValidationError("element_id does not match any video object")

            if data['element_type'] == 'business':
                self.parent_element = Business.objects.filter(id=data['element_id']).first()
                if not self.parent_element:
                    raise serializers.ValidationError("element_id does not match any business object")

        if 'parent_message_id' in data:
            try:
                m = Message.objects.get(pk=data['parent_message_id'])
                self.parent_message_thread_id = m.thread_id
                if m.message_context != self.request_context:
                    raise serializers.ValidationError(
                        f"parent_message_id is found does not match any message with {str(self.request_context)} "
                        f"message_context. Its context is {m.message_context}")
            except Message.DoesNotExist:
                raise serializers.ValidationError("parent_message_id does not match any message")
        return data

    @staticmethod
    def validate_element_type(value):
        """
        element type is the high level lstv2 entity this is in relation to.
        """
        if value not in ['video', 'article', 'business']:
            raise serializers.ValidationError("invalid element_type. allowable values: video, article, business")
        return value

    @staticmethod
    def validate_content(value):
        """
        element type is the high level lstv2 entity this is in relation to.
        """
        if len(value) < 2:
            raise serializers.ValidationError("content must be at least two characters (enough for 'ok' :-) )")
        return value


class ContactBusinessSerializer(LSTVBaseSerializer):
    name = serializers.CharField(max_length=150)
    message = serializers.CharField(allow_blank=True, required=False)
    email = serializers.EmailField()
    wedding_date = serializers.CharField(max_length=50, required=False)
    location = serializers.JSONField(required=False)
    business_slug = serializers.CharField(max_length=150)
    business_role = serializers.CharField(max_length=100)
    from_page = serializers.CharField(max_length=150)
    video_id = serializers.CharField(max_length=150, required=False)
    business_name = serializers.CharField(max_length=150)

    @staticmethod
    def validate_name(value):
        if not len(value.strip()) >= 1:
            raise serializers.ValidationError("must have at least 1 character")
        return value

    def create(self, validated_data):
        # do we have an email for the bride/groom?
        user_to, to_email = get_business_email_from_business_record(validated_data['business_slug'])

        no_email_notification = None
        # route to booking

        bcc_list = ['linnea@lovestoriestv.com', 'ronen@lovestoriestv.com', 'rachel@lovestoriestv.com',
                    'christina@lovestoriestv.com', 'alicia@lovestoriestv.com']
        if not user_to and not to_email:
            to_email = "bookings@lovestoriestv.com"
            no_email_notification = "(no business email) "
        else:
            bcc_list.append('bookings@lovestoriestv.com')

        source_page_type = get_page_type_from_url(validated_data['from_page'])

        couple_names = None
        source_page_desc = ''
        if source_page_type == PAGE_TYPE_VIDEO:
            couple_names = get_bride_groom_names_from_post_slug(validated_data['from_page'])
            short_wedding_date = get_short_date_from_video_id(validated_data['video_id'])
            video_type = "wedding video"
            source_page_desc = f"watched the{short_wedding_date}{video_type} of {couple_names}"
        elif source_page_type == PAGE_TYPE_BUSINESS:
            source_page_desc = f"visited {validated_data['business_name']} channel"
        else:
            source_page_desc = f"visited a page where {validated_data['business']} is mentioned"

        if to_email:

            # get name of sender
            name_of_sender, user_from = get_sender_name_from_session(self.request)
            if not name_of_sender:
                name_of_sender = validated_data['name']

            # get or create the appropriate messaging thread to put the message on...

            thread_id = get_messaging_thread_id(user_from, user_to)
            new_message_id = uuid.uuid4()
            message = Message(
                id=new_message_id,
                thread_id=thread_id,
                to_user=user_to if user_to else None,
                bcc=bcc_list,
                deliver_via_email=True,
                message_content=validated_data['message'] if validated_data.get('message', None) else "",
                delivery_email=user_to.email if user_to else to_email,
                from_user=user_from,
                message_context=MessageContextTypeEnum.business_inquiry,
                processor_data={
                    "to_name": validated_data['business_name'],
                    "desc_of_inquiry_page": source_page_desc,
                    "sent_to": user_to.email if user_to else to_email,
                    "from_name": f"{name_of_sender.title()}",
                    "business_page_url": f"{settings.WEB_SERVER_URL}/business/{validated_data['business_slug']}",
                    "sent_from": settings.WEB_SERVER_URL + validated_data['from_page'],
                    "message_meta": {"Sent from": "field_sent_from"},
                    "thread_id": str(thread_id),
                    "template_id": "d-cc0f53c9d8eb4dbb89839800be9c248e",
                    "subject": f"{no_email_notification if no_email_notification else ''}"
                               f"You have a new future client inquiry on Love Stories TV",
                    "lstv_email": "info@lovestoriestv.com",
                    "lstv_name": "Love Stories TV Notifications",
                    "opt_out_url": f"{settings.WEB_SERVER_URL}/opt-out/{str(new_message_id)}",
                    "cta_text": "Reply",
                    "from_email": f"{user_from.email if user_from else validated_data['email']}",
                    "cta_url": f"mailto:{user_from.email if user_from else validated_data['email']}",
                    "wedding_location": validated_data['location']['formatted'] if validated_data.get('location',
                                                                                                      None) else "Not Disclosed",
                    "wedding_location_human": get_human_readable_google_location(
                        validated_data['location']) if validated_data.get('location', None) else "Not Disclosed",
                    "wedding_date": get_verbose_date_format(validated_data['wedding_date']) if validated_data.get(
                        'wedding_date', None) else "Not Disclosed",
                    "business_role": validated_data['business_role'],
                    "loc_long": validated_data['location']['position']['long'] if validated_data.get('location',
                                                                                                     None) else "34.48809341121087",
                    "loc_lat": validated_data['location']['position']['lat'] if validated_data.get('location',
                                                                                                   None) else "-40.27142833454293"
                }
            )

            # can we send right away? or are

            approvals, rejections = user_business_inquiry_record(user_from)
            rejection_percent = (rejections / approvals) * 100 if approvals > 0 else 0

            # prepare slack block

            block_def = {
                "context_type": ISAAC_CONTEXT_BUSINESS_INQUIRY,
                "context_id": str(message.id),
                "business_role": validated_data['business_role'],
                "business_name": validated_data['business_name'],
                "sender_name": name_of_sender.title().strip(),
                "from_email": user_from.email.strip() if user_from else validated_data['email'],
                "message_content": message.message_content,
                "business_email": user_to.email if user_to else to_email,
                "wedding_location": get_human_readable_google_location(
                    validated_data['location']) if validated_data.get('location', None) else "Not Disclosed",
                "wedding_date": get_verbose_date_format(validated_data['wedding_date']) if validated_data.get(
                    'wedding_date', None) else "Not Disclosed",
                "sent_from_page": WEB_SERVER_URL + validated_data['from_page'],
                "sent_from_desc": f"{couple_names}'s Wedding Page" if couple_names else f"{validated_data['business_name']}'s Business Page",

                "approvals": approvals,
                "rejections": rejections,
                "state": {
                    "is_spam": False,
                    "is_unrelated": False,
                    "is_inappropriate": False
                }
            }

            if validated_data.get('location', None):
                block_def[
                    "google_map_url"] = f"https://www.google.com/maps/place/{validated_data['location']['formatted'].replace(' ', '+')}"
                block_def[
                    "google_map_image_url"] = f"https://maps.googleapis.com/maps/api/staticmap?zoom=13&size=600x200&maptype=roadmap&markers=color:red%7C{message.processor_data['loc_lat']},{message.processor_data['loc_long']}&key=AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8"
            else:
                block_def[
                    "google_map_url"] = f"https://lovestoriestv.com"
                block_def[
                    "google_map_image_url"] = f"https://lstv-cdn.s3.us-east-2.amazonaws.com/images/site/nothumb.jpg"

            if user_from and approvals >= 5 and rejection_percent < 10:
                message.save()
                message.deliver(inMail=True, email=True, text=False)

                block_def["context_type"] = ISAAC_CONTEXT_BUSINESS_INQUIRY_PRE_APPROVED
                send_slack_message_or_action(
                    context_type=block_def['context_type'],
                    context_id=block_def['context_id'],
                    state_container=block_def['state'],
                    blocks=prepare_slack_action(block_def),
                    channel=SLACK_CHANNEL_BUSINESS_INQUIRIES_PRE_APPROVED if settings.RELEASE_STAGE in ['production',
                                                                                                        'production-mig'] else SLACK_CHANNEL_BUSINESS_INQUIRIES_TEST)

            else:
                message.state = ContentModelState.active_review
                message.state_desc = [f"Inquiry send to {validated_data['business_name']} suspended pending LSTV staff " \
                                      f"approval"]
                message.save()

                send_slack_message_or_action(
                    context_type=block_def['context_type'],
                    context_id=block_def['context_id'],
                    state_container=block_def['state'],
                    blocks=prepare_slack_action(block_def),
                    channel=SLACK_CHANNEL_BUSINESS_INQUIRIES if settings.RELEASE_STAGE in ['production',
                                                                                           'production-mig'] else SLACK_CHANNEL_BUSINESS_INQUIRIES_TEST)

            return True
        else:
            return False

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        return self.super.to_representation(obj)


class ContactBrideGroomSerializer(LSTVBaseSerializer):
    name = serializers.CharField(max_length=150)
    message = serializers.CharField(min_length=20)
    email = serializers.EmailField()
    from_page = serializers.CharField(max_length=150)
    unique_guest_uuid = serializers.UUIDField()

    @staticmethod
    def validate_name(value):
        if not len(value) >= 5:
            raise serializers.ValidationError("must have at least 5 characters")
        return value

    def create(self, validated_data, *args, **kwargs):
        # print(validated_data);
        # do we have an email for the bride/groom?
        to_email, user_to = get_bride_groom_email_from_post_slug(validated_data['from_page'])

        if to_email:

            # get bride/groom names
            couple_names = get_bride_groom_names_from_post_slug(validated_data['from_page'])
            if not couple_names:
                couple_names = "Bride/Groom"

            # get name of sender
            name_of_sender, user_from = get_sender_name_from_session(self.request)
            if not name_of_sender:
                name_of_sender = validated_data['name']

            # get or create the appropriate messaging thread to put the message on...

            thread_id = get_messaging_thread_id(kwargs['user'], user_to)
            new_message_id = uuid.uuid4()

            message = Message(
                id=new_message_id,
                deliver_via_email=True,
                thread_id=thread_id,
                to_user=user_to.email if user_to else None,
                delivery_email=user_to.email if user_to else to_email,
                from_user=kwargs['user'],
                message_content=validated_data['message'],
                message_context=MessageContextTypeEnum.bride_groom_contact,
                processor_data={
                    "to_name": couple_names,
                    "sent_to": user_to.email if user_to else to_email,
                    "from_name": name_of_sender.title(),
                    "sent_from": settings.WEB_SERVER_URL + validated_data['from_page'],
                    "message_meta": {"Sent from": "field_sent_from"},
                    "thread_id": str(thread_id),
                    "template_id": "d-a8e1e123d91249aaaa95121861bbd8e7",
                    "subject": f"You have a new message on Love Stories TV",
                    "lstv_email": "info@lovestoriestv.com",
                    "lstv_name": "Love Stories TV Notifications",
                    "opt_out_url": f"{settings.WEB_SERVER_URL}/opt-out/{str(new_message_id)}",
                    "cta_text": "Reply",
                    "cta_url": f"{settings.WEB_SERVER_URL}/thread/{str(thread_id)}"
                }
            )
            message.save()
            message.deliver()

            return True
        else:
            return False

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        return self.super.to_representation(obj)
