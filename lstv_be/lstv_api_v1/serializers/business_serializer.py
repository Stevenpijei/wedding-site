import statistics

from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.business_photo_serializer import BusinessPhotoSerializer
from lstv_api_v1.serializers.promo_video_source_serializer import PromoVideoSourceSerializer
from lstv_api_v1.serializers.serializers_content import ShoppingItemSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import PropertySerializer, \
    BusinessRoleTypeSerializer, BusinessPhoneSerializer, BusinessCohortSerializer, BusinessSocialLinksSerializer, \
    BusinessVenueTypesSerializer, BusinessLocationSerializer, BusinessLocationAndCoverageSerializer, \
    BusinessPublicTeamSerializer, BusinessAssociateBrandsSerializer, BusinessSoldAtSerializer, TagSerializer
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.utils.business_admin_actions import create_upload_image
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.models import *
from lstv_api_v1.tasks.user_action_handlers import on_business_updated

#  ____   __ __   _____ ____  ____     ___   _____  _____      _____   ___  ____
# |    \ |  T  T / ___/l    j|    \   /  _] / ___/ / ___/     / ___/  /  _]|    \
# |  o  )|  |  |(   \_  |  T |  _  Y /  [_ (   \_ (   \_     (   \_  /  [_ |  D  )
# |     T|  |  | \__  T |  | |  |  |Y    _] \__  T \__  T     \__  TY    _]|    /
# |  O  ||  :  | /  \ | |  | |  |  ||   [_  /  \ | /  \ |     /  \ ||   [_ |    \  __  __  __
# |     |l     | \    | j  l |  |  ||     T \    | \    |     \    ||     T|  .  Y|  T|  T|  T
# l_____j \__,_j  \___j|____jl__j__jl_____j  \___j  \___j      \___jl_____jl__j\_jl__jl__jl__j

from lstv_api_v1.utils.utils import upload_image_to_cdn, create_image_from_base64, build_location_from_google_places, \
    notify_grapevine, send_business_welcome_email

from lstv_api_v1.views.lstv_base_api_view import LSTVGenericAPIViewException, \
    LSTVGenericAPIViewResourceNotFoundException
from lstv_api_v1.utils.aws_utils import delete_file_from_aws_s3
from lstv_api_v1.views.utils.view_utils import past_date_label
from lstv_be.settings import WEB_SERVER_URL


class BusinessAccountClaimSerializer(LSTVBaseSerializer):
    _business = None
    _user = None

    code = serializers.UUIDField(required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(min_length=1, max_length=25, required=True)
    last_name = serializers.CharField(min_length=1, max_length=25, required=True)
    password = serializers.CharField(min_length=1, max_length=25, required=True)

    def validate_code(self, value):
        try:
            b = Business.objects.get(account_claimed_at__isnull=True, account_claim_code=value)
            self._business = b
        except Business.DoesNotExist:
            raise serializers.ValidationError("invalid, non-existent or expired account claim code")
        return value

    def validate(self, data):
        email = data['email']
        self._user = User.objects.filter(email=email).first()
        if not self._user:
            return data
        if self._user.user_type == UserTypeEnum.consumer:
            raise serializers.ValidationError(f"{email} is not a business account")
        if not self._user.team_users.filter(business=self._business).exists():
            raise serializers.ValidationError(f"{email} already exists for another business")

        return data

    def create(self, validated_data):
        if not self._user:
            # create the user record
            self._user = User(source_desc='account-claim',
                              first_name=validated_data['first_name'],
                              last_name=validated_data['last_name'],
                              email=validated_data['email'],
                              password=make_password(validated_data['password']),
                              user_type=UserTypeEnum.business_team_member)
            self._user.save()

            # associate with business
            tm = BusinessTeamMember(business=self._business, user=self._user)
            tm.save()
        else:
            tm = self._user.team_users.get(business=self._business)

        # make user an admin
        tm.roles.add(BusinessTeamMemberRoleType.objects.filter(slug='admin').first())

        # invalidate code
        self._business.account_claimed_at = datetime.now().replace(tzinfo=timezone.utc)
        self._business.account_claim_code = None
        self._business.save()

        token = self._user.create_jwt_token()
        send_business_welcome_email(self._user, self._business)
        notify_grapevine(f":link: {self._user.get_full_name()} ({self._user.email}) successfully completed a claim link "
                         f"for <https://lovestoriestv.com/business/{self._business.slug}|{self._business.name}> "
                         f"({self._business.get_roles_as_text()}). The claim link was "
                         f"sent {past_date_label(self._business.account_claim_code_created_at)}")

        return self._user, token

    def to_representation(self, obj):
        return {}


class BusinessOrganizedEventsSerializer(LSTVBaseSerializer):
    is_lstv_event = serializers.BooleanField(required=False)
    event_start_date = serializers.DateTimeField(required=False)
    event_end_date = serializers.DateTimeField(required=False)
    event_start_time = serializers.DateTimeField(required=False)
    event_end_time = serializers.TimeField(required=False)
    name_short = serializers.CharField(min_length=3, max_length=50, required=False)
    name_long = serializers.CharField(min_length=3, max_length=50, required=False)
    cta_url = serializers.CharField(max_length=150, required=False)
    is_virtual = serializers.BooleanField(required=False)
    location = serializers.JSONField(required=False)

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessOrganizedEventsSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)

        fields['event_start_date'].required = method in ['POST']
        fields['event_end_date'].required = False
        fields['event_start_time'].required = False
        fields['event_end_time'].required = False
        fields['name_short'].required = method in ['POST']
        fields['name_long'].required = method in ['POST']
        fields['cta_url'].required = method in ['POST']
        fields['is_virtual'].required = method in ['POST']

        return fields

    def validate(self, data):
        method = getattr(self.request, 'method', None)

        # can't end before we start... @TODO: repair field names
        if 'event_start_date_time' in data and 'event_end_date_time' in data:
            if data['event_start_date_time'] >= data['event_end_date_time']:
                raise serializers.ValidationError(
                    "event_end_date_time must be lated than event_start_date_time")
        # if event is not virtual, a location must be supplied
        if method == 'POST':
            if data.get('is_virtual', None) is False and not data.get('location'):
                raise serializers.ValidationError(
                    "non virtual events must have a location defined")
        if method == 'PATCH':
            print(self.sub_element.location)
            if data.get('is_virtual', None) is False and (not self.sub_element.location and not data.get('location')):
                raise serializers.ValidationError(
                    "non virtual events must have a location defined")
        return data

    def create(self, validated_data):
        loc = None
        if validated_data.get('location', None):
            loc = build_location_from_google_places(validated_data['location'])

        new_event = OrganizedEvent(event_start_date=validated_data['event_start_date'],
                                   event_end_date=validated_data.get('event_end_date', None),
                                   event_start_time=validated_data['event_start_time'],
                                   event_end_time=validated_data.get('event_end_time', None),
                                   name_short=validated_data['name_short'],
                                   name_long=validated_data['name_long'],
                                   cta_url=validated_data['cta_url'],
                                   is_virtual=validated_data['is_virtual'],
                                   location=loc)
        new_event.save()
        self.element.organized_events.add(new_event)
        return {"id": new_event.id}

    def update(self, instance, validated_data):
        change = False

        if 'event_start_date' in validated_data:
            instance.event_start_date = validated_data['event_start_date']
            change = True

        if 'event_end_date' in validated_data:
            instance.event_end_date = validated_data['event_end_date']
            change = True

        if 'event_start_time' in validated_data:
            instance.event_start_time = validated_data['event_start_time']
            change = True

        if 'event_end_time' in validated_data:
            instance.event_end_time = validated_data['event_end_time']
            change = True

        if 'name_short' in validated_data:
            instance.name_short = validated_data['name_short']
            change = True

        if 'name_long' in validated_data:
            instance.name_long = validated_data['name_long']
            change = True

        if 'cta_url' in validated_data:
            instance.cta_url = validated_data['cta_url']
            change = True

        if 'is_virtual' in validated_data:
            instance.is_virtual = validated_data['is_virtual']
            change = True

        if 'is_lstv_event' in validated_data:
            instance.is_lstv_event = validated_data['is_lstv_event']
            change = True

        if 'location' in validated_data:
            loc = build_location_from_google_places(validated_data['location'])
            instance.location = loc
            change = True

        if change:
            instance.save()

        return {"id": instance.id}

    def to_representation(self, obj):
        return {"id": obj.id,
                "event_start_date": obj.event_start_date,
                "event_end_date": obj.event_end_date,
                "event_start_time": obj.event_start_time,
                "event_end_time": obj.event_end_time,
                "name_long": obj.name_long,
                "name_short": obj.name_short,
                "cta_url": obj.cta_url,
                "is_virtual": obj.is_virtual,
                "is_lstv_event": obj.is_lstv_event,
                "location": None if not obj.location else LocationSerializer().to_representation(obj.location),
                "phone": obj.phone.number if obj.phone else None
                }


class BusinessSerializer(LSTVBaseSerializer):
    business_name = serializers.CharField(max_length=100, min_length=3)
    inquiry_email = serializers.EmailField(max_length=100, min_length=3, allow_null=True)
    website = serializers.CharField(max_length=100, min_length=10)
    subscription_level = serializers.CharField(required=False)
    business_location = serializers.JSONField()
    description = serializers.CharField(required=False)
    business_roles = serializers.JSONField()
    profile_image = serializers.CharField(required=False)
    profile_image_url = serializers.CharField(required=False, allow_null=True)
    card_thumbnail_url = serializers.CharField(required=False, allow_null=True)

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or DELETE we do not require most of the mandatory fields.
        """
        fields = super(BusinessSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['website'].required = False
        fields['business_name'].required = method in ['POST'] and not self.request_context
        fields['business_location'].required = method in ['POST'] and not self.request_context
        fields['business_roles'].required = method in ['POST'] and not self.request_context
        fields['card_thumbnail_url'].required = False
        fields['profile_image_url'].required = False
        fields['profile_image'].required = False
        fields['inquiry_email'].required = False
        fields['profile_image'].allow_blank = method in ['PATCH', 'POST']
        return fields

    def create(self, validated_data):
        # business record
        new_business = Business(name=validated_data.get('business_name', None),
                                slug=slugify_2(validated_data.get('business_name', None)))
        new_business.subscription_level = BusinessSubscriptionLevel.objects.filter(slug='free').first()
        new_business.save()

        # profile image?

        if 'profile_image' in validated_data:
            filename = create_image_from_base64(f"{new_business.id}-orig", validated_data['profile_image'])
            s3_base_url = upload_image_to_cdn(filename, "images/businessProfileImages",
                                              ImagePurposeTypes.logo)
            if s3_base_url:
                profile_image = Image(serve_url=s3_base_url, purpose=ImagePurposeTypes.logo)
                profile_image.save()
                new_business.profile_image = profile_image
                new_business.save()

        # premium tagging

        if validated_data.get('premium', None):
            vp = Properties(key=LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP,
                            source=ContentModelSource.backend,
                            source_desc="legacy_model_utils migration")
            vp.save()
            new_business.properties.add(vp)

        # roles

        for role in validated_data['business_roles']:
            new_business.roles.add(BusinessRoleType.objects.filter(slug=role).first())

        # business location

        if 'business_location' in validated_data:
            new_business.set_business_location_from_payload(validated_data['business_location'])

        return {"id": new_business.id, "slug": new_business.slug}

    def update(self, instance, validated_data):

        rc = {"id": instance.id}

        if not instance:
            raise LSTVGenericAPIViewResourceNotFoundException(f"cannot find sub-object")
        change = False

        if 'inquiry_email' in validated_data:
            instance.inquiry_email = validated_data['inquiry_email']
            change = True

        if 'subscription_level' in validated_data:
            sl = BusinessSubscriptionLevel.objects.filter(slug=validated_data['subscription_level']).first()
            instance.subscription_level = sl
            instance.set_premium_membership(validated_data['subscription_level'] != 'free')
            change = True

        if 'business_name' in validated_data:
            instance.name = validated_data['business_name']
            instance.slug = slugify_2(validated_data['business_name'])
            rc["new_business_name"] = instance.name
            rc["new_slug"] = instance.slug

            change = True

        if 'description' in validated_data:
            instance.description = validated_data['description']
            change = True

        if 'website' in validated_data:
            instance.website = validated_data['website']
            change = True

        if 'business_location' in validated_data:
            for bl in instance.business_locations.all():
                bl.delete()
            BusinessLocation.objects.filter(business=instance).delete()
            instance.business_locations.clear()
            instance.set_business_location_from_payload(validated_data['business_location'])
            change = True

        if 'profile_image_url' in validated_data:
            if validated_data['profile_image_url'] == None:
                if instance.profile_image:
                    instance.profile_image.delete_deep()
                instance.profile_image = None
                change = True
            else:
                image = create_upload_image(validated_data['profile_image_url'], purpose=ImagePurposeTypes.thumbnail,
                                            change_acl=True)
                if image:
                    instance.profile_image = image
                    change = True

        if 'card_thumbnail_url' in validated_data:
            if validated_data['card_thumbnail_url'] == None:
                if instance.card_thumbnail:
                    instance.card_thumbnail.delete_deep()
                instance.card_thumbnail = None
                change = True
            else:
                image = create_upload_image(validated_data['card_thumbnail_url'], purpose=ImagePurposeTypes.thumbnail,
                                            change_acl=True)
                if image:
                    instance.card_thumbnail = image
                    change = True

        if 'profile_image' in validated_data:
            if instance.profile_image:
                # delete old one
                delete_filename = instance.profile_image.serve_url
                # remove old variations of the image file from s3
                delete_file_from_aws_s3("images/businessProfileImages", delete_filename)
                delete_file_from_aws_s3("images/businessProfileImages", delete_filename.replace("-orig", "-dsk"))
                delete_file_from_aws_s3("images/businessProfileImages", delete_filename.replace("-orig", "-tab"))
                delete_file_from_aws_s3("images/businessProfileImages", delete_filename.replace("-orig", "-mbl"))

            if len(validated_data['profile_image']) > 0:
                filename = create_image_from_base64(f"{instance.id}-orig", validated_data['profile_image'])
                s3_base_url = upload_image_to_cdn(filename, "images/businessProfileImages", ImagePurposeTypes.logo)
                if instance.profile_image:
                    instance.profile_image.serve_url = s3_base_url
                    instance.profile_image.save()
                    change = True
                else:
                    profile_image = Image(serve_url=s3_base_url,
                                          purpose=ImagePurposeTypes.profile_avatar)
                    profile_image.save()
                    instance.profile_image = profile_image
                    change = True
            else:
                if instance.profile_image:
                    instance.profile_image.delete()
                    instance.profile_image = None
                    change = True

        if change:
            instance.save()

        return rc

    def to_representation(self, obj):
        if self.scope == 'suspended_dmz':
            biz = Business.objects_all_states.filter(pk=obj.dmz_originating_business_id).first()
            vid = Video.objects_all_states.filter(pk=obj.dmz_originating_video_id).first()
            if vid:
                post = Post.objects_all_states.filter(pk=vid.post_id).first()
            else:
                post = None

            return {
                "created_at": obj.created_at,
                "name": obj.name,
                "slug": obj.slug,
                "suggested_by": biz.name if biz else None,
                "suggested_by_slug": biz.slug if biz else None,
                "suggested_by_id": biz.id if biz else None,
                "in_video_title": vid.title if vid else None,
                "in_video_slug": post.slug if post else None,
                "in_video_id": vid.id if vid else None,
                "video_thumbnail": vid.get_thumbnail_url() if vid else None
            }

        if self.verbosity == ContentVerbosityType.slug:
            return {
                "slug": obj.slug
            }

        if self.verbosity == ContentVerbosityType.search_hint:
            main_loc = obj.business_locations.first()

            roles = []
            for role in obj.roles.all().order_by("-weight_in_videos"):
                r = {'role': role.name, 'role_slug': role.slug}
                roles.append(r)

            return {
                "name": obj.name,
                "slug": obj.slug,
                "display_location": str(main_loc),
                "weight_videos": obj.weight_videos,
                "premium": obj.has_premium_membership(),
                "subscription_level": 'free' if not obj.subscription_level else obj.subscription_level.slug,
                "role": obj.roles.first().name,
                "role_slug": obj.roles.first().name,
                "roles": roles,
                "bg_color": obj.roles.first().role_family_type.bg_color if obj.roles.first() else "#fff"
            }

        roles = BusinessRoleTypeSerializer(many=True).to_representation(obj.roles.all())

        if self.verbosity in [ContentVerbosityType.administration, ContentVerbosityType.admin_list]:
            main_loc = obj.business_locations.first()

            claim_status = None
            if obj.account_claim_code and not obj.account_claimed_at:
                claim_status = 'Pending'
            if not obj.account_claim_code and obj.account_claimed_at:
                claim_status = f"claimed on {obj.account_claimed_at.strftime('%Y-%m-%d')}"
            rc = {
                "id": obj.id,
                "name": obj.name,
                "created_at": obj.created_at,
                "deleted_at": obj.deleted_at,
                "slug": obj.slug,
                "display_location": str(main_loc) if main_loc else "",
                'weight_videos': obj.weight_videos,
                'weight_articles': obj.weight_articles,
                'weight_photos': obj.weight_photos,
                'claim_status': claim_status,
                "subscription_level": 'free' if not obj.subscription_level else obj.subscription_level.slug,
                'account_claim_url':
                    f"{WEB_SERVER_URL}/account-claim?code={obj.account_claim_code}"
                    if obj.account_claim_code and not obj.account_claimed_at else None,
                'account_claimed_at': obj.account_claimed_at,
                'roles': roles,
                "bg_color": obj.roles.first().role_family_type.bg_color if obj.roles.first() else "#fff"
            }

            if self.scope != 'active':
                if obj.state_desc and len(obj.state_desc) > 0:
                    desc = json.loads(obj.state_desc[0])
                    rc["issue"] = obj.state_reason

            if self.scope != 'deleted':
                del rc['deleted_at']

            return rc

        reviews = ReviewsSerializer().to_representation(list(obj.reviews.all()))
        social_links = BusinessSocialLinksSerializer().to_representation(list(obj.social_links.all()))
        phones = BusinessPhoneSerializer().to_representation(list(obj.business_phones.all()))
        frequently_works_with = BusinessCohortSerializer().to_representation(list(obj.get_works_with_businesses(True)))
        venue_types = BusinessVenueTypesSerializer().to_representation(list(obj.venue_types.all()))
        business_locations = BusinessLocationAndCoverageSerializer(
            request_context='location', verbosity=self.verbosity).to_representation(
            list(BusinessLocation.objects.filter(business=obj)))
        coverage_locations = BusinessLocationAndCoverageSerializer(
            request_context='coverage').to_representation(list(obj.coverage_locations.all()))
        public_team = BusinessPublicTeamSerializer(many=True).to_representation(obj.public_team.all())
        associate_brands = BusinessAssociateBrandsSerializer(many=True).to_representation(obj.associate_brands.all())
        sold_at_businesses = BusinessSoldAtSerializer(many=True).to_representation(
            obj.sold_at_businesses.all().order_by('-subscription_level__numerical_value', 'name'))

        faq = InPageMessagingSerializer(request=self.request,
                                        request_context=MessageContextTypeEnum.business_faq).to_representation(
            obj.faq)
        public_team_faq = InPageMessagingSerializer(request=self.request,
                                                    request_context=MessageContextTypeEnum.business_team_faq). \
            to_representation(obj.public_team_faq)
        tags = TagSerializer(many=True).to_representation(obj.tags.all())
        organized_events = BusinessOrganizedEventsSerializer(many=True).to_representation(obj.organized_events.all())
        business_photos = BusinessPhotoSerializer(many=True).to_representation(
            list(BusinessPhoto.objects.filter(business=obj)))
        shopping = ShoppingItemSerializer(many=True).to_representation(obj.shopping_items)

        promo_videos = PromoVideoSourceSerializer(many=True).to_representation(
            PromoVideo.objects.filter(is_draft=False, visibility=PostVisibilityEnum.public, business=obj))

        contact_user, contact_email = obj.get_contact_for_inquiry()

        # website repairs for react:

        if obj.website:
            if not obj.website.startswith("http"):
                obj.website = f"https://{obj.website}"
                obj.save()

        data = {
            'id': obj.id,
            'name': obj.name,
            'description': obj.description,
            'slug': obj.slug,
            'website': obj.website,
            'phones': phones,
            'inquiry_email': contact_email if not obj.hide_email else None,
            'social_links': social_links,
            'premium': obj.has_premium_membership(),
            "subscription_level": 'free' if not obj.subscription_level else obj.subscription_level.slug,
            'card_thumbnail_url': obj.get_thumbnail_image_url(),
            'bg_color': "#000" if obj.roles.count() == 0 else (
                    obj.roles.first().bg_color or obj.roles.first().role_family_type.bg_color),
            'profile_image': obj.profile_image.get_serve_url() if obj.profile_image else None,
            'roles': roles,
            'venue_types': venue_types,
            'reviews': reviews,
            'channel_views': obj.channel_views,
            'subscribers': obj.subscribers.all().count(),
            'video_views': obj.video_views,
            'article_views': obj.article_views,
            'weight_videos': obj.weight_videos,
            'weight_articles': obj.weight_articles,
            'weight_photos': obj.weight_photos,
            'card_impressions': obj.card_impressions,
            'alt_contact_cta_label': obj.alt_contact_cta_label,
            'alt_contact_cta_link': obj.alt_contact_cta_link,
            'faq': faq,
            'cohorts': frequently_works_with,
            'likes': obj.likes,
            'shares': obj.shares,
            'business_locations': business_locations,
            'coverage_locations': coverage_locations,
            'publicTeam': public_team,
            'publicTeamFaq': public_team_faq,
            'associate_brands': associate_brands,
            'sold_at_businesses': sold_at_businesses,
            'photos': business_photos,
            'shopping': shopping,
            'tags': tags,
            'organized_events': organized_events,
            'promo_videos': promo_videos
        }

        if not obj.weight_videos and len(business_photos) == 0:
            data['photos'] = [
                {
                    "id": None,
                    "title": obj.name,
                    "description": None,
                    "order": 0,
                    "scope": "placeholder",
                    "url": "https://cdn.lovestoriestv.com/images/site/default_business_header.jpg",
                    "width": 1920,
                    "height": 1080,
                    "credit": "Evie Shaffer - Pexels.com"
                }
            ]

        # filtering for verbosity

        if self.verbosity == ContentVerbosityType.card:
            del data['reviews']
            del data['faq']
            del data['cohorts']
            del data['venue_types']
            del data['social_links']
            del data['photos']
            del data['organized_events']
            del data['sold_at_businesses']
            del data['associate_brands']

        return data

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        if 'business_name' in data:
            te = Business.objects.filter(slug=slugify_2(data.get('business_name', None))).first()
            if (te and method == 'POST') or (te and te.id != self.element.id):
                raise serializers.ValidationError(
                    {"business_name": [f"already exists: {data.get('business_name', None)}"]})

        if 'subscription_level' in data and data['subscription_level'] not in ['free', 'basic', 'plus', 'premium']:
            raise serializers.ValidationError(
                {"subscription_level": [f"{data['subscription_level']} is an invalid subscription level"]})

        return data
