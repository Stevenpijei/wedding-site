import hashlib
import re

from django.utils.text import slugify

from lstv_api_v1.models import User, Image, ImagePurposeTypes
from lstv_api_v1.utils.aws_utils import upload_file_to_aws_s3, invalidate_public_cdn_path


def validate_uuid(uuid_str):
    try:
        from uuid import UUID
        UUID(str(uuid_str), version=4)
        return True
    except ValueError:
        return False


def generic_validate_password(value, exception):
    """
    Ensure password is secure enough
    Rules:
     - At least 8 characters
     - At least one number
     - At least one Symbol
     - at least one Upper Case letter
    """
    if len(value) >= 4:
        return value
    else:
        if exception:
            raise exception

def create_user_from_oauth(source, first_name, last_name, email,
                           password, user_type, former_unique_guest_uuid, oauth_image, properties):
    # does the user exist?

    new_user = User.objects.filter(email=email).first()

    if not new_user:
        new_user = User(source_desc=source,
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        password=password,
                        user_type=user_type,
                        former_unique_guest_uuid=former_unique_guest_uuid)
        if oauth_image:
            # user image

            image_name = slugify(f"{first_name}{last_name}{hashlib.sha1(bytes(email, encoding='utf-8')).hexdigest()}")
            thumbnail_url = upload_file_to_aws_s3(oauth_image, 'images/profileAvatars', f"{image_name}.jpg", "public-read",
                                                  True)

            # commit new image

            new_image = Image(serve_url=thumbnail_url,
                              purpose=ImagePurposeTypes.profile_avatar)
            new_image.save()

            new_user.profile_image = new_image
        new_user.save()

        if oauth_image:
            new_user.set_property('orig_oauth_profile_image', oauth_image)

        new_user.is_new = True

        for prop in properties:
            prop.save()
            new_user.properties.add(prop)
    else:
        if oauth_image:
            # do we need to update fields?
            current_oauth_image = new_user.get_property('orig_oauth_profile_image')
            if current_oauth_image != oauth_image:
                image_name = slugify(f"{first_name}{last_name}{hashlib.sha1(bytes(email, encoding='utf-8')).hexdigest()}")
                thumbnail_url = upload_file_to_aws_s3(oauth_image, 'images/profileAvatars', f"{image_name}.jpg",
                                                      "public-read", True)
                # refresh CDN
                invalidate_public_cdn_path(thumbnail_url)

                if not new_user.profile_image:
                    new_image = Image(serve_url=thumbnail_url,
                                      purpose=ImagePurposeTypes.profile_avatar)
                    new_image.save()
                    new_user.profile_image = new_image

                new_user.profile_image.serve_url = thumbnail_url
        new_user.save()
        if oauth_image:
            new_user.set_property('orig_oauth_profile_image', oauth_image)

        new_user.is_new = False

    # add facebook properties and create token for authentication
    token = new_user.create_jwt_token()
    # # print("we have a token: " + token)

    # # print(new_user.is_new)
    return new_user, token
