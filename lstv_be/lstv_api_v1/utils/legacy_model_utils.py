from lstv_api_v1.models import *
from django.db import connections
import json
import validators

import random
from datetime import datetime, timezone, timedelta
import string
import logging
import re
from urllib import parse
from django.db.utils import IntegrityError, DataError, ConnectionHandler

from lstv_api_v1.utils.model_utils import *
from lstv_api_v1.globals import *
from lstv_api_v1.utils.utils import get_google_place_info, asciify, verify_youtube_video, \
    verify_vimeo_video, get_jwplayer_video_state

from alive_progress import alive_bar
from timezonefinder import TimezoneFinder

venue_sub_type_names = ["[No Type]", "Airport Hangar", "Aquarium", "Arboretum", "Art Space", "Backyard", "Ballroom",
                        "Barn", "Beach", "Boat", "Boathouse", "Camp", "Casino", "Castle", "Cathedral", "Chateau",
                        "Church", "City Hall", "Cliff", "Country Club", "Courthouse", "Estate", "Event Hall", "Farm",
                        "Field", "Forest", "Garden", "Golf Course", "Greenhouse", "Historic Building", "Home", "Hotel",
                        "Industrial", "Space", "Inn", "Private Terrace", "Lake", "Lakefront", "Library", "Lodge",
                        "Loft", "Manor", "Mill", "Mountain", "Museum", "Orchard", "Outdoor", "Palace", "Park",
                        "Pavillion", "Private Home", "Railway", "Ranch", "Resort", "Restaurant",
                        "Rooftop", "School", "Spa", "Studio", "Temple", "Tent", "Theatre", "Train Station",
                        "University",
                        "Urban Space", "Villa", "Vineyard", "Warehouse", "Winery", "Woods", "Yacht Club", "Zoo",
                        "Artist", "Private Property"]

business_parent_cats = [112, 5035, 27876, 27875, 27874, 27869, 5672, 234, 4333, 27878, 27884, 22930, 4335, 4332,
                        4334, 27886, 27888, 27889, 27890, 27891, 27892, 27893, 27894, 27913, 28057, 28056, 28064,
                        28063, 17527, 28075, 28076, 28077, 28089, 28101, 28102, 28115, 28116, 28117, 108, 109, 10160,
                        28161, 5037, 10650, 27915, 27916, 27917, 23014, 22959, 180, 22918, 3065, 3066, 3067,
                        3068, 22925, 12167, 22916, 31968, 33076, 33649, 34618, 35572, 35917, 40800, 40799, 40798,
                        41401, 42959, 44811, 45367, 5037, 234, 10650, 3068, 3066, 3065, 5036, 22959,
                        34666, 12167, 22959, 23014, 4333, 53329, 65972, 71720, 73552, 77705, 51663]

us_states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
             "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
             "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
             "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
             "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
             "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
             "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
             "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]

us_states_abbr = {
    'AK': 'Alaska', 'AL': 'Alabama', 'AR': 'Arkansas', 'AS': 'American Samoa', 'AZ': 'Arizona',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DC': 'District of Columbia',
    'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'GU': 'Guam', 'HI': 'Hawaii', 'IA': 'Iowa',
    'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
    'MA': 'Massachusetts', 'MD': 'Maryland', 'ME': 'Maine', 'MI': 'Michigan', 'MN': 'Minnesota', 'MO': 'Missouri',
    'MP': 'Northern Mariana Islands', 'MS': 'Mississippi', 'MT': 'Montana', 'NA': 'National', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'NE': 'Nebraska', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NV': 'Nevada', 'NY': 'New York', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
    'PR': 'Puerto Rico', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
    'TX': 'Texas', 'UT': 'Utah', 'VA': 'Virginia', 'VI': 'Virgin Islands', 'VT': 'Vermont', 'WA': 'Washington',
    'WI': 'Wisconsin', 'WV': 'West Virginia', 'WY': 'Wyoming'}

country_list = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
                "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
                "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
                "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island",
                "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso",
                "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic",
                "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
                "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire",
                "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
                "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
                "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan",
                "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia",
                "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala",
                "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands",
                "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia",
                "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
                "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of",
                "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho",
                "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau",
                "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives",
                "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico",
                "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat",
                "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles",
                "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island",
                "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
                "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar",
                "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
                "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
                "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia",
                "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands",
                "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname",
                "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
                "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo",
                "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
                "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
                "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
                "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)",
                "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"]


def translate_legacy_parent(parent_slug, grandparent_slug=None):
    legacy_business_slugs = {"bakery": {"new_value": "bakery", "action_required": None},
                             "band": {"new_value": "band", "action_required": None},
                             "band-or-dj": {"new_value": "dj",
                                            "action_required": {
                                                "issue": "ambiguous",
                                                "options": [
                                                    "band", "dj"],
                                                "chose": "dj"}},
                             "bands-and-djs": {"new_value": "dj",
                                               "action_required": {"issue": "ambiguous", "options": ["band", "dj"],
                                                                   "chose": "dj"}},
                             "bar-and-beverage-services": {"new_value": "bar-beverage-service",
                                                           "action_required": None},
                             "boudoir-photographer": {"new_value": "boudoir-photographer", "action_required": None},
                             "bridal-party-dress-designer": {"new_value": "dress-designer", "action_required": None},
                             "bridal-party-gifts": {"new_value": "gifts", "action_required": None},
                             "bridal-party-suit-designer": {"new_value": "suit-designer", "action_required": None},
                             "bridal-salon": {"new_value": "bridal-salon", "action_required": None},
                             "ceremony-coach": {"new_value": "ceremony-coach", "action_required": None},
                             "bridal-shop": {"new_value": "bridal-salon", "action_required": None},
                             "bride-shoes-designer": {"new_value": "shoe-designer", "action_required": None},
                             "bride_shoe": {"new_value": "shoe-designer", "action_required": None},
                             "bridesmaids_dresses": {"new_value": "dress-designer", "action_required": None},
                             "cake-designer": {"new_value": "bakery", "action_required": None},
                             "calligraphy": {"new_value": "calligrapher", "action_required": None},
                             "caricature-artist": {"new_value": "event-artist", "action_required": None},
                             "caterer": {"new_value": "caterer", "action_required": None},
                             "catering-services": {"new_value": "caterer", "action_required": None},
                             "ceremony-venue": {"new_value": "venue", "action_required": None},
                             "childrens-apparel": {"new_value": "childrens-apparel", "action_required": None},
                             "clothing-alterations": {"new_value": "alterations", "action_required": None},
                             "cruise-operator": {"new_value": "cruise-operator", "action_required": None},
                             "dance-instruction": {"new_value": "dance-instruction", "action_required": None},
                             "day-of-coordinator": {"new_value": "day-of-coordinator", "action_required": None},
                             "decor": {"new_value": "decor", "action_required": None},
                             "designer": {"new_value": "event-designer", "action_required": None},
                             "desserts": {"new_value": "bakery", "action_required": None},
                             "dj": {"new_value": "dj", "action_required": None},
                             "dress": {"new_value": "dress-designer", "action_required": None},
                             "dress-designer": {"new_value": "dress-designer", "action_required": None},
                             "ensemble": {"new_value": "band", "action_required": None},
                             "event-designer-or-planner": {"new_value": "event-designer",
                                                           "action_required": {"issue": "ambiguous",
                                                                               "options": ["event-designer",
                                                                                           "wedding-planner"],
                                                                               "chose": "event-designer"}},
                             "speech-and-vow-writer": {"new_value": "ceremony-coach", "action_required": None},
                             "event-rentals": {"new_value": "event-rentals", "action_required": None},
                             "florist": {"new_value": "florist", "action_required": None},
                             "gift-ideas": {"new_value": "gifts", "action_required": None},
                             "green-weddings": {"new_value": "green-weddings", "action_required": None},
                             "groom-or-bride-suit-designer": {"new_value": "suit-designer", "action_required": None},
                             "groom-shoe-designer": {"new_value": "shoe-designer", "action_required": None},
                             "groom_suit": {"new_value": "suit-designer", "action_required": None},
                             "guest-accommodations": {"new_value": "guest-accommodations", "action_required": None},
                             "hairstylist": {"new_value": "hairstylist", "action_required": None},
                             "hashtag-author": {"new_value": "hashtag-author", "action_required": None},
                             "headpiece-designer": {"new_value": "headpiece-designer", "action_required": None},
                             "invitations": {"new_value": "invitations", "action_required": None},
                             "dress-shop-or-tailor": {"new_value": "dress-designer",
                                                      "action_required": {"issue": "ambiguous",
                                                                          "options": ["dress-designer",
                                                                                      "bridal-shop"],
                                                                          "default": "dress-designer"}},
                             "jewelry-designer": {"new_value": "jewelry-designer", "action_required": None},
                             "jewelry-shop": {"new_value": "jewelry-shop", "action_required": None},
                             "lighting-sound-design": {"new_value": "lighting-design",
                                                       "action_required": {"issue": "ambiguous",
                                                                           "try": [{"light": "lighting-design"},
                                                                                   {"sound": "sound-design"}],
                                                                           "options": ["event-designer",
                                                                                       "wedding-planner"],
                                                                           "default": "lighting-design"}},
                             "makeup-artist": {"new_value": "makeup-artist", "action_required": None},
                             "officiant": {"new_value": "officiant", "action_required": None},
                             "photobooth-provider": {"new_value": "photobooth-provider", "action_required": None},
                             "photographer": {"new_value": "photographer", "action_required": None},
                             "reception-venue": {"new_value": "venue", "action_required": None},
                             "registry": {"new_value": "registry", "action_required": None},
                             "rehearsal-venue": {"new_value": "venue", "action_required": None},
                             "service-staff": {"new_value": "service-staff", "action_required": None},
                             "social-media-planner": {"new_value": "social-media-planner", "action_required": None},
                             "soloist": {"new_value": "soloist", "action_required": None},
                             "spa": {"new_value": "spa", "action_required": None},
                             "speech-writer": {"new_value": "speech-writer", "action_required": None},
                             "vow-writer": {"new_value": "ceremony-coach", "action_required": None},
                             "spray-tanning": {"new_value": "spray-tanning", "action_required": None},
                             "fashion-stylist": {"new_value": "fashion-stylist", "action_required": None},
                             "stationery-and-signage": {"new_value": "invitations",
                                                        "action_required": {"issue": "multiple",
                                                                            "options": ["invitations", "signage"]}},
                             "stationery-designer-or-calligrapher": {"new_value": "invitations",
                                                                     "action_required": {"issue": "ambiguous",
                                                                                         "options": ["invitations",
                                                                                                     "calligrapher"],
                                                                                         "chose": "invitations"}},
                             "stationary-designer-or-calligrapher": {"new_value": "invitations",
                                                                     "action_required": {"issue": "ambiguous",
                                                                                         "options": ["invitations",
                                                                                                     "calligrapher"],
                                                                                         "chose": "invitations"}},
                             "stationery-designer": {"new_value": "invitations", "action_required": None},
                             "stationery": {"new_value": "invitations", "action_required": None},
                             "transportation": {"new_value": "transportation", "action_required": None},
                             "variety-acts": {"new_value": "variety-acts", "action_required": None},
                             "videographer": {"new_value": "videographer", "action_required": None},
                             "wedding-cakes": {"new_value": "bakery", "action_required": None},
                             "wedding-designer": {"new_value": "event-designer", "action_required": None},
                             "wedding-favors": {"new_value": "wedding-favors", "action_required": None},
                             "wedding-planner": {"new_value": "wedding-planner", "action_required": None},
                             "welcome-party-venue": {"new_value": "venue", "action_required": None},
                             "event-artist": {"new_value": "event-artist", "action_required": None},
                             "special-event-pet-care": {"new_value": "special-event-pet-care", "action_required": None},
                             "precious-metal": {"new_value": "precious-metal", "action_required": None}}

    if grandparent_slug in legacy_business_slugs:
        return legacy_business_slugs[grandparent_slug]

    if parent_slug in legacy_business_slugs:
        return legacy_business_slugs[parent_slug]

    return None


def get_datetime_with_utc(date_time):
    import pytz
    if date_time is None:
        return None

    return date_time.replace(tzinfo=timezone.utc)
    # return datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)


def get_legacy_video_type(post_id):
    video_type = None
    media_id = None

    cursor = connections['migrate'].cursor()
    cursor.execute("select * from postmeta where post_id = " + str(post_id) + " and meta_key in "
                                                                              "('video_short_code','dp_video_code','dp_video_url','dp_video_urll','video_type',"
                                                                              "'video_typee');")
    metas = get_dict(cursor)
    cursor.close()

    for meta in metas:

        # try deciphering the type...
        if 'vimeo' in meta['meta_value']:
            video_type = VideoTypeEnum.vimeo
        if 'youtube' in meta['meta_value']:
            video_type = VideoTypeEnum.youtube
        if 'facebook' in meta['meta_value']:
            video_type = VideoTypeEnum.facebook
        if 'jwplayer' in meta['meta_value']:
            video_type = VideoTypeEnum.jwplayer

    for meta in metas:

        # try deciphering the media ID
        if video_type == VideoTypeEnum.vimeo:
            if meta['meta_key'] == 'dp_video_url':
                return meta['meta_value'].rsplit('/', 1)[-1], video_type
            if meta['meta_key'] == 'video_short_code':
                return meta['meta_value'].rsplit('/', 1)[-1], video_type

        if video_type == VideoTypeEnum.youtube:
            if meta['meta_key'] == 'dp_video_url':
                params = dict(parse.parse_qsl(parse.urlsplit(meta['meta_value']).query))
                if 'v' in params:
                    return params['v'], video_type

        if video_type == VideoTypeEnum.jwplayer:
            if meta['meta_key'] == 'video_short_code':
                word_list = re.sub("[^\w]", " ", meta['meta_value']).split()
                for word in word_list:
                    if word.strip() != 'jwplayer':
                        return word.strip(), video_type

    return media_id, video_type


def add_video_sources_to_video(video, post_id, author, post):
    video_source = VideoSource.objects.filter(legacy_post_id=post_id).first()
    if video_source:
        esv = VideoVideo(video=video, order=1, video_source=video_source)
        esv.save()
    else:
        # this is probably a newlywed video that's not present in the video_library. In this case we:
        # 1) create a new video row
        # 2) assign it to the event story

        media_id, video_type = get_legacy_video_type(post_id)

        if media_id is not None and video_type is not None:

            thumbnail_url = get_legacy_video_thumbnail_url(post_id)
            new_image = None
            if thumbnail_url:
                try:
                    new_image = Image.objects.get(legacy_url=thumbnail_url)
                except Image.DoesNotExist:
                    new_image = Image(legacy_url=thumbnail_url, purpose=ImagePurposeTypes.thumbnail)
                    new_image.save()

            duration = None
            size = None

            legacy_user_id = author.legacy_user_id if author else None

            try:
                new_video = VideoSource(uploader=author,
                                        owner_business=None,
                                        filename=None,
                                        source_url=None,
                                        uploaded_at=None,
                                        process_started_at=None,
                                        process_complete_at=None,
                                        media_id=media_id,
                                        duration=duration,
                                        size=size,
                                        thumbnail=new_image,
                                        legacy_post_id=post_id,
                                        legacy_user_id=legacy_user_id,
                                        type=video_type,
                                        status=VideoStatusEnum.ready,
                                        source=ContentModelSource.legacy,
                                        source_desc="legacy_model_utils migration")
                new_video.save()

                esv = VideoVideo(video=video, order=1, video_source=new_video)
                esv.save()
            except:
                # print(duration)
                # print(size)
                # print(post_id)
                exit(1)
        else:
            logging.getLogger('migration').warning(
                "[NOK] video {} (legacy={}) video not found".format(
                    video.id, video.post.legacy_post_id))


def add_photos_to_video(video, post_id):
    photos = Photo.objects.filter(legacy_post_id=post_id)
    idx = 1
    for photo in photos:
        esv = VideoPhoto(video=video, order=idx, photo=photo)
        esv.save()
        idx += 1


def remove_unwanted_chars(test_str, beyond=True):
    alpha_numeric_filter = ["Short:", ":", "::", "[ ]", "~", "l Las", "//", ",", "@", "{", "}", "/", "=",
                            "A Wedding Film", "Highlight Montage", "Wedding Trailer", "'S ",
                            "'s ", "(", ")", "- 3.10.12", "1", "///", "\\", "A Sunset Wedding", "Short Film",
                            "Castle Hill Wedding", "'Wedding'", "'First Look'", "Highlight", "Wedding",
                            "Teaser", "Trailer", "Cinematic", "Cinematography", "And ", "Belle Mer - Newport",
                            "Autumn Leaves-", " -", "L Las Caletas", "Envelopes", "Custom-Designed", "Sneak Peek",
                            "Engagement", "Grayston Castle", "Styled Shoot", " Film", "First Look",
                            "Promo Video", "Commercial", "Loose Leaf", "Bateau Bridal"]

    for filter_str in alpha_numeric_filter:
        if beyond:
            test_str = test_str.split(filter_str)[0]
        else:
            test_str = test_str.replace(filter_str, "")

    return test_str


def is_alpha(test_str):
    alpha_numeric_filter = ["'", ".", " ", "`", "-"]

    for filter_str in alpha_numeric_filter:
        test_str = test_str.replace(filter_str, "")

    return test_str.isalpha()


def decode_spouse_names(post_title):
    sp1 = None
    sp2 = None

    post_title = post_title.replace("&amp;", " + ").replace("Christe and Niko + Christe and Niko", "Christe + Niko")

    # do we have a perfect healthy string?

    if len(post_title.split('|')) > 1:
        try:
            # get couple names
            sp1 = post_title.split('|')[0].split('+')[0].strip().title()
            sp2 = post_title.split('|')[0].split('+')[1].strip().title()
            sp1 = remove_unwanted_chars(sp1).strip().title()
            sp2 = remove_unwanted_chars(sp2).strip().title()

            if sp1 and sp2 and len(sp1) > 1 and len(sp2) > 1 and len(sp1) > 1 and len(sp1) < 21 \
                    and len(sp2) < 21 and is_alpha(sp1) and is_alpha(sp2):
                return sp1, sp2
        except:
            pass

    # last chance. Simply detect "+" and provide the words just before and after...
    sp1 = post_title.split('+')[0].strip().title()
    sp2 = post_title.split('+')[1].strip().title()

    sp2 = remove_unwanted_chars(sp2, True).strip().title()

    sp1 = sp1.split(' ')[-1]
    sp2 = sp2.split(' ')[0]

    if sp1 and sp2 and len(sp1) > 1 and len(sp2) > 1 and len(sp1) > 1 and len(sp1) < 21 \
            and len(sp2) < 21 and is_alpha(sp1) and is_alpha(sp2):
        return sp1, sp2
    else:
        return None, None

    return sp1, sp2


def add_couple_names_properties_to_post(post):
    # obtain legacy post
    if not post.legacy_post_id:
        return

    cursor = connections['migrate'].cursor()
    cursor.execute("select post_title from posts where ID = " + str(post.legacy_post_id))
    post_title = get_dict(cursor)
    cursor.close()

    # if we have a healthy title record...
    if post_title[0] is not None and post_title[0]['post_title']:
        sp1, sp2 = decode_spouse_names(post_title[0]['post_title'])

        if sp1 and sp2 and sp1 != sp2:

            # sanitize the data further...

            if sp1[-1] in ["'"]:
                sp1 = sp1[:-1]

            if sp2[-1] in ["'"]:
                sp2 = sp2[:-1]

            if not post.properties.filter(key='spouse_1'):
                p = Properties(key='spouse_1', value_text=sp1)
                p.save()
                post.properties.add(p)

            if not post.properties.filter(key='spouse_2'):
                p = Properties(key='spouse_2', value_text=sp2)
                p.save()
                post.properties.add(p)

            logging.getLogger('migration').info(
                "[OK ] post {}, couple names found: {} ❤️ {}".format(
                    str(post.legacy_post_id).rjust(6, ' '), sp1, sp2))

        else:
            logging.getLogger('migration').info(
                "[NOK] post {}, couple names NOT found: {}".format(
                    str(post.legacy_post_id).rjust(6, ' '), post_title[0]['post_title']))

            # mark post with issues
            post.set_suspended_review_required(ACTIVE_REVIEW_BAD_MISSING_COUPLE_NAMES,
                                               "Please make sure the married couple names are correct")


def get_legacy_video_thumbnail_url(post_id):
    if post_id is None:
        return None

    thumbnail_url = None

    cursor = connections['migrate'].cursor()
    cursor.execute("select * from postmeta where post_id = " + str(post_id) + " and meta_key in "
                                                                              "('dp_video_poster','video_poster_image');")
    metas = get_dict(cursor)
    cursor.close()

    for meta in metas:
        if meta['meta_value']:
            if validators.url(meta['meta_value']):
                return meta['meta_value'].strip()

            if meta['meta_value'].isnumeric():
                # get the thumbnail URL from the child post
                cursor = connections['migrate'].cursor()
                cursor.execute("select guid from posts where ID = " + meta['meta_value'])
                d = get_dict(cursor)
                cursor.close()
                if len(d) > 0:
                    return d[0]['guid'].strip()
                else:
                    return "n/a"

    return thumbnail_url


def get_posts(post_type):
    cursor = connections['migrate'].cursor()

    if post_type == 'video':
        cursor.execute("select * from posts where post_title like '% + %' and post_status in ('publish','draft') "
                       "and post_type='post'")

    if post_type == 'article':
        cursor.execute("select * from posts join term_relationships on term_relationships.object_id = posts.ID "
                       "join term_taxonomy tt on term_relationships.term_taxonomy_id = tt.term_taxonomy_id "
                       "join terms on tt.term_id = terms.term_id where post_status in ('publish','draft') "
                       "and terms.name = 'The Highlight Reel' and post_type='post'")

    if post_type == 'page':
        cursor.execute("select * from posts where post_status in ('publish','draft') and post_type='page'")

    d = get_dict(cursor)
    cursor.close()
    return d


def get_post_categories(post_id):
    cursor = connections['migrate'].cursor()
    cursor.execute(
        "select terms.term_id, terms.name, t1.term_id as parent_id, t1.name as parent, t1.slug as parent_slug, "
        "t2.term_id as grandparent_id, t2.name as grandparent, t2.slug as grandparent_slug from posts join term_relationships "
        "on term_relationships.object_id = posts.ID join term_taxonomy on term_taxonomy.term_taxonomy_id = "
        "term_relationships.term_taxonomy_id join terms on terms.term_id = term_taxonomy.term_id "
        "left join terms t1 on t1.term_id = term_taxonomy.parent "
        "left join term_taxonomy tx1 on tx1.term_id = t1.term_id "
        "left join terms t2 on t2.term_id = tx1.parent "
        "where posts.ID = " + str(post_id) + " and (t1.term_id is null or t1.term_id not in (109, 108));")
    return get_dict(cursor)


def get_post_meta(post):
    from django.conf import settings
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from postmeta where meta_key in ('processional_song','spouse_name','wedding_date',"
                   "'wedding_hash_tag','your_facebook_page','bride_or_groom_email','your_instagram_handle',"
                   "'your_spouse_instagram_handle') and post_id = " + str(post['ID' if settings.DEBUG else 'id']))
    d = get_dict(cursor)
    cursor.close()
    return d


def get_video_post_businesses(post):
    from django.conf import settings
    video_businesses = []

    # get all associated terms with the post
    post_cats = get_post_categories(post['ID' if settings.DEBUG else 'id'])

    for post_cat in post_cats:
        if post_cat['parent_id'] in business_parent_cats or post_cat['grandparent_id'] in business_parent_cats:

            # trying to match venue type for the business(venue) <- -> event story
            venue_type = BusinessVenueType.objects.filter(slug=post_cat['parent_slug'].replace("-ceremony", "")).first()

            # filter out some known issues with LSTV1 data...
            if post_cat['parent_slug'] == 'make-it-a-hit':
                continue

            # is this a direct business or custom business association (e.g. direct = videographer. custom
            # business association = "Bride Shoe Designer" leading to a direct business "Shoe Designer"

            if post_cat['grandparent_id']:
                business_capacity_type = VideoBusinessCapacityType.objects.filter(
                    Q(legacy_term_id__icontains=post_cat['parent_id']) |
                    Q(legacy_term_id__icontains=post_cat['grandparent_id'])).first()
            else:
                business_capacity_type = VideoBusinessCapacityType.objects.filter(
                    Q(legacy_term_id__icontains=post_cat['parent_id'])).first()

            business = Business.objects.filter(legacy_term_id=post_cat['term_id']).first()
            if not business:
                business = Business.objects.filter(slug__iexact=slugify_2(post_cat['name'].strip().lower())).first()

            if business:
                business_role_type = None
                assert business.roles.count() > 0
                if business.roles.count() == 1:
                    business_role_type = business.roles.all()[0]
                elif business.roles.count() > 1:
                    # # print("business name:              " + business.name)
                    # if business_capacity_type:
                    #    # print("as capacity role:         " + business_capacity_type.slug)
                    # # print("parent/grandparent slugs: " + post_cat['parent_slug'] + " " + (
                    #    post_cat['grandparent_slug'] if post_cat['grandparent_slug']
                    #    else "n/a"))

                    # for role in business.roles.all():
                    #    # print("possible role:            " + role.name + " (" + role.slug + ")")

                    if business_capacity_type:
                        business_role_type = business_capacity_type.business_role_type
                    # # print("chosen role:              " + business_role_type.name)
                    else:
                        # choose a business role type based on

                        for role_type in business.roles.all():
                            if role_type.slug == post_cat['parent_slug'] \
                                    or role_type.slug == post_cat['grandparent_slug']:
                                business_role_type = role_type
                                # # print("chosen role (direct):       " + business_role_type.name)
                                break

                        if not business_role_type:
                            # try alternative mapping (old parents to new parents, with the knowledge of
                            # the user_type_categories LSTV1 table...

                            new_parent_slug = translate_legacy_parent(post_cat['parent_slug'], None)
                            # # print("new parent slug:           " + new_parent_slug['new_value'])
                            business_role_type = BusinessRoleType.objects.filter(
                                slug=new_parent_slug['new_value']).first()

                # # print("----------------------------------")

                video_business = VideoBusiness(
                    business=business,
                    business_capacity_type=business_capacity_type,
                    business_role_type=business_role_type,
                    source=ContentModelSource.legacy,
                    source_desc="legacy_model_utils migration",
                    venue_type=venue_type)

                video_businesses.append(video_business)

                logging.getLogger('migration').info(
                    "[OK ] post {}, business found, {} ({}) as {}".format(
                        post['ID' if settings.DEBUG else 'id'],
                        business.name,
                        business.legacy_term_id,
                        business_capacity_type.name if business_capacity_type else "<itself>"
                    ))

            else:
                logging.getLogger('migration').info(
                    "[NOK] post {}, business not found: {} ({})".format(
                        str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '), post_cat['name'], post_cat['term_id']))

    return video_businesses


def is_location_related(post_cat):
    return post_cat['grandparent_id'] in [560, 150] or post_cat['parent_id'] in [137, 135, 560, 150, 11302]


def get_post_vibes(post):
    from django.conf import settings
    vibes = []

    # get all associated terms with the post
    post_cats = get_post_categories(post['ID' if settings.DEBUG else 'id'])

    for post_cat in post_cats:

        if post_cat['parent_id'] not in business_parent_cats and post_cat['grandparent_id'] not in business_parent_cats:
            vibe = TagType.objects.filter(legacy_term_id=post_cat['term_id']).first()

            if vibe:
                vibes.append(vibe)
                logging.getLogger('migration').info(
                    "[OK ] post {}, vibe found, {} ({})".format(
                        post['ID' if settings.DEBUG else 'id'], vibe.name, vibe.legacy_term_id))
            else:
                # before issuing a warning because this vibe is not in the approved vibe types list, make sure
                # it's not a legacy LOCATION vibe, which is processed elsewhere.
                if not is_location_related(post_cat) and post_cat['parent_id'] not in [10651, 10652, 17287]:
                    logging.getLogger('migration').warning(
                        "[NOK] post {}, vibe not LSTV2: {} ({}) [{} ({})]-"
                        ">[{} ({})]".format(
                            str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '),
                            post_cat['name'],
                            post_cat['term_id'],
                            post_cat['parent'] if post_cat['parent'] else "n/a",
                            post_cat['parent_id'] if post_cat['parent_id'] else "n/a",
                            post_cat['grandparent'] if post_cat['grandparent'] else "n/a",
                            post_cat['grandparent_id'] if post_cat['grandparent_id'] else "n/a"))
                else:
                    pass
    return vibes


def get_post_location(post):
    from django.conf import settings
    city = None
    state_province = None
    country = None

    loc_cats = []

    # get all associated terms with the post
    post_cats = get_post_categories(post['ID' if settings.DEBUG else 'id'])

    # obtain post city, state/province and country where available.

    for post_cat in post_cats:
        if is_location_related(post_cat):
            loc_cats.append(post_cat)
            # # print(post_cat)

    if len(loc_cats) > 0:
        for loc in loc_cats:

            if loc['parent_id'] in [150]:
                country = title_with_caps(loc['name'])

            if loc['parent_id'] in [11302]:
                city = title_with_caps(loc['name'])

            if loc['parent_id'] in [560]:

                if loc['name'] in country_list:

                    country = title_with_caps(loc['name'])
                else:
                    state_province = loc['name']
                    if loc['name'] in us_states_abbr or loc['name'] in us_states:
                        country = "United States"

            if loc['grandparent_id'] == 560:

                if loc['parent'] in country_list:
                    country = title_with_caps(loc['parent'])
                    city = title_with_caps(loc['name'])
                else:
                    state_province = title_with_caps(loc['parent'])
                    city = title_with_caps(loc['name'])

                if state_province in us_states or state_province in us_states_abbr:
                    country = "United States"

        if country == 'Georgia':
            country = None
            state_province = 'Georgia'
            country = "United States"

    # sanitize the city name

    if city and ',' in city:
        city = city.partition(",")[0].strip()

    # if city is numerical, discard it.

    if city and city.isnumeric():
        city = None

    # initially, write data as is to the location. an async background process will then sanitize it, and convert
    # it into legitimate geo_db keys.

    return Location(legacy_city=city,
                    legacy_state_province=state_province,
                    legacy_country=country,
                    legacy_migrated=True)


def get_post_author(post):
    return User.objects.filter(legacy_user_id=post['post_author']).first()


def get_post_songs(post):
    from django.conf import settings
    songs = []

    # get all associated terms with the post
    post_cats = get_post_categories(post['ID' if settings.DEBUG else 'id'])

    for post_cat in post_cats:
        if post_cat['parent_id'] == 10651:
            song = Song.objects.filter(legacy_term_ids__contains=[post_cat['term_id']]).first()

            if song:
                songs.append(song)
                logging.getLogger('migration').info(
                    "[OK ] post {}, song found, {} by {} ({})".format(
                        post['ID' if settings.DEBUG else 'id'], song.title, song.song_performer.name,
                        song.legacy_term_ids))
            else:
                logging.getLogger('migration').warning(
                    "[NOK] post {}, song not LSTV2: {} ({}) [{} ({})]-"
                    ">[{} ({})]".format(
                        str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '),
                        post_cat['name'],
                        post_cat['term_id'],
                        post_cat['parent'] if post_cat['parent'] else "n/a",
                        post_cat['parent_id'] if post_cat['parent_id'] else "n/a",
                        post_cat['grandparent'] if post_cat['grandparent'] else "n/a",
                        post_cat['grandparent_id'] if post_cat['grandparent_id'] else "n/a"))

    return songs


def process_post(mode, post):
    from django.conf import settings
    video_businesses = get_video_post_businesses(post)
    vibes = get_post_vibes(post)
    post_meta = get_post_meta(post)
    new_location = get_post_location(post)
    author = get_post_author(post)
    songs = get_post_songs(post)

    if not author:
        logging.getLogger('migration').warning(
            "[NOK] post {}: can't obtain legacy author user ({})".format(
                str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '),
                post['post_author']
            ))
    else:
        logging.getLogger('migration').info(
            "[OK ] post {}: legacy author user ({}) - new ID: {} ".format(
                str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '),
                post['post_author'],
                author.id
            ))

    # create post object
    new_post = Post(title=post['post_title'],
                    slug=post['post_name'],
                    type=mode,
                    author=author,
                    legacy_post_id=post['ID' if settings.DEBUG else 'id'],
                    legacy_url="/" + post['post_name'] + "/",
                    source=ContentModelSource.legacy,
                    source_desc="legacy_model_utils migration")

    if post['post_status'] == 'draft':
        new_post.visibility = PostVisibilityEnum.draft

    if mode == PostTypeEnum.video:
        # remove title in case this post is an event story. We generate titles from the data in this case...
        new_post.title = None

    new_post.save()
    # pre-date created_at to actual legacy post created_at
    new_post.predate_created_at(post['post_date_gmt'])

    # retain post_meta in
    for post_meta_obj in post_meta:
        new_post_prop = Properties(key='legacy_' + post_meta_obj['meta_key'],
                                   value_text=post_meta_obj['meta_value'])
        new_post_prop.save()
        new_post.properties.add(new_post_prop)

    if mode == PostTypeEnum.video:
        # remove title

        # create event story for legacy video...
        new_location.save()
        video = Video(post=new_post,
                      title=post['post_title'],
                      content=post['post_content'],
                      type=VideoType.objects.filter(slug='wedding-ceremony-and-reception').first(),
                      location=new_location,
                      source=ContentModelSource.legacy,
                      source_desc="legacy_model_utils migration")
        video.save()
        video.predate_created_at(post['post_date_gmt'])
        if new_location is None:
            video.set_active_review_required(ACTIVE_REVIEW_NO_LOCATION_INFORMATION,
                                             "No location information for video")

        # add businesses to event story
        for video_business in video_businesses:
            video_business.save()
            video.businesses.add(video_business)


        # add vibes to event story
        for vibe in vibes:
            video.vibes.add(vibe)

        # add songs to event story
        for song in songs:
            video.songs.add(song)

        # update with businesses and vibes
        video.save()


        # add video to event story
        add_video_sources_to_video(video, post['ID' if settings.DEBUG else 'id'], author, post)

        # add video to event story
        add_photos_to_video(video, post['ID' if settings.DEBUG else 'id'])


        logging.getLogger('migration').info(
            "[OK ] {} video post {}: {} businesses, {} vibes".format(
                mode,
                str(post['ID' if settings.DEBUG else 'id']).rjust(6, ' '),
                len(video_businesses),
                len(vibes)
            ))


        # add couple names to the post properties
        add_couple_names_properties_to_post(new_post)

    elif mode == PostTypeEnum.article:
        # get businesses
        video_businesses = get_video_post_businesses(post)

        thumbnail_url = get_legacy_video_thumbnail_url(post['ID' if settings.DEBUG else 'id'])
        new_image = None
        if thumbnail_url:
            try:
                new_image = Image.objects.get(legacy_url=thumbnail_url)
            except Image.DoesNotExist:
                new_image = Image(legacy_url=thumbnail_url, purpose=ImagePurposeTypes.thumbnail)
                new_image.save()

        article = Article(post=new_post, content_legacy=post['post_content'], thumbnail=new_image)

        article.save()
        article.predate_created_at(post['post_date_gmt'])
        if new_location is not None:
            new_location.save()
            article.locations.add(new_location)

        # add businesses to event story
        for video_business in video_businesses:
            article.businesses.add(video_business.business)

        # add vibes to event story
        for vibe in vibes:
            article.tags.add(vibe)

    # mark as done
    mark_post_as_migrated(post['ID' if settings.DEBUG else 'id'], "success")


def get_dict(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def add_vibes_per_vibe_type(vibe_type):
    for id in vibe_type.legacy_term_ids:
        cursor = connections['migrate'].cursor()
        cursor.execute("select * from terms join term_taxonomy on term_taxonomy.term_id = terms.term_id where parent "
                       "= " + str(id))
        vibes = get_dict(cursor)
        cursor.close()
        for vibe in vibes:
            try:
                new_vibe = TagType(name=vibe['name'],
                                   slug=slugify_2(vibe['name']),
                                   legacy_term_id=vibe['term_id'],
                                   legacy_url=vibe['legacy_url'].replace('https://lovestoriestv.com', '').
                                   replace('http://localhost', ''),
                                   tag_family_type=vibe_type)
                new_vibe.save()
            except IntegrityError:
                new_vibe = TagType(name=vibe['name'],
                                   slug=slugify_2(vibe_type.name + "-" + vibe['name']),
                                   legacy_term_id=vibe['term_id'],
                                   legacy_url=vibe['legacy_url'].replace('https://lovestoriestv.com', '').
                                   replace('http://localhost', ''),
                                   tag_family_type=vibe_type)
                new_vibe.save()
                logging.getLogger('migration').info("[OK ] renaming vibe slug for uniqueness: {} ({}) to {}".format(
                    vibe['name'], vibe_type.name, new_vibe.slug))


def quick_email_verification(email):
    return True, "valid"


def sanitize_validate_venue_info(key, value, venue_name):
    value = value.strip().lower()
    key = key.strip().lower()

    if key in ['reception_venue_email', 'ceremony_venue_email']:
        # validate email
        if validators.email(value):
            email_verified, result = quick_email_verification(value)
            if email_verified:
                return value
            else:
                logging.getLogger('migration').warning(
                    "[NOK] rejecting venue email {} ({}) - Email valid but fails verification ({})".format(
                        value, venue_name, result))
                return None
        else:
            logging.getLogger('migration').warning("[NOK] rejecting venue email {} ({}) - invalid format".
                                                   format(value, venue_name))
            return None

    if key in ['reception_venue_website', 'ceremony_venue_website']:
        if validators.url(value):
            return value
        else:
            logging.getLogger('migration').warning(
                "[NOK] rejecting venue url {} ({}) - invalid format".format(value, venue_name))
            return None


def mark_term_as_migrated(term_id, migrate_result, migrate_comment=None):
    return
    cursor = connections['migrate'].cursor()
    if migrate_comment is None:
        migrate_comment = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    cursor.execute("update terms set migrated = true, migrated_comment=%s, migrated_result=%s where term_id = %s",
                   (migrate_comment, migrate_result, term_id,))
    cursor.close()


def mark_post_as_migrated(post_id, migrate_result, migrate_comment=None):
    return
    cursor = connections['migrate'].cursor()
    if migrate_comment is None:
        migrate_comment = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    cursor.execute("update posts set migrated = true, migrated_comment=%s, migrated_result=%s where ID = %s",
                   (migrate_comment, migrate_result, post_id,))
    cursor.close()


def mark_user_as_migrated(user_id, migrate_result, migrate_comment=None):
    return
    cursor = connections['migrate'].cursor()
    if migrate_comment is None:
        migrate_comment = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    cursor.execute("update users set migrated = true, migrated_comment=%s, migrated_result=%s where ID = %s",
                   (migrate_comment, migrate_result, user_id,))
    cursor.close()


def mark_video_as_migrated(video_id, migrate_result, migrate_comment=None):
    return
    cursor = connections['migrate'].cursor()
    if migrate_comment is None:
        migrate_comment = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    cursor.execute("update video_library set migrated = true, migrated_comment=%s, migrated_result=%s where ID = %s",
                   (migrate_comment, migrate_result, video_id,))
    cursor.close()


def mark_view_log_as_migrated(id):
    return
    cursor = connections['migrate'].cursor()
    cursor.execute("update post_views_detail set migrated = true where id = %s",
                   (id,))
    cursor.close()


def mark_photo_as_migrated(photo_id, migrate_result, migrate_comment=None):
    return
    cursor = connections['migrate'].cursor()
    cursor.execute("update photo_library set migrated = true where ID = %s", (photo_id,))
    cursor.close()


def cleanup_legacy_migration_flags(hard=False):
    return
    # print("cleaning out migrated flag in legacy database")
    # print("terms...")
    cursor = connections['migrate'].cursor()
    cursor.execute("update terms set migrated=0, migrated_result=0, migrated_comment=null where migrated=1")
    cursor.close()
    # print("users...")
    cursor = connections['migrate'].cursor()
    cursor.execute("update users set migrated=0, migrated_result=null, migrated_comment=null where migrated=1")
    cursor.close()
    # print("posts...")
    cursor = connections['migrate'].cursor()
    cursor.execute("update posts set migrated=false, migrated_result=null, migrated_comment=null where migrated=true")
    cursor.close()
    # print("videos...")
    cursor = connections['migrate'].cursor()
    cursor.execute(
        "update video_library set migrated=0, migrated_result=null, migrated_comment=null where migrated=1")
    cursor.close()
    # print("photo_library...")
    cursor = connections['migrate'].cursor()
    cursor.execute("update photo_library set migrated=0 where migrated=1")
    cursor.close()
    # print("post_view_details...")
    cursor = connections['migrate'].cursor()
    cursor.execute("update post_views_detail set migrated=0  where migrated=1")
    cursor.close()

    if hard:
        cursor = connections['migrate'].cursor()
        cursor.execute("update post_views_detail set migrated=false where migrated=true")
        cursor.close()


def generate_random_password():
    return ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])


def get_legacy_user(user_id):
    cursor = connections['migrate'].cursor()
    cursor.execute('select * from users where ID = %s', (user_id,))

    # mark as migrated
    dc = get_dict(cursor)
    if len(dc) > 0:
        d = dc[0]
    else:
        d = None
    cursor.close()
    c1 = connections['migrate'].cursor()
    # c1.execute('update users set migrated = true where ID = %s', (user_id,))
    c1.close()
    return d


def create_business_from_legacy(business, business_type, business_props, venue_type, venue_emails_websites):
    # sanitize business

    # do we have a business by that name + role? skip!
    # r1 = BusinessRoleType.objects.filter(slug=business_type['new_value']).first()
    # bc = Business.objects.filter(roles=r1, slug=business['slug']).count()
    # if bc > 0:
    #     return

    if business['parent_id'] == 17328:
        # # print("Skipping Business (rupers rochestra cancer) " + business['name'])
        mark_term_as_migrated(business['term_id'], "skip", "Ruperts bug")
        logging.getLogger('migration').warning("[NOK] Skipping {} - Ruperts Orchestra Bug".format(business['name']))
        return False

    if len(business['name']) > 100:
        mark_term_as_migrated(business['term_id'], "skip", "Name Too Long")
        logging.getLogger('migration').warning("[NOK] Skipping {} - Name too long".format(business['name']))
        return False

    # if business['term_id'] == 42962:
    #     # # print("Skipping Business (platimum) " + business['name'])
    #     mark_term_as_migrated(business['term_id'], "skip", "Platinum/metal")
    #     logging.getLogger('migration').warning(
    #         "[NOK] Skipping {} - Skipping Platinum/Precious-Metal as business".format(business['name']))
    #     return False

    if venue_type is not None:
        vt = BusinessVenueType.objects.filter(slug=venue_type).first()
        if vt is None:
            mark_term_as_migrated(business['term_id'], "skip",
                                  "Skipping for invalid venue type: " + business['parent_slug'])
            logging.getLogger('migration').warning(
                "[NOK] Skipping {} - invalid venue type: {}".format(business['name'], business['parent_slug']))
            return False

    new_users = []
    email_validation_record = None

    # sanitizing business

    business['slug'] = business['slug'].strip()
    business['name'] = title_with_caps(business['name']).strip()

    if business_props is not None:

        for user_id in business_props['user_id']:
            user = get_legacy_user(user_id)

            if user is None:
                continue

            # sanitizing user
            user['user_email'] = user['user_email'].lower().strip()

            # sanitize business props

            if 'last_name' in business_props:
                business_props['last_name']['value'] = business_props['last_name']['value'].strip().capitalize()

            if 'first_name' in business_props:
                business_props['first_name']['value'] = business_props['first_name']['value'].strip().capitalize()

            # create users: basic data

            try:
                new_user = User(email=user['user_email'], legacy_password=user['user_pass'],
                                legacy_user_id=user['ID' if settings.DEBUG else 'id'],
                                user_type=UserTypeEnum.business_team_member, source=ContentModelSource.legacy,
                                source_desc="legacy_model_utils migration")
                new_user.set_password(generate_random_password())
                new_user.save()
                mark_user_as_migrated(user['ID' if settings.DEBUG else 'id'], "success")

                # first and last names

                if 'first_name' in business_props and len(business_props['first_name']['value']) <= 45:
                    new_user.first_name = business_props['first_name']['value']
                if 'last_name' in business_props and len(business_props['last_name']['value']) <= 45:
                    new_user.last_name = business_props['last_name']['value']

                # update created_at time to match real legacy user

                date_time_obj = datetime.strptime(str(user['user_registered']), '%Y-%m-%d %H:%M:%S').replace(
                    tzinfo=timezone.utc)
                new_user.created_at = date_time_obj

                # verify email validity

                # TODO: UNCOMMENT
                # email_validation_record = verify_email_address(user['user_email'])
                # email_validation_record.save()
                # new_user.email_verification = email_validation_record

                # finally save all updates
                new_user.save()

                # retain new user record
                new_users.append(new_user)

            except IntegrityError:
                new_user = User.objects.filter(email=user['user_email']).first()
                # append to business team members list
                new_users.append(new_user)

    # # print(" |__ EXISTING: trying to create a user with existing email: {0} ".format(user['user_email']))

    # attach e-mail validation record TODO: Uncomment
    # email_validation_record.save()
    # new_user.email_verification = email_validation_record

    # Create or re-load business

    business_role_type = BusinessRoleType.objects.filter(slug=business_type['new_value']).first()
    new_business = None

    business_state = ContentModelState.active
    business_state_desc = None

    # record business location

    if business_type['action_required']:
        if business_type['action_required']['issue'] == 'ambiguous':
            business_state = ContentModelState.active_review
            d = business_type['action_required']
            d['resolved'] = False
            d['key'] = ACTIVE_REVIEW_AMBIGUOUS_BUSINESS_ROLE
            business_state_desc = [json.dumps(d)]
    try:
        new_business = Business(name=business['name'], slug=slugify_2(business['name']),
                                legacy_term_id=business['term_id'], source=ContentModelSource.legacy,
                                legacy_url=business['legacy_url'].replace('https://lovestoriestv.com', '').
                                replace('http://localhost', ''),
                                legacy_channel_uuid=business['term_uuid'],
                                source_desc="legacy_model_utils migration", state=business_state,
                                state_desc=business_state_desc)
        new_business.save()
        # custom image?

        if business_props and 'your_business_photo' in business_props:
            try:
                new_profile_image = Image.objects.get(legacy_url=business_props['your_business_photo']['value'])
            except Image.DoesNotExist:
                new_profile_image = Image(legacy_url=business_props['your_business_photo']['value'],
                                          purpose=ImagePurposeTypes.thumbnail)
                new_profile_image.save()

            new_business.profile_image = new_profile_image

        new_business.roles.add(business_role_type)

        # import legacy business location -> list of business bl's.

        bl = get_legacy_business_business_location(business['name'])
        if bl:
            vl = BusinessLocation(business=new_business, location=bl)
            vl.save()

        # custom promo video?

        if business['promo_video_media_id']:
            new_video = VideoSource(uploader=None,
                                    purpose=VideoPurposeEnum.business_promo_video,
                                    owner_business=new_business,
                                    filename=None,
                                    source_url=None,
                                    uploaded_at=None,
                                    process_started_at=None,
                                    process_complete_at=None,
                                    media_id=business['promo_video_media_id'],
                                    duration=None,
                                    size=None,
                                    thumbnail=None,
                                    legacy_post_id=None,
                                    legacy_user_id=None,
                                    type=VideoTypeEnum.jwplayer,
                                    status=VideoStatusEnum.ready,
                                    source=ContentModelSource.legacy,
                                    source_desc="legacy_model_utils migration")
            new_video.save()

    except IntegrityError:
        new_business = Business.objects.filter(slug=slugify_2(business['name'])).first()
        if new_business is not None:
            # only add a role type that doesn't exist.
            if business_role_type not in new_business.roles.all():
                new_business.roles.add(business_role_type)
            if business_type['action_required']:
                new_business.set_active_review_required(ACTIVE_REVIEW_AMBIGUOUS_BUSINESS_ROLE,
                                                        business_type['action_required'])
            new_business.save()
    except AttributeError:
        # print(business)
        exit(1)

    try:
        # record legacy URL in properties

        vp = Properties(key="legacy_channel_url",
                        source=ContentModelSource.legacy,
                        source_desc="legacy_model_utils migration",
                        value_text=business['legacy_url'].replace('https://lovestoriestv.com', '').
                        replace('http://localhost', ''))
        vp.save()
        new_business.properties.add(vp)

        # record all business props of interest

        if business_props:
            for vprop in business_props:
                if 'value' in business_props[vprop]:
                    vp = Properties(key="legacy_" + vprop,
                                    source=ContentModelSource.legacy,
                                    source_desc="legacy_model_utils migration",
                                    value_text=str(business_props[vprop]['value']))
                    vp.save()
                    new_business.properties.add(vp)

                    if vprop == 'your_business_description':
                        new_business.description = str(business_props['your_business_description']['value'])
                        new_business.save()

    except DataError:
        logging.getLogger('migration').critical(
            "[NOK] error saving business properties: legacy_url: {} ({})".format(business['name'],
                                                                                 business['term_id']))
    except IntegrityError:
        logging.getLogger('migration').critical(
            "[NOK] error saving business properties: legacy_url: {} ({})".format(business['name'],
                                                                                 business['term_id']))
    except AttributeError as e:
        logging.getLogger('migration').error(
            "[NOK] missing business legacy_url: {} ({})".format(business['name'],
                                                                business['term_id']))

    # attaching users as business team members

    admin_member_role_type = BusinessTeamMemberRoleType.objects.filter(slug='admin').first()

    for team_member in new_users:
        if len(BusinessTeamMember.objects.filter(user=team_member, business=new_business)) == 0:
            new_team_member = BusinessTeamMember(user=team_member, business=new_business)
            new_team_member.save()
            new_team_member.roles.add(admin_member_role_type)

    # any badges or special attributes?

    if business['term_tier'] == 1:
        vp = Properties(key=LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP,
                        source=ContentModelSource.backend,
                        source_desc="legacy_model_utils migration")
        vp.save()
        new_business.properties.add(vp)

    if business['embedding_allowed'] == 1:
        vp = Properties(key=LSTV_PROPERTY_PERMISSION_EMBED_CHANNEL,
                        source=ContentModelSource.backend,
                        source_desc="legacy_model_utils migration")
        vp.save()
        new_business.properties.add(vp)

    if business['term_tier'] > 0:
        new_business.subscription_level = BusinessSubscriptionLevel.objects.get(slug='plus')
    else:
        new_business.subscription_level = BusinessSubscriptionLevel.objects.get(slug='free')
    new_business.save()

    # dealing with possible venue types and venue emails/websites

    if venue_type is not None:
        vt = BusinessVenueType.objects.filter(slug=venue_type).first()
        if vt not in new_business.venue_types.all():
            business_venue_type_info = BusinessVenueTypeInfo(business=new_business, venue_type=vt)
            business_venue_type_info.save()
            # new_business.venue_types.add(business_venue_type_info)
            # new_business.save()

    if len(new_users) == 0 and venue_emails_websites is not None:
        for venue_info in venue_emails_websites:
            if venue_info['meta_key'] and venue_info['meta_value']:
                venue_info['meta_key'] = venue_info['meta_key'].strip().lower()
                venue_info['meta_value'] = venue_info['meta_value'].strip().lower()
                value = sanitize_validate_venue_info(venue_info['meta_key'],
                                                     venue_info['meta_value'],
                                                     new_business.name)
                if value is not None:
                    # add information in business properties
                    vp = Properties(key="legacy_" + venue_info['meta_key'],
                                    source=ContentModelSource.backend,
                                    source_desc="legacy_model_utils migration",
                                    value_text=value)
                    vp.save()
                    new_business.properties.add(vp)

    # mark business as migrated
    mark_term_as_migrated(business['term_id'], "success")

    # logging as done...
    # logging.getLogger('migration').info("[OK ] Business {} ({}) migrated. Legacy term_id: {} type: {}".format(
    #    business['name'], business_type['new_value'], business['term_id'], business['parent_slug']))

    return True


def get_legacy_videos():
    cursor = connections['migrate'].cursor()
    cursor.execute(
        "select * from video_library where status not in ('queued','new','in progress')")
    d = get_dict(cursor)
    cursor.close()
    return d


def get_legacy_photos():
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from photo_library")
    d = get_dict(cursor)
    cursor.close()
    return d


def add_vibe_family_type(name, legacy_term_id):
    new_vibe_type = TagFamilyType(name=name, slug=slugify_2(name), legacy_term_ids=legacy_term_id)
    new_vibe_type.save()
    return new_vibe_type


def get_num_legacy_songs_artists():
    cursor = connections['migrate'].cursor()
    cursor.execute("select count(*) from terms join term_taxonomy on term_taxonomy.term_id = terms.term_id where "
                   "parent in (10651,10652)")
    d = get_dict(cursor)
    cursor.close()
    return d


def get_all_posts_with_songs():
    cursor = connections['migrate'].cursor()
    cursor.execute("select object_id as id from term_taxonomy "
                   "join term_relationships on term_relationships.term_taxonomy_id = term_taxonomy.term_taxonomy_id "
                   "join posts on posts.ID = term_relationships.object_id "
                   "where parent in (10651, 10652) group by object_id;")
    d = get_dict(cursor)
    cursor.close()
    return d


def get_songs_from_legacy_post(post_id):
    cursor = connections['migrate'].cursor()
    cursor.execute("select terms.term_id, terms.name as name, t1.slug as type from term_relationships "
                   "join term_taxonomy on term_taxonomy.term_taxonomy_id = term_relationships.term_taxonomy_id "
                   "join terms on terms.term_id = term_taxonomy.term_id join term_taxonomy as tx1 on tx1.term_id = "
                   "term_taxonomy.parent join terms as t1 on t1.term_id = tx1.term_id where object_id = " +
                   str(
                       post_id) + " and term_taxonomy.parent in (10651,10652) order by t1.name, "
                                  "terms.term_id;")
    d = get_dict(cursor)
    cursor.close()
    return d


def get_uploader_for_legacy_video_library_row(user_id, video):
    cursor = connections['migrate'].cursor()
    cursor.execute("select user_email from users where ID=" + str(user_id))
    d = get_dict(cursor)
    cursor.close()

    if d:
        email = d[0]['user_email']

        if email:
            user = User.objects.filter(email=email.strip().lower()).first()
            if not user:
                # could it be a dangling video library user_id without a corresponding TERM?

                # get business name if available...
                business_name = get_business_name_from_user_id(user_id)
                if business_name:
                    # see if business name exists in terms ...
                    term_id = get_term_from_business_name(business_name)
                    if term_id:
                        logging.getLogger('migration').critical(
                            "[NOK] [{}] legacy user_id found ({}), business found {} but no business wasn't imported!".
                                format(video['status'], email, business_name))
                        return None
                    else:
                        logging.getLogger('migration').warning(
                            "[NOK] [{}] legacy user_id found ({}), but no business term associated with business name {}".
                                format(video['status'], email, business_name))
                        return None
                else:
                    logging.getLogger('migration').warning(
                        "[NOK] [{}] can't locate uploader {} (id:{}) for video if {}".
                            format(video['status'], email, video['user_id'],
                                   video['filename']))
                    return None
            else:
                return user
        else:

            logging.getLogger('migration').warning(("[NOK] [{}] legacy user id {} has no legacy user record".format(
                video['status'], video['user_id'])))
            return None
    else:

        logging.getLogger('migration').warning("[NOK] [{}] legacy email id {} has no legacy user record".format(
            video['status'], video['user_id']))
        return None


def get_legacy_businesses_from_business_type(business_type, just_count=False, just_migrated='false'):
    term_ids = '(' + str(business_type['term_id'])
    if 'override' in business_type:
        term_ids += ', ' + business_type['override'] + ')'
    else:
        term_ids += ')'

    cursor = connections['migrate'].cursor()
    if just_count is False:
        cursor.execute(
            "select terms.term_id, terms.name, terms.term_uuid, terms.promo_video_media_id, terms.slug, terms.term_tier, terms.embedding_allowed, "
            "terms.legacy_url, term_taxonomy.parent as parent_id, parent_term.name as parent_name, "
            "parent_term.slug as parent_slug, tx1.parent as grandparent_id, grandparent_term.name as "
            "grandparent_name, grandparent_term.slug as grandparent_slug, terms.migrated, "
            "terms.migrated_result from terms left join term_taxonomy on term_taxonomy.term_id = "
            "terms.term_id left join terms as parent_term on parent_term.term_id = term_taxonomy.parent "
            "left join term_taxonomy as tx1 on tx1.term_id =parent_term.term_id left join terms as "
            "grandparent_term on grandparent_term.term_id = tx1.parent where  (term_taxonomy.parent "
            "in " + term_ids + " or tx1.parent in " + term_ids + ")  and  term_taxonomy.parent not "
                                                                 "in (109,108)  and terms.legacy_url is not null order by term_tier desc")
    else:
        cursor.execute("select count(*) as weight from terms left join term_taxonomy on term_taxonomy.term_id = "
                       "terms.term_id left join terms as parent_term on parent_term.term_id = term_taxonomy.parent "
                       "left join term_taxonomy as tx1 on tx1.term_id =parent_term.term_id left join terms as "
                       "grandparent_term on grandparent_term.term_id = tx1.parent where  (term_taxonomy.parent "
                       "in " + term_ids + " or tx1.parent in " + term_ids + ") and term_taxonomy.parent not "
                                                                            "in (109,108) and terms.legacy_url is not null")

    # # print(cursor._last_executed)

    d = get_dict(cursor)
    cursor.close()
    return d, term_ids


def get_num_legacy_businesses(slug=None):
    rc = 0
    v1_business_types = get_business_types(slug)
    title = "- Estimating Business Types & Weight"
    with alive_bar(len(v1_business_types), title, bar="blocks", length=10) as bar:
        for business_type in v1_business_types:
            results, term_ids = get_legacy_businesses_from_business_type(business_type, True)
            rc += results[0]['weight']
            bar()
    return rc


def resolve_business_properties_between(one, two):
    if len(one['value'].strip()) == len(two['value'].strip()):
        # do this by weight...

        cursor = connections['migrate'].cursor()
        cursor.execute("select count(*) as count from posts where post_author = " + str(one['user_id']))
        weight_one = get_dict(cursor)[0].get('count', 0)
        cursor.close()

        cursor = connections['migrate'].cursor()
        cursor.execute("select count(*) as count from posts where post_author = " + str(two['user_id']))
        weight_two = get_dict(cursor)[0].get('count', 0)
        cursor.close()

        if weight_one > weight_two:
            return one
        else:
            return two

    if len(one['value'].strip()) > len(two['value'].strip()):
        return one
    else:
        return two


def get_business_types(slugs=None):
    cursor = connections['migrate'].cursor()
    if not slugs:
        cursor.execute('select terms.term_id, override, name, slug from user_type_categories join terms on '
                       'user_type_categories.term_id = terms.term_id')
    else:
        slugs_arr = []
        for slug in slugs:
            slugs_arr.append(f"'{slug}'")
        slug_str = "(" + ",".join(slugs_arr) + ")"
        cursor.execute("select terms.term_id, override, name, slug from user_type_categories join terms on "
                       "user_type_categories.term_id = terms.term_id where terms.slug in " + slug_str)

    v1_user_types = get_dict(cursor)
    cursor.close()

    v1_business_types = []

    for value in v1_user_types:
        business_type = {'name': value['name'], 'slug': value['slug'], 'term_id': value['term_id']}

        if value['override'] is not None and value['override'] != 'old':
            business_type['override'] = value['override']
        v1_business_types.append(business_type)

    return v1_business_types


def get_term_from_business_name(business_name):
    cursor = connections['migrate'].cursor()
    cursor.execute("select term_id from terms where LOWER(name) like %s", (business_name.lower(),))
    user_meta = get_dict(cursor)
    cursor.close()
    if len(user_meta) > 0:
        if user_meta[0]['term_id']:
            return user_meta[0]['term_id']


def get_business_name_from_user_id(user_id):
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from usermeta where user_id = " + str(user_id) + " and meta_key = 'your_business_name'")
    user_meta = get_dict(cursor)
    cursor.close()
    if len(user_meta) > 0:
        if user_meta[0]['meta_value']:
            return user_meta[0]['meta_value']


def get_legacy_business_business_location(business_name):
    cursor = connections['migrate'].cursor()
    cursor.execute("select um1.meta_value  as city, um2.meta_value as state_province, um3.meta_value as country "
                   " from usermeta left join usermeta um1 on um1.user_id = usermeta.user_id and um1.meta_key = 'city' "
                   " left join usermeta um2 on um2.user_id = usermeta.user_id and um2.meta_key = 'state' "
                   " left join usermeta um3 on um3.user_id = usermeta.user_id and um3.meta_key = 'country' "
                   " where usermeta.meta_key = 'your_business_name' and LOWER(usermeta.meta_value) like %s",
                   (business_name.lower(),))
    locations = get_dict(cursor)
    cursor.close()

    if len(locations) > 0:
        new_location = Location(legacy_city=None, legacy_state_province=None, legacy_country=None, legacy_migrated=True)
        for location in locations:
            if 'city' in location and location['city']:
                if new_location.legacy_city is None or (len(new_location.legacy_city) < len(location['city'])):
                    new_location.legacy_city = location['city']

            if 'state_province' in location and location['state_province']:
                if new_location.legacy_state_province is None or (len(new_location.legacy_state_province) < len(
                        location['state_province'])):
                    new_location.legacy_state_province = location['state_province']

            if 'country' in location and location['country']:
                if new_location.country is None or (len(new_location.legacy_country) < location['country']):
                    new_location.legacy_country = location['country']

        geo, legacy = new_location.num_base_location_elements()

        if legacy > 0:
            new_location.save()
            return new_location
        else:
            return None
    else:
        return None


def get_usermeta_for_business_name(business_name):
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from usermeta "
                   "where meta_key = 'your_business_name' and TRIM(meta_value) like %s", (business_name,))
    results = get_dict(cursor)
    cursor.close()
    user_ids = '('
    for user_meta in results:
        user_ids += str(user_meta['user_id']) + ','

    user_ids = user_ids[:-1]
    user_ids += ')'

    return results, user_ids


def get_unclaimed_venue_emails_and_websites(business):
    rc = {}

    cursor = connections['migrate'].cursor()
    cursor.execute("select meta_key, meta_value from terms join term_taxonomy on term_taxonomy.term_id = "
                   "terms.term_id join term_relationships on term_relationships.term_taxonomy_id = "
                   "term_taxonomy.term_taxonomy_id join postmeta on postmeta.post_id = object_id and meta_key in ("
                   "'venue_type','ceremony_venue_website','ceremony_venue_email','reception_venue_website',"
                   "'reception_venue_email') where terms.name = %s group by meta_key, meta_value", (business['name'],))
    results = get_dict(cursor)
    cursor.close()
    return results


def get_venue_type_from_business(business):
    for venue_type in venue_sub_type_names:
        if slugify_2(venue_type) in business['parent_slug']:
            return slugify_2(venue_type)

    # exceptions...

    if business['parent_slug'] in ['annesdale-mansion', 'eiffel-tower-reception-venue',
                                   'rehearsal-venue', 'welcome-party-venue', 'the-fig-house-wedding-reception-venue',
                                   'balmorhea-wedding-and-events-reception-venue']:
        return "no-type"

    logging.getLogger('migration').error(
        "[NOK] invalid venue type: {} for {} ({})".format(business['parent_slug'], business['name'],
                                                          business['term_id']))

    return None


def get_business_legacy_props(user_ids):
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from usermeta where user_id in " + user_ids + " order by meta_key")
    results = get_dict(cursor)
    cursor.close()

    business_prop_legacy_fields = ['user_id', 'channel_post_id', 'your_business_instagram', 'your_business_facebook',
                                   'your_business_photo', 'my_price_range', 'city', 'state', 'country',
                                   'your_business_description', 'your_business_website', 'python m',
                                   'channel_override_button', 'first_name', 'last_name']

    business_props = {}

    for result in results:
        if result['meta_key'] in business_prop_legacy_fields and result['meta_value'] is not None \
                and result['meta_value'].strip() != '':

            if result['meta_key'] not in business_props:
                business_props[result['meta_key']] = {'user_id': result['user_id'],
                                                      'value': result['meta_value'].strip()}
            else:
                business_props[result['meta_key']] = resolve_business_properties_between(
                    business_props[result['meta_key']],
                    {'user_id': result['user_id'],
                     'value': result[
                         'meta_value'].strip()})

    # adding user IDS as props

    ids = user_ids.replace('(', '').replace(')', '').split(',')
    user_ids = []
    for id in ids:
        user_ids.append(int(id))
    business_props['user_id'] = user_ids

    return business_props


def create_user_from_legacy_user(user, user_meta, is_admin=False):
    from django.conf import settings
    user_type = None
    first_name = None
    last_name = None

    if not is_admin:
        try:
            for um in user_meta:
                if um['meta_key'] == 'user_type':
                    user_type = um['meta_value'].strip().lower()
                if um['meta_key'] == 'first_name':
                    first_name = um['meta_value'].strip().title()
                if um['meta_key'] == 'last_name':
                    last_name = um['meta_value'].strip().title()
        except AttributeError:
            pass
    else:
        user_type = 'admin'

    if user_type is not None:

        legacy_type_to_user_type = {
            'admin': UserTypeEnum.admin,
            'i just love love': UserTypeEnum.consumer,
            'future bride or groom': UserTypeEnum.soonlywed,
            'newlywed bride or groom': UserTypeEnum.newlywed
        }

        new_user = User(email=user['user_email'],
                        legacy_password=user['user_pass'], legacy_user_id=user['ID' if settings.DEBUG else 'id'],
                        user_type=legacy_type_to_user_type[user_type], source=ContentModelSource.legacy,
                        source_desc="legacy_model_utils migration", first_name=first_name, last_name=last_name)
        new_user.set_password(generate_random_password())
        try:
            new_user.save()
            mark_user_as_migrated(user['ID' if settings.DEBUG else 'id'], "success")
            logging.getLogger('migration').info(
                "[OK ] Importing legacy user: {} ({})".format(user['user_email'], user_type))

        except IntegrityError:
            logging.getLogger('migration').warning(
                "[NOK] Skipping already existing user {} ({})".format(user['user_email'], user_type))
        except DataError:
            logging.getLogger('migration').warning(
                "[NOK] Skipping already existing user {} ({}) for data integrity issues".format(
                    user['user_email'], user_type))
    else:

        logging.getLogger('migration').warning(
            "[NOK] Skipping legacy user: user_type not found in in usermeta for {}".format(user['user_email']))
        mark_user_as_migrated(user['ID' if settings.DEBUG else 'id'], "fail. no type")


def get_legacy_user_meta(user_id):
    cursor = connections['migrate'].cursor()
    cursor.execute("select * from usermeta where user_id = " + str(user_id))
    d = get_dict(cursor)
    cursor.close()
    return d


def get_legacy_users(mode):
    if mode == 'consumers':
        cursor = connections['migrate'].cursor()
        cursor.execute("select * from users join usermeta on usermeta.user_id = users.ID and usermeta.meta_key= "
                       "'user_type' where meta_value in ('newlywed bride or groom','future bride or groom',"
                       "'i just love love')")
        d = get_dict(cursor)
        cursor.close()
        return d

    if mode == 'admins':
        cursor = connections['migrate'].cursor()
        cursor.execute("select * from users join usermeta on usermeta.user_id = users.ID and usermeta.meta_key= "
                       "'capabilities' where meta_value like '%admin%';")
        d = get_dict(cursor)
        cursor.close()
        return d

    # we should never be here
    raise BaseException("mode is invalid")


def isaac_migration_status(message):
    from lstv_api_v1.tasks.tasks import send_slack_message_or_action
    send_slack_message_or_action(channel="G01E47VD7L7",
                                 blocks=[{"type": "section", "text": {"type": "mrkdwn", "text": message}}])


def cleanup_db_content():
    to_delete = [
        'Image',
        'CuratedLocation',
        'Location',
        'IPAddress',
        'Phone',
        'Properties',
        'EmailVerificationRecord',
        'User',
        'ContentSearchQuery',
        'Discover',
        'Brand',
        'OrganizedEvent',
        'WeightedWorksWith',
        'PublicTeamPerson',
        'Review',
        'BusinessWeightedWorkLocationHistory',
        'Business',
        'BusinessVenueEventSpace',
        'BusinessTeamMember',
        'NavigationBarContent',
        'Setting',
        'UserEventLog',
        'ContentFlag',
        'ShoppingItem',
        'Message',
        'Video',
        'Photo',
        'VideoSource',
        'SongPerformer',
        'Song',
        'Post',
        'VideoBusiness',
        'Article',
        'Video',
        'VideoVideo',
        'VideoPhoto',
        'RequestLog',
        'VideoPlaybackLog',
        'LegacyViewsLog',
        'CardImpressionsLog',
        'VideoViewLog',
        'ArticleViewLog',
        'AggregationCache',
        'AggregationCacheData',
        'Like',
        'CompositeContentElement',
        'CompositeContentBindingItem',
        'CompositeContentBinding',
        'WeightedWorksWith',
        'SocialLink',
        'BusinessVenueTypeInfo',
        'PromoVideo',
        'BusinessPhoto',
        'VideoType',
        'BusinessGroupType',
        'DirectoryType',


    ]

    for delete_cls in to_delete:
        try:
            print(f"hard deleting {delete_cls}", end='', flush=True)
            cls = eval(delete_cls)
            if cls:
                cursor = connections['default'].cursor()
                cursor.execute(
                    f"SET session_replication_role TO replica;delete from {cls._meta.db_table} where id is not null")
                cursor.close()
                print("\33[32m---[OK]\33[0m")
            else:
                print("\33[31m---[NOK]\33[0m")

        except AttributeError as e:
            # print(e)
            cls = eval(delete_cls)
            # print(f"-cleaning {delete_cls}")
            cls.objects.all().delete()
        except TypeError as e:
            # print(e)
            cls = eval(delete_cls)
            # print(f"--cleaning {delete_cls}")
            cls.objects.all().delete()

    # raw cleanup
    cursor = connections['default'].cursor()
    cursor.execute("delete from businesses_to_properties where id is not null")
    cursor.execute("delete from videos_to_businesses where id is not null")
    cursor.execute("delete from posts_to_properties where id is not null")
    cursor.execute("delete from business_venue_type_info where id is not null")
    cursor.execute("delete from videos_to_songs where id is not null")
    cursor.execute("delete from business_locations where id is not null")
    cursor.execute("delete from businesses_to_weighted_work_location_history where id is not null")
    cursor.execute("delete from businesses_to_business_groups where id is not null")
    cursor.execute("delete from businesses_to_social_network_links where id is not null")
    cursor.execute("delete from business_role_family_types where id is not null")
    cursor.execute("delete from businesses_to_subscribers where id is not null")
    cursor.execute("delete from messages_to_flags where id is not null")
    cursor.execute("delete from place_to_subscribers where id is not null")
    cursor.execute("delete from county_to_subscribers where id is not null")
    cursor.execute("delete from videos_to_shopping_items where id is not null")
    cursor.execute("delete from business_to_faq where id is not null")
    cursor.execute("delete from business_to_reviews where id is not null")
    cursor.execute("delete from composite_content_bindings_to_elements where id is not null")
    cursor.execute("delete from business_subscription_levels where id is not null")
    cursor.execute("delete from businesses_to_sold_at_businesses where id is not null")
    cursor.execute("delete from business_to_public_personnel where id is not null")
    cursor.execute("delete from businesses_to_shopping_items where id is not null")
    cursor.execute("delete from users_to_properties where id is not null")
    cursor.execute("delete from videos_to_questions where id is not null")
    cursor.execute("delete from businesses_to_organized_events where id is not null")
    cursor.execute("delete from businesses_to_associate_brands where id is not null")
    cursor.execute("delete from business_role_family_types where id is not null")
    cursor.execute("delete from articles_to_locations where id is not null")
    cursor.execute("delete from articles_to_businesses where id is not null")
    cursor.execute("delete from curated_locations_to_properties where id is not null")
    cursor.execute("delete from properties  where id is not null")
    cursor.execute("delete from business_team_member_role_permission_types where id is not null")
    cursor.execute("delete from ip_to_location where id is not null")
    cursor.execute("delete from business_role_family_types where id is not null")
    cursor.execute("delete from business_venue_types where id is not null")
    cursor.close()

    # location too - with .objects_all_states.exclude(source_desc__icontains='ip-to-geo').delete()

def cleanup_db_seed():
    VideoType.objects.all().delete()
    InterviewPageType.objects.all().delete()
    InterviewType.objects.all().delete()
    VideoBusinessCapacityType.objects.all().delete()
    BusinessRoleType.objects.all().delete()
    BusinessRoleFamilyType.objects.all().delete()
    BusinessVenueType.objects.all().delete()
    BusinessTeamMemberRoleType.objects.all().delete()
    BusinessTeamMemberRolePermissionType.objects.all().delete()
    TagType.objects_all_states.all().delete()
    TagFamilyType.objects.all().delete()
    InterviewPropertyType.objects.all().delete()
    InterviewType.objects.all().delete()
    SocialNetworkTypes.objects.all().delete()
