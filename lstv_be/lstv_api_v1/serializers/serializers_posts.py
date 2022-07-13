from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.utils.aws_utils import delete_file_from_aws_s3
from lstv_api_v1.utils.legacy_model_utils import generate_random_password
from lstv_api_v1.utils.utils import get_preview_text_from_html, convert_legacy_blog_content, \
    SERIALIZER_DETAIL_LEVEL_CONTEXT_FULL, SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL, SERIALIZER_DETAIL_LEVEL_CONTEXT_CARD, \
    build_location_from_google_places, set_volatile_value, create_image_from_base64, \
    upload_image_to_cdn
from rest_framework import serializers
from lstv_api_v1.views.utils.view_utils import *
from lstv_api_v1.models import *

# contexts

VIDEO_SERIALIZER_CCE_MAIN_VIDEO = 'cce_main_video'


class PropertySerializer(LSTVBaseSerializer):

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        data = {}
        for prop in obj.all():
            data[prop.key] = prop.get_value()
        return data


class ArticleBusinessSerializer(LSTVBaseSerializer):
    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        business_roles = ", ".join([e['name'] for e in obj.roles.all().values()])

        data = {
            'name': obj.name,
            'slug': obj.slug,
            'type': business_roles,
            'premium': obj.has_premium_membership(),
            "subscription_level": obj.subscription_level.slug,
            'bg_color': obj.roles.first().bg_color or obj.roles.first().role_family_type.bg_color,
        }

        return data


class VideoBusinessSerializer(LSTVBaseSerializer):

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        data = {
            'name': obj.business.name,
            'slug': obj.business.slug,
            'role_name': obj.business_role_type.name,
            'singular': obj.business_role_type.singular,
            'plural': obj.business_role_type.plural,
            'role_slug': obj.business_role_type.slug,
            'premium': obj.business.has_premium_membership(),
            "subscription_level": obj.business.subscription_level.slug,
            'bg_color': obj.business_role_type.bg_color or obj.business_role_type.role_family_type.bg_color,
            'role_family': obj.business_role_type.role_family_type.slug,
            'weight': obj.business.weight_videos + obj.business.weight_articles,
            'logo_image_url': obj.business.get_profile_image_url()
        }

        if obj.business_capacity_type:
            data['business_capacity_type_name'] = obj.business_capacity_type.name
            data['business_capacity_type_slug'] = obj.business_capacity_type.slug

        # if this is tagged as primary, reflect that.
        if obj.primary:
            data['primary'] = True

        return data


class BusinessLocationSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        def get_obj_dict(obj):
            if hasattr(obj, 'location_type'):
                data = {'location_type': obj.location_type.name}
            if hasattr(obj, 'description'):
                data['location_description'] = obj.description
            if obj.location.long:
                data['long'] = obj.location.long
            if obj.location.lat:
                data['lat'] = obj.location.lat

            if obj.location.country:
                data['country'] = obj.location.country.name
                data['country_url'] = obj.location.get_country_url()

            if obj.location.state_province:
                data['state_province'] = obj.location.state_province.name
                data['state_province_url'] = obj.location.get_state_province_url()

            if obj.location.place:
                data['place'] = obj.location.place.name
                data['place_url'] = obj.location.get_place_url()

            return data

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessTeamMembersSerializer(LSTVBaseSerializer):
    first_name = serializers.CharField(min_length=1, max_length=100)
    last_name = serializers.CharField(min_length=1, max_length=100)
    email = serializers.CharField(min_length=5, max_length=100)
    role = serializers.CharField(min_length=1, max_length=100)

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessTeamMembersSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['first_name'].required = method in ['POST']
        fields['last_name'].required = method in ['POST']
        fields['email'].required = method in ['POST']
        fields['role'].required = method in ['POST']
        return fields

    def validate(self, data):
        user = self.request.user
        if 'email' in data:
            business = user.get_business_for_user_if_team_member()
            if business:
                # prevent duplicate email for team member
                if BusinessTeamMember.objects.filter(business=self.element, user__email=data['email']).count() > 0:
                    raise serializers.ValidationError({'email': [f"email  {data['email']} already exists "
                                                                 f"for {self.element.slug}"]})
        if 'role' in data:
            if BusinessTeamMemberRoleType.objects.filter(slug=data['role']).count() < 1:
                raise serializers.ValidationError({'role': [f"{data['role']} is invalid"]})
        return data

    def create(self, validated_data):
        from lstv_api_v1.tasks.tasks import job_send_sendgrid
        from lstv_be.settings import WEB_SERVER_URL
        # create user
        new_user = User(email=validated_data['email'],
                        first_name=validated_data['first_name'],
                        last_name=validated_data['last_name'],
                        user_type=UserTypeEnum.business_team_member,
                        source=ContentModelSource.organic)
        new_user.set_password(generate_random_password())
        new_user.save()

        # create team member records
        tm = BusinessTeamMember(business=self.element, user=new_user,
                                invited_at=datetime.now().replace(tzinfo=timezone.utc),
                                invitation_code_pending=uuid.uuid4())
        tm.save()
        tm.roles.add(BusinessTeamMemberRoleType.objects.filter(slug=validated_data['role']).first())

        # retain invite code for business/user

        set_volatile_value(tm.invitation_code_pending,
                           {"team_member": tm.id,
                            "business": self.element.id}, 2 if settings.DEBUG else 3 * 1440)

        job_send_sendgrid.delay("donotreply@lovestoriestv.com",
                                f"{self.element.name} via Love Stories TV",
                                validated_data['email'],
                                new_user.get_full_name(),
                                f"Team invitation from {self.element.name} via Love Stories TV",
                                "d-ab1293110e1b41959e6150f350beba92", {
                                    'business_name': self.element.name,
                                    'lstv_name': 'Love Stories TV (Password Recovery)',
                                    'lstv_email': 'donotreply@lovestoriestv.com',
                                    'subject': f"Team invitation from {self.element.name} via Love Stories TV",
                                    "to_name": f"{validated_data['first_name']} {validated_data['last_name']}",
                                    "cta_url": f"{WEB_SERVER_URL}/businessTeamInvitation?code={tm.invitation_code_pending}",
                                    "hidden_message": f"{self.element.name} Invites you to join its "
                                                      f"ranks on Love Stories TV"
                                })

        return {"email": new_user.email,
                "invitation_code": tm.invitation_code_pending}

    def update(self, instance, validated_data):
        return {}

    def to_representation(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "name": obj.user.get_full_name(),
            "profile_image_url": obj.user.get_thumbnail_url(),
            "roles": obj.roles.values_list('slug', flat=True),
            "pending_invitation": obj.invitation_code_pending is not None,
            "invited_at": obj.invited_at,
            "invitation_accepted_at": obj.accepted_at,
            "last_login": past_date_label(obj.user.last_login) if obj.user.last_login else "never"
        }


class BusinessPublicTeamSerializer(LSTVBaseSerializer):
    name = serializers.CharField(min_length=1, max_length=200)
    title = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500)
    headshot_image = serializers.CharField()

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessPublicTeamSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['name'].required = method in ['POST', 'PATCH']
        fields['title'].required = method in ['POST', 'PATCH']
        fields['description'].required = False
        fields['headshot_image'].required = False
        fields['headshot_image'].allow_blank = method in ['PATH']
        return fields

    def validate(self, data):

        if 'name' in data:
            if self.request.method == 'POST':
                if self.element.public_team.filter(name=data['name']).count() > 0:
                    raise serializers.ValidationError(
                        {"name": [f"{data['name']} already exists as a public team member"]})
            if self.request.method == 'PATCH':
                pass
        return data

    def create(self, validated_data):
        from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3
        # do we have an image?

        p = PublicTeamPerson(name=validated_data['name'],
                             title=validated_data['title'],
                             description=validated_data.get('description', None))
        p.save()
        self.element.public_team.add(p)

        if 'headshot_image' in validated_data:
            filename = create_image_from_base64(f"{p.id}-orig", validated_data['headshot_image'])
            s3_base_url = upload_image_to_cdn(filename, "images/publicTeamMembers", ImagePurposeTypes.profile_avatar)
            headshot_image = Image(serve_url=s3_base_url,
                                   purpose=ImagePurposeTypes.profile_avatar)
            headshot_image.save()
            p.headshot_image = headshot_image
            p.save()

        return {"name": p.name,
                "title": p.title}

    def update(self, instance, validated_data):
        change = False
        if 'name' in validated_data:
            instance.name = validated_data['name']
            change = True
        if 'title' in validated_data:
            instance.title = validated_data['title']
            change = True
        if 'description' in validated_data:
            instance.description = validated_data['description']
            change = True
        if 'headshot_image' in validated_data:
            if instance.headshot_image:
                # delete old one
                delete_filename = instance.headshot_image.serve_url
                # remove old variations of the image file from s3
                delete_file_from_aws_s3("images/publicTeamMembers", delete_filename)
                delete_file_from_aws_s3("images/publicTeamMembers", delete_filename.replace("-orig", "-dsk"))
                delete_file_from_aws_s3("images/publicTeamMembers", delete_filename.replace("-orig", "-tab"))
                delete_file_from_aws_s3("images/publicTeamMembers", delete_filename.replace("-orig", "-mbl"))

            if len(validated_data['headshot_image']) > 0:
                filename = create_image_from_base64(f"{instance.id}-orig", validated_data['headshot_image'])
                s3_base_url = upload_image_to_cdn(filename, "images/publicTeamMembers",
                                                  ImagePurposeTypes.profile_avatar)
                if instance.headshot_image:
                    instance.headshot_image.serve_url = s3_base_url
                    instance.headshot_image.save()
                    change = True
                else:
                    headshot_image = Image(serve_url=s3_base_url,
                                           purpose=ImagePurposeTypes.profile_avatar)
                    headshot_image.save()
                    instance.headshot_image = headshot_image
                    change = True
            else:
                if instance.headshot_image:
                    instance.headshot_image.delete()
                    instance.headshot_image = None
                    change = True

        if change:
            instance.save()
        return {"id": instance.id}

    def to_representation(self, obj):
        return {
            "id": obj.id,
            "name": obj.name,
            "title": obj.title,
            "description": obj.description,
            "headshot_image_url": obj.get_headshot_url(),
        }


class BusinessLocationAndCoverageSerializer(LSTVBaseSerializer):
    location_id = serializers.UUIDField()
    location = serializers.JSONField()
    locations = serializers.JSONField()

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or DELETE we do not require most of the mandatory fields.
        """
        fields = super(BusinessLocationAndCoverageSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)

        fields['location_id'].required = method in ['POST'] and not fields.get('location', None)
        fields['location'].required = method in ['POST'] and not fields.get('location_id', None)
        fields['locations'].required = method in ['PATCH']

        return fields

    def validate(self, data):
        def location_id_exists(id):
            if self.request_context == 'location':
                return self.element.business_locations.all().filter(id=id).count() > 0
            elif self.request_context == 'coverage':
                return self.element.coverage_locations.all().filter(id=id).count() > 0
            return False

        if not self.element:
            raise serializers.ValidationError(f"unable to find location container object")

        method = getattr(self.request, 'method', None)

        if 'location_id' in data:
            # do we have such a location?
            try:
                if method == 'POST':
                    loc = Location.objects.get(pk=data['location_id'])
                    # duplicate?
                    if location_id_exists(loc.id):
                        raise serializers.ValidationError(f"location id {data['location_id']} already exists "
                                                          f"for the business")
            except Location.DoesNotExist:
                raise serializers.ValidationError(f"no location object found with id {data['location_id']}")

        if data.get('location', {}).get('google', {}).get('components'):
            if method == 'POST':
                bl = build_location_from_google_places(data['location']['google'])
                if location_id_exists(bl.id):
                    raise serializers.ValidationError(f"location already exists the business")

        return data

    def create(self, validated_data):
        bl = None
        if 'location_id' in validated_data:
            bl = Location.objects.get(pk=validated_data['location_id'])

        if 'location' in validated_data:
            bl = build_location_from_google_places(validated_data['location']['google'])

        if bl:
            if self.request_context == 'location':
                vl = BusinessLocation(business=self.element, location=bl)
                vl.save()
            elif self.request_context == 'coverage':
                self.element.coverage_locations.add(bl)
            return {
                "business_id": self.element.id,
                "location_id": bl.id}
        return {}

    def update(self, instance, validated_data):

        if self.request_context == 'location':
            for bl in self.element.business_locations.all():
                BusinessLocation.objects.filter(business=instance).delete()
                bl.delete()

            self.element.business_locations.clear()
        elif self.request_context == 'coverage':
            for bl in self.element.coverage_locations.all():
                bl.delete()
            self.element.coverage_locations.clear()

        for gloc in validated_data['locations']:
            loc = build_location_from_google_places(gloc)
            if self.request_context == 'location':
                vl = BusinessLocation(business=instance, location=loc)
                vl.save()
            if self.request_context == 'coverage':
                self.element.coverage_locations.add(loc)
        return {
            "business_id": self.element.id
        }

    def to_representation(self, obj):

        def get_location_dict(obj):
            data = {}
            if self.request_context == 'location':

                if self.verbosity != ContentVerbosityType.card:
                    data = {
                        "location_type": obj.location_type.name,
                        "location_description": obj.location_description,
                    }
                else:
                    data = {}
                try:
                    obj = obj.location
                except Location.DoesNotExist:
                    return None
            elif self.request_context == 'coverage':
                data = {}

            data = {**data,
                    **LocationSerializer(verbosity=self.verbosity).to_representation(obj)}

            return data

        if isinstance(obj, list):
            rc = []
            for e in obj:
                l = get_location_dict(e)
                if l:
                    rc.append(l)
            return rc
        else:
            rc = get_location_dict(obj)
            return rc


class ThumbnailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image

        fields = (
            'legacy_url',
        )


class VideoVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoSource

        fields = (
            'id',
        )


class VideoBusinessCapacityTypeSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='business_role_type.name')
    role_slug = serializers.CharField(source='business_role_type.slug')
    bg_color = serializers.CharField(source='business_role_type.role_family_type.bg_color')

    class Meta:
        model = VideoBusinessCapacityType

        fields = (
            'name',
            'slug',
            'singular',
            'plural',
            'role_name',
            'role_slug',
            'bg_color',
            'business_role_type'
        )


class BusinessSoldAtSerializer(LSTVBaseSerializer):
    slug = serializers.CharField()
    array = serializers.JSONField()

    _business = None

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessSoldAtSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['slug'].required = method in ['POST']
        fields['array'].required = method in ['PATCH']

        return fields

    def validate_slug(self, value):
        b = Business.objects.filter(slug=value).first()
        if not b:
            raise serializers.ValidationError({"slug": [f"slug {value} matches no existing business"]})
        self._business = b
        return value

    def validate_array(self, value):
        for v in value:
            if not Business.objects.filter(slug=v).first():
                raise serializers.ValidationError({"array": [f"slug {v} matches no existing business"]})
        return value

    def create(self, validated_data):
        self.element.sold_at_businesses.add(self._business)
        return {
            "business_id": self.element.id,
            'slug': self._business.slug}

    def update(self, instance, validated_data):
        change = False
        self.element.sold_at_businesses.clear()
        for v in validated_data['array']:
            self.element.sold_at_businesses.add(Business.objects.filter(slug=v).first())
        if change:
            instance.save()

        return {
            "business_id": self.element.id,
            "id": instance.id}

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'name': obj.name,
                'slug': obj.slug,
                'premium': obj.has_premium_membership(),
                'bg_color': obj.roles.first().bg_color or obj.roles.first().role_family_type.bg_color,
                'role_name': obj.roles.first().name,
                'role_slug': obj.roles.first().slug,
                'singular': obj.roles.first().singular,
                'plural': obj.roles.first().plural,
                'role_family': obj.roles.first().role_family_type.name,
                'weight': obj.weight_videos + obj.weight_articles
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class TagSerializer(LSTVBaseSerializer):
    slug = serializers.CharField()
    array = serializers.JSONField()

    _tag = None

    def get_fields(self, *args, **kwargs):
        fields = super(TagSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['slug'].required = method == 'POST'
        fields['array'].required = method == 'PATCH'
        return fields

    def validate_slug(self, value):
        t = TagType.objects.filter(slug=value).first()
        if not t:
            raise serializers.ValidationError({"slug": [f"slug {value} matches no existing tag"]})
        self._tag = t
        return value

    def create(self, validated_data):
        self.element.tags.add(self._tag)
        return {
            'id': self.element.id,
            'slug': self._tag.slug}

    def update(self, instance, validated_data):
        self.element.tags.clear()
        for t in validated_data['array']:
            self.element.tags.add(TagType.objects.filter(slug=t).first())

        return {
            "id": self.element.id,
            "tag_id": self._tag.id if self._tag else None
        }

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'name': obj.name,
                'slug': obj.slug
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessCohortSerializer(LSTVBaseSerializer):
    def __init__(self, *args, **kwargs):
        super(BusinessCohortSerializer, self).__init__(*args)

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'slug': obj.slug
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessVenueTypesSerializer(LSTVBaseSerializer):
    venue_type = serializers.CharField()
    array = serializers.JSONField(required=False)

    _vt = None

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessVenueTypesSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)

        fields['venue_type'].required = method in ['POST']

        return fields

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        if self.element:
            if not self.element.roles.filter(slug='venue').first():
                raise serializers.ValidationError(
                    {"venue_type": f"this business is not a venue and cannot have venue types"})

        if 'venue_type' in data:
            vt = BusinessVenueType.objects.filter(slug=data['venue_type']).first()
            if not vt:
                raise serializers.ValidationError({"venue_type": f"no such venue type slug"})
            else:
                self._vt = vt

            # for POST, make sure we do not have this type already

            exists = self.element.venue_types.filter(slug=data['venue_type']).first()
            if exists and (method in ['POST'] or exists.id != self.element.id):
                raise serializers.ValidationError({"venue_type": f"already exists for the business"})

        if method in ['PATCH']:
            if 'array' not in data:
                raise serializers.ValidationError({"array": f"valid JSON array of venue type slugs is required"})

            if len(data['array']) != len(set(data['array'])):
                raise serializers.ValidationError({"array": f"duplicates are not allowed in list"})

            if len(data['array']) < 1:
                raise serializers.ValidationError({"array": f"must have at least one element"})

            for vt in data['array']:
                if BusinessVenueType.objects.filter(slug=vt).count() == 0:
                    raise serializers.ValidationError({"array": f"{vt} is not a valid venue type"})

        return data

    def create(self, validated_data):
        self.element.venue_types.add(self._vt)
        return {
            "business_id": self.element.id,
            "slug": self._vt.slug
        }

    def update(self, instance, validated_data):
        # remove all venue_types
        self.element.venue_types.clear()

        for vt in validated_data['array']:
            self.element.venue_types.add(BusinessVenueType.objects.filter(slug=vt).first())
        return {
            "id": self.element.id}

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'name': obj.name,
                'slug': obj.slug
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessPhoneSerializer(LSTVBaseSerializer):
    country = serializers.CharField(min_length=2)
    type = serializers.ChoiceField(choices=PhoneTypeEnum)
    number = serializers.CharField(min_length=4, max_length=20)

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessPhoneSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)

        fields['country'].required = method in ['POST']
        fields['type'].required = False
        fields['number'].required = method in ['POST']

        return fields

    def validate(self, data):

        if 'country' in data:
            # is there such a country?
            if Country.objects.filter(Q(iso2=data['country']) | Q(iso3=data['country'])).count() < 1:
                raise serializers.ValidationError(
                    {"country": f"no country found for iso code {data['country']}"})
        return data

    def create(self, validated_data):
        phone = Phone(country=Country.objects.filter(Q(iso2=validated_data['country']) |
                                                     Q(iso3=validated_data['country'])).first(),
                      type=validated_data['type'],
                      number=validated_data['number'])
        phone.save()
        self.element.business_phones.add(phone)
        return {
            "business_id": self.element.id
        }

    def update(self, instance, validated_data):
        change = False

        if 'country' in validated_data:
            instance.country = country = Country.objects.filter(Q(iso2=validated_data['country']) |
                                                                Q(iso3=validated_data['country'])).first()
            change = True

        if 'country' in validated_data:
            instance.type = validated_data['type']
            change = True

        if 'number' in validated_data:
            instance.number = validated_data['number']
            change = True

        if change:
            instance.save()

        return {
            "business_id": self.element.id,
            "id": instance.id}

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'id': obj.id,
                'type': obj.type.name,
                'display_phone_number': obj.number,
                'link_phone_number': obj.get_phone_number_link().replace(" ","").replace(".",""),
                'country': obj.country.name,
                'country_iso2': obj.country.iso2,
                'country_iso3': obj.country.iso3,
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessAssociateBrandsSerializer(LSTVBaseSerializer):
    name = serializers.CharField(min_length=2, max_length=50, required=False)
    business = serializers.CharField(min_length=2, max_length=100, required=False)
    description = serializers.CharField(required=False)
    link = serializers.URLField(required=False)
    logo_image = serializers.CharField(required=False)

    _business = None

    def get_fields(self, *args, **kwargs):
        """
        """
        fields = super(BusinessAssociateBrandsSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['logo_image'].allow_blank = method in ['PATCH']
        return fields

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        if 'business' in data and 'name' in data:
            raise serializers.ValidationError("provide either business --OR-- name, link, description (optional), "
                                              "logo_image (optional).")

        if 'business' in data:
            v = Business.objects.filter(slug=data['business']).first()
            if not v:
                raise serializers.ValidationError({"business": [f"business slug {data['business']} does not exist"]})
            self._business = v
        else:
            if 'name' in data and 'link' in data:
                # existing?
                exists = self.element.associate_brands.filter(name=data['name']).first()
                if exists and (method == 'POST' or self.sub_element.id != exists.id):
                    raise serializers.ValidationError({"name": [f"{data['name']} already exists for the business"]})
            else:
                raise serializers.ValidationError("business or name & link are required")

        return data

    def create(self, validated_data):
        if 'business' in validated_data:
            brand = Brand(business=self._business)
            brand.save()
            self.element.associate_brands.add(brand)
            return {"id": brand.id}
        else:
            brand = Brand(name=validated_data['name'],
                          link=validated_data['link'],
                          description=validated_data.get('description', None))
            brand.save()

            if 'logo_image' in validated_data:
                filename = create_image_from_base64(f"{brand.id}-orig", validated_data['logo_image'])
                s3_base_url = upload_image_to_cdn(filename, "images/associateBrands",
                                                  ImagePurposeTypes.profile_avatar)
                if s3_base_url:
                    logo_img = Image(serve_url=s3_base_url, purpose=ImagePurposeTypes.logo)
                    logo_img.save()
                    brand.logo_image = logo_img
                    brand.save()

            self.element.associate_brands.add(brand)
            return {
                "business_id": self.element.id,
                "id": brand.id}

    def update(self, instance, validated_data):
        change = False

        if 'business' in validated_data:
            instance.business = self._business
            instance.name = None
            instance.description = None
            instance.link = None
            if instance.logo_image:
                instance.logo_image.delete()
                instance.logo_image = None
            change = True

        if 'name' in validated_data:
            instance.name = validated_data['name']
            instance.business = None
            change = True

        if 'description' in validated_data:
            instance.description = validated_data['description']
            instance.business = None
            change = True

        if 'link' in validated_data:
            instance.link = validated_data['link']
            instance.business = None
            change = True

        if 'logo_image' in validated_data:
            if instance.logo_image:
                instance.business = None
                # delete old one
                delete_filename = instance.logo_image.serve_url
                # remove old variations of the image file from s3
                delete_file_from_aws_s3("images/associateBrands", delete_filename)
                delete_file_from_aws_s3("images/associateBrands", delete_filename.replace("-orig", "-dsk"))
                delete_file_from_aws_s3("images/associateBrands", delete_filename.replace("-orig", "-tab"))
                delete_file_from_aws_s3("images/associateBrands", delete_filename.replace("-orig", "-mbl"))

            if len(validated_data['logo_image']) > 0:
                filename = create_image_from_base64(f"{instance.id}-orig", validated_data['logo_image'])
                s3_base_url = upload_image_to_cdn(filename, "images/associateBrands", ImagePurposeTypes.profile_avatar)
                if instance.logo_image:
                    instance.logo_image.serve_url = s3_base_url
                    instance.logo_image.save()
                    change = True
                else:
                    logo_image = Image(serve_url=s3_base_url,
                                       purpose=ImagePurposeTypes.profile_avatar)
                    logo_image.save()
                    instance.logo_image = logo_image
                    change = True
            else:
                if instance.logo_image:
                    instance.logo_image.delete()
                    instance.logo_image = None
                    change = True

        if change:
            instance.save()
        return {
            "business_id": self.element.id,
            "id": instance.id}

    def to_representation(self, obj):
        from lstv_be.settings import WEB_SERVER_URL

        def get_obj_dict(obj):
            return {
                'id': obj.id,
                'name': obj.name if obj.name else obj.business.name,
                'description': obj.description or obj.business.description,
                'link': obj.link or f"/business/{obj.business.slug}",
                'logo_image_url': obj.get_logo_image() or obj.business.get_profile_image_url()
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessSocialLinksSerializer(LSTVBaseSerializer):
    type = serializers.CharField(min_length=1, max_length=25)
    account = serializers.CharField(min_length=1, max_length=50)

    def get_fields(self, *args, **kwargs):
        """
        """
        fields = super(BusinessSocialLinksSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['type'].required = method in ['POST']
        fields['account'].required = method in ['POST']
        return fields

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        if 'type' in data:
            if SocialNetworkTypes.objects.filter(slug=data['type']).count() < 1:
                raise serializers.ValidationError({"type": ["type of social network is invalid"]})
            if method != 'PATCH':
                exists = self.element.social_links.filter(social_network=SocialNetworkTypes.objects.filter(
                    slug=data['type']).first()).first()
                if exists and (method in ['POST'] or exists.id != self.element.id):
                    raise serializers.ValidationError(f"{data['type']} social link already exists for this business")

        return data

    def create(self, validated_data):
        sn = SocialLink(social_network=SocialNetworkTypes.objects.filter(slug=validated_data['type']).first(),
                        profile_account=validated_data['account'])
        sn.save()
        self.element.social_links.add(sn)

        return {
            "business_id": self.element.id,
            "social_link_id": sn.id
        }

    def update(self, instance, validated_data):
        change = False

        if 'type' in validated_data:
            instance.social_network = SocialNetworkTypes.objects.filter(slug=validated_data['type']).first()
            change = True

        if 'account' in validated_data:
            instance.profile_account = validated_data['account']
            change = True

        if change:
            instance.save()

        return {
            "business_id": self.element.id,
            "social_link_id": instance.id
        }

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'id': obj.id,
                'type': obj.social_network.slug,
                'link': obj.get_link()
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessSubscribersSerializer(LSTVBaseSerializer):
    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        def get_obj_dict(obj):
            return {
                'id': obj.id,
                'name': obj.get_full_name_or_email()
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class BusinessRoleTypeSerializer(LSTVBaseSerializer):
    slug = serializers.CharField()
    array = serializers.JSONField()

    def __init__(self, *args, **kwargs):
        self.serializer_context = kwargs.pop('context', None)
        super(BusinessRoleTypeSerializer, self).__init__(*args, **kwargs)

    def get_fields(self, *args, **kwargs):
        """
        """
        fields = super(BusinessRoleTypeSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['slug'].required = method in ['POST']
        fields['array'].required = method in ['PATCH']
        return fields

    @staticmethod
    def is_role_slug_valid(slug):
        return BusinessRoleType.objects.filter(slug=slug).count() > 0

    def role_slug_already_exists_for_business(self, slug):
        return self.element.roles.filter(slug__icontains=slug).count() > 0

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        if method in ['POST']:
            if 'slug' in data:
                if not self.is_role_slug_valid(data['slug']):
                    raise serializers.ValidationError({"slug": [f"{data['slug']} is not a valid business role slug"]})
                if self.role_slug_already_exists_for_business(data['slug']):
                    raise serializers.ValidationError({"slug": [f"{data['slug']} already exists for the business"]})

        if method in ['DELETE']:
            if self.element and self.sub_element:
                if not self.role_slug_already_exists_for_business(self.sub_element.slug):
                    raise serializers.ValidationError({"slug": [f"{self.sub_element.slug} not found for the business"]})
            else:
                raise serializers.ValidationError({"slug": [f"invalid or missing business role slug"]})

        if method in ['PATCH']:
            if 'array' in data:
                for r in data['array']:
                    if not self.is_role_slug_valid(r):
                        raise serializers.ValidationError(
                            {"slug": [f"{r} is not a valid business role slug"]})
        return data

    def create(self, validated_data):
        rt = BusinessRoleType.objects.get(slug=validated_data['slug'])
        self.element.roles.add(rt)
        return {
            "business_slug": self.element.slug,
            "business_id": self.element.id,
            "role_slug": rt.slug}

    def update(self, instance, validated_data):
        instance.roles.clear()
        for r in validated_data['array']:
            print(r)
            r_obj = BusinessRoleType.objects.filter(slug=r).first()
            instance.roles.add(r_obj)
        return {"business_id": instance.id}

    def to_representation(self, obj):
        return {
            'name': obj.name,
            'slug': obj.slug,
            'singular': obj.singular,
            'plural': obj.plural,
            'family': obj.role_family_type.name,
            'family_slug': obj.role_family_type.slug,
            'bg_color': obj.bg_color or obj.role_family_type.bg_color
        }


class CompositeBindingItemSerializer(LSTVBaseSerializer):
    def __init__(self, *args, **kwargs):
        self.serializer_context = kwargs.pop('context', None)
        self.model_object = kwargs.pop('model_object', None)
        self.root_type = kwargs.pop('root_type', None)
        super(CompositeBindingItemSerializer, self).__init__(*args)

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        data = []
        for item in obj.all():
            element_data = get_data_from_composite_content_factory(self.root_type,
                                                                   item.composite_content_element.element_type.name,
                                                                   item.composite_content_element.options,
                                                                   self.model_object)

            item = {'order': item.order,
                    'element': {'slug': item.composite_content_element.slug,
                                'type': item.composite_content_element.element_type.name,
                                'options': item.composite_content_element.options,
                                'element_data': element_data}}
            data.append(item)
        return data

    class Meta:
        model = CompositeContentBindingItem


class CompositeContentBindingSerializer(LSTVBaseSerializer):
    def __init__(self, *args, **kwargs):
        self.serializer_context = kwargs.pop('context', None)
        self.params = kwargs.pop('params', None)

        super(CompositeContentBindingSerializer, self).__init__(*args)

    def create(self, validated_data):
        return self.super.create(validated_data)

    def update(self, instance, validated_data):
        return self.super.update(validated_data)

    def to_representation(self, obj):
        content_object = None

        if 'root_type' in self.params and 'slug' in self.params:
            content_object, model_object = get_object_from_type_slug(self.params['root_type'], self.params['slug'])

        if content_object and model_object:
            elements = CompositeBindingItemSerializer(many=False, root_type=self.params['root_type'],
                                                      model_object=model_object).to_representation(
                obj.composite_content_elements)

            return {
                'id': obj.id,
                'created_at': obj.created_at,
                'slug': obj.slug,
                'elements': elements,
                'content_object': content_object
            }
        else:
            return {}

    class Meta:
        model = CompositeContentBinding
