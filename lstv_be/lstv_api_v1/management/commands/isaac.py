import json
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List
import pytz
import requests
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.core.management.base import LabelCommand, BaseCommand, handle_default_options, CommandError
from lstv_api_v1.models import (
    ContentModelState, Business, Like, Message, MessageContextTypeEnum,
    User, UserTypeEnum, Video, BusinessTeamMember
)
from lstv_api_v1.utils.business_admin_actions import do_business_merge, set_business_card_thumbnail_url, \
    set_business_logo_image, set_business_description, set_find_store_url, clear_business_social_links, \
    add_business_social_link, set_business_subscription_level, convert_consumer_to_business, get_business_info, \
    remove_role_from_business, get_video_info, add_role_to_business, add_shopping_item_to_business, \
    remove_business_social_link, purge_business_social_links, remove_shopping_item_from_business, add_business_photo, \
    remove_business_addresse, add_business_address, purge_business_addresses, change_business_inquiry_email, \
    purge_business_phones, add_business_phone, remove_business_phone, set_business_video_order, \
    purge_business_logo_image, purge_business_card_thumbnail_url, purge_business_photos, remove_business_photo, \
    purge_shopping_items_from_business, hard_delete_business, delete_business, set_website_for_business_page, \
    change_video_thumbnail, add_business_promo_video, remove_business_promo_video, \
    set_business_card_thumbnail_url_from_video, add_vendor_to_video, remove_vendor_from_video, add_business_team_member, \
    remove_business_team_member, create_attach_consumer_to_business, add_photo_to_video, remove_photo_from_video, \
    add_tag_to_video, remove_tag_from_video, set_business_hide_email

from lstv_api_v1.utils.utils import notify_grapevine

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


class Command(BaseCommand):

    def create_parser(self, prog_name, subcommand, **kwargs):
        return None

    def add_arguments(self, parser):
        pass

    def run_from_argv(self, argv):
        try:
            self.execute(*argv)
        except CommandError as e:
            pass

    def execute(self, *args, **options):
        output = self.handle(*args)

    allowable_commands = {
        "business": {
            "role": {
                "usage": "isaac business [business_slug] role [add|remove] [role_slug]",
                "help": "add or remove role to and from a business ",
                "example": [
                    "isaac business nst-pictures role add dj",
                    "isaac business nst-pictures role remove videographer"
                ]
            },
            "info": {
                "usage": "isaac business [business_slug] info",
                "help": "get information about a business",
                "example": [
                    "isaac business nst-pictures info"
                ]
            },
            "subscription": {
                "usage": "isaac business [business_slug] subscription [free|basic|plus|premium]",
                "help": "change the subscription levels of the business",
                "example": [
                    "isaac business nst-pictures subscription premium",
                    "isaac business meraki-weddings subscription free"
                ]
            },
            "social": {
                "usage": "isaac business [business_slug] social [add|remove|purge] [network_type|id] [account_name...]",
                "help": "add, remove a social link to and from a business, or purge all social links from business",
                "example": [
                    "isaac business nst-pictures social add instagram nstoninstagram",
                    "isaac business nst-pictures social remove instagram",
                    "isaac business nst-pictures social purge"
                ]
            },
            "cta": {
                "usage": "isaac business [business_slug] cta [set|purge] [url...] [...label]",
                "help": "modify the 'contact' button on a business page and where it leads, or revert it to contact form",
                "example": [
                    "isaac business nst-pictures cta set 'Book Us' 'https://nstpictures.com/bookus'",
                    "isaac business nst-pictures cta purge"
                ]
            },
            "description": {
                "usage": "isaac business [business_slug] description [set|purge|  [...text]",
                "help": "set or purge the business page description",
                "example": [
                    "isaac business nst-pictures description set 'We are a group of  videographers based in NYC...'",
                    "isaac business nst-pictures description purge"
                ]
            },
            "logo_image": {
                "usage": "isaac business [business_slug] logo_image [set|purge] [...image_url]",
                "help": "modify or clear the logo image on a business page",
                "example": [
                    "isaac business nst-pictures logo_image set 'https://somewhere.com/image.jpg'",
                    "isaac business nst-pictures logo_image purge"
                ]
            },
            "card_thumbnail": {
                "usage": "isaac business [business_slug] card_thumbnail [set|set_from_video|purge] [...image_url|..video_slug]",
                "help": "set or purge the card thumbnail image for a business",
                "example": [
                    "isaac business nst-pictures card_thumbnail set 'https://somewhere.com/image.jpg'",
                    "isaac business nst-pictures card_thumbnail set_from_video nicholas-paige-wedding-video-december-2020",
                    "isaac business nst-pictures card_thumbnail purge"
                ]
            },
            "merge": {
                "usage": "isaac business [business_slug] merge [from_business_slug]",
                "help": "merge one business's assets/properties (roles, videos, more...) into another and delete the origin business",
                "example": [
                    "isaac business nst-pictures merge nst-pictures-redundant-name",
                ]
            },
            "shop": {
                "usage": "isaac business [business_slug] shop [add|remove|purge]  [...id|...item_name] [description...] [price...] [image_url...] [cta_url...]",
                "help": "add or remove shopping item from a business page",
                "example": [
                    "isaac business nst-pictures shop add 'Cannot D500' 'Top of the line DSLR camera for photographers' '$1499.95' 'https://site.com/d500.png' 'https://amazon.com/items/d500'",
                    "isaac business nst-pictures shop remove 41b4c291-2032-4ad3-9b26-ea3bb9c36039"
                    "isaac business nst-pictures shop purge"
                ]
            },
            "photo": {
                "usage": "isaac business [business_slug] photo [add|remove|purge]  [...id|...photo_url]",
                "help": "add, remove a photo from a business page or purge all business photos",
                "example": [
                    "isaac business nst-pictures photo add 'https://somesite.com/photo.jpg'",
                    "isaac business nst-pictures photo remove 41b4c291-2032-4ad3-9b26-ea3bb9c36039"
                    "isaac business nst-pictures photo purge"
                ]
            },
            "email": {
                "usage": "isaac business [business_slug] email [set|purge] [...email]",
                "help": "set the inquiry email for the business",
                "example": [
                    "isaac business nst-pictures email set inquiries@nstpictires.com",
                    "isaac business nst-pictures email purge",
                ]
            },
            "website": {
                "usage": "isaac business [business_slug] website [set|purge] [website]",
                "help": "set the public website for the business appearing on the business page",
                "example": [
                    "isaac business nst-pictures website set nstpictures.com",
                    "isaac business nst-pictures website purge",
                ]
            },
            "location": {
                "usage": "isaac business [business_slug] location [add|remove|purge] [location_path|id] [zipcode...][street_address_1...] [street_address_2...]",
                "help": "add or remove business physical location",
                "example": [
                    "isaac business nst-pictures location add /united-states/california/modesto",
                    "isaac business nst-pictures location add /united-states/california/modesto 94552 '123 Main street'",
                    "isaac business nst-pictures location add /united-states/california/modesto 94552 '123 Main street' '#533",
                    "isaac business nst-pictures location remove 41b4c291-2032-4ad3-9b26-ea3bb9c3603",
                    "isaac business nst-pictures location purge"
                ]
            },
            "phone": {
                "usage": "isaac business [business_slug] phone [add|remove|purge] [id|country_code_or_slug] [phone_number]",
                "help": "add or remove a business phone to and from a business page",
                "example": [
                    "isaac business nst-pictures phone add usa 212-555-4233",
                    "isaac business nst-pictures phone remove 41b4c291-2032-4ad3-9b26-ea3bb9c36039"
                ]
            },
            "video_order": {
                "usage": "isaac business [business_slug] video_order [video_slug1,...video_slug2,...video_slug_3]",
                "help": "force a new video order for the business page, overriding older order",
                "example": [
                    "isaac business nst-pictures video_order 'video_slug1,video_slug2,video_slug3,video_slug_4'"
                ]
            },
            "delete": {
                "usage": "isaac business [business_slug] delete",
                "help": "Mark a business as deleted, can be un-delete",
                "example": [
                    "isaac business an-airbnb delete"
                ]
            },
            "hard_delete": {
                "usage": "isaac business [business_slug] hard_delete",
                "help": "DANGER: Remove a business totally, without possibility for un-delete",
                "example": [
                    "isaac business an-airbnb hard_delete"
                ]
            },
            "promo_video": {
                "usage": "isaac business [business_slug] promo_video [add|remove|purge] [...title|media_id] [...media_id]",
                "help": "Adds or removes a promo video to and from  a business page",
                "example": [
                    "isaac business nst-pictures promo_video add 'Where Eagles Dare' mkg356af",
                    "isaac business nst-pictures promo_video remove mkg356af",
                    "isaac business nst-pictures promo_video purge"
                ]
            },
            "team": {
                "usage": "isaac business [business_slug] team [add|remove|purge] [name|id] [...title] [...description] [...image URL]",
                "help": "Adds or removes team members to or from a business page",
                "example": [
                    "isaac business nst-pictures team add 'Tim Cook' 'CEO' 'This guy runs Apple, not like Steve Jobs though' 'https://somesite.com/cook.jpg'",
                    "isaac business nst-pictures team remove 715149f4-c41f-4196-896c-e35e3100d76b",
                    "isaac business nst-pictures team purge"
                ]
            },
            "hide_email": {
                "usage": "isaac business [business_slug] hide_email [true|false]",
                "help": "Hides or unhides email from business page",
                "example": [
                    "isaac business nst-pictures hide_email true",
                    "isaac business nst-pictures hide_email false"
                ]
            }
        },
        "video": {
            "info": {
                "usage": "isaac video [video_slug_or_url] info",
                "help": "get information about a videoe",
                "example": [
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 info"
                ]
            },
            "thumbnail": {
                "usage": "isaac video [video_slug_or_url] thumbnail [thumbnail_url]",
                "help": "replace the thumbnail for a video card",
                "example": [
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 thumbnail https://somesite.com/images/new_image.jpg"
                ]
            },
            "vendor": {
                "usage": "isaac video [video_slug_or_url] vendor [add|remove] [vendor_slug] [..role_or_role_capacity]",
                "help": "add or remove vendors from the wedding team of a video",
                "example": [
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 vendor add allure-bridals bride-shoe-designer",
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 vendor add meraki-weddings photographer",
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 vendor remove meraki-weddings",
                ]
            },
            "photo": {
                "usage": "isaac video [video_slug_or_url] photo [add|remove] [image_url]  [..business_slug]",
                "help": "add or remove a photo from a video page and the photographer's business page.",
                "example": [
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 photo add 'https://site.com/photos/1.jpg'",
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 photo add 'https://site.com/photos/1.jpg' the_other_photographer",
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 photo remove 41b4c291-2032-4ad3-9b26-ea3bb9c36039",
                ]
            },
            "tag": {
                "usage": "isaac video [video_slug_or_url] tag [add|remove] [tag_slug]",
                "help": "add or remove a tag from a video.",
                "example": [
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 tag add elopement",
                    "isaac video mckenzie-jonathan-wedding-video-march-2019 tag remove elopement",
                ]
            }
        },
        "user": {
            "attach_to_business": {
                "usage": "isaac user [email] attach_to_business [business_slug]",
                "help": "assign a consumer to a business, converting him/her to a business_team_member user",
                "example": [
                    "isaac user jack@nstpictures.com attach_to_business nst-pictures"
                ]
            },
            "create_attach_to_business": {
                "usage": "isaac user [email] create_attach_to_business  [business_name] [business_main_role]",
                "help": "create a new business object + assign existing consumer to it  converting him/her to a business_team_member user",
                "example": [
                    "isaac user jack@jill.com create_attach_to_business 'JackJill Videography' videographers"
                ]
            }
        }
    }

    def show_help(self, key):
        self.show_isaac()
        print(f"options for:  {CBEIGE}isaac {key}{CEND}\n")
        max_pattern_len = 0

        for item in self.allowable_commands[key].keys():
            pattern = f"{self.allowable_commands[key][item]['usage']}"
            print(f"{CBEIGEBG}{CBLACK}{self.allowable_commands[key][item]['help']}{CEND}\n{CBEIGE}{pattern}{CEND}")
            print(f"     example:")
            for example in self.allowable_commands[key][item]['example']:
                print(f"     - {CVIOLET}{example}{CEND}")
        exit(0)

    def show_isaac(self):
        print(f"{CWHITEBG2}{CBLACK} sssssoooooooo+++oyhdddmmdhyso/:::::::::::::::::.+s {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssssoooooo++shmmmmmNNNNNNNNNNds:-:::::::::::::.ss {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssssoooooosdmmNNNNNNNNNMMMMNMNNNy::::::::::::/.ys {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssssooooooymmmNNNNNNNNMMMMMMMMMMMNd:::::::::::/-yo {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssoooooosmmNNNNmdmNNNNNNNNNNMMMMMNd:::::::::::-hs {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssoooooodmNNNmysssssss++++shmNMMMMNs:::::::::::hy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssooooosmNNNms++ooo++//::/+ooyNMMMNy:::::::::::yh {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssooooooymNNNNs//+++++/////++osmNNMNd::::::::::+yy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} soooooooyNNMNmssyhhyo+//+ooosyyNMNMNo::::::::::+sy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssoooooosNNNNhdddhhhhy+oyhhyyyhdMMMm/:::::::::-+oy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssooooooohNNdo/+ssosys+oooooosshNNm+:::::::::/-ssh {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssooooooooymho+o+syoo+/+ooo+:+symd+::::::::::/-ysy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssoooooooooshyyhmmNNNmdmmdhdhosyy/:::::::::::+:ssy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssooooooo++ydyNmmdyso+osymmmsss//:::::::::::+:ssh {CEND}")
        print(f"{CWHITEBG2}{CBLACK} sssooooooo++oddhyyyo//::/ooyhss--:::::::::::/++hhd {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssssoooooo++/:yhhhyyso++oooos+..o+sNNNmddhys-o+syh {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssssooosyds:.`-hhyyso++++oos:``./hNNNMMMMNNm.o``hy {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ssssyhmNNNd```::hmdhyyssyyo+sh.```/sydmmNNNy.o`.m. {CEND}")
        print(f"{CWHITEBG2}{CBLACK} +s-smNNNN+:-``/++shdmmmdhdNNNNo.` ````.........-/` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} `.s-+dy+-+/--.hNNNNmdmNmNNNNMMs/:.```````````````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} +../.````/+/:-yNNNNNNmhhmNNNMMhoo+:.`````````````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} :```  `-:://:-+mNNNNd/``-/shdds`/yo/:-. `````````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ````` +dmd+::--odNdo.-`````/:````++oyss:`````````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} .````:syhyss/+/-:/.`...`````.://+oshysoo-````````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} `````hhyyyyyssoo````.`.``````+yyssssoooos.```````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ````-ssyyyso+so.`````..``````.:ys+++++++os/``````` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ````-yyyyysss+.``````.-``/`...::hho++ooooysy+-```` {CEND}")
        print(f"{CWHITEBG2}{CBLACK} ````.hhhhhys+.````````-.````.-:.:sysssosyyosss-``` {CEND}")

    def handle(self, *args, **options):
        armed = False
        params = []
        for arg in args[2:]:
            if arg.lower() == '--arm':
                armed = True
            params.append(arg)

        print(CYELLOW)
        print(f"{CYELLOW} _____                       _____ _      _____   {CEND}")
        print(f"{CYELLOW}|_   _|                     / ____| |    |_   _|  {CEND}")
        print(f"{CYELLOW}  | |  ___  __ _  __ _  ___| |    | |      | |    {CEND}")
        print(f"{CYELLOW}  | | / __|/ _` |/ _` |/ __| |    | |      | |    {CEND}")
        print(f"{CYELLOW} _| |_\__ \ (_| | (_| | (__| |____| |____ _| |_   {CEND}")
        print(f"{CYELLOW}|_____|___/\__,_|\__,_|\___|\_____|______|_____|  {CEND}")
        print(f"")

        if len(params) == 0:
            print("Usage: isaac <object> <command> [parameters]")
            print("for help:")
            print("")
            print("isaac help")
            print("isaac <command> help")
            exit(0)
        else:
            if params[0] == 'help':
                print("isaac business help              - see business management commands")
                print("isaac video help                 - see business management commands")
                print("isaac user help                  - see business management commands")
                exit(0)

            if params[0] not in self.allowable_commands.keys():
                print(f"{CRED}ERROR:{CEND} {params[0]} is not a valid object to manage. Options are: "
                      f"{', '.join(self.allowable_commands.keys())}{CEND}{CEND}")
                print(f"use: {CGREEN}isaac help{CEND} to get help...")
                exit(1)

            if params[0] in self.allowable_commands.keys() and len(params) >= 2:
                if params[1] == 'help':
                    self.show_help(params[0])

            try:

                #  __      ___     _
                #  \ \    / (_)   | |
                #   \ \  / / _  __| | ___  ___
                #    \ \/ / | |/ -_` |/ _ \/ _ \
                #     \  /  | | (_| |  __/ (_) |
                #      \/   |_|\__,_|\___|\___/

                if params[0] == 'video':
                    try:
                        video_slug = params[1]
                        command = params[2]
                        video_slug = video_slug.replace("https://lovestoriestv.com/", "").replace("/", "")
                    except IndexError:
                        print(f"{CRED}ERROR:{CEND} -- {params[1]} is not a valid video")
                        exit(0)

                    if command == 'info':
                        get_video_info(video_slug, output=True)

                    if command == 'thumbnail':
                        thumbnail_url = params[3]
                        change_video_thumbnail(video_slug, thumbnail_url, armed, output=True)

                    if command == 'vendor':
                        verb = params[3]
                        vendor_slug = params[4]

                        if verb == 'add':
                            role_or_capacity = params[5]
                            print(video_slug)
                            print(vendor_slug)
                            print(role_or_capacity)
                            add_vendor_to_video(video_slug, vendor_slug, role_or_capacity, armed, output=True)
                        if verb == 'remove':
                            remove_vendor_from_video(video_slug, vendor_slug, role_or_capacity, armed, output=True)

                    if command == 'photo':
                        verb = params[3]
                        if verb == 'add':
                            photo_url = params[4]
                            business_slug = None
                            if len(params) > 5:
                                business_slug = params[5]
                            add_photo_to_video(video_slug, photo_url, business_slug, armed, output=True)
                        if verb == 'remove':
                            photo_id = params[4]
                            remove_photo_from_video(video_slug, photo_id, armed, output=True)
                            
                    if command == 'tag':
                        verb = params[3]
                        tag_slug = params[4]
                        if verb == 'add':
                            print(video_slug)
                            print(tag_slug)
                            add_tag_to_video(video_slug, tag_slug, armed, output=True)
                        if verb == 'remove':
                            print(video_slug)
                            print(tag_slug)
                            remove_tag_from_video(video_slug, tag_slug, armed, output=True)


                #   _    _
                #  | |  | |
                #  | |  | |___  ___ _ __
                #  | |  | / __|/ _ \ '__|
                #  | |__| \__ \  __/ |
                #   \____/|___/\___|_|
                #

                if params[0] == 'user':
                    email = params[1]
                    if params[2] == 'attach_to_business':
                        business_slug = params[3]
                        convert_consumer_to_business(email, business_slug, armed, output=True)
                    if params[2] == 'create_attach_to_business':
                        business_name = params[3]
                        business_role = params[4]
                        create_attach_consumer_to_business(email, business_name, business_role, armed, output=True)

                #   ____            _
                #  |  _ \          (_)
                #  | |_) |_   _ ___ _ _ __   ___  ___ ___
                #  |  _ <| | | / __| | '_ \ / _ \/ __/ __|
                #  | |_) | |_| \__ \ | | | |  __/\__ \__ \
                #  |____/ \__,_|___/_|_| |_|\___||___/___/

                if params[0] == 'business':
                    print(params)
                    business_slug = params[1]
                    command = params[2]
                    if command == 'role':
                        verb = params[3]
                        role_type_slug = params[4]
                        print(verb)
                        print(role_type_slug)

                        if verb == 'remove':
                            remove_role_from_business(business_slug, role_type_slug, armed, output=True)
                        if verb == 'add':
                            add_role_to_business(business_slug, role_type_slug, armed, output=True)
                    if command == 'subscription':
                        level = params[3]
                        set_business_subscription_level(business_slug, level, armed, output=True)

                    if command == 'social':
                        verb = params[3]
                        if verb == 'set':
                            sn_type = params[4]
                            sn_account = params[5]
                            add_business_social_link(business_slug, sn_type, sn_account, armed, output=True)
                        if verb == 'remove':
                            sn_type = params[4]
                            remove_business_social_link(business_slug, sn_type, armed, output=True)
                        if verb == 'purge':
                            purge_business_social_links(business_slug, armed, output=True)
                    if command == 'info':
                        get_business_info(business_slug, output=True)
                    if command == 'cta':
                        verb = params[3]
                        if verb == 'set':
                            url = params[4]
                            label = params[5]
                            print(url)
                            print(label)
                            set_find_store_url(business_slug, url, label, armed, output=True)
                        if verb == 'purge':
                            set_find_store_url(business_slug, None, None, armed, output=True)
                    if command == 'description':
                        verb = params[3]
                        if verb == 'set':
                            set_business_description(business_slug, params[4], armed, output=True)
                        if verb == 'purge':
                            set_business_description(business_slug, None, armed, output=True)

                    if command == 'logo_image':
                        verb = params[3]
                        if verb == 'set':
                            image_url = params[4]
                            set_business_logo_image(business_slug, image_url, armed, True)
                        if verb == 'purge':
                            purge_business_logo_image(business_slug, armed, True)

                    if command == 'card_thumbnail':
                        verb = params[3]
                        if verb == 'set':
                            image_url = params[4]
                            set_business_card_thumbnail_url(business_slug, image_url, armed, True)
                        if verb == 'set_from_video':
                            video_slug = params[4]
                            set_business_card_thumbnail_url_from_video(business_slug, video_slug, armed, True)
                        if verb == 'purge':
                            purge_business_card_thumbnail_url(business_slug, armed, True)

                    if command == 'merge':
                        to_business_slug = params[1]
                        from_business_slug = params[3]
                        do_business_merge(to_business_slug, from_business_slug, armed, output=True)
                    if command == 'location':
                        verb = params[3]
                        if verb == 'remove':
                            id = params[4]
                            remove_business_addresse(business_slug, id, armed, output=True)
                        if verb == 'add':
                            location_path = params[4]
                            zipcode = params[5] if len(params) > 5 else None
                            address1 = params[6] if len(params) > 6 else None
                            address2 = params[7] if len(params) > 7 else None
                            add_business_address(business_slug, location_path, zipcode, address1, address2, armed,
                                                 output=True)
                        if verb == 'purge':
                            purge_business_addresses(business_slug, armed, armed, output=True)
                    if command == 'phone':
                        verb = params[3]
                        if verb == 'add':
                            country_code = params[4]
                            phone = params[5]
                            add_business_phone(business_slug, country_code, phone, armed, output=True)
                        if verb == 'purge':
                            purge_business_phones(business_slug, armed, output=True)
                        if verb == 'remove':
                            id = params[4]
                            remove_business_phone(business_slug, id, armed, output=True)
                    if command == 'email':
                        verb = params[3]
                        if verb == 'set':
                            email = params[4]
                            change_business_inquiry_email(business_slug, email, armed, output=True)
                        if verb == 'purge':
                            change_business_inquiry_email(business_slug, None, armed, output=True)
                    if command == 'website':
                        verb = params[3]
                        if verb == 'set':
                            website = params[4]
                            set_website_for_business_page(business_slug, website, armed, output=True)
                        if verb == 'purge':
                            set_website_for_business_page(business_slug, None, armed, output=True)

                    if command == 'photo':
                        verb = params[3]
                        if verb == 'add':
                            image_url = params[4]
                            add_business_photo(business_slug, image_url, armed, output=True)
                        if verb == 'purge':
                            purge_business_photos(business_slug, armed, output=True)
                        if verb == 'remove':
                            id = params[4]
                            remove_business_photo(business_slug, id, armed, output=True)
                    if command == 'video_order':
                        order = params[3]
                        set_business_video_order(business_slug, order, armed, output=True)
                    if command == 'shop':
                        verb = params[3]
                        if verb == 'add':
                            title = params[4]
                            desc = params[5]
                            price = params[6]
                            image_url = params[7]
                            cta_url = params[8]
                            add_shopping_item_to_business(business_slug, title, desc, price, image_url, cta_url,
                                                          armed, output=True)
                        if verb == 'remove':
                            id = params[4]
                            remove_shopping_item_from_business(business_slug, id, armed, output=True)
                        if verb == 'purge':
                            purge_shopping_items_from_business(business_slug, armed, output=True)
                    if command == 'hard_delete':
                        hard_delete_business(business_slug, armed, output=True)
                    if command == 'delete':
                        delete_business(business_slug, armed, output=True)
                    if command == 'promo_video':
                        verb = params[3]
                        if verb == 'add':
                            title = params[4]
                            media_id = params[5]
                            add_business_promo_video(business_slug, title, media_id, armed, output=True)
                        if verb == 'remove':
                            media_id = params[4]
                            remove_business_promo_video(business_slug, media_id, armed, output=True)
                        if verb == 'purge':
                            media_id = params[4]
                            remove_business_promo_video(business_slug, None, armed, output=True)
                    if command == 'team':
                        verb = params[3]
                        if verb == 'add':
                            name = params[4]
                            title = params[5]
                            description = params[6]
                            image_url = params[7]
                            add_business_team_member(business_slug, name, title, description, image_url, armed,
                                                     output=True)
                        if verb == 'remove':
                            id = params[4]
                            remove_business_team_member(business_slug, id, armed, output=True)
                        if verb == 'purge':
                            remove_business_team_member(business_slug, None, armed, output=True)
                    if command == 'hide_email':
                        verb = params[3]
                        if verb == 'true':
                            set_business_hide_email(business_slug, True, armed, output=True)
                        if verb == 'false':
                            set_business_hide_email(business_slug, False, armed, output=True)

                    if command == 'hide_email':
                        verb = params[3]
                        if verb == 'true':
                            set_business_hide_email(business_slug, True, armed, output=True)
                        if verb == 'false':
                            set_business_hide_email(business_slug, False, armed, output=True)

                if not armed:
                    print(f"\n{CGREENBG} DRY RUN {CEND}: No changed made. To actually make changes "
                          f"add {CRED}--arm{CEND} to your command")

            except IndexError:
                print(f"{CRED}ERROR:{CEND} -- badly formed command. Use isaac help")
