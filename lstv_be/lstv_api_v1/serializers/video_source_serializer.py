from rest_framework import serializers

from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.models import VideoVideo, VideoPurposeEnum, PostVisibilityEnum, VideoBusiness, Video, TagType, \
    ContentModelState, ContentVerbosityType, PromoVideo
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.views.utils.view_utils import legacy_url_image
from lstv_be.settings import WEB_SERVER_URL


class VideoSourceSerializer(LSTVBaseSerializer):
    def create(self, validated_data):
        return super(VideoSourceSerializer).create(validated_data)

    def update(self, instance, validated_data):
        return super(VideoSourceSerializer).update(instance, validated_data)

    def to_representation(self, obj):
        return {
            'id': obj.video_source.id,
            'order': obj.order,
            'type': obj.video_source.type.name,
            'media_id': obj.video_source.media_id,
            'duration': obj.video_source.duration,
            'width': obj.video_source.width,
            'height': obj.video_source.height,
            'thumbnail_url': legacy_url_image(
                obj.video_source.thumbnail.get_serve_url() if obj.video_source.thumbnail else None)
        }


class BusinessVideoSerializer(LSTVBaseSerializer):
    visibility = serializers.ChoiceField(choices=PostVisibilityEnum)

    def create(self, validated_data):
        return super(BusinessVideoSerializer).create(validated_data)

    def update(self, instance, validated_data):
        videos = VideoVideo.objects.filter(video_source=instance)

        if validated_data['visibility'] == PostVisibilityEnum.unlisted:
            for video in videos:
                video.video.post.visibility = PostVisibilityEnum.unlisted
                video.video.post.save()

        if validated_data['visibility'] == PostVisibilityEnum.public:
            for video in videos:
                video.video.post.visibility = PostVisibilityEnum.public
                video.video.post.save()

        return {"id": instance.id}

    def to_representation(self, obj):
        #  is published?

        vid = VideoVideo.objects.filter(video_source=obj).first()
        promo = PromoVideo.objects.filter(video_source=obj).first()

        video_type = 'wedding'
        if obj.purpose == VideoPurposeEnum.business_promo_video:
            video_type = 'promo'

        businesses = []
        tags = []

        visibility = 'n/a'
        if vid:
            visibility = str(vid.video.post.visibility)

            # spouse
            if vid.video:
                spouse_1 = vid.video.post.properties.filter(key='spouse_1').first()
                spouse_2 = vid.video.post.properties.filter(key='spouse_2').first()
                bride_email = vid.video.post.properties.filter(key='bride_email').first()
                bride_instagram = vid.video.post.properties.filter(key='bride_instagram').first()

                print(spouse_1)
                print(bride_email)

            # businesses

            for vb in VideoBusiness.objects_all_states.filter(videos=vid.video).exclude(
                    state=ContentModelState.deleted):
                if not vid.video or vb.business.slug != vid.video_source.owner_business.slug:
                    business = vb.business
                    if business.state == ContentModelState.suspended_dmz and business.suggested_for_video == vid.video:
                        businesses.append({
                            "name": business.name,
                            "email": business.suggested_email,
                            "role_slug": business.suggested_role_type.slug if business.suggested_role_type else None,
                            "ref": business.id,
                            "state": str(business.state),
                            "suggested_for_video": business.suggested_for_video.id,
                            "suggested_by_business": business.suggested_by_business.id
                        })
                    if business.state in [ContentModelState.active, ContentModelState.active_review]:
                        businesses.append({
                            "slug": business.slug,
                            "name": business.name,
                            "role_slug": vb.business_role_type.slug,
                            "role_capacity_slug": vb.business_capacity_type.slug if vb.business_capacity_type else None
                        })

            # tags
            for tag in TagType.objects_all_states.filter(videos=vid.video):
                if tag.state == ContentModelState.suspended_dmz:
                    tags.append({
                        "name": tag.name,
                    })
                if tag.state in [ContentModelState.active, ContentModelState.active_review]:
                    tags.append({
                        "slug": tag.slug,
                        "name": tag.name
                    })

        if vid and vid.video:
            opt_in_for_social_and_paid = vid.video.opt_in_for_social or vid.video.opt_in_for_paid_partners
        else:
            if promo:
                opt_in_for_social_and_paid = promo.opt_in_for_social_and_paid
            else:
                opt_in_for_social_and_paid = False

        rc = {
            'id': obj.id,
            'video_id': vid.video.id if vid else None,
            'visibility': visibility,
            'draft': vid.video.is_draft if vid and vid.video else None,
            'video_type': video_type,
            'media_id': obj.media_id,
            'duration': obj.duration,
            'uploaded_at': obj.uploaded_at or obj.created_at,
            'width': obj.width,
            'height': obj.height,
            'title': vid.video.title if vid else None,
            'link': f"{WEB_SERVER_URL}/{vid.video.post.slug}" if vid else None,
            'thumbnail_url': legacy_url_image(
                obj.thumbnail.get_serve_url() if obj.thumbnail else None),
            'opt_in_for_social_and_paid': opt_in_for_social_and_paid

        }

        if self.verbosity == ContentVerbosityType.full and obj.purpose == VideoPurposeEnum.video_video:
            rc['name_spouse_1'] = spouse_1.get_value() if vid and spouse_1 else None
            rc['name_spouse_2'] = spouse_2.get_value() if vid and spouse_2 else None
            rc['bride_email'] = bride_email.get_value() if vid and bride_email else None
            rc['bride_instagram'] = bride_instagram.get_value() if vid and bride_instagram else None
            rc['event_location'] = LocationSerializer().to_representation(
                vid.video.location) if vid and vid.video.location else None
            rc['event_date'] = vid.video.event_date if vid and vid.video and vid.video.event_date else None
            rc['content'] = vid.video.content if vid and vid.video and vid.video.content else None
            rc['businesses'] = businesses
            rc['tags'] = tags

        if self.verbosity == ContentVerbosityType.full and obj.purpose == VideoPurposeEnum.business_promo_video:
            rc['draft'] = promo.is_draft if promo else False
            rc['visibility'] = str(promo.visibility) if promo else str(PostVisibilityEnum.unlisted)
            rc['content'] = promo.description if promo else None
            rc['title'] = promo.title if promo else None

        return rc
