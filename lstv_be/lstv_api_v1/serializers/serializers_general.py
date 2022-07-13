from nested_lookup import nested_lookup
import urllib.parse
from lstv_api_v1.models import *
from rest_framework import serializers
from lstv_api_v1.views.utils.view_utils import get_business_from_slug, get_vibe_from_slug, \
    get_post_from_slug, user_business_inquiry_record
from lstv_be.settings import SLACK_CHANNEL_BUSINESS_INQUIRIES, ISAAC_CONTEXT_BUSINESS_INQUIRY, WEB_SERVER_URL
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer
from .article_serializer import ArticleSerializer
from .serializers_utils import *
from .base_serializers import TimeBasedSerializer, TimeBasedSerializerOnlyCreate, LSTVBaseSerializer
from lstv_api_v1.utils.utils import get_custom_content, obtain_url_for_card_grid_section, report_issue, \
    get_bride_groom_email_from_post_slug, get_bride_groom_names_from_post_slug, get_sender_name_from_session, \
    get_messaging_thread_id, get_page_type_from_url, get_business_email_from_business_record, \
    get_short_date_from_video_id, get_human_readable_google_location, get_verbose_date_format, \
    SERIALIZER_DETAIL_LEVEL_CONTEXT_FULL
from lstv_api_v1.globals import *
from lstv_api_v1.utils.model_utils import is_valid_email_syntax
from django.contrib.auth.hashers import make_password
import facebook
from google.oauth2 import id_token
from google.auth.transport import requests

from .business_serializer import BusinessSerializer
from .utils.slack_action_processor import prepare_slack_action
from ..tasks.tasks import job_process_buffered_card_impressions, send_slack_message_or_action


class UserBufferedEventsSerializer(LSTVBaseSerializer):
    events = serializers.JSONField()

    def create(self, validated_data):
        for event in validated_data['events']:
            if 'data' in event:
                for key in event['data']:
                    if key == LSTV_USER_BUFFERED_EVENT_TYPE_CARD_IMPRESSION:
                        job_process_buffered_card_impressions.delay(
                            event['key'],
                            event['data'][key],
                            validated_data['user'].id if 'user' in validated_data else None,
                            validated_data['ip'].id if 'ip' in validated_data else None)
        return True

    def update(self, instance, validated_data):
        return self.super.update(validated_data)


class DiscoverSerializer(LSTVBaseSerializer):

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    def attempt_fetching_discovery_element_thumbnail_image(self, element):
        for child in Discover.objects.filter(parent=element).iterator():
            if child.content_query:
                q = ContentSearchQuery.objects.filter(id=child.content_query.id).first()
                if q:
                    q.size = 1
                    items = get_custom_content(q)
                    if len(items) > 0:
                        item_content = get_slug_content(items[0]['slug'], "card")
                        image_url = nested_lookup('thumbnail_url', item_content)
                        if image_url and len(image_url) > 0:
                            image_obj = Image.objects.filter(serve_url=image_url[0]).first()
                            if image_obj:
                                return image_obj

            self.attempt_fetching_discovery_element_thumbnail_image(child)
        return None

    def traverse_discover_elements(self, obj, rc):

        for child in Discover.objects.filter(parent=obj).iterator():
            child_target = None
            if child.type == DiscoverElementTypeEnum.main_content:
                rc['content'].append({"main_content": {"name": child.name, "content": []}})
                child_target = rc['content'][-1]['main_content']

            if child.type == DiscoverElementTypeEnum.sidebar:
                rc['content'].append({"sidebar": {"name": child.name, "content": []}})
                child_target = rc['content'][-1]['sidebar']

            if child.type == DiscoverElementTypeEnum.tab_group:
                rc['content'].append({"tab_group": {"name": child.name, "content": []}})
                child_target = rc['content'][-1]['tab_group']

            if child.type == DiscoverElementTypeEnum.tab:
                rc['content'].append({"tab": {"name": child.name, "slug": child.slug, "content": []}})
                child_target = rc['content'][-1]['tab']

            if child.type == DiscoverElementTypeEnum.section:
                rc['content'].append({"section": {"name": child.name, "content": []}})
                child_target = rc['content'][-1]['section']

            if child.type == DiscoverElementTypeEnum.folder:
                # if we encounter no thumbnail for the image try fetching it from a potential child content
                # element that may have a content grid.
                if not child.element_image:
                    child.element_image = self.attempt_fetching_discovery_element_thumbnail_image(child)

                rc['content'].append({"folder": {"name": child.name,
                                                 "thumbnail_url": child.element_image.serve_url if child.element_image else None,
                                                 "slug": child.slug, "content": []}})
                child_target = rc['content'][-1]['folder']
            if child.type == DiscoverElementTypeEnum.content:
                rc['content'].append({"content_grid": {"name": child.name,
                                                       "query": child.content_query.id}})

            if child_target:
                self.traverse_discover_elements(child, child_target)

    def to_representation(self, obj):
        rc = {"domain": {"name": obj.name, "slug": "discover", "content": []}}
        self.traverse_discover_elements(obj, rc['domain'])
        return rc


class UserFacingCardGridItemSerializer(serializers.Serializer):
    slug = serializers.CharField()


class UserFacingCardGridSerializer(serializers.ModelSerializer):
    items = UserFacingCardGridItemSerializer(many=True)
    content_type = serializers.CharField()

    class Meta:
        model = ContentSearchQuery
        fields = [
            'target', 'order', 'group', 'content_type',
            'header', 'sub_header', 'cta_text', 'cta_url', 'items'
        ]


class UserFacingCardGridTypesSerializer(LSTVBaseSerializer):
    sections = UserFacingCardGridSerializer(many=True)

    def get_display_name(self, item, content_translation):
        print(content_translation)
        if 'business' in content_translation:
            try:
                return Business.objects.get(slug=item).name
            except Business.DoesNotExist:
                return None
        if 'vibe' in content_translation:
            try:
                return TagType.objects.get(slug=item).name
            except TagType.DoesNotExist:
                return None

        if 'video' in content_translation:
            try:
                return Video.objects.get(post__slug=item).title
            except Video.DoesNotExist:
                return None

        return "n/a"

    def to_representation(self, obj):
        groups = {"0": []}
        sections = []
        current_group = 0

        content_type_display_translate = {
            "fixed_business_list": "Fixed Business List",
            "vibe_to_video": "Videos For Vibe",
            "business_to_video": "Videos For Business",
            "fixed_video_list": "Fixed Video List"
        }

        if self.verbosity == ContentVerbosityType.administration:
            rc = []
            for section in obj:

                content_type = section.content_search_type.name

                if 'fixed' not in content_type:
                    items = []
                    for item in section.search_items:
                        display = self.get_display_name(item, content_type)
                        if display:
                            items.append(
                                {"slug": item,
                                "display_name":display}
                        )
                else:
                    items = []
                    for item in section.fixed_content_items:
                        display = self.get_display_name(item, content_type)
                        if display:
                            items.append(
                                {"slug": item,
                                 "display_name": display}
                            )

                rc.append(
                    {
                        'target': section.target,
                        'order': section.order,
                        'group': section.group,
                        'content_type': content_type,
                        'content_type_display_name': content_type_display_translate.get(content_type, None),
                        'header': section.header,
                        'cta_text': section.cta_text,
                        'cta_url': section.cta_url if section.cta_url else obtain_url_for_card_grid_section(section),
                        'items': items
                    }
                )

            return {"sections": rc}

        for section in obj:
            # get url

            section_obj = {
                'header': section.header,
                'slug': section.slug,
                'sub_header': section.sub_header,
                'card_type': section.content_type.name,
                'content_options': section.content_options,
                'url': section.cta_url if section.cta_url else obtain_url_for_card_grid_section(section),
                'cta': section.cta_text,
                'content': get_custom_content(section)[0]
            }

            if current_group != section.group:
                sections.append(groups)
                current_group += 1
                groups[str(current_group)] = []

            groups[str(current_group)].append(section_obj)

        data = {'sections': groups}
        return data

    def validate(self, data):
        sections = data['sections']
        targets = frozenset(s['target'] for s in sections)
        valid_targets = frozenset(['logged_in_home_page', 'logged_out_home_page'])
        if any(t for t in targets if t not in valid_targets):
            raise serializers.ValidationError('only valid targets are ' + ', '.join(valid_targets))

        content_types = frozenset(s['content_type'] for s in sections)
        valid_content_types = frozenset(['fixed_business_list', 'vibe_to_video', 'business_to_video', 'fixed_video_list'])
        if len(content_types - valid_content_types) > 0:
            raise serializers.ValidationError('only valid content_types are ' + ', '.join(valid_content_types))

        for target in targets:
            groups = sorted([s['group'] for s in sections if s['target'] == target])
            if groups != [0, 0, 1, 1, 2, 2]:
                raise serializers.ValidationError(f'target {target} does not have two items in groups 0, 1, and 2')

            for group in [0, 1, 2]:
                orders = [s['order'] for s in sections if s['target'] == target and s['group'] == group]
                if len(orders) != len(frozenset(orders)):
                    raise serializers.ValidationError(f'target {target} does not have unique order numbers in group {group}')

        return data

    def create(self, validated_data):
        sections = validated_data['sections']
        targets = frozenset(s['target'] for s in sections)
        ContentSearchQuery.objects.filter(target__in=targets).delete()

        for section in sections:
            copy_attrs = ['target', 'order', 'group', 'header', 'sub_header', 'cta_text', 'cta_url']
            kwargs = {attr: section.get(attr) for attr in copy_attrs}

            cta_url = section.get('cta_url')
            if cta_url and '/' in cta_url:
                kwargs['slug'] = cta_url[cta_url.rindex('/') + 1:]
            else:
                kwargs['slug'] = cta_url or ""
            content_type = (
                ContentSearchQueryType.business
                if section['content_type'] == 'fixed_business_list'
                else ContentSearchQueryType.video
            )

            kwargs['verbosity'] = ContentVerbosityType.slug
            kwargs['business_location_scope'] = ContentBusinessLocationScope.based_at
            kwargs['content_type'] = content_type
            kwargs['content_sort_method'] = (
                ContentSearchQueryOrderType.none
                if content_type == ContentSearchQueryType.business
                else ContentSearchQueryOrderType.most_recent
            )
            kwargs['content_search_type'] = ContentSearchQuerySourcingType[section['content_type']]
            if section['content_type'] in ['fixed_business_list', 'fixed_video_list']:
                kwargs['fixed_content_items'] = [item['slug'] for item in section['items']]
            elif section['content_type'] in ['vibe_to_video', 'business_to_video']:
                kwargs['search_items'] = [item['slug'] for item in section['items']]
            ContentSearchQuery.objects.create(**kwargs)


class VideoPlaybackLogViewSerializer(TimeBasedSerializerOnlyCreate):
    """
    Validate video playback log entry

    {
        'time_watched': 540,
        'play_uuid': '60ab8a9f-86a5-4324-a48e-2e30021c4fb0',
        'unique_guest_uuid': 'ea351611-91d9-4f81-96dd-e5f602d880c7',
        'video_identifier': '16648'
    }
    """

    time_watched = serializers.FloatField()
    duration = serializers.FloatField()
    id = serializers.UUIDField()
    unique_guest_uuid = serializers.UUIDField()
    video_identifier = serializers.UUIDField()

    def create(self, validated_data):
        if not validate_uuid(validated_data['video_identifier']):
            # try to find a video matching the media id
            video = VideoSource.objects.using('default').filter(media_id=validated_data['video_identifier']).first()
            if video:
                validated_data['video_identifier'] = video.id

        obj, created = VideoPlaybackLog.objects.using('default').get_or_create(
            id=validated_data['id'],
            defaults={'ip': validated_data.get('ip', None),
                      'duration': validated_data['duration'],
                      'user': self.request.user if not self.request.user.is_anonymous else None,
                      'unique_guest_uuid': self.request.data.get('unique_guest_uuid', None),
                      'time_watched': validated_data['time_watched'],
                      'video_identifier': validated_data['video_identifier']})

        if not created:
            obj.time_watched = validated_data['time_watched']
            obj.duration = validated_data['duration']
            obj.video_identifier = validated_data['video_identifier']
            obj.save()
        else:
            obj.save()

        return obj

    @staticmethod
    def validate_video_identifier(value):
        """
        validate video identifier is valid:
            1) ( > 0 )
            2) TODO: FUTURE: corresponds to a real video in th database
        """
        if not validate_uuid(value) and len(value) < 4:
            raise serializers.ValidationError("video_identifier must be a valid UUID or a valid JWP media ID")
        return value

    @staticmethod
    def validate_user(value):
        """
        validate user
        """
        return value

    @staticmethod
    def validate_duration(value):
        """
        validate duration
        """
        if value < 1:
            raise serializers.ValidationError("duration must be greater than 0")
        return value

    @staticmethod
    def validate_time_watched(value):
        """
        validate time watched
        """
        if value == 0:
            raise serializers.ValidationError("time watched must be greater than 0")
        return value

    @staticmethod
    def validate_unique_guest_uuid(value):
        """
        validate unique guest (uuid)
        """
        if not validate_uuid(value):
            raise serializers.ValidationError("unique_guest_uuid is not a valid uuid v4")
        return value

    @staticmethod
    def validate_id(value):
        """
        validate ID (uuid)
        """
        if not validate_uuid(value):
            raise serializers.ValidationError("id is not a valid uuid v4")
        return value

    class Meta:
        model = VideoPlaybackLog

        fields = ('user', 'video_identifier', 'duration', 'time_watched', 'id', 'unique_guest_uuid', 'ip')


class AdPlaybackLogViewSerializer(TimeBasedSerializerOnlyCreate):
    ad_time_watched = serializers.FloatField()
    id = serializers.UUIDField()
    unique_guest_uuid = serializers.UUIDField()
    ad_title = serializers.CharField(max_length=100)
    ad_duration = serializers.FloatField()
    video_identifier = serializers.UUIDField()

    def create(self, validated_data):

        if not validate_uuid(validated_data['video_identifier']):
            # try to find a video matching the media id
            video = VideoSource.objects.using('default').filter(media_id=validated_data['video_identifier']).first()
            if video:
                validated_data['video_identifier'] = video.id

        obj, created = VideoPlaybackLog.objects.using('default').get_or_create(id=validated_data['id'],
                                                                               defaults={
                                                                                   'ip': validated_data.get('ip', None),
                                                                                   'ad_duration': validated_data[
                                                                                       'ad_duration'],
                                                                                   'user': self.request.user if not
                                                                                   self.request.user.is_anonymous else None,
                                                                                   'unique_guest_uuid': self.request.data.get(
                                                                                       'unique_guest_uuid', None),
                                                                                   'ad_title': validated_data[
                                                                                       'ad_title'],
                                                                                   'ad_time_watched':
                                                                                       validated_data[
                                                                                           'ad_time_watched'],
                                                                                   'video_identifier':
                                                                                       validated_data[
                                                                                           'video_identifier'],
                                                                               })

        if not created:
            obj.ad_time_watched = validated_data['ad_time_watched']
            obj.ad_title = validated_data['ad_title']
            obj.ad_duration = validated_data['ad_duration']
            obj.save()
        else:
            # add duration...
            video = VideoSource.objects.filter(id=validated_data['video_identifier']).first()
            if video:
                obj.duration = video.duration
            else:
                report_issue("can't get video duration for " + str(validated_data['video_identifier']))
            obj.save()

        return obj

    @staticmethod
    def validate_ad_title(value):
        """
        validate ad_title  is valid:
        """
        if len(value) < 1:
            raise serializers.ValidationError("ad_title seems cannot be empty.")
        return value

    @staticmethod
    def validate_ad_time_watched(value):
        """
        validate time watched
        """
        return value

    @staticmethod
    def validate_ad_duration(value):
        """
        validate ad_duration
        """
        if value < 1:
            raise serializers.ValidationError("ad_duration must be greater than 0")
        return value

    @staticmethod
    def validate_unique_guest_uuid(value):
        """
        validate unique guest (uuid)
        """
        if not validate_uuid(value):
            raise serializers.ValidationError("unique_guest_uuid is not a valid uuid v4")
        return value

    @staticmethod
    def validate_id(value):
        """
        validate ID (uuid)
        """
        if not validate_uuid(value):
            raise serializers.ValidationError("id is not a valid uuid v4")
        return value

    @staticmethod
    def validate_video_identifier(value):
        """
        validate video identifier is valid:
            1) ( > 0 )
            2) TODO: FUTURE: corresponds to a real video in th database
        """

        if not validate_uuid(value) and len(value) < 4:
            raise serializers.ValidationError("video_identifier must be a valid UUID or a valid JWP media ID")
        return value

    class Meta:
        model = VideoPlaybackLog

        fields = (
            'id', 'unique_guest_uuid', 'user', 'ip', 'ad_duration', 'ad_time_watched', 'ad_title', 'video_identifier')


class AdPlaybackClickLogViewSerializer(TimeBasedSerializerOnlyCreate):
    """
    Validate ad playback log entry
    {
        "id": "60ab8a9f-86a5-4324-a48e-2e30021c4fb1"
        "ad_clicked_time_index": 13.44323423
    }
    """

    id = serializers.UUIDField()
    ad_clicked_time_index = serializers.FloatField()

    def create(self, validated_data):
        obj, created = VideoPlaybackLog.objects.using('default').get_or_create(id=validated_data['id'],
                                                                               defaults={'ad_clicked': True,
                                                                                         'ad_clicked_time_index':
                                                                                             validated_data[
                                                                                                 'ad_clicked_time_index'],
                                                                                         'ip': validated_data[
                                                                                             'ip']})
        if not created:
            obj.ad_clicked_time_index = validated_data['ad_clicked_time_index']
            obj.ad_clicked = True
            obj.save()
        else:
            obj.save()

        return obj

    @staticmethod
    def validate_id(value):
        """
        validate ID (uuid)
        """
        if not validate_uuid(value):
            raise serializers.ValidationError("id is not a valid uuid v4")
        return value

    class Meta:
        model = VideoPlaybackLog

        fields = ('id', 'ad_clicked', 'ad_clicked_time_index', 'ip')


class ContentWatchLogSerializer(serializers.ModelSerializer):
    element_id = serializers.UUIDField()
    element_type = serializers.ChoiceField(choices=(('video', 'video'), ('article', 'article')))

    def create(self, validated_data, request=None):

        new_log_row = None

        content_item = None
        if validated_data['element_type'] == 'video':
            content_item = Video.objects.filter(videos__id=validated_data['element_id']).first()
            if not content_item:
                content_item = VideoSource.objects.filter(id=validated_data['element_id']).first()

        elif validated_data['element_type'] == 'article':
            content_item = Article.objects.filter(pk=validated_data['element_id']).first()

        if not content_item:
            return None
        else:
            validated_data['content_item'] = content_item

        if validated_data['element_type'] == 'video':
            if type(content_item) == Video:
                new_log_row = VideoViewLog(video=content_item,
                                           unique_guest_uuid=validated_data[
                                               'unique_guest_uuid'] if 'unique_guest_uuid' in validated_data else None,
                                           user=request.user if not request.user.is_anonymous else None,
                                           ip=validated_data['ip'] if 'ip' in validated_data else None)
            else:
                new_log_row = PromoVideoViewLog(video_source=content_item,
                                                unique_guest_uuid=validated_data[
                                                    'unique_guest_uuid'] if 'unique_guest_uuid' in validated_data else None,
                                                user=request.user if not request.user.is_anonymous else None,
                                                ip=validated_data['ip'] if 'ip' in validated_data else None)

        if validated_data['element_type'] == 'article':
            new_log_row = ArticleViewLog(article=content_item,
                                         unique_guest_uuid=validated_data[
                                             'unique_guest_uuid'] if 'unique_guest_uuid' in validated_data else None,
                                         user=request.user if not request.user.is_anonymous else None,
                                         ip=validated_data['ip'] if 'user' in validated_data else None)
        if new_log_row:
            new_log_row.save()
            return new_log_row

    #
    # def update(self, instance, validated_data):
    #     return self.super.update(validated_data)
    #
    # def to_representation(self, obj):
    #     return self.super.to_representation(obj)

    @staticmethod
    def validate_element_id(value):
        if not validate_uuid(value):
            raise serializers.ValidationError("unique_guest_uuid is not a valid uuid v4")
        return value

    @staticmethod
    def validate_user(value):
        return value

    @staticmethod
    def validate_unique_guest_uuid(value):
        if not validate_uuid(value):
            raise serializers.ValidationError("unique_guest_uuid is not a valid uuid v4")
        return value

    class Meta:
        model = VideoViewLog

        fields = ('id', 'video', 'user', 'unique_guest_uuid', 'ip', 'user_id', 'element_id', 'element_type')


class UserEventSerializer(TimeBasedSerializerOnlyCreate):
    """
    Validate user event
    """

    def create(self, validated_data):
        obj = UserEventLog.objects.create(**validated_data)
        obj.save()
        return obj

    class Meta:
        model = UserEventLog
        fields = ('domain', 'event', 'severity', 'unique_guest_uuid', 'user', 'data')


class SettingsSerializer(TimeBasedSerializer):
    """
    """

    def create(self, validated_data):
        obj = Setting.objects.create(**validated_data)
        obj.save()
        return obj

    class Meta:
        model = Setting
        fields = ('name', 'value', 'category')


class UserSerializer(LSTVBaseSerializer):
    type = serializers.CharField(max_length=50, required=True)
    email = serializers.CharField(max_length=150, required=False)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    password = serializers.CharField(max_length=150, required=False)
    unique_guest_uuid = serializers.UUIDField(required=False)
    oauth_payload = serializers.JSONField(required=False)

    def validate(self, data):
        if 'oauth_payload' not in data:
            if not all(key in data for key in ['email', 'type', 'first_name', 'last_name', 'password']):
                raise serializers.ValidationError(
                    "request must include {email, type, first_name, last_name, and password}  OR --- "
                    "oauth_payload and type")

        return data

    def update(self, instance, validated_data):
        pass

    @staticmethod
    def validate_type(value):
        if value not in ['consumer', 'business_team_member', 'business_team_member_onboarding']:
            raise serializers.ValidationError(
                "type must be either consumer, business_team_member or business_team_member_onboarding")
        return value

    @staticmethod
    def validate_first_name(value):
        if len(value) <= 1 and value.isalpha():
            raise serializers.ValidationError("must have at least 2 characters and be alphanumeric")
        return value

    @staticmethod
    def validate_unique_guest_uuid(value):
        if not validate_uuid(value):
            raise serializers.ValidationError("must be valid uuid")
        return value

    @staticmethod
    def validate_last_name(value):
        if len(value) <= 1 and value.isalpha():
            raise serializers.ValidationError("must have at least 2 characters and be alphanumeric")
        return value

    @staticmethod
    def validate_email(value):
        valid, error = is_valid_email_syntax(value)
        if not valid:
            raise serializers.ValidationError(error)
        # make sure this user does not exist

        if User.objects.filter(email=value).count() > 0:
            raise serializers.ValidationError("email already exists.")

        return value

    @staticmethod
    def validate_password(value):
        return generic_validate_password(value, serializers.ValidationError(LSTV_API_V1_PASSWORD_NOT_STRONG))

    def create(self, validated_data):
        if 'oauth_payload' in validated_data:
            oauthdata = validated_data['oauth_payload']

            #  _____   ____     __    ___  ____    ___    ___   __  _
            # |     | /    T   /  ]  /  _]|    \  /   \  /   \ |  l/ ]
            # |   __jY  o  |  /  /  /  [_ |  o  )Y     YY     Y|  ' /
            # |  l_  |     | /  /  Y    _]|     T|  O  ||  O  ||    \
            # |   _] |  _  |/   \_ |   [_ |  O  ||     ||     ||     Y
            # |  T   |  |  |\     ||     T|     |l     !l     !|  .  |
            # l__j   l__j__j \____jl_____jl_____j \___/  \___/ l__j\_j

            if 'first_name' in oauthdata and 'last_name' in oauthdata and 'email' in oauthdata and \
                    'accessToken' in oauthdata and 'userID' in oauthdata:

                # we must make sure the token valid and not a fake, otherwise this is a major security issue.
                graph = facebook.GraphAPI(access_token=oauthdata['accessToken'], version="3.1")
                try:
                    res = graph.get_objects(ids=[oauthdata['userID']], fields='email')
                    if oauthdata['userID'] in res and 'email' in res[oauthdata['userID']] and \
                            res[oauthdata['userID']]['email'] == oauthdata['email']:
                        oauth_image = f"http://graph.facebook.com/{oauthdata['userID']}/picture?width=300&height=300"
                        return create_user_from_oauth('facebook/oauth',
                                                      oauthdata['first_name'],
                                                      oauthdata['last_name'],
                                                      res[oauthdata['userID']]['email'],
                                                      make_password(User.objects.make_random_password()),
                                                      UserTypeEnum[validated_data['type']],
                                                      validated_data['unique_guest_uuid'] if 'unique_guest_uuid' in
                                                                                             validated_data else None,
                                                      oauth_image,
                                                      [Properties(key='facebook_id', value_text=oauthdata['userID'])])
                except facebook.GraphAPIError:
                    # validate
                    return None, None

            #   ____   ___    ___    ____  _        ___
            #  /    T /   \  /   \  /    T| T      /  _]
            # Y   __jY     YY     YY   __j| |     /  [_
            # |  T  ||  O  ||  O  ||  T  || l___ Y    _]
            # |  l_ ||     ||     ||  l_ ||     T|   [_
            # |     |l     !l     !|     ||     ||     T
            # l___,_j \___/  \___/ l___,_jl_____jl_____j

            if 'profileObj' in oauthdata and 'googleId' in oauthdata['profileObj'] and \
                    'email' in oauthdata['profileObj'] and 'givenName' in oauthdata['profileObj'] \
                    and 'familyName' in oauthdata['profileObj']:

                try:
                    # Specify the CLIENT_ID of the app that accesses the backend:
                    idinfo = id_token.verify_oauth2_token(
                        oauthdata['tokenObj']['id_token'],
                        requests.Request(),
                        '787829919361-tkhpnmpm6p7me0711o1kdlhlmhe1l3u8.apps.googleusercontent.com')

                    if idinfo['email'] == oauthdata['profileObj']['email']:
                        oauth_image = idinfo.get('picture', None)
                        if oauth_image:
                            oauth_image = oauth_image.replace('=s96-c', '=s300-c')
                        return create_user_from_oauth('google/oauth',
                                                      idinfo['given_name'],
                                                      idinfo['family_name'],
                                                      idinfo['email'],
                                                      make_password(User.objects.make_random_password()),
                                                      UserTypeEnum[validated_data['type']],
                                                      validated_data['unique_guest_uuid'] if 'unique_guest_uuid' in
                                                                                             validated_data else None,
                                                      oauth_image,
                                                      [Properties(key='google_id', value_text=idinfo['sub'])])

                except ValueError:
                    # Invalid token
                    pass

                return None, None
            else:
                return None, None
        else:
            #   _    _                 _________          __      _
            #  | |  | |               / /  __ \ \        / /     (_)
            #  | |  | |___  ___ _ __ / /| |__) \ \  /\  / /   ___ _  __ _ _ __  _   _ _ __
            #  | |  | / __|/ _ \ '__/ / |  ___/ \ \/  \/ /   / __| |/ _` | '_ \| | | | '_ \
            #  | |__| \__ \  __/ | / /  | |      \  /\  /    \__ \ | (_| | | | | |_| | |_) |
            #   \____/|___/\___|_|/_/   |_|       \/  \/     |___/_|\__, |_| |_|\__,_| .__/
            #                                                        __/ |           | |
            #                                                       |___/            |_|

            new_user = User(first_name=validated_data['first_name'],
                            last_name=validated_data['last_name'],
                            email=validated_data['email'],
                            password=make_password(validated_data['password']),
                            user_type=UserTypeEnum[validated_data['type']],
                            former_unique_guest_uuid=validated_data[
                                'unique_guest_uuid'] if 'unique_guest_uuid' in validated_data else None)
            new_user.save()
            token = new_user.create_jwt_token()
            new_user.is_new = True
            return new_user, token

    def update(self, instance, validated_data):
        pass

    def to_representation(self, obj):
        btm = BusinessTeamMember.objects.filter(user=obj).first()
        loc = obj.ip_addresses.filter(location__isnull=False).order_by('-created_at').first()
        location = str(loc.location) if loc and loc.location else None

        rc = {
            "joined": obj.created_at,
            "id": obj.id,
            "email": obj.email,
            "name": obj.get_full_name(),
            "thumbnail_url": obj.get_thumbnail_url(),
            "user_type": str(obj.user_type),
            "business_name": btm.business.name if btm and btm.business else None,
            "business_slug": btm.business.slug if btm and btm.business else None,
            "location": location,
            "phone": obj.mobile_phone.number if obj.mobile_phone else None,
            "last_login": obj.last_login
        }
        if obj.state != ContentModelState.active:
            if obj.state_desc:
                desc = json.loads(obj.state_desc[0])
                rc["issue"] = desc['issue']
            if obj.state == ContentModelState.deleted:
                rc["deleted_at"] = obj.deleted_at
        return rc


def get_slug_content(item, verbosity=ContentVerbosityType.slug, request=None):
    from .video_serializer import VideoSerializer
    if item.startswith('/business/'):
        item = item.replace('/business/', '')
        business = get_business_from_slug(item)
        if business:
            serializer = BusinessSerializer(business, verbosity=verbosity, request=request)
            return serializer.data
    elif item.startswith('/vibe/'):
        item = item.replace('/vibe/', '')
        vibe = get_vibe_from_slug(item)
        if vibe:
            serializer = TagTypeSerializer(vibe, verbosity=verbosity, request=request)
            return serializer.data
    else:
        slug_element = get_post_from_slug(item)
        if slug_element:
            if type(slug_element) == Video:
                serializer = VideoSerializer(slug_element, verbosity=verbosity, request=request)
                return serializer.to_representation(slug_element)
            if type(slug_element) == Post:
                return ArticleSerializer(verbosity=verbosity, request=request).to_representation(slug_element)

    return None
