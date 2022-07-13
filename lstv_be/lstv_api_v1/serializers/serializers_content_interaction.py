import statistics
from uuid import UUID

from django.db.models import F
from rest_framework import serializers

from lstv_api_v1.globals import PAGE_TYPE_BUSINESS, PAGE_TYPE_VIDEO
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer

from lstv_api_v1.serializers.utils.slack_action_processor import prepare_slack_action
from lstv_api_v1.tasks.tasks import send_slack_message_or_action, job_migrate_image_to_s3
from lstv_api_v1.utils.utils import get_bride_groom_email_from_post_slug, get_sender_name_from_session, \
    get_messaging_thread_id, get_business_email_from_business_record, get_page_type_from_url, \
    get_bride_groom_names_from_post_slug, get_short_date_from_video_id, get_human_readable_google_location, \
    get_verbose_date_format
from lstv_api_v1.models import *
from lstv_be.settings import SLACK_CHANNEL_BUSINESS_INQUIRIES, ISAAC_CONTEXT_BUSINESS_INQUIRY, WEB_SERVER_URL, settings


#   _____            _                      _____           _       _ _
#  |  __ \          (_)                    / ____|         (_)     | (_)
#  | |__) |_____   ___  _____      _____  | (___   ___ _ __ _  __ _| |_ _______ _ __
#  |  _  // _ \ \ / / |/ _ \ \ /\ / / __|  \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#  | | \ \  __/\ V /| |  __/\ V  V /\__ \  ____) |  __/ |  | | (_| | | |/ /  __/ |
#  |_|  \_\___| \_/ |_|\___| \_/\_/ |___/ |_____/ \___|_|  |_|\__,_|_|_/___\___|_|


class ReviewsSerializer(LSTVBaseSerializer):
    content = serializers.CharField(min_length=100, max_length=500)
    title = serializers.CharField(max_length=50, min_length=3)
    rating = serializers.IntegerField(min_value=0, max_value=5)
    complaint = serializers.CharField()
    from_first_name = serializers.CharField(required=False)
    from_last_name = serializers.CharField(required=False)
    from_profile_image_url = serializers.CharField(required=False)

    # optionals...
    review_context = serializers.CharField(max_length=50, required=False)

    instance = None

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or DELETE we do not require most of the mandatory fields.
        """
        fields = super(ReviewsSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['content'].required = method in ['POST'] and not self.action
        fields['title'].required = method in ['POST'] and not self.action
        fields['rating'].required = method in ['POST'] and not self.action
        fields['complaint'].required = False
        return fields

    def create(self, validated_data):
        from lstv_api_v1.serializers.lstv_declarative_api_serializer import LSTVDeclarativeAPISerializerException
        if not self.action:
            is_from_admin = self.request.user.is_lstv_admin()
            from_first_name = validated_data.get('from_first_name') if is_from_admin else None
            from_last_name = validated_data.get('from_last_name') if is_from_admin else None
            from_profile_image_url = validated_data.get('from_profile_image_url') if is_from_admin else None

            new_message = Message(
                message_context=validated_data.get('review_context', None) or MessageContextTypeEnum.business_review,
                thread_id=uuid.uuid4(),
                message_content=validated_data['content'],
                from_user=None if from_first_name else self.request.user or None,
                from_first_name=from_first_name,
                from_last_name=from_last_name,
            )
            if from_profile_image_url:
                new_message.from_profile_image = Image.objects.create(
                    legacy_url=validated_data['from_profile_image_url'],
                    source=ContentModelSource.admin,
                    purpose=ImagePurposeTypes.profile_avatar
                )
                job_migrate_image_to_s3.delay(new_message.from_profile_image.id)
            new_message.save()

            new_review = Review(
                element_type=self.element.get_review_object_type(),
                element_id=self.element.id,
                title=validated_data['title'],
                rating=validated_data['rating'],
                review=new_message
            )
            new_review.save()
            self.element.reviews.add(new_review)
            return self.to_representation(new_review)
        elif self.action == 'like':
            if not self.sub_element:
                raise LSTVDeclarativeAPISerializerException("cant find it")
            like = Like(element_type=LikableElementType.review, element_id=self.sub_element.id,
                        user=self.request.user)
            like.save()
            Message.objects.filter(id=self.sub_element.review.id).update(likes=(F('likes') + 1))

            return {'id': self.element.id}
        elif self.action == 'flag':
            flagged_message = ContentFlag(
                element_type=ContentFlagElementEnumType.review,
                element_id=self.sub_element.id,
                complaint=validated_data.get('complaint', None),
                flagged_by=self.request.user)
            flagged_message.save()
            self.sub_element.flags.add(flagged_message)

            return {'id': self.element.id,
                    'business_id': self.element.id}

    def update(self, instance, validated_data):
        instance.review.message_content = validated_data.get('content', instance.review.message_content)
        instance.title = validated_data.get('title', instance.title)
        instance.rating = validated_data.get('rating', instance.rating)
        instance.review.edited_at = datetime.now().replace(tzinfo=timezone.utc)
        instance.review.save()
        instance.save()
        return instance

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                "review_id": obj.id,
                "posted_at_label": obj.get_past_date_label(),
                "created_at": obj.created_at,
                "posted_at": int(obj.created_at.timestamp()),
                "edited_at": int(
                    obj.updated_at.timestamp()) if int(obj.updated_at.timestamp()) > int(
                    obj.created_at.timestamp()) else None,
                "author": (
                    obj.review.from_user.get_full_name_or_email()
                    if obj.review.from_user
                    else f"{obj.review.from_first_name} {obj.review.from_last_name}".strip()
                ),
                "author_id": (
                    obj.review.from_user.id
                    if obj.review.from_user
                    else None
                ),
                "author_thumbnail_url": (
                    obj.review.from_user.profile_image.get_serve_url()
                    if obj.review.from_user and obj.review.from_user.profile_image
                    else obj.review.from_profile_image.get_serve_url()
                    if obj.review.from_profile_image
                    else None
                ),
                "likes": obj.review.likes,
                "rating": obj.rating,
                "title": obj.title,
                "content": obj.review.message_content
            }

        if obj:
            if isinstance(obj, list):
                rc = []
                for e in obj:
                    rc.append(get_obj_dict(e))

                avg = statistics.mean((o.get('rating', 2) for o in rc))

                return {
                    "summary": {
                        "num_reviews": len(rc),
                        "average_rating": round(avg, 1) if len(rc) > 0 else None
                    },
                    'reviews': rc
                }
            else:
                return get_obj_dict(obj)
        else:
            return []

    def validate(self, data):
        if not self.action:
            if not self.element:
                raise serializers.ValidationError(f"unable to find review container object")

            if self.request.method in ['POST']:
                # user cannot review element twice but admins can create many reviews if they send name
                is_from_admin = self.request.user.is_lstv_admin()
                from_first_name = data.get('from_first_name')
                if not is_from_admin or not from_first_name:
                    past_review = Review.objects.filter(element_type=self.element.get_review_object_type(),
                                                        element_id=self.element.id,
                                                        review__from_user=self.request.user).count()
                    if past_review > 0:
                        raise serializers.ValidationError("User already has one review for this resource. It can be edited "
                                                        "or deleted.")
        else:
            if not self.sub_element:
                raise serializers.ValidationError("review item not found")
            if self.action == 'like':
                # user already likes this element?
                if Like.objects.filter(user=self.request.user, element_type=LikableElementType.review,
                                       element_id=self.sub_element.id).count() > 0:
                    raise serializers.ValidationError("User already likes this review")
            if self.action == 'flag':
                if self.request.user and self.request.user.is_flagging_blocked:
                    raise serializers.ValidationError("Flagging reviews is not available for this user at the moment")

                # any existing flagging for the same resource by the same user?
                if self.sub_element.flags.filter(flagged_by=self.request.user).count() > 0:
                    raise serializers.ValidationError("The user already flagged this particular element")

        return data


class BusinessFAQSerializer(LSTVBaseSerializer):
    content = serializers.CharField()
    fixed_response = serializers.CharField()

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessFAQSerializer, self).get_fields()
        fields['content'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        fields['fixed_response'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        return fields

    def create(self, validated_data):

        new_message = Message(
            message_context=MessageContextTypeEnum.business_faq,
            thread_id=uuid.uuid4(),
            message_content=validated_data['content'],
            fixed_response=validated_data.get('fixed_response', None),
            from_user=self.request.user,
            parent_message_id=None
        )
        new_message.save()
        self.element.faq.add(new_message)
        return {
            "business_faq_id": new_message.id,
            "business_id": self.element.id}

    def update(self, instance, validated_data):
        if 'content' in self.request.data:
            instance.message_content = validated_data.get('content', None)
        if 'fixed_response' in self.request.data:
            instance.fixed_response = validated_data.get('fixed_response', None)
        instance.edited_at = datetime.now().replace(tzinfo=timezone.utc)
        instance.save()
        return instance

    def to_representation(self, obj):
        from lstv_api_v1.views.utils.view_utils import past_date_label
        rc = []
        for message in obj.all().order_by('created_at'):
            rc.append({
                "posted_at_label": past_date_label(message.created_at),
                "posted_at": int(message.created_at.timestamp()),
                "edited_at": past_date_label(message.edited_at),
                "business_faq_id": message.id,
                "content": message.message_content,
                "fixed_response": message.fixed_response,
            })
        return rc

    def validate(self, data):
        if not self.element:
            raise serializers.ValidationError(f"unable to find review container object")
        return data

    @staticmethod
    def validate_content(value):
        """
        element type is the high level lstv2 entity this is in relation to.
        """
        if len(value) < 2:
            raise serializers.ValidationError("content must be at least two characters (enough for 'ok' :-) )")
        return value


class BusinessPublicTeamFAQSerializer(LSTVBaseSerializer):
    content = serializers.CharField()
    fixed_response = serializers.CharField()

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessPublicTeamFAQSerializer, self).get_fields()
        fields['content'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        fields['fixed_response'].required = self.request and getattr(self.request, 'method', None) in ['POST']
        return fields

    def create(self, validated_data):
        new_message = Message(
            message_context=MessageContextTypeEnum.business_team_faq,
            thread_id=uuid.uuid4(),
            message_content=validated_data['content'],
            fixed_response=validated_data.get('fixed_response', None),
            from_user=self.request.user,
            parent_message_id=None
        )
        new_message.save()
        self.element.public_team_faq.add(new_message)
        return {
            "business_id": self.element,
            "business_public_team_faq_id": new_message.id
        }

    def update(self, instance, validated_data):
        if 'content' in self.request.data:
            instance.message_content = validated_data.get('content', None)
        if 'fixed_response' in self.request.data:
            instance.fixed_response = validated_data.get('fixed_response', None)
        instance.edited_at = datetime.now().replace(tzinfo=timezone.utc)
        instance.save()
        return instance

    def to_representation(self, obj):
        from lstv_api_v1.views.utils.view_utils import past_date_label
        rc = []
        for message in obj.all().order_by('created_at'):
            rc.append({
                "posted_at": int(message.created_at.timestamp()),
                "edited_at": past_date_label(message.edited_at),
                "business_public_team_faq_id": message.id,
                "content": message.message_content,
                "fixed_response": message.fixed_response,
            })
        return rc

    def validate(self, data):
        if not self.element:
            raise serializers.ValidationError(f"unable to find review container object")
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


#   _      _ _           _____           _       _ _
#  | |    (_) |         / ____|         (_)     | (_)
#  | |     _| | _____  | (___   ___ _ __ _  __ _| |_ _______ _ __
#  | |    | | |/ / _ \  \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#  | |____| |   <  __/  ____) |  __/ |  | | (_| | | |/ /  __/ |
#  |______|_|_|\_\___| |_____/ \___|_|  |_|\__,_|_|_/___\___|_|


class ElementLikeSerializer(serializers.ModelSerializer):
    element_type = serializers.ChoiceField(choices=LikableElementType)

    def __init__(self, *args, **kwargs):
        self.serializer_context = kwargs.pop('context', None)
        self.serializer_context = kwargs.pop('request', None)
        super(ElementLikeSerializer, self).__init__(*args, **kwargs)

    def validate(self, data):

        def panic_not_found():
            raise serializers.ValidationError(f"there is no element id {data['element_id']} of type "
                                              f"{data['element_type']}")

        def panic_already_liked():
            raise serializers.ValidationError(f"element id {data['element_id']} of type "
                                              f"{data['element_type']} already liked by you")

        if data['element_type'] == LikableElementType.video:
            try:
                Video.objects.get(pk=data['element_id'])
            except Video.DoesNotExist:
                panic_not_found()

        if data['element_type'] == LikableElementType.article:
            try:
                Article.objects.get(pk=data['element_id'])
            except Article.DoesNotExist:
                panic_not_found()

        if data['element_type'] == LikableElementType.business:
            try:
                Business.objects.get(pk=data['element_id'])
            except Business.DoesNotExist:
                panic_not_found()

        if data['element_type'] == LikableElementType.photo:
            try:
                Photo.objects.get(pk=data['element_id'])
            except Photo.DoesNotExist:
                panic_not_found()

        if self.serializer_context == 'post':
            if Like.objects.filter(element_type=data['element_type'], element_id=data['element_id'],
                                   unique_guest_uuid=data['unique_guest_uuid']).count() > 0:
                panic_already_liked()

            if 'user' in data:
                if Like.objects.filter(element_type=data['element_type'], element_id=data['element_id'],
                                       user=data['user']).count() > 0:
                    panic_already_liked()

        return data

    class Meta:
        model = Like
        fields = ('element_type', 'user', 'unique_guest_uuid', 'element_id')
