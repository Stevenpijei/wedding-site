import time

from django.core.management.base import BaseCommand
from django.db.models import F, Value, Case
from django.db.models.functions import Concat
from django.forms import CharField

from lstv_api_v1.tasks.tasks import job_migrate_image_to_s3
from lstv_api_v1.utils.jwp_utils import upload_external_file_to_jwp
from lstv_api_v1.utils.legacy_model_utils import *
from lstv_api_v1.utils.aws_utils import get_upload_pre_signed_url, aws_s3_is_object_public, upload_file_to_aws_s3, \
    aws_s3_get_object_url
from lstv_be.settings import DEFAULT_CDN_BUCKET_URL, DEFAULT_CDN_BUCKET_NAME


def charFieldd():
    pass


class Command(BaseCommand):

    def handle(self, *args, **options):


        b = BusinessLocation.objects.filter(business__id='5e99091d-9441-4f53-bca6-574504b97d72').first()
        print(b.location_id)
        print(b.location)

        # bizz = Business.objects.annotate(
        #     loc=F('business_locations__place__name')).order_by('loc')[
        #        0:1000]
        #
        # bizz = Business.objects.annotate(
        #     the_roles=F('roles__name')
        #     ).order_by('the_roles')[0:1000]
        #
        #
        # for b in bizz:
        #     print(f"{b.the_roles} - {b.get_roles_as_text()}")

        # print(aws_s3_get_object_url(DEFAULT_CDN_BUCKET_NAME,
        #                            'videos/originals/27df04eee73931d0-8b96a43d2e36ebaa-#stopmotionshort+-+sarah+++daniel+.mp4'))

        # vn = "/Users/ronenmagid/Desktop/cba21e296d8a14e7-scarlet witch and hawkeye vs ronen vision - fight scene _ captain america civil war (2016) movie clip 4k.mp4"
        # upload_file_to_aws_s3(vn, 'videos/originals', 'cba21e296d8a14e7-scarlet witch and hawkeye vs ronen vision - fight scene _ captain america civil war (2016) movie clip 4k.mp4')
        #
        # #fn = "https://lstv2-public.s3.us-east-2.amazonaws.com/videos/originals/cba21e296d8a14e7-iron+man+vs+scarlet+witch+-+airport+battle+scene+%E2%80%93+captain+america+civil+war+(2016)+imax+movie+clip.mp4"
        # # f = upload_external_file_to_jwp(fn)
        #
        #  attempts = 0
        #  while True:
        #      if aws_s3_is_object_public("lstv2-public",
        #                                 "videos/originals/cba21e296d8a14e7-scarlet witch and hawkeye vs vision - fight scene _ captain america civil war (2016) movie clip 4k.mp4"):
        #          print("Public")
        #          break
        #      else:
        #          attempts += 1
        #          print("private")
        #          if attempts > 5:
        #              print("giving up")
        #              break
        #          time.sleep(5)

        # # res = upload_external_file_to_jwp(f"{DEFAULT_CDN_BUCKET_URL}/videos/originals/4d1b80de06aaabaf-maggie.mp4")
        # # print(type(res))
        # # if res['id']:
        # #     print(f"Media ID: {res['id']}")
        # # exit(0)
        # #
        # # response = get_upload_pre_signed_url(DEFAULT_CDN_BUCKET_NAME, "videos/uploads/maggie.mp4")
        # # print(response)
        # #
        # # exit(0)
        #
        # #  _____   ____   _____ __ __  ____   ___   ____       ___      ___  ___ ___   ___
        # # |     | /    T / ___/|  T  Tl    j /   \ |    \     |   \    /  _]|   T   T /   \
        # # |   __jY  o  |(   \_ |  l  | |  T Y     Y|  _  Y    |    \  /  [_ | _   _ |Y     Y
        # # |  l_  |     | \__  T|  _  | |  | |  O  ||  |  |    |  D  YY    _]|  \_/  ||  O  |
        # # |   _] |  _  | /  \ ||  |  | |  | |     ||  |  |    |     ||   [_ |   |   ||     |
        # # |  T   |  |  | \    ||  |  | j  l l     !|  |  |    |     ||     T|   |   |l     !
        # # l__j   l__j__j  \___jl__j__j|____j \___/ l__j__j    l_____jl_____jl___j___j \___/
        #
        # # lesbian vibe curated content
        #
        # lc = TagType.objects.filter(slug='lesbian').first()
        #
        # p = Properties(key='page_title', value_text='{weight_videos} Lesbian Wedding Videos to Inspire Your Day')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='page_description', value_text='These wedding videos will give you the inspiration for '
        #                                                   'all your white wedding, plus the vendors and brands who can '
        #                                                   'make them happen.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='businesses_title',
        #                value_text='Need vendors for your Lesbian wedding? These pros specialize in this style.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_header_1',
        #                value_text='Why You Should Consider a Lesbian Wedding...')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_text_1',
        #                value_text='Lesbian weddings are all about making your wedding speak to your special and '
        #                           'unique relationship. If you’re a part of the LGBTQIA+ community, wedding planning '
        #                           'may seem even more strenuous because your celebration may not follow the template '
        #                           'of a “traditional” wedding, but this is where you should feel free to play around.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_header_2',
        #                value_text='You don\'t feel constrained to the typical wedding ideas—if you both want to wear '
        #                           'a ballgown, go for it!')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_text_2',
        #                value_text='We love that lesbian weddings can turn traditions on their head. For instance, '
        #                           'have fun with what you call your wedding party, like I Do Crew, Friends of Honor, '
        #                           'Adventure Party, Bridesminions. We\'ve also found that the majority of same-sex '
        #                           'couples choose to write their own wedding vows. And consider encouraging your '
        #                           'speakers to acknowledge that this is a different and special relationship, and to'
        #                           'announce it to the world during their toasts.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_image_url',
        #                value_text=f"{DEFAULT_CDN_BUCKET_URL}/images/temp/LesbianWedding_middle_info_image_url+(1).jpg")
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='middle_info_image_credit',
        #                value_text='Photo by Vincent Van-Gogh')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_header_1',
        #                value_text='What Is a Lesbian Wedding?')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_text_1',
        #                value_text='A lesbian wedding is a wedding between two females and we love that this style '
        #                           'can really be about choosing to make your own traditions. We love when lesbian '
        #                           'couples make the ceremony entrance their own—walk in together or have a circular '
        #                           'setup and each walk in from different sides.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_text_2',
        #                value_text='Consider readings that are personal to you or ones important to your relationship '
        #                           'like Justice Anthony Kennedy’s majority opinion in Hodges v. Obergefell.')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_image_url_1',
        #                value_text=f"{DEFAULT_CDN_BUCKET_URL}/images/temp/LesbianWedding_bottom_info_image_url_1.png")
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_image_url_2',
        #                value_text=f"{DEFAULT_CDN_BUCKET_URL}/images/temp/LesbianWedding_bottom_info_image_url_2.png")
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_image_url_credit_2',
        #                value_text='Photo by Vincent Van-Gogh')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # p = Properties(key='bottom_info_image_url_credit_1',
        #                value_text='Photo by Vincent Van-Gogh')
        # p.save()
        # lc.curated_properties.add(p)
        #
        # # -----------------------------------------------------------------------------------------------------
        #
        # # ms = Business.objects.filter(slug='jaine-kershner-photography').first()
        # # print(ms)
        # #
        # # # premium business team
        # #
        # # for ptm in ms.public_team.all():
        # #     ms.public_team.remove(ptm)
        # #     ptm.delete_deep()
        # #
        # # i1 = Image(legacy_url=f"{DEFAULT_CDN_BUCKET_URL}/images/temp/image-2.jpg",
        # #            purpose=ImagePurposeTypes.profile_avatar)
        # # i1.save()
        # # job_migrate_image_to_s3(i1.id)
        # #
        # # p1 = PublicTeamPerson(name="Jessica Sample", title="Photographer",
        # #                       description="Jessica Sample grew up in Los Angeles "
        # #                                   "and has been traveling far from home "
        # #                                   "and taking pictures ever since "
        # #                                   "childhood. Her parents owned a stock "
        # #                                   "footage company and she accompanied "
        # #                                   "them across the world with her "
        # #                                   "camera to places as far flung as "
        # #                                   "Bhutan, Tibet, Africa, Europe, "
        # #                                   "and Indonesia.", headshot_image=i1)
        # # p1.save()
        # # ms.public_team.add(p1)
        # #
        # # #
        # #
        # # i1 = Image(legacy_url=f"{DEFAULT_CDN_BUCKET_URL}/images/temp/image-3.jpg",
        # #            purpose=ImagePurposeTypes.profile_avatar)
        # # i1.save()
        # # job_migrate_image_to_s3(i1.id)
        # #
        # # p1 = PublicTeamPerson(name="Jeff E. Demo", title="Photographer",
        # #                       description="Jeff is a New York-based photographer specializing in portraits, corporate lifestyle, and events. His work has appeared on the websites and marketing materials of Fortune 500 companies, major universities and non-profit organizations, and in numerous national magazines.",
        # #                       headshot_image=i1)
        # # p1.save()
        # # ms.public_team.add(p1)
        #
        # # ----------------------------------------------------------------------------
        #
        # ms = Business.objects.filter(slug='maggie-sottero-designs').first()
        #
        # # sold at
        #
        # ms.sold_at_businesses.clear()
        # ms.sold_at_businesses.add(Business.objects.get(slug="fantasy-bridal"))
        # ms.sold_at_businesses.add(Business.objects.get(slug="janenes-bridal-boutique"))
        # ms.sold_at_businesses.add(Business.objects.get(slug="kleinfeld-bridal"))
        # ms.sold_at_businesses.add(Business.objects.get(slug="bijou-bridal"))
        # ms.sold_at_businesses.add(Business.objects.get(slug="lilys-bridal-outlet"))
        #
        # # make maggie-sottero-designs premium
        # ms.set_premium_membership(True)
        #
        # # Business Description
        #
        # ms.description = 'Maggie Sottero Designs is committed to your love story, offering fresh, romantic, ' \
        #                  'and perfectly tailored styles at a variety of attainable price points. “Every woman ' \
        #                  'deserves to wear at least one spectacular gown in her lifetime,” as stated by the design ' \
        #                  'team. “We’re inspired by that happiest of wedding celebrations, creating styles that are ' \
        #                  'beautiful and inspiring, yet truly comfortable to wear.” Maggie Sottero Designs features ' \
        #                  'the Maggie Sottero, Sottero and Midgley, and Rebecca Ingram labels, partnering with brick-' \
        #                  'and-mortar boutiques to offer brides around the world a beautiful and personalized ' \
        #                  'shopping experience.'
        #
        # for loc in BusinessLocation.objects.filter(business=ms):
        #     loc.delete_deep()
        # ms.business_locations.clear()
        #
        # ms.save()
        #
        # # Social Links
        #
        # for mssn in ms.social_links.all():
        #     mssn.delete()
        #     ms.social_links.remove(mssn)
        #
        # sl_tiktok = SocialLink(social_network=SocialNetworkTypes.objects.get(slug='tiktok'),
        #                        profile_account='maggiesotterodesigns')
        # sl_tiktok.save()
        #
        # sl_yt = SocialLink(social_network=SocialNetworkTypes.objects.get(slug='youtube'),
        #                    profile_account='UCNQvThSzB0qQnJAae5ILNig')
        # sl_yt.save()
        #
        # sl_pn = SocialLink(social_network=SocialNetworkTypes.objects.get(slug='pinterest'),
        #                    profile_account='maggiesottero')
        # sl_pn.save()
        #
        # sl_fb = SocialLink(social_network=SocialNetworkTypes.objects.get(slug='facebook'),
        #                    profile_account='maggiesotterodesigns')
        # sl_fb.save()
        #
        # sl_ig = SocialLink(social_network=SocialNetworkTypes.objects.get(slug='instagram'),
        #                    profile_account='maggiesotterodesigns')
        # sl_ig.save()
        #
        # ms.social_links.add(sl_tiktok)
        # ms.social_links.add(sl_yt)
        # ms.social_links.add(sl_pn)
        # ms.social_links.add(sl_ig)
        # ms.social_links.add(sl_fb)
        #
        # # Promo videos w video name, location, description, any vendor tags
        # #
        # # for pv in PromoVideo.objects.filter(business=ms):
        # #     pv.video_source.delete_deep()
        # #     pv.delete()
        # ms.promo_videos.clear()
        # #
        # # i = Image(legacy_url="https://content.jwplatform.com/thumbs/8KmDBUid-1920.jpg",
        # #           purpose=ImagePurposeTypes.thumbnail)
        # # i.save()
        # # v = VideoSource(uploader=BusinessTeamMember.objects.filter(business=ms).first().user,
        # #                 owner_business=ms,
        # #                 status=VideoStatusEnum.ready,
        # #                 media_id="8KmDBUid",
        # #                 filename="Bigmarker-recording.mp4",
        # #                 type=VideoTypeEnum.jwplayer,
        # #                 purpose=VideoPurposeEnum.business_promo_video,
        # #                 source_url="https://content.jwplatform.com/videos/8KmDBUid-VlAguMsS.mp4",
        # #                 width=1920,
        # #                 height=1080,
        # #                 duration=4265,
        # #                 size=1073741824,
        # #                 thumbnail=i)
        # # v.save()
        # #
        # # pvo = PromoVideo(business=ms, video_source=v, title="Maggie Sottero Virtual Fashion Show 2020")
        # # pvo.save()
        # # ms.promo_videos.add(v)
        #
        # # associated brands
        #
        # for fb in ms.associate_brands.all():
        #     fb.delete()
        # ms.associate_brands.clear()
        #
        # brands = ["sottero-and-midgley", "rebecca-ingram"]
        # for br in brands:
        #     nb = Brand(business=Business.objects.get(slug=br))
        #     nb.save()
        #     ms.associate_brands.add(nb)
        #
        # # Shopping Modules (Need images, prices, product names, links)
        #
        # # name = models.CharField(db_index=True, max_length=100, null=False)
        # #     sold_by = models.CharField(db_index=True, max_length=100, null=False)
        # #     shop_url = models.CharField(db_index=True, max_length=250, null=False)
        # #     thumbnail_url = models.CharField(db_index=True, max_length=250, null=False)
        # #     price = models.CharField(max_length=20, db_index=True, null=False)
        # #     old_price = models.CharField(max_length=10, db_index=True, null=True)
        # #     discount_label = models.CharField(db_index=True, max_length=35, null=True)
        # #     currency_symbol = models.CharField(db_index=True, max_length=150, null=True)
        #
        # for si in ms.shopping_items.all():
        #     ms.shopping_items.remove(si)
        #     si.delete_deep()
        #
        # shopping = [
        #     {
        #         "name": "Tuscany Lynette",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url": f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Tuscany+Lynette.jpg",
        #         "shop_url": "https://www.maggiesottero.com/maggie-sottero/tuscany-lynette/11514",
        #         "description": "A romantic lace sheath wedding gown for an unforgettable \"Yes!\" moment.",
        #         "old_price": None,
        #         "discount_label": None
        #     },
        #     {
        #         "name": "Autumn",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url":f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Autumn.jpg",
        #         "shop_url": "https://www.maggiesottero.com/maggie-sottero/autumn/11153",
        #         "description": "A fit-and-flare wedding dress for major glam and zero weigh-down factor.",
        #         "old_price": None,
        #         "discount_label": None
        #     },
        #     {
        #         "name": "Charlene",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url":f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Charlene.jpg",
        #         "shop_url": "https://www.maggiesottero.com/maggie-sottero/charlene/11275",
        #         "description": "A relaxed boho A-line wedding dress with a choice amount of shimmer.",
        #         "old_price": None,
        #         "discount_label": None
        #     },
        #     {
        #         "name": "Bernadine",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url":f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Bernadine.jpg",
        #         "shop_url": "https://www.maggiesottero.com/maggie-sottero/bernadine/11158",
        #         "description": "An elegant tulle sheath wedding dress with romantic accessory potential.",
        #         "old_price": None,
        #         "discount_label": None
        #     },
        #     {
        #         "name": "Evangelina",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url":f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Evangelina.jpg",
        #         "shop_url": "https://www.maggiesottero.com/maggie-sottero/evangelina/10471",
        #         "description": "Shimmery details in a glam-meets-elegant backless sheath wedding dress.",
        #         "old_price": None,
        #         "discount_label": None
        #     },
        #     {
        #         "name": "Narissa",
        #         "sold_by": Business.objects.get(slug='maggie-sottero').name,
        #         "thumbnail_url":f"{DEFAULT_CDN_BUCKET_URL}/temp/shop/shop_Narissa+.jpg",
        #         "shop_url": "https://www.maggiesottero.com/sottero-and-midgley/narissa/10570",
        #         "description": "A boho sheath wedding dress for an enchanting and feminine statement.",
        #         "price": "$2,350.00",
        #         "old_price": None,
        #         "discount_label": None
        #     }
        #
        # ]
        #
        # for shop in shopping:
        #     i = Image(legacy_url=shop["thumbnail_url"], purpose=ImagePurposeTypes.thumbnail)
        #     i.save()
        #
        #     job_migrate_image_to_s3(i.id)
        #
        #     si = ShoppingItem(
        #         name=shop["name"],
        #         sold_by=shop["sold_by"],
        #         shop_url=shop["shop_url"],
        #         description=shop["description"],
        #         thumbnail_image=i,
        #         old_price=shop["old_price"],
        #         discount_label=shop["discount_label"]
        #     )
        #     si.save()
        #     ms.shopping_items.add(si)
        #
        # # Dress Gallery Images
        #
        # for bp in BusinessPhoto.objects.filter(business=ms):
        #     if bp.photo:
        #         bp.photo.delete_deep()
        #     bp.delete()
        #
        # photos = [{"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Adele.jpg",
        #            "d": "Modest flutter sleeve wedding dress made for nontraditional glamour", "t": "Adele"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Alyssa+.jpg",
        #            "d": "Minimalist modern crepe wedding gown with a statement back",
        #            "t": "Alyssa"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Antonella.jpg",
        #            "d": "Sophisticated crepe sheath bridal dress with a touch of undone glamour ",
        #            "t": "Antonella"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Bayler.jpg",
        #            "d": "Minimalist strapless sheath bridal dress in a captivating silhouette",
        #            "t": "Bayler"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Charmaine.jpg",
        #            "d": "Off-the-shoulder nature-inspired bridal gown with flirty floral motifs",
        #            "t": "Charmaine"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Esther.jpg",
        #            "d": "Sexy low-back mermaid wedding dress in an ultra-flattering silhouette",
        #            "t": "Esther"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Farrah.jpg",
        #            "d": "Beaded lace sheath bridal dress in decadent illusion and layers",
        #            "t": "Farrah"},
        #           {"l":f"{DEFAULT_CDN_BUCKET_URL}/temp/photos/Fiona.jpg",
        #            "d": "Sparkly lace fit-and-flare bridal dress with off-the-shoulder sleeves", "t": "Fiona"}]
        #
        # for photo in photos:
        #     i = Image(legacy_url=photo["l"], purpose=ImagePurposeTypes.photo)
        #     i.save()
        #
        #     p1 = Photo(image=i, uploader=BusinessTeamMember.objects.filter(business=ms).first().user)
        #     p1.save()
        #
        #     bp = BusinessPhoto(photo=p1, business=ms, title=photo["t"], description=photo["d"])
        #     bp.save()
        #
        #     job_migrate_image_to_s3(i.id)
        #
        # # events
        #
        # for o in ms.organized_events.all():
        #     ms.organized_events.remove(o)
        #     o.delete_deep()
        # ms.organized_events.clear()
        #
        # loc = Location(address1="932 S Los Angeles St",
        #                place=Place.objects.get(slug='los-angeles', state_province__slug='california',
        #                                        country__slug='united-states'))
        # loc.state_province = loc.place.state_province
        # loc.county = loc.place.county
        # loc.country = loc.place.country
        # loc.save()
        #
        # # phone = Phone(number="213-265-7804", country=loc.country)
        # # phone.save()
        # #
        # # o1 = OrganizedEvent(event_start_date="2021-01-29",
        # #                     event_end_date="2021-02-14",
        # #                     name_short="In Store Event",
        # #                     name_long="Bottega Vow",
        # #                     cta_url="https://www.bottegavow.com/",
        # #                     is_virtual=False,
        # #                     location=loc,
        # #                     phone=phone)
        # # o1.save()
        # # ms.organized_events.add(o1)
        # #
        # # # ----
        # #
        # # loc = Location(address1="129 E 13800 S Ste A8",
        # #                place=Place.objects.get(slug='draper', state_province__slug='utah',
        # #                                        country__slug='united-states'))
        # # loc.state_province = loc.place.state_province
        # # loc.county = loc.place.county
        # # loc.country = loc.place.country
        # # loc.save()
        # #
        # # phone = Phone(number="801-572-2519", country=loc.country)
        # # phone.save()
        # #
        # # o1 = OrganizedEvent(event_start_date="2021-02-12",
        # #                     event_end_date="2021-02-21",
        # #                     name_short="In Store Event",
        # #                     name_long="Bridal Closet",
        # #                     cta_url="https://www.mybridalcloset.com/",
        # #                     is_virtual=False,
        # #                     location=loc,
        # #                     phone=phone)
        # # o1.save()
        # # ms.organized_events.add(o1)
        # #
        # # # ----
        # #
        # # loc = Location(address1="619 West 54th Street", address2="5th floor",
        # #                place=Place.objects.get(slug='new-york', state_province__slug='new-york',
        # #                                        country__slug='united-states'))
        # # loc.state_province = loc.place.state_province
        # # loc.county = loc.place.county
        # # loc.country = loc.place.country
        # # loc.save()
        # #
        # # phone = Phone(number="212-947-1155", country=loc.country)
        # # phone.save()
        # #
        # # o1 = OrganizedEvent(event_start_date="2021-02-18",
        # #                     event_end_date="2021-02-21",
        # #                     name_short="In Store Event",
        # #                     name_long="RK Bridal",
        # #                     cta_url="http://www.rkbridal.com/",
        # #                     is_virtual=False,
        # #                     location=loc,
        # #                     phone=phone)
        # o1.save()
        # ms.organized_events.add(o1)
        #
        # # ----
        #
        # loc = Location(address1="8028 Cooper Ave",
        #                place=Place.objects.get(slug='glendale', state_province__slug='new-york',
        #                                        country__slug='united-states'))
        # loc.state_province = loc.place.state_province
        # loc.county = loc.place.county
        # loc.country = loc.place.country
        # loc.save()
        #
        # phone = Phone(number="718-326-5700", country=loc.country)
        # phone.save()
        #
        # o1 = OrganizedEvent(event_start_date="2021-01-26",
        #                     event_end_date="2021-01-31",
        #                     name_short="In Store Event",
        #                     name_long="Paisley Bridal (Shops at Atlas Park)",
        #                     cta_url="http://www.paisleybridal.com",
        #                     is_virtual=False,
        #                     location=loc,
        #                     phone=phone)
        # o1.save()
        # ms.organized_events.add(o1)
        #
        # # ----
        #
        # loc = Location(address1="105 Pompton Avenue",
        #                place=Place.objects.get(slug='cedar-grove', state_province__slug='new-jersey',
        #                                        country__slug='united-states'))
        # loc.state_province = loc.place.state_province
        # loc.county = loc.place.county
        # loc.country = loc.place.country
        # loc.save()
        #
        # phone = Phone(number="973-239-7111", country=loc.country)
        # phone.save()
        #
        # o1 = OrganizedEvent(event_start_date="2021-02-12",
        #                     event_end_date="2021-02-13",
        #                     name_short="In Store Event",
        #                     name_long="Park Avenue Bridals",
        #                     cta_url="https://www.parkavenuebridals.com",
        #                     is_virtual=False,
        #                     location=loc,
        #                     phone=phone)
        # o1.save()
        # ms.organized_events.add(o1)

        #  ____   __ __   _____ ____  ____     ___   _____  _____     ___      ___  ___ ___   ___
        # |    \ |  T  T / ___/l    j|    \   /  _] / ___/ / ___/    |   \    /  _]|   T   T /   \
        # |  o  )|  |  |(   \_  |  T |  _  Y /  [_ (   \_ (   \_     |    \  /  [_ | _   _ |Y     Y
        # |     T|  |  | \__  T |  | |  |  |Y    _] \__  T \__  T    |  D  YY    _]|  \_/  ||  O  |
        # |  O  ||  :  | /  \ | |  | |  |  ||   [_  /  \ | /  \ |    |     ||   [_ |   |   ||     |
        # |     |l     | \    | j  l |  |  ||     T \    | \    |    |     ||     T|   |   |l     !
        # l_____j \__,_j  \___j|____jl__j__jl_____j  \___j  \___j    l_____jl_____jl___j___j \___/

        #     __  __ __  ____    ____  ______    ___  ___        ___      ___  ___ ___   ___
        #    /  ]|  T  T|    \  /    T|      T  /  _]|   \      |   \    /  _]|   T   T /   \
        #   /  / |  |  ||  D  )Y  o  ||      | /  [_ |    \     |    \  /  [_ | _   _ |Y     Y
        #  /  /  |  |  ||    / |     |l_j  l_jY    _]|  D  Y    |  D  YY    _]|  \_/  ||  O  |
        # /   \_ |  :  ||    \ |  _  |  |  |  |   [_ |     |    |     ||   [_ |   |   ||     |
        # \     |l     ||  .  Y|  |  |  |  |  |     T|     |    |     ||     T|   |   |l     !
        #  \____j \__,_jl__j\_jl__j__j  l__j  l_____jl_____j    l_____jl_____jl___j___j \___/

        # p_close = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Close the account", "description": "Permanently close the account"})
        # p_close.slug = slugify(p_close.name)
        # p_close.save()
        #
        # p_suspend = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Suspend the account", "description": "Temporarily suspend the account, hiding all content"})
        # p_suspend.slug = slugify(p_suspend.name)
        # p_suspend.save()
        #
        # p_rename = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Rename the business", "description": "Rename/Rebrand the business account"})
        # p_rename.slug = slugify(p_rename.name)
        # p_rename.save()
        #
        # p_upgrade = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Upgrade to paid plan", "description": "Upgrade the acount to a paid plan"})
        # p_upgrade.slug = slugify(p_upgrade.name)
        # p_upgrade.save()
        #
        # p_profile = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Edit business profile", "description": "Make changes to the properties of the business profile"})
        # p_profile.slug = slugify(p_profile.name)
        # p_profile.save()
        #
        # p_manage_users = BusinessTeamMemberRolePermissionType(**{"name": "Manage team members",
        #                                                        "description": "Invite, remove or edit team members"})
        # p_manage_users.slug = slugify(p_manage_users.name)
        # p_manage_users.save()
        #
        # p_editor = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Edit all content", "description": "Edit all published business content"})
        # p_editor.slug = slugify(p_editor.name)
        # p_editor.save()
        #
        # p_contributor_editor = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Edit own content", "description": "Edit self-created published business content"})
        # p_contributor_editor.slug = slugify(p_contributor_editor.name)
        # p_contributor_editor.save()
        #
        # p_video_publisher = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Publish videos", "description": "Upload and publish videos"})
        # p_video_publisher.slug = slugify(p_video_publisher.name)
        # p_video_publisher.save()
        #
        # p_photo_publisher = BusinessTeamMemberRolePermissionType(
        #     **{"name": "Publish photographs", "description": "Upload and publish photographs"})
        # p_photo_publisher.slug = slugify(p_photo_publisher.name)
        # p_photo_publisher.save()
        #
        # # Admin full
        # classification = BusinessTeamMemberRoleType(name="Administrator (Full)",
        #                                           slug=slugify_2("admin-full"))
        # classification.save()
        # classification.permissions.add(p_close)
        # classification.permissions.add(p_suspend)
        # classification.permissions.add(p_rename)
        # classification.permissions.add(p_upgrade)
        # classification.permissions.add(p_profile)
        # classification.permissions.add(p_manage_users)
        # classification.permissions.add(p_editor)
        # classification.permissions.add(p_contributor_editor)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_photo_publisher)
        #
        # # Partial Admin
        # classification = BusinessTeamMemberRoleType(name="Limited Admin", slug=slugify_2("limited-admin"))
        # classification.save()
        # classification.permissions.add(p_profile)
        # classification.permissions.add(p_manage_users)
        # classification.permissions.add(p_editor)
        # classification.permissions.add(p_contributor_editor)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_photo_publisher)
        #
        # # Editor
        # classification = BusinessTeamMemberRoleType(name="Editor (All Content)", slug=slugify_2("editor"))
        # classification.save()
        # classification.permissions.add(p_editor)
        # classification.permissions.add(p_contributor_editor)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_photo_publisher)
        #
        # # Contributor
        # classification = BusinessTeamMemberRoleType(name="Contributor (Own Content)", slug=slugify_2("Contributor"))
        # classification.save()
        # classification.permissions.add(p_contributor_editor)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_video_publisher)
        # classification.permissions.add(p_photo_publisher)
        # #
        # num_recs = VideoViewLog.objects.filter(legacy_post_id__isnull=True).count()
        # with alive_bar(num_recs, "- adding legacy post id to event story view log", bar="blocks", length=10) as bar:
        #     for log in VideoViewLog.objects.filter(legacy_post_id__isnull=True).iterator():
        #         log.legacy_post_id = log.video.post.legacy_post_id
        #         log.save()
        #         bar()
        #
        # num_recs = ArticleViewLog.objects.filter(legacy_post_id__isnull=True).count()
        # with alive_bar(num_recs, "- adding legacy post id to blog story view log", bar="blocks", length=10) as bar:
        #     for log in ArticleViewLog.objects.filter(legacy_post_id__isnull=True).iterator():
        #         log.legacy_post_id = log.article.post.legacy_post_id
        #         log.save()
        #         bar()
        #
        # num_recs = VideoViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).count()
        # with alive_bar(num_recs, "- adding legacy user id to event story view log", bar="blocks", length=10) as bar:
        #     for log in VideoViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).iterator():
        #         log.legacy_user_id = log.user.legacy_user_id
        #         log.save()
        #         bar()
        #
        # num_recs = ArticleViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).count()
        # with alive_bar(num_recs, "- adding legacy user id to blog story view log", bar="blocks", length=10) as bar:
        #     for log in ArticleViewLog.objects.filter(user__isnull=False, legacy_user_id__isnull=True).iterator():
        #         log.legacy_user_id = log.user.legacy_user_id
        #         log.save()
        #         bar()

        # a = Location.objects.get(pk='244cf5a9-fa34-4395-b46b-bb51f5ba704c')
        # a.country = None
        # a.state_province = None
        # a.place = None
        # a.save()
        #
        # # print(a.legacy_country)
        # # print(a.legacy_state_province)
        # # print(a.legacy_city)
        #
        # job_sanitize_address('244cf5a9-fa34-4395-b46b-bb51f5ba704c')
        #
        # a = Location.objects.get(pk='244cf5a9-fa34-4395-b46b-bb51f5ba704c')
        # # print(a.country.name)
        # # print(a.state_province.name)
        # # print(a.place.name if a.place else "[n/a]")
        #
        # return
        #
        # countries = {}
        # es = Video.objects_all_states.all()
        # for e in es:
        #     if e.location.country:
        #         if e.location.country.name not in countries:
        #             countries[e.location.country.name] = {'videos': 1}
        #         else:
        #             countries[e.location.country.name]['videos'] += 1
        #
        #
        # # print(countries)
        #
        # return

        # for each event story -- plug the specific venue type for venue businesses.
        # videos = Video.objects_all_states.all()
        # with alive_bar(len(videos), "- plug the specific venue type for venue businesses.   ", bar="blocks", length=10) as bar:
        #     for es in videos:
        #         bar()
        #         post = {'ID': es.post.legacy_post_id}
        #         businesses = get_video_post_businesses(post)
        #         for business in businesses:
        #             if business.venue_type:
        #                 # find the event story business to modify.
        #                 for esv in es.businesses.all():
        #                     for esvr in esv.business.roles.all():
        #                         if esvr.slug == 'venue':
        #                             # update weight on venue type...
        #                             business.venue_type.weight_videos += 1
        #                             business.venue_type.save()
        #
        #                             # update the esv record itself.
        #                             esv.venue_type = business.venue_type
        #                             esv.save()
        #
        #                             # # print(esv.business.name + " " + business.venue_type.slug)
