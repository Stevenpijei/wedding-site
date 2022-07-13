from lstv_api_v1.models import ContentVerbosityType, ContentModelState, TagFamilyType, TagType, Image, ImagePurposeTypes
from lstv_api_v1.serializers.curated_content_serializer import CuratedContentSerializer
from lstv_api_v1.utils.utils import SERIALIZER_DETAIL_LEVEL_CONTEXT_MINIMAL, \
    SERIALIZER_DETAIL_LEVEL_CONTEXT_CARD
from lstv_api_v1.views.lstv_base_api_view import LSTVBaseSerializer
from rest_framework import serializers
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.utils.business_admin_actions import create_upload_image


#   _______            _______                  _____           _       _ _
#  |__   __|          |__   __|                / ____|         (_)     | (_)
#     | | __ _  __ _     | |_   _ _ __   ___  | (___   ___ _ __ _  __ _| |_ _______ _ __
#     | |/ _` |/ _` |    | | | | | '_ \ / _ \  \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#     | | (_| | (_| |    | | |_| | |_) |  __/  ____) |  __/ |  | | (_| | | |/ /  __/ |
#     |_|\__,_|\__, |    |_|\__, | .__/ \___| |_____/ \___|_|  |_|\__,_|_|_/___\___|_|
#               __/ |        __/ | |
#              |___/        |___/|_|



class TagTypeSubscriberSerializer(LSTVBaseSerializer):
    def create(self, validated_data):
        return {}

    def update(self, instance, validated_data):
        return {}

    def to_representation(self, obj):
        def get_obj_dict(o):
            return {
                'id': o.id,
                'name': o.get_full_name_or_email()
            }

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)


class TagTypeSerializer(LSTVBaseSerializer):

    slug = serializers.CharField(max_length=100, required=False)
    name = serializers.CharField(max_length=100, required=False)
    type_slug = serializers.CharField(required=False, allow_null=True)
    thumbnail = serializers.CharField(max_length=200, required=False, allow_null=True)

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or POST we do not require most of the mandatory fields.
        """
        fields = super(TagTypeSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        fields['name'].required = method in ['POST'] and not self.request_context
        fields['slug'].required = method in ['PATCH']
        fields['type_slug'].allow_blank = method in ['PATCH', 'POST']
        return fields

    def validate(self,data):
        method = getattr(self.request, 'method', None)

        if 'name' in data:
            te = TagType.objects.filter(slug=slugify_2(data.get('name', None))).first()
            if (te and method in ('POST','PATCH')) or (te and te.id != self.element.id):
                raise serializers.ValidationError(
                    {"name": [f"already exists: {data.get('name', None)}"]})

        if 'type_slug' in data and data.get('type_slug') is not None:
            te = TagFamilyType.objects.filter(slug=data.get('type_slug')).first()
            if not te:
                raise serializers.ValidationError(
                    {"type_slug": [f"does not exists: {data.get('type_slug', None)}"]})

        return data

    def create(self, validated_data):
        tag_name = validated_data['name']
        tag_type_slug_value = TagFamilyType.objects.get(slug=validated_data['type_slug']) if 'type_slug' in validated_data else None
        if 'thumbnail' in validated_data:
            thumbnail_obj = create_upload_image(validated_data['thumbnail'], purpose=ImagePurposeTypes.thumbnail,
                                            change_acl=True, sync=True)
        else:
            thumbnail_obj = None
        tag_object = TagType(name=tag_name, slug=slugify_2(tag_name),
                            tag_family_type=tag_type_slug_value,
                            thumbnail=thumbnail_obj)
        tag_object.save()
        return {"id": tag_object.id, "slug": tag_object.slug}

    def update(self, instance, validated_data):
        change = False
        
        if 'name' in validated_data and validated_data['name'] != instance.name:
            instance.name = validated_data['name']
            instance.slug = slugify_2(validated_data['name'])
            change = True
        
        if 'type_slug' in validated_data:
            change=True
            if validated_data['type_slug'] is None:
                instance.tag_family_type = None
            else:
                instance.tag_family_type = TagFamilyType.objects.get(slug=validated_data['type_slug'])

        if 'thumbnail' in validated_data:
            change = True
            if validated_data['thumbnail'] is None:
                if instance.thumbnail:
                    instance.thumbnail.delete_deep()
                instance.thumbnail = None
            else:
                thumbnail_obj = create_upload_image(validated_data['thumbnail'], purpose=ImagePurposeTypes.thumbnail,
                                            change_acl=True, sync=True)
                instance.thumbnail = thumbnail_obj

        if change:
            instance.save()

        return {"id": instance.id, "slug": instance.slug}

    def process_custom_fields(self, curated_content, obj):
        for cci in curated_content.keys():
            curated_content[cci] = curated_content[cci].replace("{weight_videos}", f"{obj.weight_videos:,}")
            curated_content[cci] = curated_content[cci].replace("{name}", f"{obj.name}")
        return curated_content

    def to_representation(self, obj):

        if self.verbosity == ContentVerbosityType.slug:
            data = {'slug': obj.slug}
        elif self.verbosity == ContentVerbosityType.search_hint:
            data = {
                'name': obj.name,
                'slug': obj.slug,
                'type_name': obj.tag_family_type.name
            }
        else:
            curated_content = CuratedContentSerializer().to_representation(obj)
            data = {
                'name': obj.name,
                'slug': obj.slug,
                'weight': obj.weight,
                'type': obj.tag_family_type.name if obj.tag_family_type and obj.tag_family_type.name else None,
                'type_slug': obj.tag_family_type.slug if obj.tag_family_type and obj.tag_family_type.slug else None,
                'importance': obj.importance,
                'type_group': obj.tag_family_type.tag_group.name if obj.tag_family_type else None,
                'weight_videos': obj.weight_videos,
                'weight_articles': obj.weight_articles,
                'weight_businesses': obj.weight_businesses,
                'weight_photos': obj.weight_photos,
                'subscribers': obj.subscribers.count(),
                'thumbnail': Image.objects.get(id=obj.thumbnail_id).serve_url if obj.thumbnail_id else None
            }

            if self.verbosity in [ContentVerbosityType.admin_full, ContentVerbosityType.admin_list]:
                data['created_at'] = obj.created_at
            if self.scope == ContentModelState.deleted:
                data['deleted_at'] = obj.deleted_at

            if curated_content:
                data['curated_content'] = self.process_custom_fields(curated_content, obj)

        if self.verbosity == ContentVerbosityType.card or self.verbosity in [ContentVerbosityType.admin_full, ContentVerbosityType.admin_list]:
            data['thumbnail_url'] = obj.get_thumbnail_image_url()

        return data
