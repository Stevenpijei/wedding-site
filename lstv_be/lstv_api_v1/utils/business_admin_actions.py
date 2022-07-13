from django.core.exceptions import ValidationError

from lstv_api_v1.models import *
from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3
from lstv_api_v1.utils.aws_utils import aws_s3_change_file_acl
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.utils.utils import get_location_data_from_url_path_as_object, get_jwplayer_video_state
from lstv_be import settings

CEND = '\33[0m'
CBOLD = '\33[1m'
CITALIC = '\33[3m'
CURL = '\33[4m'
CBLINK = '\33[5m'
CBLINK2 = '\33[6m'
CSELECTED = '\33[7m'
CBLACK = '\33[30m'
CRED = '\33[31m'
CGREEN = '\33[32m'
CYELLOW = '\33[33m'
CBLUE = '\33[34m'
CVIOLET = '\33[35m'
CBEIGE = '\33[36m'
CWHITE = '\33[37m'
CBLACKBG = '\33[40m'
CREDBG = '\33[41m'
CGREENBG = '\33[42m'
CYELLOWBG = '\33[43m'
CBLUEBG = '\33[44m'
CVIOLETBG = '\33[45m'
CBEIGEBG = '\33[46m'
CWHITEBG = '\33[47m'
CGREY = '\33[90m'
CRED2 = '\33[91m'
CGREEN2 = '\33[92m'
CYELLOW2 = '\33[93m'
CBLUE2 = '\33[94m'
CVIOLET2 = '\33[95m'
CBEIGE2 = '\33[96m'
CWHITE2 = '\33[97m'
CGREYBG = '\33[100m'
CREDBG2 = '\33[101m'
CGREENBG2 = '\33[102m'
CYELLOWBG2 = '\33[103m'
CBLUEBG2 = '\33[104m'
CVIOLETBG2 = '\33[105m'
CBEIGEBG2 = '\33[106m'
CWHITEBG2 = '\33[107m'


def xprint(output, str):
    if output:
        print(str)


def create_upload_image(url, purpose=ImagePurposeTypes.thumbnail, change_acl=False, sync=False):
    # if this is a fresh upload to S3, we need to make it public
    if change_acl:
        key = url.split('.com/')[1]
        aws_s3_change_file_acl(settings.DEFAULT_CDN_BUCKET_NAME, key, True)

    new_image = Image(legacy_url=url, purpose=purpose)
    new_image.save()
    if sync:
        job_migrate_image_to_s3(new_image.id)
    else:
        job_migrate_image_to_s3.delay(new_image.id)
    return new_image


def get_business(business_id, output):
    try:
        return Business.objects.get(Q(slug=business_id))
    except (ValidationError, Business.DoesNotExist):
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {business_id} is not a valid business ID or slug")
        exit(1)


def get_video(video_slug, output):
    try:
        return Video.objects.get(post__slug=video_slug)
    except (ValidationError, Video.DoesNotExist):
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {video_slug} is not a valid video slug")
        exit(1)


def get_tag(tag_slug, output):
    try:
        return TagType.objects.get(slug=tag_slug)
    except (ValidationError, TagType.DoesNotExist):
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {tag_slug} is not a valid tag slug")
        exit(1)


def get_user(email, output):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {email} is not in the system")
        exit(1)


def get_video_info(video_slug, output=False):
    video = get_video(video_slug, output)
    xprint(output, f"slug            :   {video.post.slug}")
    xprint(output, f"url             :   https://lovestoriestv.com/{video.post.slug}")
    xprint(output, f"title           :   {video.title}")
    for vs in video.videos.all():
        xprint(output, f"media_id        :   {vs.media_id}")
        xprint(output, f"download url    :   {vs.source_url}")
    for item in video.businesses.all():
        inquiry_email = item.business.get_inquiry_email() or "no email"
        xprint(output, f"Vendor          :   {item.business.name} ({inquiry_email}) - {item.business_role_type.name})")

    for item in VideoBusiness.objects_all_states.filter(videos=video, state=ContentModelState.suspended_dmz).all():
        xprint(output, f"suggeted Vendor :   {item.business.name} ({item.business.suggested_email or 'n/a'})")

    for item in video.vibes.all():
        xprint(output, f"Style/Tag       :   {item.name}")

    for item in video.photos.all():
        xprint(output, f"photo          :   {item.image.serve_url or item.image.legacy_url}")
        xprint(output, f"               :   ID: {item.id}")

    # vendor_sheet = '=SPLIT("'
    # for item in video.businesses.all():
    #     inquiry_email = item.business.get_inquiry_email() or "n/a"
    #     v = f"{item.business.name}~{item.business_role_type.name}~{inquiry_email}~https://lovestoriestv.com/business/{item.business.slug}~"
    #     vendor_sheet += v
    # vendor_sheet += '","~")'
    # print(vendor_sheet)


def change_video_thumbnail(video_slug, thumbnail_url, armed, output=False):
    video = get_video(video_slug, output)
    if armed:
        image = create_upload_image(thumbnail_url)
        vs = video.videos.first()
        if vs:
            vs.thumbnail = image
            vs.save()
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {thumbnail_url} is now the thumbnail for {video_slug}")


def add_vendor_to_video(video_slug, vendor_slug, role_or_capacity, arm, output=True):
    video = get_video(video_slug, output)
    business = get_business(vendor_slug, output)
    role_type = BusinessRoleType.objects.filter(slug=role_or_capacity).first()
    role_capacity_type = VideoBusinessCapacityType.objects.filter(slug=role_or_capacity).first()

    if not role_type and not role_capacity_type:
        xprint(output,
               f"{CREDBG}{CBLACK}ERROR:{CEND} {role_or_capacity} is not a valid  business role or role capacity type")
        exit(1)

    existing = video.businesses.filter(business__slug=vendor_slug).first()
    if existing:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} {vendor_slug} already exists for {video_slug}")
        exit(1)

    if role_type:
        if business.roles.filter(slug=role_type.slug).count() == 0:
            print(f"{CREDBG}{CBLACK}ERROR:{CEND} {role_type.slug} is not one of the defined roles of {business.slug}")
            exit(1)

    if arm:
        vb = VideoBusiness(business=business, business_role_type=role_type or role_capacity_type.business_role_type,
                           business_capacity_type=role_capacity_type)
        vb.save()
        video.businesses.add(vb)
        xprint(output,
               f"\n{CREDBG} COMPLETE {CEND}: {vendor_slug} added as {role_type.slug if role_type else role_capacity_type.slug} in "
               f"{video_slug}")


def add_photo_to_video(video_slug, photo_url, business_slug, arm, output=True):
    video = get_video(video_slug, output)
    business = None
    photographers = video.businesses.filter(business_role_type=BusinessRoleType.objects.get(slug='photographer'))
    if photographers.count() == 0:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} {video_slug} does not have any photographers in its wedding team. Add "
              f"one first before adding photographs to this video.")
        exit(1)

    if photographers.count() == 1:
        business = photographers.first().business

    if photographers.count() > 1:
        if not business_slug:
            print(f"{CREDBG}{CBLACK}ERROR:{CEND} {video_slug} has nore than one photographer. You must specify which"
                  f"one is to be credited with this photo.")
            exit(1)

        business = get_business(business_slug)
        if video.businesses.filter(business=business).count() == 0:
            print(f"{CREDBG}{CBLACK}ERROR:{CEND} {business_slug} does not exist as a photographer in {video_slug}.")
            exit(1)

    if arm:
        image = create_upload_image(photo_url, ImagePurposeTypes.photo)
        photo = Photo(image=image, owner_business=business,
                      uploader=BusinessTeamMember.objects.filter(business=business).first().user)
        photo.save()
        esv = VideoPhoto(video=video, order=0, photo=photo)
        esv.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {photo_url} added to {video_slug} and added to business page of"
                       f"{business.name}")


def add_tag_to_video(video_slug, tag_slug, arm, output=True):
    video = get_video(video_slug, output)
    tag_type = get_tag(tag_slug, output)
    
    existing = video.vibes.filter(slug=tag_slug).first()
    if existing:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} {tag_slug} already exists for {video_slug}")
        exit(1)

    if arm:
        video.vibes.add(tag_type)
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {tag_slug} added to {video_slug}")


def remove_tag_from_video(video_slug, tag_slug, arm, output=True):
    video = get_video(video_slug, output)
    tag_type = get_tag(tag_slug, output)

    if video.vibes.filter(slug=tag_slug).count() == 0:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} {tag_slug} is not styles/tag for {video_slug}")
        exit(1)

    if arm:
        video.vibes.remove(tag_type)
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {tag_slug} removed from {video_slug}")


def remove_photo_from_video(video_slug, photo_id, arm, output=True):
    video = get_video(video_slug, output)
    photo = VideoPhoto.objects.filter(photo__id=photo_id).first()
    if not photo:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} no photo with id {photo_id} exists for {video_slug}.")
        exit(1)

    if arm:
        photo.photo.delete_deep()
        photo.delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {photo_id} removed from {video_slug}")


def remove_vendor_from_video(video_slug, vendor_slug, arm, output=True):
    video = get_video(video_slug, output)
    business = get_business(vendor_slug, output)

    if video.businesses.filter(business=business).count() == 0:
        print(f"{CREDBG}{CBLACK}ERROR:{CEND} {vendor_slug} is not part of the wedding team in {video_slug}")
        exit(1)

    if arm:
        for vb in video.businesses.filter(business=business):
            vb.delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {vendor_slug} removed from {video_slug}")


def change_business_inquiry_email(b1, email, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        main_biz.inquiry_email = email
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {email} is now the inquiry email for  {main_biz.name}")


def set_website_for_business_page(b1, website, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        main_biz.website = website
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {website} will now shown on the business page for {main_biz.name}")


def add_role_to_business(b1, role, arm, output=True):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        if main_biz.roles.filter(slug=role).first():
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} role {role} already exists {main_biz.name}")
            exit(1)

        if not BusinessRoleType.objects.filter(slug=role).first():
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {role} is not a valid role")
            exit(1)
        if arm:
            main_biz.roles.add(BusinessRoleType.objects.filter(slug=role).first())
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied: role: {role} added to {main_biz.name}")


def remove_role_from_business(b1, role, arm, output=True):
    main_biz = get_business(b1, output) if type(b1) is str else b1

    if arm:
        if main_biz.roles.count() < 2:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {role} you cannot remove the last role remaining "
                           f"for {main_biz.name}")
            exit(1)
        br = main_biz.roles.filter(slug=role).first()
        if br:
            main_biz.roles.remove(br)
        else:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {role} doesn't exist in {main_biz.name}")
            exit(1)

        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied: {role} removed from {main_biz.name}")


def add_shopping_item_to_business(business_slug, title, desc, price, image_url, cta_url, arm, output=True):
    desc = (desc[:397] + '...') if len(desc) > 400 else desc

    main_biz = get_business(business_slug, output) if type(business_slug) is str else business_slug
    xprint(output, f"name          :   {main_biz.name}")
    xprint(output, f"title         :   {title}")
    xprint(output, f"description   :   {desc}")
    xprint(output, f"price         :   {price}")
    xprint(output, f"image_url     :   {image_url}")
    xprint(output, f"cta_url       :   {cta_url}")
    if arm:
        image = create_upload_image(image_url)
        new_item = ShoppingItem(
            name=title,
            description=desc,
            sold_by="",
            shop_url=cta_url,
            thumbnail_image=image,
            price=price
        )
        new_item.save()
        main_biz.shopping_items.add(new_item)
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: added {title} to shopping items of {main_biz.name}")


def remove_shopping_item_from_business(business_slug, id, arm, output=False):
    main_biz = get_business(business_slug, output) if type(business_slug) is str else business_slug
    if arm:
        item = main_biz.shopping_items.filter(id=id).first()
        if not item:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} shopping item id {id} doesn't exist for {main_biz.name}")
            exit(1)

        main_biz.shopping_items.remove(item)
        item.delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: removed {item.name} from shopping items of {main_biz.name}")


def purge_shopping_items_from_business(business_slug, arm, output=False):
    main_biz = get_business(business_slug, output) if type(business_slug) is str else business_slug
    if arm:
        for item in main_biz.shopping_items.all():
            item.delete()
            main_biz.shopping_items.remove(item)
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: no more shopping items for {main_biz.name}")


def get_business_info(b1, output=False):
    from lstv_be.settings import WEB_SERVER_URL
    main_biz = get_business(b1, output) if type(b1) is str else b1

    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)

    u, c = main_biz.get_contact_for_inquiry()

    xprint(output, f"name           :   {main_biz.name}")
    xprint(output, f"subscription   :   {main_biz.subscription_level.slug}")
    xprint(output, f"website        :   {main_biz.website}")
    xprint(output, f"business_page  :   {WEB_SERVER_URL}/business/{main_biz.slug}")
    xprint(output, f"inquiry email  :   {c}")
    xprint(output, f"roles          :   {main_biz.get_roles_as_text()}")
    xprint(output, f"alt cta label  :   {main_biz.alt_contact_cta_label}")
    xprint(output, f"alt_cta_link   :   {main_biz.alt_contact_cta_link}")
    xprint(output,
           f"card_thumbnail :   {main_biz.card_thumbnail_id}{' - ' + main_biz.card_thumbnail.get_serve_url() if main_biz.card_thumbnail else ''}")
    xprint(output,
           f"logo image     :   {main_biz.profile_image_id}{' - ' + main_biz.profile_image.get_serve_url() if main_biz.profile_image else ''}")

    for item in main_biz.shopping_items.all():
        xprint(output, f"shopping item  :   {item.id} - {item.name}")

    for item in main_biz.business_locations.all():
        xprint(output, f"location       :   {item.id} - {item}")

    for item in main_biz.social_links.all():
        xprint(output, f"social link    :   {item.id} - {item.social_network.name} - {item.get_link()}")

    for item in main_biz.business_phones.all():
        xprint(output, f"Phone          :   {item.id} - {item.country.iso3} - {item.number}")

    for item in main_biz.business_photos.all():
        xprint(output, f"Business Photo :   {item.id} - {item.image.get_serve_url()}")

    for item in PromoVideo.objects.filter(business=main_biz):
        xprint(output, f"Promo Video    :   {item.title} - {item.video_source.media_id}")

    for item in main_biz.public_team.all():
        xprint(output, f"Team           :   {item.id} - {item.name}")


def convert_consumer_to_business(email, b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)

    if arm:
        try:
            u = User.objects.get(email=email)
            u.user_type = UserTypeEnum.business_team_member
            u.save()
            BusinessTeamMember.objects.filter(user=u).delete()
            tm = BusinessTeamMember(user=u, business=main_biz)
            tm.save()
            tm.roles.add(BusinessTeamMemberRoleType.objects.filter(slug='admin').first())
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied: {email} is now admin of {main_biz.name}")
        except User.DoesNotExist:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {email} not found in users database")
            exit(1)


def create_attach_consumer_to_business(email, business_name, business_role, arm, output=False):
    try:
        b = Business.objects.get(Q(slug=slugify_2(business_name)))
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {business_name} already exists. To attach the user there, use "
                       f"isaac user {email} attach_to_business {slugify_2(business_name)}")
        exit(1)
    except Business.DoesNotExist:
        user = get_user(email, output)
        role_type = BusinessRoleType.objects.filter(slug=business_role).first()
        if not role_type:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {business_role} is an invalid role")
            exit(1)
        if arm:
            # create the business
            new_business = Business(name=business_name,
                                    slug=slugify_2(business_name))
            new_business.subscription_level = BusinessSubscriptionLevel.objects.get(slug='free')
            new_business.save()

            # attach role to business
            new_business.roles.add(role_type)
            # convert and attach the user
            user.user_type = UserTypeEnum.business_team_member
            user.save()
            tm = BusinessTeamMember(user=user, business=new_business)
            tm.save()
            tm.roles.add(BusinessTeamMemberRoleType.objects.filter(slug='admin').first())
            xprint(output,
                   f"\n{CREDBG} COMPLETE {CEND}: {business_name} created, and {user.get_full_name_or_email()} added "
                   f"to it as admin")


def set_business_subscription_level(b1, tier, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)

    if arm:
        try:
            main_biz.subscription_level = BusinessSubscriptionLevel.objects.get(slug=tier)
            main_biz.save()
            main_biz.set_premium_membership(main_biz.subscription_level.numerical_value > 0)
            xprint(output,
                   f"\n{CREDBG} COMPLETE {CEND}: Changes applied: {main_biz.name} is now {tier} subscription level")
        except BusinessSubscriptionLevel.DoesNotExist:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} {tier} is not a valid subscription level")
            exit(1)


def add_business_social_link(b1, snt, sna, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)

    if arm:
        snt_object = None
        try:
            snt_object = SocialNetworkTypes.objects.get(slug=snt)
        except SocialNetworkTypes.DoesNotExist:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {snt} is not a valid social network type slug")
            exit(1)

        if main_biz.social_links.filter(social_network__slug=snt).count() > 0:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {snt} social link already exists for {main_biz.name}")
            exit(1)

        new_sl = SocialLink(social_network=snt_object, profile_account=sna)
        new_sl.save()
        main_biz.social_links.add(new_sl)

        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def purge_business_social_links(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)

    if arm:
        for snr in main_biz.social_links.all():
            main_biz.social_links.remove(snr)
            snr.delete()

        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def remove_business_social_link(b1, snt, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1

    if arm:
        snt_object = None
        try:
            snt_object = SocialNetworkTypes.objects.get(slug=snt)
        except SocialNetworkTypes.DoesNotExist:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {snt} is not a valid social network type slug")
            exit(1)

        if main_biz.social_links.filter(social_network__slug=snt).count() == 0:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {snt} social link for {snt} does not exists "
                           f"for {main_biz.name}")
            exit(1)

        for snr in main_biz.social_links.filter(social_network=snt_object):
            main_biz.social_links.remove(snr)
            snr.delete()

        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def clear_business_social_links(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        for sl in main_biz.social_links.all():
            main_biz.social_links.remove(sl)
            sl.delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def set_find_store_url(b1, url, label, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        main_biz.alt_contact_cta_link = url
        main_biz.alt_contact_cta_label = label
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def remove_find_store_url(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)
    if arm:
        main_biz.alt_contact_cta_link = None
        main_biz.alt_contact_cta_label = None
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def set_business_description(b1, bd, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not main_biz:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        exit(1)
    if arm:
        main_biz.description = bd
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def add_business_photo(b1, url, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        new_image = create_upload_image(url, ImagePurposeTypes.photo)
        ph = Photo(image=new_image, credit=main_biz.name,
                   uploader=User.objects.filter(user_type=UserTypeEnum.bot).first())
        ph.save()
        bp = BusinessPhoto(business=main_biz, photo=ph)
        bp.save()

        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def purge_business_photos(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        for bp in BusinessPhoto.objects.filter(business=main_biz):
            bp.delete_deep()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: all business photos removed for {main_biz.name}.")


def remove_business_photo(b1, id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if not BusinessPhoto.objects.filter(business=main_biz, photo_id=id).first():
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {id} is an invalid photo id for {main_biz.name}")
        exit(1)
    if arm:
        for bp in BusinessPhoto.objects.filter(business=main_biz, photo_id=id):
            bp.delete_deep()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: all business photos removed for {main_biz.name}.")


def set_business_card_thumbnail_url(b1, iurl, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        new_image = create_upload_image(iurl)
        main_biz.card_thumbnail = new_image
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def set_business_card_thumbnail_url_from_video(b1, video_slug, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        v = Video.objects.filter(post__slug=video_slug).first()
        if v:
            vs = v.videos.filter(thumbnail__isnull=False).first()
            if vs:
                main_biz.card_thumbnail = vs.thumbnail
                main_biz.save()
                xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")
        else:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {video_slug} is not valid video slug.")


def purge_business_card_thumbnail_url(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        if main_biz.card_thumbnail:
            main_biz.card_thumbnail.delete()
        main_biz.card_thumbnail = None
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def set_business_logo_image(b1, url, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        new_image = create_upload_image(url, ImagePurposeTypes.logo)
        main_biz.profile_image = new_image
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def purge_business_logo_image(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        if main_biz.profile_image:
            main_biz.profile_image.delete()
        main_biz.profile_image = None
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: logo image purged from {main_biz.name}.")


def add_business_address(b1, location_path, zipcode, address1, address2, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        loc = get_location_data_from_url_path_as_object(location_path)
        if loc:
            if zipcode:
                loc.zipcode = zipcode
            if address1:
                loc.address1 = address1
            if address2:
                loc.address2 = address2
            loc.save()
            bl = BusinessLocation(business=main_biz, location=loc)
            bl.save()
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: address {loc} added to {main_biz.name}.")
        else:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {location_path} is not valid. check it and re-try.")


def remove_business_addresse(b1, id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        ba = main_biz.business_locations.filter(id=id).first()
        if ba:
            main_biz.business_locations.remove(ba)
            ba.delete()
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: address {id} removed from {main_biz.name}.")


def set_business_video_order(b1, order, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    vids = order.split(",")
    #  verify slug and wedding team membership
    for vid_slug in vids:
        v = Video.objects.filter(post__slug=vid_slug.strip()).first()
        if not v:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {vid_slug} is not a valid video slug")
            exit(1)
        if main_biz.id not in v.businesses.all().values_list('business', flat=True):
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {vid_slug} is not a video {main_biz.name} worked on")

    if arm:
        # remove old order
        ResourceOrder.objects.filter(element_owner=main_biz.id).delete()
        # get get it done
        idx = 0
        for vid_slug in vids:
            v = Video.objects.filter(post__slug=vid_slug.strip()).first()
            order_obj = ResourceOrder(element_owner=main_biz.id,
                                      video_id=v.id,
                                      element_type=ResourceOrderingType.video,
                                      element_order=idx)
            order_obj.save()
            idx += 1
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: address {idx} videos prioritized/orderd for {main_biz.name}.")


def hard_delete_business(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        main_biz.dangerously_purge_from_system()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {main_biz.name} purged from existence.")


def delete_business(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1


def add_business_promo_video(b1, title, media_id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1

    # data from jwp

    state = get_jwplayer_video_state(media_id)
    duration = state.get('duration', None)
    size = state.get('size', None)
    height = state.get('height', None)
    width = state.get('width', None)
    exists = state.get('exists', True)

    if not exists:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {media_id} is not a valid video media_id")
        exit(1)

    if arm:
        # image thumbnail

        new_image = create_upload_image(f"https://content.jwplatform.com/thumbs/{media_id}-1920.jpg",
                                        ImagePurposeTypes.photo)
        # create video source
        v = VideoSource(
            uploader=User.objects.filter(user_type=UserTypeEnum.bot).first(),
            owner_business=main_biz,
            status=VideoStatusEnum.ready,
            media_id=media_id,
            type=VideoTypeEnum.jwplayer,
            purpose=VideoPurposeEnum.business_promo_video,
            source_url=f"https://content.jwplatform.com/videos/{media_id}-VlAguMsS.mp4",
            width=1920,
            height=1080,
            duration=0,
            size=0,
            thumbnail=new_image)
        v.save()
        job_migrate_image_to_s3

        pvo = PromoVideo(business=main_biz, video_source=v, title=title)
        pvo.save()
        main_biz.promo_videos.add(v)

        # update jwp data for promo video

        # create promo video

        #
        xprint(output,
               f"\n{CREDBG} COMPLETE {CEND}: promo video {title} ({media_id} added to business page of {main_biz.name}.")


def remove_business_promo_video(b1, media_id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        for pv in PromoVideo.objects.filter(business=main_biz):
            if not media_id or pv.video_source.media_id == media_id:
                pv.video_source.delete_deep()
                pv.delete()
        if not media_id:
            xprint(output,
                   f"\n{CREDBG} COMPLETE {CEND}: business page of {main_biz.name} is clear of all promo videos.")
        else:
            xprint(output,
                   f"\n{CREDBG} COMPLETE {CEND}: business page of {main_biz.name} is clear of promo video {media_id}")


def add_business_team_member(b1, name, title, description, image_url, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        new_image = create_upload_image(image_url, ImagePurposeTypes.logo)
        ptm = PublicTeamPerson(name=name, title=title, description=description, headshot_image=new_image)
        ptm.save()
        main_biz.public_team.add(ptm)
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: added {name} ({title}) as team member for {main_biz.name}")


def remove_business_team_member(b1, id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1

    ptm = PublicTeamPerson.objects.filter(id=id).first()
    if id and not ptm:
        xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {id} is not a valid team member id for {main_biz.name}")
        exit(1)
    if arm:
        if ptm:
            main_biz.public_team.remove(ptm)
        if not id and not ptm:
            for ptm in main_biz.public_team.all():
                main_biz.public_team.remove(ptm)
                ptm.delete()
        ptm.delete()
        if id:
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: removed  {ptm.name} ({ptm.title}) from {main_biz.name} team")
        else:
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {main_biz.name} is now clear of public team members")


def purge_business_addresses(b1, id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        for ba in BusinessLocation.objects.filter(business=main_biz).all():
            ba.delete()
        BusinessLocation.objects.filter(business=main_biz).delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: all addresses  removed from {main_biz.name}.")


def add_business_phone(b1, country, phone, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        geo_country = Country.objects.filter(Q(iso3__iexact=country) | (Q(slug=country))).first()
        if geo_country:
            print(geo_country)
            ph = Phone(number=phone, country=geo_country)
            ph.save()
            main_biz.business_phones.add(ph)
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: {ph} ({geo_country.iso3} added to {main_biz.name}.")
        else:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {country} is not a valid country iso3 code or slug")


def remove_business_phone(b1, id, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        be = main_biz.business_phones.filter(id=id).first()
        if be:
            main_biz.business_phones.remove(be)
            be.delete()
            xprint(output, f"\n{CREDBG} COMPLETE {CEND}: delete phone {id} from  {main_biz.name}.")
        else:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {id} is not a valid phone id for {main_biz.name}.")


def purge_business_phones(b1, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        for bp in main_biz.business_phones.all():
            bp.delete()
            main_biz.business_phones.remove(bp)
        BusinessLocation.objects.filter(business=main_biz).delete()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: all phone numbers  removed from {main_biz.name}.")


def do_business_merge(b1, b2, arm, output=False):
    _output = output
    main_biz = get_business(b1, output) if type(b1) is str else b1
    secondary_biz = get_business(b2, output) if type(b2) is str else b2

    if not main_biz or not secondary_biz:
        if not main_biz:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b1} is not a valid business ID or slug")
        if not secondary_biz:
            xprint(output, f"{CREDBG}{CBLACK}ERROR:{CEND} {b2} is not a valid business ID or slug")
        exit(1)

    # get into: main business
    roles_to_transfer_count = 0
    xprint(output, f"BUSINESS MERGER: {CGREENBG} {main_biz.name} {CEND} <- "
                   f"{CREDBG} {secondary_biz.name} {CEND}. The Process:\n")

    main_roles = main_biz.roles.all().values_list('slug', flat=True)
    for role in secondary_biz.roles.all():
        if role.slug not in main_roles:
            roles_to_transfer_count += 1
    xprint(output,
           f" 1. {CGREEN}{main_biz.name}{CEND} <- {roles_to_transfer_count} role(s) combined from  {CRED}{secondary_biz.name}{CEND}")
    if arm:
        # role merger -- make sure we bring ANY new role from the secondary onto the main business
        for role in secondary_biz.roles.all():
            if role.slug not in main_roles:
                xprint(output, f"    --- {role.name} Role: {secondary_biz.name}  ->  {main_biz.name}")
                main_biz.roles.add(BusinessRoleType.objects.get(slug=role.slug))
    xprint(output,
           f" 2. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.get_videos().count()} video wedding team tags for  {CRED}{secondary_biz.name}{CEND}")

    if arm:
        # transfer video wedding team tagging
        for video in secondary_biz.get_videos().all():
            xprint(output, f"    --- {video.title}")
            old_vb = video.businesses.filter(business__slug=secondary_biz.slug).first()
            video.businesses.remove(video.businesses.filter(business__slug=secondary_biz.slug).first())
            vb = VideoBusiness(business=main_biz, business_role_type=old_vb.business_role_type,
                               business_capacity_type=old_vb.business_capacity_type)
            vb.save()
            video.businesses.add(vb)
            old_vb.state_desc = [f"merged into {main_biz.name}"]
            old_vb.save()
            old_vb.delete()

    xprint(output,
           f" 3. {CGREEN}{main_biz.name}{CEND} <- {BusinessTeamMember.objects.filter(business=secondary_biz).count()} team members from {CRED}{secondary_biz.name}{CEND}")
    for tm in BusinessTeamMember.objects.filter(business=secondary_biz).all():
        xprint(output, f"    --- {tm.user.get_full_name_or_email()} - {tm.user.email}")
    xprint(output,
           f" 4. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.business_photos.count()} business page photos from {CRED}{secondary_biz.name}{CEND}")
    xprint(output,
           f" 5. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.get_wedding_photos().count()} wedding photos from {CRED}{secondary_biz.name}{CEND}")
    xprint(output,
           f" 6. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.subscribers.count()} subscribers from {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f" 8. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.faq.count()} FAQ items from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f" 9. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.reviews.count()} reviews from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"10. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.public_team.count()} public team members from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"11. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.sold_at_businesses.count()} sold_at records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"12. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.associate_brands.count()} associate brand "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"13. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.organized_events.count()} organized event "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"14. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.business_photos.count()} business phone "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"15. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.promo_videos.count()} promo video "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"16. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.business_locations.count()} business location "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"17. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.worked_at_cache.count()} worked-at location "
           f"records from  {CRED}{secondary_biz.name}{CEND}")
    if arm:
        for worked_at in secondary_biz.worked_at_cache.all():
            xprint(output, f"    --- {worked_at}")
            secondary_biz.worked_at_cache.remove(worked_at)
            main_biz.worked_at_cache.add(worked_at)

    xprint(output,
           f"18. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.shopping_items.count()} shopping item "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"19. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.social_links.count()} social link "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"20. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.tags.count()} business tag "
           f"records from  {CRED}{secondary_biz.name}{CEND}")

    xprint(output,
           f"21. {CGREEN}{main_biz.name}{CEND} <- {secondary_biz.properties.count()} business properties "
           f"records from  {CRED}{secondary_biz.name}{CEND}")
    if arm:
        for prop in secondary_biz.properties.all():
            secondary_biz.properties.remove(prop)
            if prop.key not in main_biz.properties.values_list('key', flat=True):
                xprint(output, f"    --- {prop.key} added")
                main_biz.properties.add(prop)
            else:
                target_prop = main_biz.properties.filter(key=prop.key).first()
                # if the merged from prop is newer than the merged in prop, merge.
                if prop.updated_at > target_prop.updated_at:
                    target_prop.value_text = prop.value_text
                    target_prop.value_date = prop.value_date
                    target_prop.value_json = prop.value_json
                    target_prop.value_float = prop.value_float
                    target_prop.value_integer = prop.value_integer
                    target_prop.save()
                    xprint(output, f"    --- {prop.key} updated with new values")

    xprint(output,
           f"22. {CRED}{secondary_biz.name}{CEND} will be removed once merged into {CGREEN}{main_biz.name}{CEND}")

    if arm:
        secondary_biz.dangerously_purge_from_system()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: Changes applied.")


def set_business_hide_email(b1,hide_flag, arm, output=False):
    main_biz = get_business(b1, output) if type(b1) is str else b1
    if arm:
        main_biz.hide_email = hide_flag
        main_biz.save()
        xprint(output, f"\n{CREDBG} COMPLETE {CEND}: hide_email flag set to {main_biz.hide_email} for {main_biz.name}.") 
