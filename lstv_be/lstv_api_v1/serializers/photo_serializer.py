import statistics
from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import PropertySerializer, \
    BusinessRoleTypeSerializer, BusinessPhoneSerializer, BusinessCohortSerializer, BusinessSocialLinksSerializer, \
    BusinessVenueTypesSerializer, BusinessLocationSerializer, BusinessLocationAndCoverageSerializer, \
    BusinessPublicTeamSerializer, BusinessAssociateBrandsSerializer, BusinessSoldAtSerializer, TagSerializer
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.utils.aws_utils import process_thumbnail_url
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.models import *
from lstv_api_v1.views.utils.view_utils import legacy_url_image
from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3


class PhotoSerializer(LSTVBaseSerializer):
    video_id = serializers.UUIDField(required=True)
    business_slug = serializers.CharField(min_length=1, max_length=50, required=False)
    photos = serializers.JSONField(required=True)

    def __init__(self, *args, **kwargs):
        self.reset_internals()
        super().__init__(*args, **kwargs)

    def reset_internals(self):
        self._video = None
        self._business = None
        self._photoArray = []

    def validate(self, data):
        method = getattr(self.request, 'method', None)
        self.reset_internals()

        # video ID
        try:
            self._video = Video.objects.get(pk=data.get('video_id', None))
        except Video.DoesNotExist:
            raise serializers.ValidationError(
                f"{data['video_id']} does not correspond to an exinsting video id")

        # Photography Business
        try:
            self._business = Business.objects.get(slug=data.get('business_slug', None), roles__slug='photographer')
        except Business.DoesNotExist:
            raise serializers.ValidationError(
                f"{data['business_slug']} does not correcpond to an existing photographer")

        return data

    def create(self, validated_data):
        result_photos = []
        # create photos
        for photo in validated_data.get('photos', []):
            photo = process_thumbnail_url(photo)
            result_photos.append(photo)
            i = Image(legacy_url=photo, purpose=ImagePurposeTypes.photo, width=1280, height=720)
            i.save()
            print(f"saved photo id {i.id}")
            p = Photo(image=i, uploader=self.request.user, owner_business=self._business)
            p.save()
            job_migrate_image_to_s3.delay(i.id)
            vp = VideoPhoto(video=self._video, order=0, photo=p)
            vp.save()
            result_photos.append({"photo_id": p.id, "photo_url": photo})

        found_photographer = self._video.businesses.filter(business=self._business,
                                                           business_role_type__slug='photographer').first()

        # if there are no photographers, use this one...

        if not found_photographer:
            new_photographer = VideoBusiness(business=self._business,
                                             business_role_type=BusinessRoleType.objects.get(slug='photographer'))
            new_photographer.save()
            self._video.businesses.add(new_photographer)

        return {
            "video_id": self._video.id,
            "video_slug": self._video.post.slug,
            "business_slug": self._business.slug,
            "photos": result_photos
        }

    def update(self, instance, validated_data):
        return super(PhotoSerializer).update(instance, validated_data)

    def to_representation(self, obj):
        video_slug = None
        video = VideoPhoto.objects.filter(photo__pk=obj.photo.id).first()
        if video:
            video_slug = video.video.post.slug

        return {
            'created_at': obj.photo.created_at,
            'id': obj.photo.id,
            'order': obj.order,
            'scope': obj.scope,
            'url': legacy_url_image(obj.photo.image.get_serve_url()),
            'width': obj.photo.image.width,
            'height': obj.photo.image.height,
            'description': obj.photo.description,
            'owner_business': obj.photo.owner_business.name,
            'owner_business_slug': obj.photo.owner_business.slug,
            'in_video_slug': video_slug,
            'video_id': video.video.id,
            'video_thumbnail': video.video.get_thumbnail_url(),
            'video_title': video.video.title,
            'credit': obj.photo.credit or obj.photo.owner_business.name
        }


