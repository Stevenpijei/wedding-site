from datetime import datetime, timezone, timedelta
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils.text import slugify
from django.utils.timezone import now
import uuid
from django.contrib.postgres.fields import ArrayField
from enumchoicefield import ChoiceEnum, EnumChoiceField
from django.db.models import Q, QuerySet, UniqueConstraint, FileField
import json
from django.core.cache import cache
import secrets
from rest_framework_jwt.settings import api_settings
from lstv_api_v1 import fields

#                          _      _   _
#      _ __ ___   ___   __| | ___| | | |_ _   _ _ __   ___  ___
#     | '_ ` _ \ / _ \ / _` |/ _ \ | | __| | | | '_ \ / _ \/ __|
#     | | | | | | (_) | (_| |  __/ | | |_| |_| | |_) |  __/\__ \
#     |_| |_| |_|\___/ \__,_|\___|_|  \__|\__, | .__/ \___||___/
#                                         |___/|_|
#

from lstv_api_v1.globals import LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP, \
    LSTV_DEFAULT_TTL_FOR_LATEST_UPDATE_TIMESTAMP_CACHE

from lstv_be.settings import DEFAULT_CDN, DEFAULT_CDN_BUCKET_URL


class LSTVBareBonesModel(models.Model):
    created_at = models.DateTimeField(db_index=True, auto_now_add=True)

    def predate_created_at(self, new_created_at_date, save=True):
        if new_created_at_date:
            if type(new_created_at_date) == str:
                self.created_at = datetime.strptime(new_created_at_date, '%Y-%m-%d %H:%M:%S').replace(
                    tzinfo=timezone.utc)
            elif type(new_created_at_date) == datetime:
                self.created_at = new_created_at_date.replace(
                    tzinfo=timezone.utc)
            if save:
                self.save()

    class Meta:
        abstract = True


class LSTVBaseModel(LSTVBareBonesModel):
    """
    base class for all LSTV models
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class LSTVModel(LSTVBaseModel):
    """
    base class for all LSTV model
    """
    updated_at = models.DateTimeField(db_index=True, auto_now=True, null=True)

    def get_past_date_label(self):
        from lstv_api_v1.views.utils.view_utils import past_date_label
        return past_date_label(self.created_at)

    def get_past_edited_date_label(self):
        from lstv_api_v1.views.utils.view_utils import past_date_label
        return past_date_label(self.updated_at)

    class Meta:
        abstract = True


class ContentModelState(ChoiceEnum):
    active = "active"
    pending = "pending"
    suspended = "suspended"
    deleted = "deleted"
    active_review = "active_review"
    suspended_review = "suspended_review"
    suspended_dmz = "suspended_dmz"


class ContentModelSource(ChoiceEnum):
    organic = "organic"
    legacy = "legacy"
    admin = "admin"
    backend = "backend"
    other = "other"


class LSTVQuerySet(QuerySet):

    def delete(self, hard=False):
        for obj in self:
            if not hard:
                obj.deleted_at = now()
                obj.updated_at = now()
                obj.delete_token = secrets.token_hex(5)
                obj.state = ContentModelState.deleted
                obj.save()
            else:
                obj.delete()


class LSTVContentModelManager(models.Manager):
    def get_queryset(self):
        return LSTVQuerySet(self.model, using=self._db).filter(
            Q(state=ContentModelState.active) | Q(state=ContentModelState.active_review))


class LSTVContentModel(LSTVModel):
    SELF_TIMESTAMP_MODE = "self_timestamp_mode"
    state = EnumChoiceField(ContentModelState, null=False, db_index=True, default=ContentModelState.active)
    state_desc = ArrayField(models.TextField(null=True, db_index=True, max_length=200), null=True)
    source = EnumChoiceField(ContentModelSource, null=False, db_index=True, default=ContentModelSource.organic)
    source_desc = models.TextField(null=True, db_index=True, max_length=100)
    delete_token = models.TextField(null=True, db_index=True, max_length=15)
    deleted_at = models.DateTimeField(db_index=True, null=True)

    # non deleted objects with active or active-review status
    objects = LSTVContentModelManager()
    # all non deleted objects regardless of state
    objects_all_states = models.Manager()

    # properties

    # functions

    def delete_deep(self):
        raise Exception("delete_deep must be overriden")

    def delete(self, hard=False):
        if hard:
            super(LSTVContentModel, self).delete()
        else:
            self.deleted_at = now()
            self.updated_at = now()
            self.delete_token = secrets.token_hex(5)
            self.state = ContentModelState.deleted
            self.save()

    def add_state_desc(self, key, desc, save=True):

        if type(desc) is str:
            desc = {"issue": desc}

        desc['resolved'] = False
        desc['key'] = key
        obj = json.dumps(desc)

        if self.state_desc:
            if obj not in self.state_desc:
                self.state_desc.append(obj)
        else:
            self.state_desc = [obj]
        if save:
            self.save()

    def remove_state_desc(self, key, save=True):
        altered = False
        if self.state_desc:
            for desc in self.state_desc:
                desc_obj = json.loads(desc)
                if 'key' in desc_obj and desc_obj['key'] == key:
                    self.state_desc.remove(desc)
                    altered = True

        if altered:
            if len(self.state_desc) == 0:
                self.state_desc = None
            self.save()

    def set_active(self):
        self.state = ContentModelState.active
        self.state_desc = None
        self.save()

    def set_state(self, new_state):
        self.state = new_state
        self.save()

    def set_active_review_required(self, key, desc):
        self.state = ContentModelState.active_review
        self.add_state_desc(key, desc)
        self.save()

    def set_suspended_review_required(self, key, desc):
        self.state = ContentModelState.suspended_review
        self.add_state_desc(key, desc)
        self.save()

    @classmethod
    def get_timestamp_key_for_cache(cls, **kwargs):
        return cls.__name__ + "_" + "update_timestamp" + ("_" + kwargs['tag'] if 'tag' in kwargs else "").lower()

    @classmethod
    def commit_latest_update_timestamp_from_cache(cls, value, ttl, **kwargs):
        key = cls.get_timestamp_key_for_cache(**kwargs)
        cache.set(key, value, ttl)

    @classmethod
    def get_latest_update_timestamp_from_cache(cls, **kwargs):
        time_stamp = cache.get(cls.get_timestamp_key_for_cache(**kwargs))
        return time_stamp

    @classmethod
    def get_latest_update_cache_ttl(cls, **kwargs):
        ttl = LSTV_DEFAULT_TTL_FOR_LATEST_UPDATE_TIMESTAMP_CACHE
        if 'ttl' in kwargs:
            ttl = kwargs['ttl']
        return ttl

    @staticmethod
    def get_review_object_type():
        return None

    @classmethod
    def get_latest_update_timestamp(cls, **kwargs):
        # custom ttl?
        ttl = cls.get_latest_update_cache_ttl(**kwargs)

        # do we have the timestamp in cache?
        timestamp = cls.get_latest_update_timestamp_from_cache(**kwargs)

        if timestamp:
            # # print("time stamp is " + str(time_stamp))
            return timestamp
        else:
            if 'latest_updated_at' in kwargs and kwargs['latest_updated_at']:
                latest_updated_at = kwargs['latest_updated_at']
            else:
                # figure out latest timestamp
                try:
                    latest_updated_at = cls.objects_all_states.filter(
                        updated_at__isnull=False).latest('updated_at').updated_at
                except cls.DoesNotExist:
                    # if we can't get our update_at -- we fetch the record anyway by presuming last update happened
                    # when people still listened to disco.
                    return 0

            time_stamp = int(round(latest_updated_at.timestamp()))
            # commit to cache
            cls.commit_latest_update_timestamp_from_cache(time_stamp, ttl, **kwargs)
            # return it
            return int(time_stamp)

    class Meta:
        abstract = True
        default_manager_name = 'objects'
        # base_manager_name = 'objects'


class URLAccessibleContent(LSTVContentModel):
    short_url_token = models.CharField(db_index=True, max_length=7, null=True, default=None)
    url_history = ArrayField(models.CharField(null=False, db_index=True, max_length=150), db_index=True, null=True)

    @staticmethod
    def get_unique_short_url_prefix():
        raise Exception(
            "get_unique_short_url_prefix must be implemented in all URLAccessibleContent descendant classes")

    def set_short_url_token(self):
        starting_token_size = 2
        attempts = 0

        if self.short_url_token:
            return self.short_url_token

        while True:
            attempts += 1
            if attempts > 8:
                starting_token_size += 1
            token = self.get_unique_short_url_prefix() + secrets.token_hex(starting_token_size)
            try:
                es_with_similar_token = self.__class__.objects_all_states.get(short_url_token=token)
            except self.__class__.DoesNotExist:
                self.short_url_token = token
                self.save()
                return token

    class Meta:
        abstract = True


#
#      █████╗ ███████╗███████╗███████╗████████╗    ██╗███╗   ███╗ █████╗  ██████╗ ███████╗███████╗
#     ██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝    ██║████╗ ████║██╔══██╗██╔════╝ ██╔════╝██╔════╝
#     ███████║███████╗███████╗█████╗     ██║       ██║██╔████╔██║███████║██║  ███╗█████╗  ███████╗
#     ██╔══██║╚════██║╚════██║██╔══╝     ██║       ██║██║╚██╔╝██║██╔══██║██║   ██║██╔══╝  ╚════██║
#     ██║  ██║███████║███████║███████╗   ██║       ██║██║ ╚═╝ ██║██║  ██║╚██████╔╝███████╗███████║
#     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝       ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
#

class ImagePurposeTypes(ChoiceEnum):
    thumbnail = "thumbnail"
    background = "background"
    banner = "banner"
    profile_avatar = "profile_avatar"
    logo = "logo"
    photo = "photo"
    media = "media"


class ImageDeviceTypes(ChoiceEnum):
    phone = "phone"
    tablet = "tablet"
    desktop = "desktop"
    original = "original"


class Image(LSTVContentModel):
    url_appendix_dict = {
        ImageDeviceTypes.phone: {
            ImagePurposeTypes.logo: 320,
            ImagePurposeTypes.thumbnail: 640,
            ImagePurposeTypes.profile_avatar: 150,
            ImagePurposeTypes.background: 1024,
            ImagePurposeTypes.banner: 480},

        ImageDeviceTypes.tablet: {
            ImagePurposeTypes.logo: 420,
            ImagePurposeTypes.thumbnail: 640,
            ImagePurposeTypes.profile_avatar: 320,
            ImagePurposeTypes.background: 1024,
            ImagePurposeTypes.banner: 480},

        ImageDeviceTypes.desktop: {
            ImagePurposeTypes.logo: 800,
            ImagePurposeTypes.thumbnail: 640,
            ImagePurposeTypes.profile_avatar: 320,
            ImagePurposeTypes.background: 1600,
            ImagePurposeTypes.banner: 480}
    }

    purpose = EnumChoiceField(ImagePurposeTypes, null=False, db_index=False)
    legacy_url = models.CharField(unique=False, db_index=True, max_length=250, null=False)
    serve_url = models.CharField(db_index=True, max_length=250, null=True)
    img_alt = models.CharField(db_index=True, max_length=100, null=False)
    verified_at = models.DateTimeField(blank=True, null=True)
    width = models.IntegerField(db_index=True, null=True)
    height = models.IntegerField(db_index=True, null=True)
    focal_x_pos_percent = models.IntegerField(db_index=True, null=True)
    focal_y_pos_percent = models.IntegerField(db_index=True, null=True)
    svg_placeholder_data = models.TextField(null=True)

    def delete_deep(self):
        # @TODO: remove it from AWS??
        self.delete()

    def get_serve_url(self):
        if self.serve_url:
            return self.serve_url
        elif self.legacy_url:
            return self.legacy_url
        else:
            return f"{DEFAULT_CDN_BUCKET_URL}/images/site/nothumb.jpg"

    def update_dimensions(self):
        from lstv_be.utils import get_image_size_by_url
        size = get_image_size_by_url(self.serve_url or self.legacy_url)
        if size:
            self.width = size.width
            self.height = size.height
            self.save()

    class Meta:
        db_table = 'v1_images'


#
#                            __            _     _
#       __ _  ___  ___      / /   __ _  __| | __| |_ __ ___  ___ ___
#      / _` |/ _ \/ _ \    / /   / _` |/ _` |/ _` | '__/ _ \/ __/ __|
#     | (_| |  __/ (_) |  / /   | (_| | (_| | (_| | | |  __/\__ \__ \
#      \__, |\___|\___/  /_/     \__,_|\__,_|\__,_|_|  \___||___/___/
#      |___/
#


class PlaceSource(ChoiceEnum):
    geo_db = 'geo_db'
    google = 'google'
    admin = 'admin'


class Country(LSTVModel):
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    name = models.CharField(db_index=True, max_length=100, null=False)
    name_ascii = models.CharField(db_index=True, max_length=100, null=False)
    iso2 = models.CharField(db_index=True, max_length=2, null=False)
    iso3 = models.CharField(db_index=True, max_length=3, null=False)
    phone_prefix = models.CharField(db_index=True, max_length=50, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    long = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    source = EnumChoiceField(PlaceSource, null=False, default=PlaceSource.geo_db, db_index=True)
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_work_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at_role_breakdown = models.JSONField(db_index=False, null=True)
    weight_businesses_work_at_role_breakdown = models.JSONField(db_index=False, null=True)
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)

    # subscribers
    subscribers = models.ManyToManyField('User',
                                         db_table='v1_countries_to_subscribers',
                                         related_name='countries_subscribed_to')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'v1_geo_countries'


class StateProvince(LSTVModel):
    slug = models.CharField(db_index=True, max_length=100, null=False)
    name = models.CharField(db_index=True, max_length=100, null=False)
    name_ascii = models.CharField(db_index=True, max_length=100, null=False)
    country = models.ForeignKey(Country, on_delete=models.PROTECT, null=False)
    type = models.CharField(db_index=True, max_length=45, null=False)
    code = models.CharField(db_index=True, max_length=15, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    long = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    source = EnumChoiceField(PlaceSource, null=False, default=PlaceSource.geo_db, db_index=True)
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_work_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at_role_breakdown = models.JSONField(db_index=False, null=True)
    weight_businesses_work_at_role_breakdown = models.JSONField(db_index=False, null=True)
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)

    # subscribers
    subscribers = models.ManyToManyField('User',
                                         db_table='v1_state_provinces_to_subscribers',
                                         related_name='state_province_subscribed_to')

    def __str__(self):
        if self.country and self.country.slug == 'united-states':
            return f"State Of {self.name}"
        elif self.country:
            return f"{self.name}, {self.country.name}"
        else:
            return self.name

    def code_name(self):
        return self.code if self.country.slug == 'united-states' else self.name

    class Meta:
        db_table = 'v1_geo_states_provinces'


class PlaceType(ChoiceEnum):
    locality = 'locality'
    place = 'natural'


class County(LSTVModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    state_province = models.ForeignKey(StateProvince, db_index=True, on_delete=models.PROTECT, null=True)
    fips = models.CharField(db_index=True, max_length=10, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    long = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    source = EnumChoiceField(PlaceSource, null=False, default=PlaceSource.geo_db, db_index=True)
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_work_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at_role_breakdown = models.JSONField(db_index=False, null=True)
    weight_businesses_work_at_role_breakdown = models.JSONField(db_index=False, null=True)
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)

    # subscribers
    subscribers = models.ManyToManyField('User',
                                         db_table='v1_county_to_subscribers',
                                         related_name='counties_subscribed_to')

    def __str__(self):
        if self.state_province:
            return f"{self.name} County, {self.state_province.name}"
        else:
            return self.name

    class Meta:
        db_table = 'v1_geo_counties'


class PlaceAltType(ChoiceEnum):
    name = 'name'
    name_ascii = 'name_ascii'
    slug = 'slug'


class PlaceAltName(LSTVModel):
    type = EnumChoiceField(PlaceAltType, null=False, default=PlaceType.locality, db_index=True)
    value = models.CharField(db_index=True, max_length=100, null=False)

    class Meta:
        db_table = 'v1_geo_place_alt_names'


class Place(LSTVModel):
    type = EnumChoiceField(PlaceType, null=False, default=PlaceType.locality, db_index=True)
    source = EnumChoiceField(PlaceSource, null=False, default=PlaceSource.geo_db, db_index=True)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    name = models.CharField(db_index=True, max_length=100, null=False)
    name_ascii = models.CharField(db_index=True, max_length=100, null=False)
    alt_names = ArrayField(models.CharField(null=True, db_index=False, max_length=45), db_index=False, null=True)
    alt_names_ascii = ArrayField(models.CharField(null=True, db_index=False, max_length=45), db_index=False, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=False)
    long = models.DecimalField(max_digits=9, decimal_places=6, null=False)
    country = models.ForeignKey(Country, on_delete=models.PROTECT, null=True)
    state_province = models.ForeignKey(StateProvince, db_index=True, on_delete=models.PROTECT, null=True)
    county = models.ForeignKey(County, on_delete=models.PROTECT, null=True)
    timezone = models.CharField(db_index=True, max_length=50, null=False)
    admin_type = models.CharField(db_index=True, max_length=50, null=True)
    ranking = models.IntegerField(db_index=True, null=True, default=0)
    population_urban = models.IntegerField(db_index=True, null=True, default=0)
    population_municipal = models.IntegerField(db_index=True, null=True, default=0)
    import_id = models.IntegerField(db_index=True, null=True, default=0)
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_work_at = models.IntegerField(db_index=True, default=0)
    weight_businesses_based_at_role_breakdown = models.JSONField(db_index=False, null=True)
    weight_businesses_work_at_role_breakdown = models.JSONField(db_index=False, null=True)

    # just for U.S. cities...
    zipcodes = ArrayField(models.CharField(null=False, db_index=True, max_length=10), db_index=True, null=True)
    county_name = models.CharField(db_index=True, max_length=100, null=True)
    married_percent = models.FloatField(db_index=True, null=True)
    race_white_percent = models.FloatField(db_index=True, null=True)
    race_black_percent = models.FloatField(db_index=True, null=True)
    race_asian_percent = models.FloatField(db_index=True, null=True)
    race_native_percent = models.FloatField(db_index=True, null=True)
    race_pacific_percent = models.FloatField(db_index=True, null=True)
    race_other_percent = models.FloatField(db_index=True, null=True)
    race_multiple_percent = models.FloatField(db_index=True, null=True)
    age_20s_percent = models.FloatField(db_index=True, null=True)
    age_30s_percent = models.FloatField(db_index=True, null=True)
    age_40s_percent = models.FloatField(db_index=True, null=True)
    divorced_percent = models.FloatField(db_index=True, null=True)
    never_married_percent = models.FloatField(db_index=True, null=True)
    family_dual_income_percent = models.FloatField(db_index=True, null=True)
    income_household_under_5_percent = models.FloatField(db_index=True, null=True)
    income_household_5_to_10_percent = models.FloatField(db_index=True, null=True)
    income_household_10_to_15_percent = models.FloatField(db_index=True, null=True)
    income_household_15_to_20_percent = models.FloatField(db_index=True, null=True)
    income_household_20_to_25_percent = models.FloatField(db_index=True, null=True)
    income_household_25_to_35_percent = models.FloatField(db_index=True, null=True)
    income_household_35_to_50_percent = models.FloatField(db_index=True, null=True)
    income_household_50_to_75_percent = models.FloatField(db_index=True, null=True)
    income_household_75_to_100_percent = models.FloatField(db_index=True, null=True)
    income_household_100_to_150_percent = models.FloatField(db_index=True, null=True)
    income_household_over_150_percent = models.FloatField(db_index=True, null=True)
    home_value = models.IntegerField(db_index=True, null=True)
    rent_percent_of_household_income = models.FloatField(db_index=True, null=True)
    income_household_six_figure_percent = models.FloatField(db_index=True, null=True)
    income_household_median = models.IntegerField(db_index=True, null=True)
    health_uninsured_percent = models.FloatField(db_index=True, null=True)
    age_median = models.FloatField(db_index=True, null=True)
    education_high_school_percent = models.FloatField(db_index=True, null=True)
    education_bachelors_percent = models.FloatField(db_index=True, null=True)
    education_graduate_percent = models.FloatField(db_index=True, null=True)
    education_college_or_above_percent = models.FloatField(db_index=True, null=True)

    # alternate slugs/names for search

    alternates = models.ManyToManyField(PlaceAltName,
                                        db_table='v1_geo_places_to_alt_names',
                                        related_name='places')

    # subscribers
    subscribers = models.ManyToManyField('User',
                                         db_table='v1_place_to_subscribers',
                                         related_name='places_subscribed_to')

    def __str__(self):
        if self.state_province and self.country and self.country.slug == 'united-states':
            return f"{self.name}, {self.state_province.code}"
        if self.state_province and self.country:
            return f"{self.name}, {self.state_province.code}, {self.country.name}"
        if self.country:
            return f"{self.name}, {self.country.name}"
        else:
            return self.name

    class Meta:
        db_table = "v1_geo_places"


class CuratedLocation(LSTVContentModel):
    """
    """

    # combinations identifying the location -- one of those elements

    place = models.ForeignKey(Place, db_index=True, on_delete=models.PROTECT, null=True)
    state_province = models.ForeignKey(StateProvince, db_index=True, on_delete=models.PROTECT, null=True)
    county = models.ForeignKey(County, db_index=True, on_delete=models.PROTECT, null=True)
    country = models.ForeignKey(Country, db_index=True, on_delete=models.PROTECT, null=True)

    curated_fields = models.ManyToManyField('Properties',
                                            db_table='v1_curated_locations_to_properties',
                                            related_name='curated_locations')

    # functions

    def delete_deep(self):
        for prop in self.curated_fields.all():
            prop.delete()
        self.curated_fields.clear()
        self.delete()

    class Meta:
        db_table = "v1_curated_locations"


#
#  ██╗      ██████╗  ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
#  ██║     ██╔═══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
#  ██║     ██║   ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
#  ██║     ██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
#  ███████╗╚██████╔╝╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
#  ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
#


class Location(LSTVContentModel):
    """
    """
    label = models.CharField(db_index=True, max_length=150, null=True)
    address1 = models.CharField(db_index=True, max_length=150, null=True)
    address2 = models.CharField(db_index=True, max_length=150, null=True, blank=True)
    place = models.ForeignKey(Place, db_index=True, on_delete=models.PROTECT, null=True)
    state_province = models.ForeignKey(StateProvince, db_index=True, on_delete=models.PROTECT, null=True)
    county = models.ForeignKey(County, db_index=True, on_delete=models.PROTECT, null=True)
    zipcode = models.CharField(db_index=True, max_length=10, null=True)
    country = models.ForeignKey(Country, db_index=True, on_delete=models.PROTECT, null=True)
    sanitized = models.BooleanField(db_index=True, default=False)

    # legacy fields
    legacy_city = models.CharField(db_index=True, max_length=150, null=True)
    legacy_state_province = models.CharField(db_index=True, max_length=150, null=True)
    legacy_country = models.CharField(db_index=True, max_length=150, null=True)
    legacy_migrated = models.BooleanField(db_index=True, default=False)

    def delete_deep(self):
        self.delete()

    @property
    def lat(self):
        if self.place:
            return self.place.lat
        if self.county:
            return self.county.lat
        if self.state_province:
            return self.state_province.lat
        if self.country:
            return self.country.lat
        return None

    @property
    def long(self):
        if self.place:
            return self.place.long
        if self.county:
            return self.county.long
        if self.state_province:
            return self.state_province.long
        if self.country:
            return self.country.long
        return None

    # functionality
    def __str__(self):
        add = ""
        if self.address1:
            add = f"{self.address1}, "
        if self.address1 and self.address2:
            add += f"{self.address2}, "
        if self.place and self.state_province and self.country:
            return f"{add}{self.place.name}, " \
                   f"{self.state_province.code if self.country.slug == 'united-states' else self.state_province.name}" \
                   f"{', ' + self.country.name if self.country.slug != 'united-states' else ''}".strip()
        if self.state_province and self.country:
            if self.county:
                return f"{self.county.name} County, {self.state_province.name}" \
                       f"{',' + self.country.name if self.country.slug != 'united-states' else ''}"
            else:
                return f"{self.state_province.name}, {self.country.name}"
        if self.country and self.place:
            return f"{self.place.name}, {self.country.name}"
        if self.country:
            return f"{self.country.name}"
        # this should never occur.
        return f"Location {self.id}"

    def has_content(self):
        return self.place or self.state_province or self.county or self.country

    def get_location_as_text(self):
        from lstv_api_v1.utils.model_utils import decorate_country_or_state_region_name, \
            get_worked_at_locations_as_text
        locs = []
        if self.place:
            locs.append(self.place.name)
        if self.state_province:
            locs.append(decorate_country_or_state_region_name(self.state_province.name))
        if self.country and self.country.name != 'United States':
            locs.append(decorate_country_or_state_region_name(self.country.name))
        return ", ".join(locs)

    def get_location_geo_object(self):
        rc = None
        if self.country:
            rc = self.country
        if self.state_province:
            rc = self.state_province
        if self.county:
            rc = self.county
        if self.place:
            rc = self.place
        return rc

    def num_base_location_elements(self):
        geo = 0
        legacy = 0
        if self.place:
            geo += 1
        if self.state_province:
            geo += 1
        if self.country:
            geo += 1
        if self.legacy_city:
            legacy += 1
        if self.legacy_state_province:
            legacy += 1
        if self.legacy_country:
            legacy += 1
        return geo, legacy

    def update_content_state(self):
        geo, leg = self.num_base_location_elements()
        if leg > geo > 0:
            self.state = ContentModelState.active_review
            self.state_desc = ['review location migration']
            self.save()
        if geo == 0:
            self.state = ContentModelState.suspended_review
            self.state_desc = ['potentially empty location. record suspended.review.']
            self.save()

    # serialization support

    def get_country_url(self):

        if self.country:
            return "/location/" + self.country.slug
        else:
            return None

    def get_state_province_url(self):
        country_url = self.get_country_url()
        if country_url:
            if self.state_province:
                return country_url + "/" + self.state_province.slug
            else:
                return None
        else:
            return None

    def get_county_url(self):
        state_province_url = self.get_state_province_url()
        if state_province_url:
            if self.county:
                return state_province_url + "/" + self.county.slug
            else:
                return None
        else:
            return None

    def get_place_url(self):

        if self.place:
            url = self.get_county_url()
            if not url:
                url = self.get_state_province_url()
                if not url:
                    url = self.get_country_url()
            if url:
                return url + "/" + self.place.slug
            else:
                return None
        else:
            return None

    def get_url(self):
        rc = "/location/"
        if self.place:
            if self.country:
                rc += self.country.slug
            if self.state_province:
                rc += "/" + self.state_province.slug
            rc += "/" + self.place.slug
        return rc

    class Meta:
        db_table = 'v1_locations'


# ██╗██████╗      █████╗ ██████╗ ██████╗ ██████╗ ███████╗███████╗███████╗
# ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
# ██║██████╔╝    ███████║██║  ██║██║  ██║██████╔╝█████╗  ███████╗███████╗
# ██║██╔═══╝     ██╔══██║██║  ██║██║  ██║██╔══██╗██╔══╝  ╚════██║╚════██║
# ██║██║         ██║  ██║██████╔╝██████╔╝██║  ██║███████╗███████║███████║
# ╚═╝╚═╝         ╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝


class IPAddress(LSTVBaseModel):
    # ip + geo

    ip = models.CharField(db_index=True, max_length=45, null=False)
    processed = models.BooleanField(db_index=True, default=False, null=False)
    location = models.ForeignKey(Location, db_index=True, on_delete=models.PROTECT, null=True)

    class Meta:
        db_table = 'v1_ip_to_location'


class PhoneTypeEnum(ChoiceEnum):
    home = "home"
    mobile = 'mobile'
    business = "business"
    sales = "sales"
    fax = "fax"


class Phone(LSTVContentModel):
    """
    Phones are used to store phone numbers with classification
    """

    country = models.ForeignKey(Country, db_index=True, null=True, on_delete=models.PROTECT)
    type = EnumChoiceField(PhoneTypeEnum, null=False, default=PhoneTypeEnum.business, db_index=True)
    number = models.CharField(max_length=20, null=True)

    # functions

    def get_phone_number_link(self):
        if self.country:
            return f"+{self.country.phone_prefix}{self.number.lstrip('0')}".replace("(", "").replace(")", ""). \
                replace(" ", "").replace("-", "")

    class Meta:
        db_table = 'v1_phones'


class Properties(LSTVContentModel):
    """
    Defines a generic key/multiple-optional-values pairing with optional expiration date.
    """
    key = models.CharField(db_index=True, max_length=100, null=False)
    value_text = models.TextField(null=True)
    value_integer = models.IntegerField(db_index=True, null=True)
    value_float = models.FloatField(db_index=True, null=True)
    value_date = models.DateField(db_index=True, null=True)
    value_json = models.JSONField(db_index=False, null=True)

    # property will be removed when expires_at passes, unless null
    expires_at = models.DateTimeField(db_index=True, null=True)

    # obtain value
    def get_value(self):

        if self.value_text:
            return self.value_text

        if self.value_integer:
            return self.value_integer

        if self.value_float:
            return self.value_float

        if self.value_date:
            return self.value_date

        if self.value_json:
            return self.value_json

        return None

    class Meta:
        db_table = 'v1_properties'


#                                                                                        _
#      _   _ ___  ___ _ __   _ __ ___   __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_
#     | | | / __|/ _ \ '__| | '_ ` _ \ / _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
#     | |_| \__ \  __/ |    | | | | | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_
#      \__,_|___/\___|_|    |_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
#                                                        |___/
#


class LSTVUserManager(BaseUserManager):
    """
    A custom user manager to deal with emails as unique identifiers for auth
    instead of usernames. The default that's used is "UserManager"
    """

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'UD')
        extra_fields.setdefault('is_staff', True)
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)

    def get_queryset(self):
        return LSTVQuerySet(self.model, using=self._db).filter(
            Q(state=ContentModelState.active) | Q(state=ContentModelState.active_review))


class EmailVerificationRecord(LSTVModel):
    email = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    status = models.CharField(db_index=True, max_length=100, null=False)
    sub_status = models.CharField(db_index=True, max_length=100, null=True)
    free_email_account = models.BooleanField(db_index=True, null=True)
    account = models.CharField(db_index=True, max_length=100, null=False)
    domain = models.CharField(db_index=True, max_length=100, null=False)
    domain_age_days = models.IntegerField(db_index=True, null=True)
    smtp_provider = models.CharField(db_index=True, max_length=100, null=True)
    first_name = models.CharField(db_index=True, max_length=100, null=True)
    last_name = models.CharField(db_index=True, max_length=100, null=True)
    gender = models.CharField(db_index=True, max_length=100, null=True)
    country = models.CharField(db_index=True, max_length=100, null=True)
    region = models.CharField(db_index=True, max_length=100, null=True)
    city = models.CharField(db_index=True, max_length=100, null=True)
    zipcode = models.CharField(db_index=True, max_length=100, null=True)

    class Meta:
        db_table = 'v1_email_verification_records'


class UserTypeEnum(ChoiceEnum):
    consumer = "consumer"
    newlywed = 'newlywed'
    soonlywed = "soonlywed"
    business_team_member = "business_team_member"
    business_team_member_onboarding = "business_team_member_onboarding"
    admin = "admin"
    editor = "editor"
    bot = 'bot'


class User(LSTVContentModel, AbstractBaseUser, PermissionsMixin):
    user_type = EnumChoiceField(UserTypeEnum, null=False, db_index=True)
    email = models.EmailField(db_index=True, max_length=150, unique=True, null=False)
    email_verification = models.ForeignKey(EmailVerificationRecord, db_index=True, null=True, on_delete=models.PROTECT)
    first_name = models.CharField(db_index=True, max_length=45, null=True)
    last_name = models.CharField(db_index=True, max_length=45, null=True)
    profile_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)
    is_staff = models.BooleanField(db_index=True, default=False)
    email_verification_at = models.DateTimeField(blank=True, null=True)
    mobile_phone = models.ForeignKey(Phone, db_index=True, null=True, on_delete=models.PROTECT)
    former_unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    ip_addresses = models.ManyToManyField(IPAddress, db_table='v1_users_to_ip_addresses', related_name='ip_user')

    # properties
    properties = models.ManyToManyField(Properties, db_table='v1_users_to_properties', related_name='users')

    # legacy password from LSTV1 (Wordpress)
    legacy_password = models.CharField(max_length=150, null=True)

    # legacy user_id
    legacy_user_id = models.IntegerField(null=True)

    # User Blocks (when we have to...)

    is_inquiry_blocked = models.BooleanField(db_index=True, default=False)
    is_in_page_messaging_blocked = models.BooleanField(db_index=True, default=False)
    is_flagging_blocked = models.BooleanField(db_index=True, default=False)
    is_reviewing_blocked = models.BooleanField(db_index=True, default=False)

    USERNAME_FIELD = 'email'
    objects = LSTVUserManager()

    def delete_deep(self):
        if self.mobile_phone:
            self.mobile_phone.delete()

        if self.email_verification:
            self.email_verification.delete()

        if self.profile_image:
            self.profile_image.delete_deep()

        self.delete()

    def __str__(self):
        return self.user_type.name + " -  " + self.email

    def is_lstv_admin(self):
        return self.user_type == UserTypeEnum.admin

    def get_full_name(self):
        if self.first_name and self.last_name:
            return str(self.first_name).title() + " " + str(self.last_name).title()
        else:
            return ""

    def get_name(self):
        if self.first_name and self.last_name:
            return str(self.first_name).title() + " " + str(self.last_name).title()
        else:
            return None

    def delete(self, **kwargs):
        self.email = f"{self.email}"
        return super(User, self).delete(kwargs)

    def set_property(self, key, value):
        prop = self.properties.filter(key=key).first()
        exist = prop is not None
        if not exist:
            prop = Properties(key=key)

        if type(value) == str:
            prop.value_text = value

        prop.save()

        if not exist:
            self.properties.add(prop)

    def get_property(self, key):
        prop = self.properties.filter(key=key).first()
        if prop:
            if prop.value_text:
                return prop.value_text
            if prop.value_json:
                return prop.value_json
        return None

    def get_full_name_or_email(self):
        if self.first_name and self.last_name:
            return str(self.first_name).title() + " " + str(self.last_name).title()
        else:
            return self.email

    def get_short_name(self):
        return self.first_name

    def create_jwt_token(self):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(self)
        token = jwt_encode_handler(payload)
        # print(token)
        return token

    def get_business_for_user_if_team_member(self):
        member = BusinessTeamMember.objects.filter(user=self).first()
        if member:
            return member.business
        else:
            return None

    def get_thumbnail_url(self):
        if self.profile_image:
            return self.profile_image.get_serve_url()
        else:
            return None

    class Meta:
        db_table = 'v1_users'


#    _____            _             _
#   / ____|          | |           | |
#  | |     ___  _ __ | |_ ___ _ __ | |_
#  | |    / _ \| '_ \| __/ _ \ '_ \| __|
#  | |___| (_) | | | | ||  __/ | | | |_
#   \_____\___/|_| |_|\__\___|_| |_|\__|


class ContentVerbosityType(ChoiceEnum):
    slug = 'slug'
    card = 'card'
    full = 'full'
    search_hint = 'search_hint'
    administration = 'administration'
    business_admin_list = 'business_admin_list'
    admin_list = 'admin_list'
    admin_full = 'admin_full'


class ContentSearchQuerySourcingType(ChoiceEnum):
    # none
    none = 'none'
    # for videos :
    vibe_to_video = 'vibe_to_video'  # search the vibes for event story participation
    business_to_video = 'business_to_video'  # search the business for event story participation
    location_to_video = 'location_to_video'  # search locations for event story participation
    recommended_for_you = 'recommended_for_you'  # recommended videos for *you*
    in_your_area = 'recommended_for_you'  # event stories from around where *you're* at
    award_winners = 'award_winners'  # event stories that won awards...
    fixed_video_list = 'fixed_video_list'  # provide fixed list of videos

    # for businesses
    fixed_business_list = 'fixed_business_list'  # provide fixed list of business
    location_to_business_based_at = 'location_to_business_based_at'  # provide businesses based around a location
    location_to_business_worked_at = 'location_to_business_worked_at'  # provide businesses worked around a location
    location_to_business = 'location_to_business'  # provide business who are either based or worked around a location
    vibe_to_business = 'vibe_to_business'  # provide businesses who teamed up in weddings of given styles
    # for photos
    location_to_photos = 'location_to_photos'  # get photos from around a location
    vibe_to_photos = 'vibe_to_photos'  # get photos from weddings of given vibe(s)

    # others...
    premium = 'premium'  # search love club members (works in conjunction with CardGridTypeContentType.BUSINESS)
    venue_type_to_video = 'venue_type_to_video'  # search event stories featuring a certain type of venue
    # other fixed
    fixed_vibe_list = 'fixed_vibe_list'  # provide fixed list of vibes
    fixed_location_list = 'fixed_location_list'  # provide fixed list of locations


class ContentSearchQueryOrderType(ChoiceEnum):
    none = 'none'
    random = 'random'
    most_recent = 'most_recent'
    most_watched_30d = 'most_watched_30d'
    most_watched = 'most_watched'
    weight = 'weight'
    weight_photos = 'weight_photos'
    weight_views = 'weight_views'
    weight_articles = 'weight_articles'
    importance = 'importance'
    most_recently_updated = 'most_recently_updated'


class ContentSearchQueryType(ChoiceEnum):
    video = 'video'
    business = 'business'
    location = 'location'
    tag = 'tag'
    article = 'article'
    photo = 'photo'


class ContentBusinessLocationScope(ChoiceEnum):
    worked_at = 'worked_at'
    based_at = 'based_at'
    worked_or_based_at = 'worked_or_based_at'


class ContentSearchQuery(LSTVModel):
    group = models.IntegerField(db_index=True, default=0)
    target = models.CharField(db_index=True, max_length=100, null=False)
    order = models.IntegerField(db_index=True, default=0)
    header = models.CharField(db_index=True, max_length=100, null=False)
    sub_header = models.TextField(db_index=True, null=True)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=False)
    cta_text = models.CharField(db_index=True, max_length=100, null=True)
    cta_url = models.CharField(db_index=True, max_length=150)
    more_allowed = models.BooleanField(db_index=True, default=True)
    content_type = EnumChoiceField(ContentSearchQueryType, null=False, db_index=True)
    content_search_type = EnumChoiceField(ContentSearchQuerySourcingType, null=False, db_index=True)
    content_sort_method = EnumChoiceField(ContentSearchQueryOrderType, null=False, db_index=True)
    fixed_content_items = ArrayField(models.TextField(null=True, db_index=True, max_length=100), null=True)
    exclude_items = ArrayField(models.TextField(null=True, db_index=True, max_length=100), null=True)
    limit_to_business_roles = ArrayField(models.TextField(null=True, db_index=True, max_length=150), null=True)
    exclude_business_roles = ArrayField(models.TextField(null=True, db_index=True, max_length=150), null=True)
    limit_to_business_role_capacity = ArrayField(models.TextField(null=True, db_index=True, max_length=150), null=True)
    limit_to_locations = ArrayField(models.TextField(null=True, db_index=True, max_length=500), null=True)
    limit_to_business = ArrayField(models.TextField(null=True, db_index=True, max_length=500), null=True)
    limit_to_tags = ArrayField(models.TextField(null=True, db_index=True, max_length=500), null=True)
    search_items = ArrayField(models.TextField(null=True, db_index=True, max_length=100), null=True)
    content_options = models.JSONField(db_index=False, null=True)
    verbosity = EnumChoiceField(ContentVerbosityType, null=False, default=ContentVerbosityType.slug, db_index=True)
    business_location_scope = EnumChoiceField(ContentBusinessLocationScope, null=False,
                                              default=ContentBusinessLocationScope.based_at, db_index=True)

    class Meta:
        db_table = 'v1_content_search_queries'


#   _____  _
#  |  __ \(_)
#  | |  | |_ ___  ___ _____   _____ _ __ _   _
#  | |  | | / __|/ __/ _ \ \ / / _ \ '__| | | |
#  | |__| | \__ \ (_| (_) \ V /  __/ |  | |_| |
#  |_____/|_|___/\___\___/ \_/ \___|_|   \__, |
#                                         __/ |
#                                        |___/


class DiscoverElementTypeEnum(ChoiceEnum):
    domain = "domain"
    sidebar = "sidebar"
    main_content = "main_content"
    tab_group = "tab-group"
    tab = "tab"
    section = "section"
    folder = "folder"
    content = "content"


class Discover(LSTVModel):
    parent = models.ForeignKey('self', db_index=True, null=True, on_delete=models.CASCADE)
    type = EnumChoiceField(DiscoverElementTypeEnum, null=False, db_index=True)
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=True)
    properties = models.ManyToManyField(Properties, db_table='v1_discover_to_properties', related_name='discover')
    order = models.CharField(db_index=True, max_length=50, null=False, unique=True)
    content_query = models.ForeignKey(ContentSearchQuery, db_index=True, null=True, on_delete=models.CASCADE)
    element_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.CASCADE)

    # functionality

    def get_next_order_number(self):
        child_count = Discover.objects.filter(parent=self).count()
        return f"{self.order}-{str(child_count + 1).zfill(3)}"

    def add_content_root(self, name, content_root_type):
        new_layout_root = Discover(name=name, slug=None, type=content_root_type,
                                   order=self.get_next_order_number(), parent=self)
        new_layout_root.save()
        return new_layout_root

    def add_tab_group(self, name):
        new_tab_group = Discover(name=name, slug=None, type=DiscoverElementTypeEnum.tab_group,
                                 order=self.get_next_order_number(), parent=self)
        new_tab_group.save()
        return new_tab_group

    def add_tab(self, name):
        new_tab = Discover(name=name, slug=slugify(name), type=DiscoverElementTypeEnum.tab,
                           order=self.get_next_order_number(), parent=self)
        new_tab.save()
        return new_tab

    def add_section(self, name):
        new_section = Discover(name=name, slug=slugify(name), type=DiscoverElementTypeEnum.section,
                               order=self.get_next_order_number(),
                               parent=self)
        new_section.save()
        return new_section

    def add_folder(self, name):
        new_folder = Discover(name=name, slug=slugify(name), type=DiscoverElementTypeEnum.folder,
                              order=self.get_next_order_number(),
                              parent=self)
        new_folder.save()
        return new_folder

    def add_content(self, query_content):
        query_content.save()
        new_content = Discover(name=query_content.header, slug=None,
                               type=DiscoverElementTypeEnum.content,
                               order=self.get_next_order_number(),
                               content_query=query_content,
                               parent=self)

        new_content.save()
        return new_content

    class Meta:
        db_table = 'v1_discover'
        ordering = ['order']


#
#             _ _                  _______
#      /\   /(_) |__   ___  ___   / /__   \__ _  __ _ ___
#      \ \ / / | '_ \ / _ \/ __| / /  / /\/ _` |/ _` / __|
#       \ V /| | |_) |  __/\__ \/ /  / / | (_| | (_| \__ \
#        \_/ |_|_.__/ \___||___/_/   \/   \__,_|\__, |___/
#                                               |___/
#

class TagFamilyGroupType(ChoiceEnum):
    wedding_tag = "wedding_tag"
    lstv_editorial = "lstv_editorial"
    tag = "tag"


class TagFamilyType(LSTVModel):
    """
    defines a vibe type grouping two or more vibe instance
    """

    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    name = models.CharField(db_index=True, max_length=100, null=False)
    legacy_term_ids = ArrayField(models.IntegerField(), blank=True, db_index=True, null=True)
    tag_group = EnumChoiceField(TagFamilyGroupType,
                                default=TagFamilyGroupType.wedding_tag,
                                db_index=True)

    class Meta:
        db_table = 'v1_tag_family_types'


class TagType(LSTVContentModel):
    """
    defines a vibe type
    """

    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    name = models.CharField(db_index=True, max_length=100, null=False)
    legacy_term_id = models.IntegerField(db_index=True, null=True)
    legacy_url = models.CharField(max_length=200, null=True)
    tag_family_type = models.ForeignKey(TagFamilyType, on_delete=models.PROTECT, related_name='tags', null=True)
    weight = models.IntegerField(db_index=True, default=0)
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_businesses = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)
    importance = models.CharField(db_index=True, max_length=20, null=False, default="00001")
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)
    is_public = models.BooleanField(db_index=True, default=True)
    card_impressions = models.IntegerField(db_index=True, default=0)
    curated_properties = models.ManyToManyField(Properties,
                                                db_table='v1_tag_types_to_curated_props',
                                                related_name='tag_types')

    suggested_by_business = models.ForeignKey('Business', db_index=True, related_name="tag_suggesting_business", null=True,
                                              on_delete=models.PROTECT)
    suggested_for_video = models.ForeignKey('Video', db_index=True, related_name="tag_suggesting_business", null=True,
                                            on_delete=models.PROTECT)
    # subscribers
    subscribers = models.ManyToManyField(User,
                                         db_table='v1_tag_types_to_subscribers',
                                         related_name='tag_types_subscribed_to')

    # functions

    # DMZ

    dmz_originating_business = models.ForeignKey('Business', db_index=True, null=True, on_delete=models.PROTECT)
    dmz_originating_video = models.ForeignKey('Video', db_index=True, null=True, on_delete=models.PROTECT)

    def get_thumbnail_image_url(self):
        if self.thumbnail:
            return self.thumbnail.get_serve_url()
        else:
            video_source = VideoSource.objects.filter(
                pk__in=Video.objects.filter(vibes__slug=self.slug, videos__thumbnail__isnull=False).values_list(
                    'videos', flat=True)).order_by('-created_at').first()
            if video_source:
                return video_source.thumbnail.get_serve_url()
            else:
                return f"{DEFAULT_CDN}/images/site/nothumb.jpg"

    class Meta:
        db_table = 'v1_tag_types'
        ordering = ['-importance']


#   ____                      _   ______              _ _
#  |  _ \                    | | |  ____|            (_) |
#  | |_) |_ __ __ _ _ __   __| | | |__ __ _ _ __ ___  _| |_   _
#  |  _ <| '__/ _` | '_ \ / _` | |  __/ _` | '_ ` _ \| | | | | |
#  | |_) | | | (_| | | | | (_| | | | | (_| | | | | | | | | |_| |
#  |____/|_|  \__,_|_| |_|\__,_| |_|  \__,_|_| |_| |_|_|_|\__, |
#                                                          __/ |
#                                                         |___/


class Brand(LSTVContentModel):
    # this....
    name = models.CharField(db_index=True, max_length=100, null=True)
    description = models.TextField(null=True, db_index=True)
    logo_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.CASCADE)
    link = models.CharField(db_index=True, max_length=150, null=True)

    # OR that...
    business = models.ForeignKey('Business', db_index=True, on_delete=models.PROTECT, null=True)

    def delete_deep(self):
        if self.logo_image:
            self.logo_image.delete()
        self.delete()

    def get_logo_image(self):
        if self.logo_image:
            return self.logo_image.serve_url

    class Meta:
        db_table = 'v1_brands'


#    ____                        _             _   ______               _
#   / __ \                      (_)           | | |  ____|             | |
#  | |  | |_ __ __ _  __ _ _ __  _ _______  __| | | |____   _____ _ __ | |_ ___
#  | |  | | '__/ _` |/ _` | '_ \| |_  / _ \/ _` | |  __\ \ / / _ \ '_ \| __/ __|
#  | |__| | | | (_| | (_| | | | | |/ /  __/ (_| | | |___\ V /  __/ | | | |_\__ \
#   \____/|_|  \__, |\__,_|_| |_|_/___\___|\__,_| |______\_/ \___|_| |_|\__|___/
#               __/ |
#              |___/


class OrganizedEvent(LSTVContentModel):
    is_lstv_event = models.BooleanField(db_index=True, default=False)

    event_start_date = models.DateField(null=False, db_index=True)
    event_end_date = models.DateField(null=True, db_index=True)
    event_start_time = models.TimeField(null=True, db_index=True)
    event_end_time = models.TimeField(null=True, db_index=True)

    name_short = models.CharField(db_index=True, max_length=100, null=False)
    name_long = models.CharField(db_index=True, max_length=150, null=True)
    cta_url = models.CharField(db_index=True, max_length=150, null=False)
    is_virtual = models.BooleanField(db_index=True, default=False)
    location = models.ForeignKey(Location, db_index=True, null=True, on_delete=models.CASCADE)
    phone = models.ForeignKey(Phone, db_index=True, null=True, on_delete=models.CASCADE)

    def delete_deep(self):
        if self.location:
            self.location.delete()
        if self.phone:
            self.phone.delete()
        self.delete()

    class Meta:
        db_table = 'v1_organized_events'


#  __          __        _         __          ___ _   _
#  \ \        / /       | |        \ \        / (_) | | |
#   \ \  /\  / /__  _ __| | _____   \ \  /\  / / _| |_| |__
#    \ \/  \/ / _ \| '__| |/ / __|   \ \/  \/ / | | __| '_ \
#     \  /\  / (_) | |  |   <\__ \    \  /\  /  | | |_| | | |_ _ _
#      \/  \/ \___/|_|  |_|\_\___/     \/  \/   |_|\__|_| |_(_|_|_)


class WeightedWorksWith(LSTVContentModel):
    business_a = models.ForeignKey('Business', db_index=True, null=False, related_name="businessA",
                                   on_delete=models.CASCADE)
    business_b = models.ForeignKey('Business', db_index=True, null=False, related_name="businessB",
                                   on_delete=models.CASCADE)
    weight = models.IntegerField(db_index=True, default=0)
    weight_last_month = models.IntegerField(db_index=True, default=0)
    weight_last_quarter = models.IntegerField(db_index=True, default=0)
    weight_last_six_month = models.IntegerField(db_index=True, default=0)
    weight_last_year = models.IntegerField(db_index=True, default=0)

    class Meta:
        db_table = 'v1_weighted_works_with'


#   __  __           _      ____      __            _          __    _______
#  |  \/  |         | |    / /\ \    / /           | |         \ \  |__   __|
#  | \  / | ___  ___| |_  | |  \ \  / /__ _ __   __| | ___  _ __| |    | | ___  __ _ _ __ ___
#  | |\/| |/ _ \/ _ \ __| | |   \ \/ / _ \ '_ \ / _` |/ _ \| '__| |    | |/ _ \/ _` | '_ ` _ \
#  | |  | |  __/  __/ |_  | |    \  /  __/ | | | (_| | (_) | |  | |    | |  __/ (_| | | | | | |
#  |_|  |_|\___|\___|\__| | |     \/ \___|_| |_|\__,_|\___/|_|  | |    |_|\___|\__,_|_| |_| |_|
#                          \_\                                 /_/


class PublicTeamPerson(LSTVContentModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    title = models.CharField(db_index=True, max_length=100, null=False)
    description = models.TextField(null=True, db_index=True)
    headshot_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.CASCADE)

    def delete_deep(self):
        if self.headshot_image:
            self.headshot_image.delete_deep()
        self.delete()

    def get_headshot_url(self):
        if self.headshot_image:
            return self.headshot_image.get_serve_url()
        else:
            return None

    class Meta:
        db_table = 'v1_public_business_team_people'


#   _____            _
#  |  __ \          (_)
#  | |__) |_____   ___  _____      _____
#  |  _  // _ \ \ / / |/ _ \ \ /\ / / __|
#  | | \ \  __/\ V /| |  __/\ V  V /\__ \
#  |_|  \_\___| \_/ |_|\___| \_/\_/ |___/


class ReviewElementTypeEnum(ChoiceEnum):
    video = 'video'
    business = 'business'
    article = 'article'


class Review(LSTVContentModel):
    element_type = EnumChoiceField(ReviewElementTypeEnum, null=False, db_index=True)
    element_id = models.UUIDField(null=False, db_index=True)
    rating = models.FloatField(default=0.0, db_index=True)
    title = models.CharField(db_index=True, max_length=100, null=False)
    review = models.ForeignKey('Message', db_index=True, null=True, on_delete=models.PROTECT)

    # flagging

    flags = models.ManyToManyField('ContentFlag', db_table='v1_reviews_to_flags',
                                   related_name='review')

    def delete_deep(self):
        self.delete()

    class Meta:
        db_table = 'v1_reviews'


#    _____            _       _   _      _       _
#   / ____|          (_)     | | | |    (_)     | |
#  | (___   ___   ___ _  __ _| | | |     _ _ __ | | _____
#   \___ \ / _ \ / __| |/ _` | | | |    | | '_ \| |/ / __|
#   ____) | (_) | (__| | (_| | | | |____| | | | |   <\__ \
#  |_____/ \___/ \___|_|\__,_|_| |______|_|_| |_|_|\_\___/

class SocialNetworkTypes(LSTVModel):
    """
    specifies a social network
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    link_pattern = models.CharField(db_index=True, max_length=100, null=False)

    class Meta:
        db_table = 'v1_social_network_types'


class SocialLink(LSTVContentModel):
    """
    represents a social network link for a business or any other entity
    """

    social_network = models.ForeignKey(SocialNetworkTypes, db_index=True, on_delete=models.PROTECT, null=False)
    profile_account = models.CharField(db_index=True, max_length=100, null=False)

    def get_link(self):
        link = self.social_network.link_pattern.replace('<account>', self.profile_account)
        return link

    class Meta:
        db_table = 'v1_social_links'


#   _____  _               _
#  |  __ \(_)             | |
#  | |  | |_ _ __ ___  ___| |_ ___  _ __ _   _
#  | |  | | | '__/ _ \/ __| __/ _ \| '__| | | |
#  | |__| | | | |  __/ (__| || (_) | |  | |_| |
#  |_____/|_|_|  \___|\___|\__\___/|_|   \__, |
#                                         __/ |
#                                        |___/

class DirectoryPageClass(ChoiceEnum):
    business = "business"
    video = "video"
    photo = "photo"
    article = "article"
    style = "style"


class DirectoryType(LSTVModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    subtitle_name_singular = models.CharField(db_index=True, max_length=100, null=True)
    subtitle_name_plural = models.CharField(db_index=True, max_length=100, null=True)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    priority = models.IntegerField(db_index=True, default=0)
    show_in_dropdown = models.BooleanField(db_index=True, default=False)
    show_search = models.BooleanField(db_index=True, default=True)
    show_in_search_roles = models.BooleanField(db_index=True, default=False)
    description = models.TextField(db_index=True, null=True)
    description_location = models.TextField(db_index=True, null=True)
    content_type = EnumChoiceField(DirectoryPageClass, db_index=True)
    bg_color = models.CharField(db_index=True, max_length=10, null=False)
    role_types = models.ManyToManyField('BusinessRoleType',
                                        related_name='related_directory',
                                        db_table='v1_directories_to_role_types')
    role_capacity_types = models.ManyToManyField('VideoBusinessCapacityType',
                                                 related_name='role_capacity_types_directory',
                                                 db_table='v1_directories_to_role_capacity_types')

    def delete_deep(self):
        for rt in self.role_types.all():
            self.role_types.remove(rt)
        for rct in self.role_capacity_types.all():
            self.role_capacity_types.remove(rct)
        self.delete()

    class Meta:
        db_table = 'v1_directory_types'
        ordering = ["-show_in_dropdown", "priority"]


#   ____            _
#  |  _ \          (_)
#  | |_) |_   _ ___ _ _ __   ___  ___ ___  ___  ___
#  |  _ <| | | / __| | '_ \ / _ \/ __/ __|/ _ \/ __|
#  | |_) | |_| \__ \ | | | |  __/\__ \__ \  __/\__ \
#  |____/ \__,_|___/_|_| |_|\___||___/___/\___||___/


class BusinessVenueType(LSTVContentModel):
    """
    specifies a generic type that can be applied to a venue or a space within a venue (e.g. ("Beach" or
    "Rooftop")
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    weight_business = models.IntegerField(db_index=True, default=0)
    weight_videos = models.IntegerField(db_index=True, default=0)

    class Meta:
        db_table = 'v1_business_venue_types'


class BusinessRoleFamilyType(LSTVBareBonesModel):
    """
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    bg_color = models.CharField(db_index=True, max_length=10, null=False)

    class Meta:
        db_table = 'v1_business_role_family_types'


class BusinessRoleType(LSTVModel):
    """
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    singular = models.CharField(db_index=True, max_length=100, null=True)
    plural = models.CharField(db_index=True, max_length=100, null=True)
    name_what_business_does = models.CharField(db_index=True, max_length=100, null=True)
    role_family_type = models.ForeignKey(BusinessRoleFamilyType, db_index=True, on_delete=models.PROTECT, null=True)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    weight_in_videos = models.IntegerField(db_index=True, default=0)
    weight_in_businesses = models.IntegerField(db_index=True, default=0)
    priority = models.IntegerField(db_index=True, default=1)
    bg_color = models.CharField(db_index=True, max_length=10, null=True)

    class Meta:
        db_table = 'v1_business_role_types'
        ordering = ["-priority", "-weight_in_videos"]


class BusinessWeightedWorkLocationHistory(LSTVBaseModel):
    location = models.ForeignKey(Location, db_index=True, on_delete=models.PROTECT, null=True)
    weight = models.IntegerField(db_index=True, default=0)

    def __str__(self):
        if self.location:
            return str(self.location)
        else:
            return None

    class Meta:
        db_table = 'v1_business_weighted_work_location_history'


class BusinessGroupType(LSTVModel):
    """
    defines a vibe type grouping two or more vibe instance
    """

    slug = models.CharField(db_index=True, max_length=100, null=False)
    name = models.CharField(db_index=True, max_length=100, null=False)

    class Meta:
        db_table = 'v1_business_grouping_types'


class BusinessLocationType(ChoiceEnum):
    main = 'main'
    branch = 'branch'


class BusinessLocation(models.Model):
    """
    """
    location_description = models.CharField(db_index=True, max_length=100, null=True)
    location = models.ForeignKey(Location, db_index=True, null=False, on_delete=models.PROTECT)
    business = models.ForeignKey('Business', db_index=True, null=False, on_delete=models.PROTECT)
    location_type = EnumChoiceField(BusinessLocationType, null=False, default=BusinessLocationType.main, db_index=True)

    def delete_deep(self):
        if self.location:
            self.location.delete_deep()
        self.delete()

    class Meta:
        db_table = 'v1_business_locations'


class BusinessPhoto(models.Model):
    business = models.ForeignKey('Business', db_index=True, null=False, on_delete=models.PROTECT)
    photo = models.ForeignKey('Photo', db_index=True, null=False, on_delete=models.PROTECT)
    title = models.CharField(db_index=True, max_length=50, null=True)
    description = models.CharField(db_index=True, max_length=200, null=True)
    cta_url = models.CharField(db_index=True, max_length=150, null=True)
    order = models.IntegerField(db_index=True, default=0)
    scope = models.CharField(max_length=50, null=False, default="general")

    def delete_deep(self):
        if self.photo:
            self.photo.delete_deep()
        self.delete()

    class Meta:
        db_table = 'v1_business_photos'


class BusinessSubscriptionLevel(LSTVModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    numerical_value = models.IntegerField(db_index=True, default=0)

    def delete_deep(self):
        self.delete()

    class Meta:
        db_table = 'v1_business_subscription_levels'


class Business(LSTVContentModel):
    """
    Individual named Business (Every business, including venues that offers services to the wedding space)
    """

    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    profile_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)
    card_thumbnail = models.ForeignKey(Image, db_index=True, null=True, related_name="business_with_card_thumbnail",
                                       on_delete=models.PROTECT)
    description = models.TextField(null=True)
    website = models.CharField(db_index=True, max_length=250, null=True)
    alt_contact_cta_label = models.CharField(db_index=True, max_length=25, null=True)
    alt_contact_cta_link = models.CharField(db_index=True, max_length=250, null=True)
    inquiry_email = models.CharField(db_index=True, max_length=150, null=True)
    legacy_term_id = models.IntegerField(db_index=True, null=True)
    legacy_url = models.CharField(max_length=200, db_index=True, null=False)
    legacy_channel_uuid = models.UUIDField(db_index=True, null=True)
    venue_types = models.ManyToManyField(BusinessVenueType,
                                         through='lstv_api_v1.BusinessVenueTypeInfo',
                                         related_name='business_venues')
    card_impressions = models.IntegerField(db_index=True, default=0)
    video_card_impressions = models.IntegerField(db_index=True, default=0)
    channel_views = models.IntegerField(db_index=True, default=0)
    video_views = models.IntegerField(db_index=True, default=0)
    article_views = models.IntegerField(db_index=True, default=0)

    likes = models.IntegerField(db_index=True, default=0)
    shares = models.IntegerField(db_index=True, default=0)
    roles = models.ManyToManyField(BusinessRoleType, related_name='business_roles', db_table='v1_business_to_role_types')
    weight_subscribers = models.IntegerField(db_index=True, default=0)
    weighted_roles = models.ManyToManyField(BusinessRoleType, through='lstv_api_v1.BusinessWeightedRoleType')
    weight_videos = models.IntegerField(db_index=True, default=0)
    weight_articles = models.IntegerField(db_index=True, default=0)
    weight_photos = models.IntegerField(db_index=True, default=0)

    subscribers = models.ManyToManyField(User,
                                         db_table='v1_businesses_to_subscribers',
                                         related_name='businesses_subscribed_to')

    subscription_level = models.ForeignKey(BusinessSubscriptionLevel, db_index=True, null=True,
                                           on_delete=models.PROTECT)
    hash_code = models.CharField(max_length=20, db_index=True, null=True)

    # Premium Features

    faq = models.ManyToManyField('Message', db_table='v1_business_to_faq', related_name='faq_businesses')
    reviews = models.ManyToManyField(Review, related_name='business_in_review', db_table='v1_business_to_reviews')

    public_team = models.ManyToManyField('PublicTeamPerson', db_table='v1_business_to_public_personnel',
                                         related_name='public_personnel_businesses')
    public_team_faq = models.ManyToManyField('Message', db_table='v1_business_to_team_faq',
                                             related_name='businesses_for_team_faq')

    sold_at_businesses = models.ManyToManyField('self', db_table='v1_businesses_to_sold_at_businesses',
                                                symmetrical=False, related_name='businesses_selling')

    associate_brands = models.ManyToManyField(Brand, db_table='v1_businesses_to_associate_brands',
                                              related_name='businesses')

    organized_events = models.ManyToManyField(OrganizedEvent, db_table='v1_businesses_to_organized_events',
                                              related_name='event_businesses')

    business_photos = models.ManyToManyField('Photo',
                                             through=BusinessPhoto,
                                             related_name='photo_owning_business')

    promo_videos = models.ManyToManyField('VideoSource', through='PromoVideo', related_name='businesses')

    hide_email = models.BooleanField(db_index=True, null=False, default=False)


    # locations (offices and overage areas)
    business_locations = models.ManyToManyField(Location,
                                                through=BusinessLocation,
                                                related_name='located_business')
    coverage_locations = models.ManyToManyField(Location,
                                                db_table='v1_businesses_to_coverage_locations',
                                                related_name='works_at_business')
    worked_at_cache = models.ManyToManyField(BusinessWeightedWorkLocationHistory,
                                             db_table='v1_businesses_to_weighted_work_location_history',
                                             related_name='business_who_worked_there')
    business_phones = models.ManyToManyField(Phone,
                                             db_table='v1_businesses_to_business_phones',
                                             related_name='businesses')

    shopping_items = models.ManyToManyField('ShoppingItem', db_table='v1_businesses_to_shopping_items',
                                            related_name='businesses')

    # customer engagement
    can_work_remotely = models.BooleanField(db_index=True, null=True)
    prefer_work_locally = models.BooleanField(db_index=True, null=True)
    is_ecommerce_only = models.BooleanField(db_index=True, null=True)
    is_custom_goods = models.BooleanField(db_index=True, null=True)
    is_service_at_business_location_only = models.BooleanField(db_index=True, null=True)
    has_multiple_locations = models.BooleanField(db_index=True, null=True)

    groups = models.ManyToManyField(BusinessGroupType, related_name='group_business',
                                    db_table='v1_businesses_to_business_groups')

    # social links
    social_links = models.ManyToManyField(SocialLink, db_table='v1_businesses_to_social_network_links',
                                          related_name='social_network_businesses')

    # business tags
    tags = models.ManyToManyField(TagType, db_table='v1_businesses_to_tag_types', related_name='businesses')

    # properties
    properties = models.ManyToManyField(Properties, db_table='v1_businesses_to_properties', related_name='businesses')

    # DMZ

    dmz_originating_business = models.ForeignKey('self', db_index=True, null=True, on_delete=models.PROTECT)
    dmz_originating_video = models.ForeignKey('Video', db_index=True, null=True, on_delete=models.PROTECT)

    # state_reason (complementing state_desc for non 'active' state businesses)
    state_reason = models.TextField(db_index=True, null=True)

    # account claim link

    account_claim_code = models.CharField(db_index=True, max_length=150, null=True)
    account_claim_code_created_at = models.DateTimeField(db_index=True, null=True)
    account_claimed_at = models.DateTimeField(db_index=True, null=True)

    # suggested email (temporary storage for the dmz state)
    suggested_email = models.CharField(db_index=True, max_length=150, null=True)
    suggested_role_type = models.ForeignKey(BusinessRoleType, related_name='suggested_businesses', db_index=True,
                                            null=True, on_delete=models.PROTECT)
    suggested_by_business = models.ForeignKey('self', db_index=True, related_name="suggesting_business", null=True, on_delete=models.PROTECT)
    suggested_for_video = models.ForeignKey('Video', db_index=True, related_name="suggesting_business", null=True, on_delete=models.PROTECT)

    # functions

    def get_hash(self):
        if self.hash_code:
            return self.hash_code
        else:
            self.hash_code = secrets.token_hex(8)
            self.save()
            return self.hash_code

    def dangerously_purge_from_system(self):
        # business location objects
        BusinessLocation.objects.filter(business=self).delete()
        # business venue info type, where applicable
        BusinessVenueTypeInfo.objects.filter(business=self).delete()
        # wedding team membership removal
        VideoBusiness.objects_all_states.filter(business=self).delete()

        # wedding photos
        for photo in Photo.objects_all_states.filter(owner_business=self):
            for vp in VideoPhoto.objects.filter(photo=photo):
                vp.delete()
                vp.photo.delete_deep()
                vp.photo.delete(hard=True)
            photo.delete(hard=True)

        # team members and their content, videos, videos and posts
        BusinessTeamMember.objects_all_states.filter(business=self).delete()
        for video in VideoSource.objects_all_states.filter(owner_business=self).all():
            VideoVideo.objects.filter(video_source=video).delete()
        VideoSource.objects_all_states.filter(owner_business=self).delete()
        for team_member in BusinessTeamMember.objects_all_states.filter(business=self).all():
            for post in Post.objects_all_states.filter(author=team_member.user).all():
                print(f"{post.id} owned by {team_member.user.name}")
                Video.objects_all_states.filter(post=post).delete()
                post.delete()
            team_member.user.delete(hard=True)
        # business Photos
        for bp in BusinessPhoto.objects.filter(business=self).all():
            print(bp)
            bp.photo.delete(hard=True)
            bp.delete()

        # wedding video photos

        self.delete(hard=True)

    def get_subscription_level(self):
        return self.subscription_level

    def get_subscription_level_numeral(self):
        if self.subscription_level:
            return self.subscription_level.numerical_value
        else:
            return 0

    def is_premium(self):
        return self.get_subscription_level_numeral() > 0

    def get_videos(self):
        return Video.objects.filter(businesses__business__id=self.id)

    def get_wedding_photos(self):
        return Photo.objects.filter(owner_business__id=self.id)

    def set_subscription_level(self, slug):
        try:
            pl = BusinessSubscriptionLevel.objects.get(slug=slug)
            self.subscription_level = pl
            self.save()
            return True
        except BusinessSubscriptionLevel.DoesNotExist:
            return False

    #     ____  __________  ____  _______________  ________________
    #    / __ \/ ____/ __ \/ __ \/ ____/ ____/   |/_  __/ ____/ __ \
    #   / / / / __/ / /_/ / /_/ / __/ / /   / /| | / / / __/ / / / /
    #  / /_/ / /___/ ____/ _, _/ /___/ /___/ ___ |/ / / /___/ /_/ /
    # /_____/_____/_/   /_/ |_/_____/\____/_/  |_/_/ /_____/_____/

    def set_premium_membership(self, premium):
        if premium:
            if not self.has_premium_membership():
                vp = Properties(key=LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP,
                                source=ContentModelSource.backend,
                                source_desc="legacy_model_utils migration")
                vp.save()
                self.properties.add(vp)

        else:
            if self.has_premium_membership():
                for prop in self.properties.filter(key=LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP).all():
                    self.properties.remove(prop)
                    prop.delete()

    #     ____  __________  ____  _______________  ________________
    #    / __ \/ ____/ __ \/ __ \/ ____/ ____/   |/_  __/ ____/ __ \
    #   / / / / __/ / /_/ / /_/ / __/ / /   / /| | / / / __/ / / / /
    #  / /_/ / /___/ ____/ _, _/ /___/ /___/ ___ |/ / / /___/ /_/ /
    # /_____/_____/_/   /_/ |_/_____/\____/_/  |_/_/ /_____/_____/

    def has_premium_membership(self):
        return self.properties.filter(key=LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP).first() is not None

    def set_business_location_from_payload(self, payload):
        from lstv_api_v1.utils.utils import build_location_from_google_places
        if payload.get('location_id', None):
            bl = Location.objects.filter(
                id=payload.get('location_id', None)).first()
            if bl:
                vl = BusinessLocation(location=bl, business=self)
                vl.save()
            self.save()

        if payload.get('google', None):
            bl = build_location_from_google_places(payload['google'])
            if bl:
                vl = BusinessLocation(location=bl, business=self)
                vl.save()
            self.save()

    def get_business_role_breakdown(self, breakdown):
        for role in self.roles.all():
            if role.slug not in breakdown:
                breakdown[role.slug] = 1
            else:
                breakdown[role.slug] += 1
        return breakdown

    def get_business_location_as_text(self):
        bl = self.business_locations.all().filter(location_type=BusinessLocationType.main)
        if bl:
            return bl.get_location_as_text()
        else:
            return None

    def get_coverage_locations(self):
        locations = self.coverage_locations.all()
        if len(locations) > 0:
            return locations
        else:
            return None

    @staticmethod
    def get_review_object_type():
        return ReviewElementTypeEnum.business

    def get_works_with_businesses(self, filter_fashion_brands=False):
        rc = []
        ww = WeightedWorksWith.objects.filter((Q(business_a=self) | Q(business_b=self)) & Q(weight__gte=3)).order_by(
            '-weight')[:10]
        for w in ww:
            business = w.business_b if w.business_a == self else w.business_a
            if filter_fashion_brands:
                found = False
                for role in business.roles.all():
                    if role.role_family_type.slug == 'fashion':
                        found = True
                if not found:
                    rc.append(business)
            else:
                rc.append(business)
        return rc

    def rebuild_worked_at_location_cache(self):
        # delete old set of records

        for loc in self.worked_at_cache.all():
            if loc.location:
                loc.location.delete()
            loc.delete()
        self.worked_at_cache.clear()

        # generate new worked_at cache...

        locs = Location.objects.filter(
            id__in=Video.objects.filter(businesses__business__slug=self.slug).values('location__id'))
        for location_obj in locs:

            existing_loc = self.worked_at_cache.filter(Q(location__place=location_obj.place) &
                                                       Q(location__state_province=location_obj.state_province) &
                                                       Q(location__county=location_obj.county) &
                                                       Q(location__country=location_obj.country)).first()
            if not existing_loc:
                loc = Location(place=location_obj.place,
                               state_province=location_obj.state_province,
                               county=location_obj.county,
                               country=location_obj.country)
                loc.save()
                wwl = BusinessWeightedWorkLocationHistory(location=loc,
                                                          weight=1)
                wwl.save()
                self.worked_at_cache.add(wwl)
            else:
                existing_loc.weight += 1
                existing_loc.save()

    def get_works_at_locations_as_text(self):
        # if it doesn't exist, or it's stale, build it...
        worked_at_history = self.worked_at_cache.all().order_by('-weight')
        if len(worked_at_history) == 0:
            self.rebuild_worked_at_location_cache()
            worked_at_history = self.worked_at_cache.all().order_by('-weight')

        # otherwise, return its processed results...
        from lstv_api_v1.utils.model_utils import get_worked_at_locations_as_text
        return get_worked_at_locations_as_text(worked_at_history)

    def get_roles_as_text(self, prepend_article=False):
        role_list = []
        for role in self.roles.all():
            role_list.append(role.singular if role.singular else role.name)

        if prepend_article:
            if role_list[0][0] in "aeiouAEIOU":
                role_list[0] = 'an ' + role_list[0]
            else:
                role_list[0] = 'a ' + role_list[0]

        if len(role_list) > 1:
            return " and ".join([", ".join(role_list[:-1]), role_list[-1]] if len(role_list) > 2 else role_list)
        else:
            return self.roles.all()[0].singular or self.roles.all()[0].name

    def get_profile_image_url(self):
        if self.profile_image:
            return self.profile_image.serve_url
        else:
            return None

    def get_thumbnail_image_url(self):
        if self.card_thumbnail:
            return self.card_thumbnail.get_serve_url()
        else:
            video = Video.objects.filter(businesses__business__slug=self.slug,
                                         post__visibility=PostVisibilityEnum.public,
                                         post__state__in=[ContentModelState.active,
                                                          ContentModelState.active_review],
                                         videos__thumbnail__isnull=False).order_by('-created_at').first()
            if video:
                v = video.get_videos().first()
                if v:
                    return v.video_source.thumbnail.get_serve_url()

            # does this business have photos?

            if self.business_photos.all().count() > 0:
                return self.business_photos.all()[0].image.get_serve_url()

            return f"{DEFAULT_CDN}/images/site/nothumb.jpg"

    def set_property(self, key, value):
        prop = self.properties.filter(key=key).first()
        exist = prop is not None
        if not exist:
            prop = Properties(key=key)
        if type(value) == str:
            prop.value_text = value
        prop.save()
        if not exist:
            self.properties.add(prop)

    def get_property(self, key):
        prop = self.properties.filter(key=key).first()
        if prop and prop.value_text:
            return prop.value_text
        return None

    def has_property(self, key):
        return self.properties.filter(key=key).first()

    def remove_properties(self, name):
        self.properties.delete()

    def add_subscriber(self, user):
        self.subscribers.add(user)

    def remove_subscriber(self, user):
        self.subscribers.remove(user)

    def get_inquiry_email(self):
        if self.inquiry_email:
            return self.inquiry_email

        member = BusinessTeamMember.objects.filter(business=self.id).order_by('-created_at').first()
        if member:
            return member.user.email
        else:
            return None

    def get_contact_for_inquiry(self):
        members = BusinessTeamMember.objects.filter(business=self.id)
        if len(members) > 0:
            return members[0].user, self.inquiry_email or members[0].user.email
        else:
            return None, self.inquiry_email or ""

    def delete_deep(self):
        # process for deleting a business
        # 1) Foreign Keys -> Deep delete
        #       - profile_image
        # 2) Many-To-Many Relations -> Detach
        #       - venue_types
        #       - roles
        #       - weighted_roles
        #       - subscribers
        #       - q_and_a
        #       - reviews
        #       - public_personnel
        #       - sold_at_businesses
        #       - associated_brands
        #       - business_locations
        #       - coverage_locations
        #       - worked_at_cache
        #       - business_phones
        #       - groups
        #       - social_network_links
        #       - tags
        #       - properties
        # 3) delete self

        if self.profile_image:
            self.profile_image.delete()

        self.venue_types.clear()
        self.roles.clear()
        BusinessWeightedRoleType.objects.filter(business=self).delete()
        self.subscribers.clear()
        for msg in self.faq.all():
            msg.delete_deep()
        self.faq.clear()

        for review in self.reviews.all():
            review.delete_deep()
        self.reviews.clear()

        for pp in self.public_personnel.all():
            pp.delete_deep()
        self.public_personnel.clear()

        self.sold_at_businesses.clear()

        for ab in self.associate_brands.all():
            ab.delete_deep()
        self.associate_brands.clear()

        self.business_locations.clear()

        for cl in self.coverage_locations.all():
            cl.delete()
        self.coverage_locations.clear()

        for wa in self.worked_at_cache.all():
            wa.delete()
        self.worked_at_cache.clear()

        for bp in self.business_phones.all():
            bp.delete()
        self.business_phones.clear()

        self.groups.clear()

        for snl in self.social_links.all():
            snl.delete()
        self.social_links.clear()

        self.tags.clear()

        for props in self.properties.all():
            props.delete()
        self.properties.clear()

        self.delete()

    class Meta:
        db_table = 'v1_businesses'
        unique_together = ['slug', 'delete_token']


class BusinessWeightedRoleType(models.Model):
    business = models.ForeignKey(Business, db_index=True, null=False, on_delete=models.PROTECT)
    role_type = models.ForeignKey(BusinessRoleType, db_index=True, null=False, on_delete=models.PROTECT)
    weight = models.IntegerField(db_index=True, default=0)

    class Meta:
        db_table = 'v1_business_to_weighted_role_types'
        ordering = ['weight']


class BusinessVenueTypeInfo(models.Model):
    """
    BusinessVenueType holds additional information about the link between a venue business and its types.
    """
    business = models.ForeignKey(Business, db_index=True, null=False, on_delete=models.PROTECT)
    venue_type = models.ForeignKey(BusinessVenueType, db_index=True, null=False, on_delete=models.PROTECT)

    class Meta:
        db_table = 'v1_business_venue_type_info'


class BusinessVenueEventSpace(LSTVContentModel):
    """
    specifies a named event space to be associated with a venue. (e.g. "The Oak Room" associated with "The Plaza"
    venue)
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    type = models.ForeignKey(BusinessVenueType, db_index=True, null=False, on_delete=models.PROTECT)
    weight = models.IntegerField(db_index=True, default=0)
    business = models.ForeignKey(Business, on_delete=models.PROTECT, related_name='event_spaces',
                                 related_query_name='event_spaces', null=True)

    class Meta:
        db_table = 'v1_business_venue_event_spaces'


class BusinessTeamMemberRolePermissionType(LSTVModel):
    """
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    description = models.TextField()

    class Meta:
        db_table = 'v1_business_team_member_role_permission_types'


class BusinessTeamMemberRoleType(LSTVModel):
    """
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    permissions = models.ManyToManyField(BusinessTeamMemberRolePermissionType,
                                         db_table='v1_business_team_member_role_types_to_role_permission_types',
                                         related_name='business_team_member_role_types_to_role_permission_types')

    class Meta:
        db_table = 'v1_business_team_member_role_types'


class BusinessTeamMember(LSTVContentModel):
    """
    """
    user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT, related_name="team_users")
    business = models.ForeignKey(Business, on_delete=models.PROTECT, related_name='team_members',
                                 related_query_name='team_members', null=True)
    roles = models.ManyToManyField(BusinessTeamMemberRoleType,
                                   db_table='v1_business_team_members_to_team_member_role_types',
                                   related_name='business_team_members')

    # business team invitation
    invitation_code_pending = models.UUIDField(null=True, db_index=True)
    invited_at = models.DateTimeField(null=True, db_index=True)
    accepted_at = models.DateTimeField(null=True, db_index=True)

    def get_permissions(self):
        rc = []
        for r in self.roles.all():
            for p in r.permissions.all():
                rc.append(p.slug)
        return rc

    class Meta:
        db_table = 'v1_business_team_members'


#                                 _            _       _
#       __ _  ___ _ __   ___ _ __(_) ___    __| | __ _| |_ __ _
#      / _` |/ _ \ '_ \ / _ \ '__| |/ __|  / _` |/ _` | __/ _` |
#     | (_| |  __/ | | |  __/ |  | | (__  | (_| | (_| | || (_| |
#      \__, |\___|_| |_|\___|_|  |_|\___|  \__,_|\__,_|\__\__,_|
#      |___/
#
#


class NavigationBarContent(LSTVModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    name_id = models.IntegerField(db_index=True)
    parent_id = models.IntegerField(db_index=True)
    level = models.IntegerField(db_index=True)
    url = models.CharField(db_index=True, max_length=150, null=False)

    class Meta:
        db_table = 'v1_navbar_content'


class Setting(LSTVContentModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    value = models.JSONField(null=False)
    category = models.CharField(db_index=True, max_length=100, null=False)

    class Meta:
        db_table = 'v1_settings'


class UserEventSeverityEnum(ChoiceEnum):
    info = "info"
    warning = 'warning'
    error = "error"
    fatal = "fatal"


class UserEventCrudTypeEnum(ChoiceEnum):
    create = "create"
    read = "read"
    update = 'update'
    delete = "delete"


class UserEventOutcome(ChoiceEnum):
    success = "success"
    fail = "fail"


class UserEventLog(LSTVBaseModel):
    domain = models.CharField(db_index=True, max_length=100, null=True)
    action = models.CharField(db_index=True, max_length=100, null=False)
    event = models.CharField(db_index=True, max_length=100, null=False)
    severity = EnumChoiceField(UserEventSeverityEnum, null=False, default=UserEventSeverityEnum.info, db_index=True)
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)
    data = models.JSONField(blank=True, null=True)
    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, null=False, default=False)

    class Meta:
        db_table = 'v1_user_events_log'


class ContentFlagStaffDecision(ChoiceEnum):
    pending = "pending"
    accept_remove = "accept_remove"
    accept_remove_block = "accept_remove_block"
    reject = "reject_flag"

    # had more than one flags, took action on another flag....

    already_accepted_removed = "already_accepted_removed"
    already_accepted_removed_blocked = "already_accepted_removed_blocked"
    already_rejected = "already_rejected"


class ContentFlagElementEnumType(ChoiceEnum):
    video = 'video'
    business = 'business'
    article = 'article'
    photo = 'photo'
    message = 'message'
    vibe = 'vibe'
    location = 'location'
    review = 'review'


class ContentFlag(LSTVContentModel):
    element_type = EnumChoiceField(ContentFlagElementEnumType, null=False, db_index=True)
    element_id = models.UUIDField(null=False, db_index=True)
    flagged_by = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)
    decision_at = models.DateTimeField(null=True, db_index=True)
    complaint = models.TextField(null=True, db_index=True)
    decision = EnumChoiceField(ContentFlagStaffDecision, null=False, default=ContentFlagStaffDecision.pending,
                               db_index=True)
    decision_response = models.TextField(null=True, db_index=True)

    class Meta:
        db_table = 'v1_content_flags'
        # unique_together = ('flagged_by', 'message_d')


#    _____ _                       _               _____ _
#   / ____| |                     (_)             |_   _| |
#  | (___ | |__   ___  _ __  _ __  _ _ __   __ _    | | | |_ ___ _ __ ___
#   \___ \| '_ \ / _ \| '_ \| '_ \| | '_ \ / _` |   | | | __/ _ \ '_ ` _ \
#   ____) | | | | (_) | |_) | |_) | | | | | (_| |  _| |_| ||  __/ | | | | |
#  |_____/|_| |_|\___/| .__/| .__/|_|_| |_|\__, | |_____|\__\___|_| |_| |_|
#                     | |   | |             __/ |
#                     |_|   |_|            |___/


class ShoppingItem(LSTVContentModel):
    name = models.CharField(db_index=True, max_length=100, null=False)
    description = models.CharField(db_index=True, max_length=500, null=True)
    sold_by = models.CharField(db_index=True, max_length=100, null=False)
    shop_url = models.CharField(db_index=True, max_length=250, null=False)
    thumbnail_url = models.CharField(db_index=True, max_length=250, null=False)
    thumbnail_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)
    price = models.CharField(max_length=20, db_index=True, null=False)
    old_price = models.CharField(max_length=10, db_index=True, null=True)
    discount_label = models.CharField(db_index=True, max_length=35, null=True)
    currency_symbol = models.CharField(db_index=True, max_length=150, null=True)

    def delete_deep(self):
        if self.thumbnail_image:
            self.thumbnail_image.delete_deep()
        self.delete()

    class Meta:
        db_table = 'v1_shopping_items'


#      _ __ ___   ___  ___ ___  __ _  __ _(_)_ __   __ _
#     | '_ ` _ \ / _ \/ __/ __|/ _` |/ _` | | '_ \ / _` |
#     | | | | | |  __/\__ \__ \ (_| | (_| | | | | | (_| |
#     |_| |_| |_|\___||___/___/\__,_|\__, |_|_| |_|\__, |
#                                    |___/         |___/
#


class ExternalMessageDeliveryStatus(ChoiceEnum):
    new = "new"

    # for internal messaging (in-page, in-mail)
    posted = "posted"

    # for outside delivery (e.g. email, text message)
    sent_to_processor = 'sent_to_processor'
    delivered = "delivered"
    bounced = "bounced"
    dropped = "dropped"
    deferred = "deferred"
    opened = "opened"
    clicked = "clicked"
    spam = "spam"
    unsubscribe = "unsubscribe"


class MessageContextTypeEnum(ChoiceEnum):
    business_inquiry = "business_inquiry"
    bride_groom_contact = "bride_groom_contact"
    video_q_and_a = "video_q_and_a"
    business_review = "business_review"
    business_faq = "business_faq"
    business_team_faq = "business_team_faq"


class Message(LSTVContentModel):
    """
    Represents a message send from one entity to another on LSTV2
    """

    # context and external delivery methods and status
    message_context = EnumChoiceField(MessageContextTypeEnum, null=True, db_index=True)
    deliver_via_email = models.BooleanField(db_index=True, default=False)
    deliver_via_text_message = models.BooleanField(db_index=True, default=False)
    message_status = EnumChoiceField(ExternalMessageDeliveryStatus, null=True,
                                     db_index=True)
    parent_message = models.ForeignKey('self', db_index=True, null=True, on_delete=models.CASCADE)

    # message receiver
    to_user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT, related_name='user_to')
    to_business = models.ForeignKey(Business, db_index=True, null=True, on_delete=models.PROTECT,
                                    related_name='business_message_to')

    # bcc
    bcc = ArrayField(models.CharField(null=True, db_index=True, max_length=50), null=True)

    # message sender
    from_user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT, related_name='user_from')
    from_business = models.ForeignKey(Business, db_index=True, null=True, on_delete=models.PROTECT,
                                      related_name='business_from')
    from_first_name = models.CharField(db_index=True, max_length=45, null=True)
    from_last_name = models.CharField(db_index=True, max_length=45, null=True)
    from_profile_image = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)

    # content
    message_content = models.TextField(null=True, db_index=True)
    fixed_response = models.TextField(null=True, db_index=True)
    edited_at = models.DateTimeField(db_index=True, null=True)

    # json field elements are used to hold the contents of the message with respect to the delivery means
    # (e-mail template) for email, in-message or shorter version used for text-messaging a mobile device)
    processor_data = models.JSONField(db_index=False, null=False, default=dict)

    # thread id (used to group messages into a single context e.g. "chat between user X and user Y)
    thread_id = models.UUIDField(db_index=True, null=False)

    # flagging

    flags = models.ManyToManyField(ContentFlag, db_table='v1_messages_to_flags',
                                   related_name='messages')

    # likes

    likes = models.IntegerField(db_index=True, default=0)

    # delivery log for external messages

    pending_at = models.DateTimeField(null=True, db_index=True)
    deferred_bounced_dropped_at = models.DateTimeField(null=True, db_index=True)
    delivered_at = models.DateTimeField(null=True, db_index=True)
    opened_at = models.DateTimeField(null=True, db_index=True)
    clicked_at = models.DateTimeField(null=True, db_index=True)
    spam_at = models.DateTimeField(null=True, db_index=True)
    unsubscribed_at = models.DateTimeField(null=True, db_index=True)
    processor_message_id = models.CharField(db_index=True, max_length=100, null=False)
    delivery_email = models.CharField(db_index=True, max_length=150, null=False)
    delivery_phone = models.CharField(db_index=True, max_length=150, null=False)

    def deliver(self, **kwargs):
        from lstv_api_v1.tasks.tasks import job_deliver_email_message
        if self.deliver_via_email:
            job_deliver_email_message.delay(self.id)

    def delete_deep(self):
        self.delete()

    class Meta:
        db_table = 'v1_messages'


#
#                  _     _ _     _       _       _                  _
#      _ __  _   _| |__ | (_)___| |__   (_)_ __ | |_ ___ _ ____   _(_) _____      __
#     | '_ \| | | | '_ \| | / __| '_ \  | | '_ \| __/ _ \ '__\ \ / / |/ _ \ \ /\ / /
#     | |_) | |_| | |_) | | \__ \ | | | | | | | | ||  __/ |   \ V /| |  __/\ V  V /
#     | .__/ \__,_|_.__/|_|_|___/_| |_| |_|_| |_|\__\___|_|    \_/ |_|\___| \_/\_/
#     |_|
#


class InterviewQuestionInputType(ChoiceEnum):
    text = 'text'
    date = 'date'
    dropdown = 'dropdown'
    checkbox = 'checkbox'
    MULTIPLE_CHOICE = 'multiple_choice'
    single_choice = 'single_choice'
    video_upload = 'video_upload'
    photo_upload = 'photo_upload'
    video_type = 'video_type'


class InterviewPropertyType(LSTVContentModel):
    """
    InterviewPropertyType defines an event story publish/edit interview property
    """
    display_name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    business_role_type = models.ForeignKey(BusinessRoleType, db_index=True, null=True, on_delete=models.PROTECT)

    class Meta:
        db_table = 'v1_interview_property_types'


class InterviewPageType(LSTVModel):
    """
    InterviewPages defines a section (page) in the interview encapsulating one or more interview questions.
    """
    title_new_post = models.CharField(db_index=True, max_length=100, null=False)
    title_existing_post = models.CharField(db_index=True, max_length=100, null=True)
    order = models.IntegerField(db_index=True, null=False)
    description = models.CharField(db_index=True, max_length=100, null=True)
    questions = models.ManyToManyField(InterviewPropertyType, db_table='v1_interview_page_type_to_questions',
                                       related_name='interview_page_type')

    class Meta:
        db_table = 'v1_interview_page_types'


class InterviewType(LSTVModel):
    """
    PublishInterview defines the types of publishing interview types we have (e.g. filmmaker, newlywed, admin)
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    audience = EnumChoiceField(UserTypeEnum, null=False, db_index=True)
    audience_role = models.ForeignKey(BusinessRoleType, db_index=True, null=True, on_delete=models.PROTECT)
    interview_pages = models.ManyToManyField(InterviewPageType, db_table='v1_interview_type_to_pages',
                                             related_name='interview_type')
    new_post_page_offset = models.IntegerField(db_index=True, default=1)
    existing_post_page_offset = models.IntegerField(db_index=True)

    class Meta:
        db_table = 'v1_interview_types'


#
#            _     _
#     __   _(_) __| | ___  ___  ___
#     \ \ / / |/ _` |/ _ \/ _ \/ __|
#      \ V /| | (_| |  __/ (_) \__ \
#       \_/ |_|\__,_|\___|\___/|___/
#
#


class VideoTypeEnum(ChoiceEnum):
    jwplayer = "jwplayer"
    youtube = 'youtube'
    vimeo = "vimeo"
    facebook = "facebook"


class VideoStatusEnum(ChoiceEnum):
    new = "new"
    encoding = 'encoding'
    ready = "ready"
    encoding_failed = 'encoding_failed'
    stale_video = "stale_video"


class VideoPurposeEnum(ChoiceEnum):
    video_video = 'video_video'
    business_promo_video = 'business_promo_video'
    system_video = 'system_video'


class VideoSource(LSTVContentModel):
    uploader = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)
    owner_business = models.ForeignKey(Business, db_index=True, null=True, on_delete=models.PROTECT)
    filename = models.CharField(db_index=True, max_length=150, null=True)
    type = EnumChoiceField(VideoTypeEnum, null=False, db_index=True)
    purpose = EnumChoiceField(VideoPurposeEnum, null=False, db_index=True, default=VideoPurposeEnum.video_video)
    source_url = models.CharField(db_index=True, max_length=200, null=True)
    status = EnumChoiceField(VideoStatusEnum, null=False, db_index=True)
    uploaded_at = models.DateTimeField(db_index=True, null=True)
    process_started_at = models.DateTimeField(db_index=True, null=True)
    process_complete_at = models.DateTimeField(db_index=True, null=True)
    media_id = models.CharField(db_index=True, max_length=50, null=True)
    duration = models.IntegerField(db_index=True, null=True)
    size = models.BigIntegerField(db_index=True, null=True)
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)
    preview_gif_url = models.CharField(db_index=True, max_length=200, null=True)
    legacy_post_id = models.IntegerField(db_index=True, null=True)
    legacy_user_id = models.IntegerField(db_index=True, null=True)
    external_verified_at = models.DateTimeField(blank=True, null=True)
    width = models.IntegerField(db_index=True, null=True)
    height = models.IntegerField(db_index=True, null=True)
    views = models.IntegerField(db_index=True, default=0)
    likes = models.IntegerField(db_index=True, default=0)
    upload_token = models.CharField(db_index=True, max_length=25, null=True)

    def delete_deep(self):
        if self.thumbnail:
            self.thumbnail.delete_deep()
        self.delete()

    def update_metadata_from_source(self):
        from lstv_api_v1.utils.utils import get_jwplayer_video_state
        if type == VideoTypeEnum.jwplayer:
            state = get_jwplayer_video_state(self.media_id)
            duration = state.get('duration', None)
            size = state.get('size', None)
            height = state.get('height', None)
            width = state.get('width', None)
            exists = state.get('exists', True)

            if exists:
                if duration:
                    self.duration = int(float(duration))
                self.size = size
                self.width = width
                self.height = height
                self.save()

    class Meta:
        db_table = 'v1_video_sources'


#
#            _           _
#      _ __ | |__   ___ | |_ ___  ___
#     | '_ \| '_ \ / _ \| __/ _ \/ __|
#     | |_) | | | | (_) | || (_) \__ \
#     | .__/|_| |_|\___/ \__\___/|___/
#     |_|
#
#


class Photo(LSTVContentModel):
    uploader = models.ForeignKey(User, db_index=True, null=False, on_delete=models.PROTECT)
    owner_business = models.ForeignKey(Business, db_index=True, null=True, on_delete=models.PROTECT)
    image = models.ForeignKey(Image, db_index=True, null=False, on_delete=models.PROTECT)
    description = models.CharField(db_index=True, null=True, max_length=150)
    credit = models.CharField(db_index=True, null=True, max_length=150)
    legacy_term_id = models.IntegerField(db_index=True, null=True)
    legacy_user_id = models.IntegerField(db_index=True, null=True)
    legacy_post_id = models.IntegerField(db_index=True, null=True)
    card_impressions = models.IntegerField(db_index=True, default=0)
    likes = models.IntegerField(db_index=True, default=0)

    def delete_deep(self):
        if self.image:
            self.image.delete_deep()
        self.delete()

    class Meta:
        db_table = 'v1_photos'


#
#                      _
#      _ __   ___  ___| |_ ___
#     | '_ \ / _ \/ __| __/ __|
#     | |_) | (_) \__ \ |_\__ \
#     | .__/ \___/|___/\__|___/
#     |_|
#
#


class SongPerformer(LSTVContentModel):
    slug = models.CharField(db_index=True, max_length=100, null=False)
    name = models.CharField(db_index=True, max_length=100, null=False)
    legacy_term_ids = ArrayField(models.IntegerField(), blank=True, db_index=True, null=True)

    class Meta:
        db_table = 'v1_song_performers'


class Song(LSTVContentModel):
    slug = models.CharField(db_index=True, max_length=100, null=False)
    title = models.CharField(db_index=True, max_length=100, null=False)
    legacy_term_ids = ArrayField(models.IntegerField(), blank=True, db_index=True, null=True)
    song_performer = models.ForeignKey(SongPerformer, db_index=True, null=False, on_delete=models.PROTECT)

    class Meta:
        db_table = 'v1_songs'


class VideoType(LSTVModel):
    slug = models.CharField(db_index=True, max_length=100, null=False)
    name = models.CharField(db_index=True, max_length=100, null=False)

    class Meta:
        db_table = 'v1_video_types'


class PostTypeEnum(ChoiceEnum):
    blog = 'blog'
    article = 'article'
    page = 'page'
    video = 'video'
    new = 'new'


class PostVisibilityEnum(ChoiceEnum):
    draft = 'draft'
    unlisted = 'unlisted'
    public = 'public'
    business_private = 'business_private'


class Post(LSTVContentModel):
    title = models.CharField(db_index=True, max_length=150, null=True)
    slug = models.CharField(db_index=True, max_length=150, null=False)
    type = EnumChoiceField(PostTypeEnum, null=False, db_index=True)
    visibility = EnumChoiceField(PostVisibilityEnum, null=False, default=PostVisibilityEnum.public, db_index=True)
    author = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)
    editors = models.ManyToManyField(User, db_table='v1_posts_to_editors', related_name='editable_posts')
    legacy_post_id = models.IntegerField(db_index=True, null=True)
    legacy_url = models.CharField(max_length=200, null=False)

    # properties
    properties = models.ManyToManyField(Properties, db_table='v1_posts_to_properties', related_name='posts')

    class Meta:
        db_table = 'v1_posts'


class VideoBusinessCapacityType(LSTVModel):
    """
    VideoBusinessCapacityType defines the explicit way a named business + business_role are associated with
    a specific event story (e.g. a "Shot Designer" typed business can be a "Bride's shoe
    designer" or a "Groom shoe designer" or both... depending on the role it filled in the specific event.
    """
    name = models.CharField(db_index=True, max_length=100, null=False)
    slug = models.CharField(db_index=True, max_length=100, null=False)
    singular = models.CharField(db_index=True, max_length=100, null=True)
    plural = models.CharField(db_index=True, max_length=100, null=True)
    legacy_term_id = ArrayField(models.IntegerField(db_index=True), blank=True, db_index=True, null=False)
    business_role_type = models.ForeignKey(BusinessRoleType, db_index=True, null=False, on_delete=models.PROTECT)

    class Meta:
        db_table = 'v1_video_business_capacity_types'


class VideoBusiness(LSTVContentModel):
    """
    VideoBusiness defines the way a named business is associated with an event story. For instance:
    Some named businesses are used in multiple ways, like Sho Designers. They can be associated to an event story because
    they've supplied the bride's shoes, or bridesmaid's shoes. Unlike LSTV1, we do not duplicate business records to
    reflect the different ways they're associated with weddings, there's a need for this intermediate layer between
    an event story and named businesses.
    """
    business = models.ForeignKey(Business, db_index=True, null=False, on_delete=models.PROTECT)
    business_role_type = models.ForeignKey(BusinessRoleType, db_index=True, null=False, on_delete=models.PROTECT)
    business_capacity_type = models.ForeignKey(VideoBusinessCapacityType, db_index=True, null=True,
                                               on_delete=models.PROTECT)
    venue_type = models.ForeignKey(BusinessVenueType, db_index=True, null=True, on_delete=models.PROTECT)
    event_space = models.ForeignKey(BusinessVenueEventSpace, db_index=True, null=True, on_delete=models.PROTECT)
    primary = models.BooleanField(db_index=True, null=True, default=None)

    class Meta:
        db_table = 'v1_video_business'


class Article(URLAccessibleContent):
    post = models.ForeignKey(Post, on_delete=models.PROTECT, related_name='articles',
                             related_query_name='articles', null=True)
    content_legacy = models.TextField(null=True)
    content = models.JSONField(blank=True, null=True)
    content_md = models.TextField(null=True)
    associated_articles = models.ManyToManyField('self', db_table='v1_articles_to_associated_articles',
                                                 related_name='associated_articles')
    views = models.IntegerField(db_index=True, default=0)
    card_impressions = models.IntegerField(db_index=True, default=0)
    likes = models.IntegerField(db_index=True, default=0)
    shares = models.IntegerField(db_index=True, default=0)
    tags = models.ManyToManyField(TagType, db_table='v1_articles_to_vibe_types', related_name='articles')
    locations = models.ManyToManyField(Location, db_table='v1_articles_to_locations', related_name='articles')
    businesses = models.ManyToManyField(Business, db_table='v1_articles_to_businesses', related_name='articles')
    thumbnail = models.ForeignKey(Image, db_index=True, null=True, on_delete=models.PROTECT)

    # functions

    def delete_deep(self):
        for loc in self.locations.all():
            loc.delete_deep()
        if self.thumbnail:
            self.thumbnail.delete_deep()
        self.delete()

    def get_public_tags(self):
        return self.tags.filter(is_public=True, state=ContentModelState.active)

    def get_unique_short_url_prefix(self):
        return "b"

    class Meta:
        db_table = 'v1_articles'


class Video(URLAccessibleContent):
    event_date = models.DateField(db_index=True, null=True)
    is_draft = models.BooleanField(db_index=True, default=False)
    visibility = EnumChoiceField(PostVisibilityEnum, null=False, default=PostVisibilityEnum.public, db_index=True)
    order = models.IntegerField(db_index=True, default=1)
    title = models.CharField(db_index=True, max_length=150, null=False)
    views = models.IntegerField(db_index=True, default=0)
    card_impressions = models.IntegerField(db_index=True, default=0)
    likes = models.IntegerField(db_index=True, default=0)
    shares = models.IntegerField(db_index=True, default=0)
    content = models.TextField(null=True)
    type = models.ForeignKey(VideoType, db_index=True, null=False, on_delete=models.PROTECT)
    post = models.ForeignKey(Post, on_delete=models.PROTECT, related_name='videos',
                             related_query_name='videos', null=True)
    vibes = models.ManyToManyField(TagType, db_table='v1_videos_to_vibe_types', related_name='videos')
    location = models.ForeignKey(Location, db_index=True, null=True, on_delete=models.PROTECT)
    businesses = models.ManyToManyField(
        VideoBusiness,
        db_table='v1_videos_to_businesses',
        related_name='videos')
    properties = models.ManyToManyField(Properties, db_table='v1_videos_to_properties',
                                        related_name='videos')
    songs = models.ManyToManyField(Song, db_table='v1_videos_to_songs',
                                   related_name='videos')
    q_and_a = models.ManyToManyField(Message, db_table='v1_videos_to_questions',
                                     related_name='videos')

    # legal...
    opt_in_for_social = models.BooleanField(db_index=True, default=False)
    opt_in_for_paid_partners = models.BooleanField(db_index=True, default=False)

    # videos and photos...

    videos = models.ManyToManyField(VideoSource, through='VideoVideo', related_name='videos')
    photos = models.ManyToManyField(Photo, through='VideoPhoto', related_name='videos')

    # shopping items linked to event story

    shopping_items = models.ManyToManyField(ShoppingItem, db_table='v1_videos_to_shopping_items',
                                            related_name='videos')

    # functions

    def get_all_public_tags_as_text(self):
        tags = self.vibes.all().values_list('name', flat=True).order_by('-weight')
        return ", ".join(tags)

    def get_public_vibes(self):
        return self.vibes.exclude(tag_family_type__slug__in=['lstv-editorial'])

    def get_public_tags(self):
        return self.vibes.filter(tag_family_type__slug__in=['lstv-editorial'])

    def get_all_tags(self):
        return self.vibes.all()

    def get_public_tags(self):
        return self.vibes.filter(tag_family_type__slug__in=['lstv-editorial'])

    def get_videos(self):
        return VideoVideo.objects.filter(video=self)

    def get_thumbnail_url(self):
        vids = self.get_videos()
        if vids.count() > 0:
            try:
                return vids[0].video_source.thumbnail.get_serve_url()
            except:
                pass

    def get_photos(self):
        return VideoPhoto.objects.filter(video=self)

    def get_business_role_breakdown(self, breakdown):
        for business in self.businesses.all():
            if business.business_role_type.slug not in breakdown:
                if breakdown == {}:
                    breakdown = {business.business_role_type.slug: 1}
                else:
                    breakdown[business.business_role_type.slug] = 1
            else:
                breakdown[business.business_role_type.slug] += 1
        return breakdown

    def get_businesses(self, types=None):
        if not types:
            return self.businesses.all().order_by('-business__weight_videos')
        else:
            return self.businesses.filter(business__roles__slug__in=types).order_by('-business__weight_videos')

    def get_unique_short_url_prefix(self):
        return "v"

    class Meta:
        db_table = 'v1_videos'
        ordering = ['-order']


class VideoVideo(models.Model):
    video_source = models.ForeignKey(VideoSource, db_index=True, null=False, on_delete=models.PROTECT)
    video = models.ForeignKey(Video, db_index=True, null=False, on_delete=models.PROTECT)
    order = models.IntegerField(db_index=True, default=0)
    title = models.CharField(db_index=True, max_length=150, null=True)

    class Meta:
        db_table = 'v1_videos_to_video_sources'
        ordering = ['order']


class PromoVideo(models.Model):
    is_draft = models.BooleanField(db_index=True, default=False)
    visibility = EnumChoiceField(PostVisibilityEnum, null=False, default=PostVisibilityEnum.public, db_index=True)
    video_source = models.ForeignKey(VideoSource, db_index=True, null=False, on_delete=models.PROTECT)
    business = models.ForeignKey(Business, db_index=True, null=False, on_delete=models.PROTECT)
    order = models.IntegerField(db_index=True, default=0)
    title = models.CharField(db_index=True, max_length=150, null=True)
    description = models.TextField(db_index=True, max_length=500, null=True)
    opt_in_for_social_and_paid = models.BooleanField(db_index=True, default=False)

    class Meta:
        db_table = 'v1_promo_videos'
        ordering = ['order']


class VideoPhoto(models.Model):
    photo = models.ForeignKey(Photo, db_index=True, null=False, on_delete=models.PROTECT)
    video = models.ForeignKey(Video, db_index=True, null=False, on_delete=models.PROTECT)
    order = models.IntegerField(db_index=True, default=0)
    scope = models.CharField(max_length=50, null=False, default="general")

    class Meta:
        db_table = 'v1_videos_to_photos'


#
#      _                   _
#     | | ___   __ _  __ _(_)_ __   __ _
#     | |/ _ \ / _` |/ _` | | '_ \ / _` |
#     | | (_) | (_| | (_| | | | | | (_| |
#     |_|\___/ \__, |\__, |_|_| |_|\__, |
#              |___/ |___/         |___/
#


class RequestLog(LSTVBaseModel):
    """
    General relocation preferences for talent.
    """
    # user this event pertains to (or null if anonymous)
    user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)

    # unique guest ID
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)

    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # method
    method = models.CharField(db_index=True, null=False, max_length=10)

    # url
    url = models.CharField(db_index=True, null=False, max_length=150)

    # url_full
    request_path = models.CharField(db_index=True, null=True, max_length=250)

    # payload
    data = models.JSONField(blank=True, null=True)

    # request incoming/outgoing cookies
    cookies_in = models.JSONField(blank=True, null=True)
    cookies_out = models.JSONField(blank=True, null=True)

    # result_code
    result_code = models.IntegerField(db_index=True)

    # result
    result = models.TextField(null=True)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    class Meta:
        db_table = 'v1_request_log'


class VideoPlaybackLog(LSTVBaseModel):
    video_identifier = models.UUIDField(db_index=True, null=True)
    time_watched = models.FloatField(db_index=True, null=True)
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    user = models.ForeignKey(User, related_name='video_playbacks', related_query_name='video_playbacks',
                             on_delete=models.PROTECT, null=True)
    duration = models.FloatField(db_index=True, null=True)

    ad_title = models.CharField(db_index=True, max_length=100, null=True)
    ad_duration = models.FloatField(db_index=True, null=True)
    ad_time_watched = models.FloatField(db_index=True, null=True)
    ad_clicked = models.BooleanField(db_index=True, null=True)
    ad_clicked_time_index = models.FloatField(db_index=True, null=True)

    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    class Meta:
        select_on_save = True
        db_table = 'v1_video_playback_log'


class LegacyViewsLog(LSTVBareBonesModel):
    # legacy information -- to be used for import only
    legacy_created = models.CharField(max_length=45, null=False)
    legacy_user_id = models.IntegerField(null=True)
    legacy_post_id = models.IntegerField(null=True)
    migrated = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = 'v1_legacy_views_log'


class CardImpressionsLog(LSTVBareBonesModel):
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    element_type = EnumChoiceField(ContentSearchQueryType, null=False, db_index=True)
    element_id = models.UUIDField(db_index=False, null=True)
    user = models.ForeignKey(User, related_name='card_impression_log', related_query_name='card_impression_log',
                             on_delete=models.SET_NULL, null=True)
    event_date = models.DateField(db_index=True, null=True)
    num_impressions = models.IntegerField(db_index=True, default=1)

    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    class Meta:
        db_table = 'v1_card_impression_log'


class VideoViewLog(LSTVBareBonesModel):
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    video = models.ForeignKey(Video, related_name='video_view_logs',
                              related_query_name='video_views_logs',
                              on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, related_name='video_view_logs', related_query_name='video_view_logs',
                             on_delete=models.SET_NULL, null=True)
    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    # legacy post_id to help us import the log incrementally, despite re-creating everything else from scratch.
    legacy_post_id = models.IntegerField(null=True, db_index=True)
    legacy_user_id = models.IntegerField(null=True, db_index=True)

    class Meta:
        db_table = 'v1_video_view_log'


class PromoVideoViewLog(LSTVBareBonesModel):
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    video_source = models.ForeignKey(VideoSource, related_name='promo_video_view_logs',
                                     related_query_name='promo_video_views_logs',
                                     on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, related_name='promo_video_view_logs', related_query_name='promo_video_view_logs',
                             on_delete=models.SET_NULL, null=True)
    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    # legacy post_id to help us import the log incrementally, despite re-creating everything else from scratch.
    legacy_post_id = models.IntegerField(null=True, db_index=True)
    legacy_user_id = models.IntegerField(null=True, db_index=True)

    class Meta:
        db_table = 'v1_promo_video_view_log'


class ArticleViewLog(LSTVBareBonesModel):
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    short_url_token = models.CharField(db_index=True, max_length=7, null=True, default=None)
    article = models.ForeignKey(Article, related_name='article_view_logs',
                                related_query_name='article_views_logs',
                                on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, related_name='article_view_logs', related_query_name='article_view_logs',
                             on_delete=models.SET_NULL, null=True)

    # IP
    ip = models.ForeignKey(IPAddress, db_index=True, null=True, on_delete=models.PROTECT)

    # migrated to log cluster
    migrated_to_log_cluster = models.BooleanField(db_index=True, default=False)

    # legacy post_id to help us import the log incrementally, despite re-creating everything else from scratch.
    legacy_post_id = models.IntegerField(null=True, db_index=True)
    legacy_user_id = models.IntegerField(null=True, db_index=True)

    class Meta:
        db_table = 'v1_article_view_log'


#                                           _   _                _____           _
#     /\                                   | | (_)              / ____|         | |         
#    /  \   __ _  __ _ _ __ ___  __ _  __ _| |_ _  ___  _ __   | |     __ _  ___| |__   ___ 
#   / /\ \ / _` |/ _` | '__/ _ \/ _` |/ _` | __| |/ _ \| '_ \  | |    / _` |/ __| '_ \ / _ \
#  / ____ \ (_| | (_| | | |  __/ (_| | (_| | |_| | (_) | | | | | |___| (_| | (__| | | |  __/
# /_/    \_\__, |\__, |_|  \___|\__, |\__,_|\__|_|\___/|_| |_|  \_____\__,_|\___|_| |_|\___|
#           __/ | __/ |          __/ |                                                      
#          |___/ |___/          |___/                                                       


class AggregationCache(LSTVModel):
    context = models.CharField(db_index=True, max_length=100, null=False)
    ttl_hours = models.IntegerField(db_index=True, default=0)
    data_timestamp = models.DateTimeField(db_index=True, null=True)

    def is_expired(self):
        if not self.ttl_hours:
            return False

        interval = datetime.now(timezone.utc) - self.data_timestamp
        if interval.total_seconds() / 3600 > self.ttl_hours:
            AggregationCacheData.objects.filter(aggregation_cache=self).delete()
            return True
        else:
            return False

    class Meta:
        db_table = 'v1_aggregation_cache'


class AggregationCacheData(LSTVModel):
    aggregation_cache = models.ForeignKey(AggregationCache, related_name='aggregation_cache',
                                          related_query_name='aggregation_cache',
                                          on_delete=models.PROTECT, null=False)
    object_id = models.UUIDField(db_index=True, null=False)
    value = models.IntegerField(db_index=True, null=True)
    value_json = models.JSONField(db_index=False, null=True)

    class Meta:
        db_table = 'v1_aggregation_cache_data'


#  _      _ _
# | |    (_) |
# | |     _| | _____  ___
# | |    | | |/ / _ \/ __|
# | |____| |   <  __/\__ \
# |______|_|_|\_\___||___(


class LikableElementType(ChoiceEnum):
    video = 'video'
    business = 'business'
    article = 'article'
    photo = 'photo'
    message = 'message'
    vibe = 'vibe'
    location = 'location'
    review = 'review'
    q_and_a = "q_and_a"


class Like(LSTVContentModel):
    element_type = EnumChoiceField(LikableElementType, blank=False, null=False, db_index=True)
    user = models.ForeignKey(User, db_index=True, null=True, on_delete=models.PROTECT)
    unique_guest_uuid = models.UUIDField(db_index=True, null=True)
    element_id = models.UUIDField(db_index=True, null=False)

    class Meta:
        db_table = 'v1_likes'


#   _____                                       ____          _           _
#  |  __ \                                     / __ \        | |         (_)
#  | |__) |___  ___  ___  _   _ _ __ ___ ___  | |  | |_ __ __| | ___ _ __ _ _ __   __ _
#  |  _  // _ \/ __|/ _ \| | | | '__/ __/ _ \ | |  | | '__/ _` |/ _ \ '__| | '_ \ / _` |
#  | | \ \  __/\__ \ (_) | |_| | | | (_|  __/ | |__| | | | (_| |  __/ |  | | | | | (_| |
#  |_|  \_\___||___/\___/ \__,_|_|  \___\___|  \____/|_|  \__,_|\___|_|  |_|_| |_|\__, |
#                                                                                  __/ |
#                                                                                 |___/

class ResourceOrderingType(ChoiceEnum):
    video = 'video'


class ResourceOrder(LSTVContentModel):
    element_type = EnumChoiceField(ResourceOrderingType, blank=False, null=False, db_index=True)
    video = models.ForeignKey(Video, db_index=True, null=True, on_delete=models.PROTECT)
    element_owner = models.UUIDField(db_index=True, null=False)
    element_order = models.IntegerField(db_index=True, null=False)

    class Meta:
        db_table = 'v1_resource_ordering'


#    _____                                _ _        _____            _             _
#   / ____|                              (_) |      / ____|          | |           | |
#  | |     ___  _ __ ___  _ __   ___  ___ _| |_ ___| |     ___  _ __ | |_ ___ _ __ | |_
#  | |    / _ \| '_ ` _ \| '_ \ / _ \/ __| | __/ _ \ |    / _ \| '_ \| __/ _ \ '_ \| __|
#  | |___| (_) | | | | | | |_) | (_) \__ \ | ||  __/ |___| (_) | | | | ||  __/ | | | |_
#   \_____\___/|_| |_| |_| .__/ \___/|___/_|\__\___|\_____\___/|_| |_|\__\___|_| |_|\__|
#                        | |
#                        |_|


class CompositeContentElementType(ChoiceEnum):
    channel_main_video = 'channel_main_video'
    channel_main_photograph = 'channel_main_video'
    business_info_grid = 'business_info_grid'
    header = 'header'
    content_grid = 'content_grid'
    content_grid_filter = 'content_grid_filter'


class CompositeContentElementAvailability(ChoiceEnum):
    all = 'all'
    mobile_only = 'mobile_only'
    tablet_only = 'tablet_only'
    desktop_only = 'desktop_only'
    mobile_and_tablet_only = 'mobile_and_tablet_only'
    tablet_and_up = 'tablet_and_up'


class CompositeContentElement(LSTVModel):
    element_type = EnumChoiceField(CompositeContentElementType, blank=False, null=False, db_index=True)
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    options = models.JSONField(db_index=False, null=True)

    class Meta:
        db_table = 'v1_composite_content_elements'


class CompositeContentBindingItem(LSTVModel):
    composite_content_element = models.ForeignKey(CompositeContentElement, db_index=True, null=False,
                                                  on_delete=models.PROTECT)
    order = models.IntegerField(db_index=True, default=0)
    device_availability = EnumChoiceField(CompositeContentElementAvailability, blank=False, null=False, db_index=True,
                                          default=CompositeContentElementAvailability.all)

    class Meta:
        db_table = 'v1_composite_content_biding_items'


class CompositeContentBinding(LSTVModel):
    slug = models.CharField(db_index=True, max_length=100, null=False, unique=True)
    composite_content_elements = models.ManyToManyField(
        CompositeContentBindingItem,
        db_table='v1_composite_content_bindings_to_elements',
        related_name='composite_content_bindings')
    options = models.JSONField(db_index=False, null=True)

    def add_composite_content_element(self, composite_content_element, order):
        if composite_content_element:
            new_cce_item = CompositeContentBindingItem(composite_content_element=composite_content_element, order=order)
            new_cce_item.save()
            self.composite_content_elements.add(new_cce_item)

    class Meta:
        db_table = 'v1_composite_content_bindings'


class FileUploadModel(LSTVBaseModel):
    file = models.ImageField(upload_to='./', default='')
    created = models.DateTimeField(db_index=True, auto_now_add=True)

    class Meta:
        db_table = 'v1_file_upload_model'