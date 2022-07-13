import statistics
from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.models import *
from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3
from lstv_api_v1.utils.aws_utils import aws_s3_change_file_acl, aws_s3_does_object_exist, \
    aws_s3_move_file_to_another_key, process_thumbnail_url
from lstv_api_v1.views.utils.view_utils import legacy_url_image
from django.conf import settings


class BusinessPhotoSerializer(LSTVBaseSerializer):
    photo_url = serializers.CharField(max_length=200, required=True)
    title = serializers.CharField(max_length=50, required=False)
    description = serializers.CharField(max_length=200, required=False)
    cta_url = serializers.CharField(max_length=150, required=False)

    def get_fields(self, *args, **kwargs):
        fields = super(BusinessPhotoSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)

        fields['photo_url'].required = method in ['POST']

        return fields

    def validate(self, data):
        if 'photo_url' in data:
            path = data['photo_url'].replace(DEFAULT_CDN+"/", "")
            # reduce to key
            if not aws_s3_does_object_exist(settings.DEFAULT_CDN_BUCKET_NAME, path):
                raise serializers.ValidationError(f'file at {path} was not uploaded')
        return data


    # def process_photo(self, validated_data):
    #     old_key = validated_data['photo_url'].replace(DEFAULT_CDN + "/", "")
    #     new_key = old_key.replace("photos/uploads", "photos/originals")
    #
    #     success = aws_s3_move_file_to_another_key(old_key, new_key)
    #     if success:
    #         aws_s3_change_file_acl(settings.DEFAULT_CDN_BUCKET_NAME, new_key, True)
    #         image = Image.objects.create(
    #             purpose=ImagePurposeTypes.photo,
    #             legacy_url=f"{DEFAULT_CDN}/{new_key}",
    #             img_alt=validated_data.get('description', 'business image')
    #         )
    #         job_migrate_image_to_s3.delay(image.id)
    #
    #         return image, new_key

    def create(self, validated_data):
        image = process_thumbnail_url(validated_data['photo_url'])

        image = Image.objects.create(
                        purpose=ImagePurposeTypes.photo,
                        legacy_url=f"{image}",
                        img_alt=validated_data.get('description', 'business image')
                    )
        job_migrate_image_to_s3.delay(image.id)

        photo = Photo.objects.create(
            uploader=self.request.user,
            owner_business=self.element,
            image=image,
        )

        BusinessPhoto.objects.create(
            business=self.element,
            photo=photo,
            title=validated_data.get('title'),
            description=validated_data.get('description'),
            cta_url=validated_data.get('cta_url'),
        )

        return {
            'business_id': self.element.id,
            'photo': f'{image}',
        }


    def update(self, instance, validated_data):

        instance = BusinessPhoto.objects.filter(photo=instance).first()
        if instance:
            change = False
            if 'photo_url' in validated_data:
                image = process_thumbnail_url(validated_data['photo_url'])
                instance.photo.image.delete()
                instance.photo.image = image
                instance.photo.save()
                change = True

            if 'title' in validated_data:
                instance.title = validated_data['title']
                change = True

            if 'description' in validated_data:
                instance.description = validated_data['description']
                change = True

            if 'cta_url' in validated_data:
                instance.cta_url = validated_data['cta_url']
                change = True

            if change:
                instance.save()

            return {"id": instance.photo.id}

    def to_representation(self, obj):
        return {
            'id': obj.photo.id,
            'state': str(obj.photo.state),
            'title': obj.title,
            'description': obj.description,
            'order': obj.order,
            'scope': obj.scope,
            'url': legacy_url_image(obj.photo.image.get_serve_url()),
            'width': obj.photo.image.width,
            'height': obj.photo.image.height,
            'credit': obj.photo.credit
        }
