from django.conf import settings

# roles and families

# business role family type

business_family_color = {
    "Beauty": "#EBC7B7",
    "Decor & Rentals": "#EBA900",
    "Fashion": "#F16565",
    "Florals": "#FF7A00",
    "Food & Beverage": "#790074",
    "Other": "#F4DB75",
    "Music & Entertainment": "#53B7FF",
    "Officiant & Ceremony": "#241C78",
    "Planning & Design": "#8AEC81",
    "Signage & Stationery": "#CA99D6",
    "Venues": "#FF80A6",
    "Video & Photo": "#10D3EA",
    "Jewelry": "#ff8b3d"
}

business_roles = {
    'Beauty': [
        'Hairstylist',
        'Henna Artist / Salon',
        'Makeup Artist',
        'Spa',
        'Spray Tanning|Spray Tanning Provider',
    ],
    'Decor & Rentals': [
        'Decor|Decor Service',
        'Event Rentals|Event Rentals Provider',
    ],
    'Fashion': [
        'Bridal Salon',
        'Children\'s Apparel|Children\'s Apparel Provider',
        'Alterations|Alterations Service',
        'Dress Designer',
        'Fashion Stylist',
        'Headpiece Designer',
        'Jewelry Shop',
        'Shoe Designer',
        'Suit Designer',
    ],
    'Jewelry': [
        'Jewelry Designer',
        'Precious Metal|Precious Metal Retailer',
    ],
    'Florals': [
        'Florist',
        'Green Weddings|Green Wedding Consultant'
    ],
    'Food & Beverage': [
        'Bakery',
        'Bar & Beverage Service|Bar & Beverage Service Provider',
        'Caterer',
        'Service Staff|Service Staff Provider'
    ],
    'Other': [
        'Gifts|Gifts Provider',
        'Registry|Registry Service',
        'Wedding Favors|Wedding Favors Provider',
        'Cruise Operator',
        'Transportation|Transportation Service',
        'Special Event Pet Care|Special Event Pet Care Service'
    ],
    'Music & Entertainment': [
        'Band',
        'DJ',
        'Dance Instruction|Dance Instructor',
        'Event Artist',
        'Soloist',
        'Sound Design|Sound Designer',
        'Variety Acts|Variety Acts Company'
    ],
    'Officiant & Ceremony': [
        'Ceremony Coach',
        'Hashtag Author',
        'Officiant',
        'Speech Writer'
    ],
    'Planning & Design': [
        'Day-Of-Coordinator',
        'Event Designer',
        'Lighting Design|Lighting Designer',
        'Social Media Planner',
        'Wedding Planner'
    ],
    'Signage & Stationery': [
        'Calligrapher',
        'Invitations|Invitation Designer',
        'Signage|Signage Designer',
    ],
    'Venues': [
        'Venue',
        'Guest Accommodations|Guest Accommodations Provider'
    ],
    'Video & Photo': [
        'Boudoir Photographer',
        'Photobooth Provider',
        'Photographer',
        'Videographer'
    ]
}

# generic cached update timestamp ttl's (in seconds)

LSTV_DEFAULT_TTL_FOR_LATEST_UPDATE_TIMESTAMP_CACHE = 5

# Home page card grid minimums

LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIBES = 0
LSTV_HOME_PAGE_CARD_GRID_MINIMUM_NUM_VIDEOS = 0

# LSTV cache context elements

LSTV_CACHE_MOST_WATCHED_VIDEOS_30_DAYS = "most_watched_videos_30_days"

# LSTV model properties constants

LSTV_PROPERTY_STATUS_PREMIUM_MEMBERSHIP = "premium_membership"
LSTV_PROPERTY_PERMISSION_EMBED_CHANNEL = "channel_embedding"

# get_model_element allowable types

get_allowed_model_elements = ['video', 'article', 'photo', 'business', 'vibe', 'location', 'message', 'review',
                              'shopping_item', 'business']

# REST API textual error messages

LSTV_API_V1_BAD_REQUEST_NO_SLUG = "slug parameter missing."
LSTV_API_V1_BAD_REQUEST_NO_ID = "must have either id or auto_select parameters."
LSTV_API_V1_BAD_REQUEST_NO_ROOT_TYPE_AND_SLUG = "root_type and slug must be defined."
LSTV_API_V1_BAD_REQUEST_NO_TYPE_DEFINED = "type must be defined."
LSTV_API_V1_BAD_REQUEST_NO_CARD_GRID_SECTION_TARGET = "target parameter missing"

LSTV_API_V1_BAD_CONTENT_REQUEST = "query_id. offset and size   --OR---  content_type, search_items, slug, sort_method, offset and size are " \
                                  "required parameters"
LSTV_API_V1_BAD_CONTENT_REQUEST_PARAMS = "invalid query param values, one or more are invalid or obsolete"

LSTV_API_V1_CONTENT_REQUEST_NOT_FOUND = "request ID not found"

LSTV_API_V1_BAD_CONTENT_CANT_FIND_COMPOSITE_DEFS = "Unable to find composite content definitions for requested contents"

LSTV_API_V1_PASSWORD_NOT_STRONG = "Passwords must be at least 4 characters long."

LSTV_API_V1_USER_RECORD_NO_LONGER_EXISTS = "User record no longer exists"

LSTV_API_V1_PASSWORD_RESET_LINK_EXPIRED = "Password reset link expired or voided after use."

ELEMENT_TYPE_AND_ID_MUST_BE_VALID = "element_type and element_id must refer to an existing element"
ELEMENT_ID_NOT_FOUND = "can't find element with element_id provided"

# key setting item names

SETTING_MAIN_VIDEO_POST = 'landing_page_video'

# model state active-review keys

ACTIVE_REVIEW_NO_LOCATION_INFORMATION = "no_location_info"
ACTIVE_REVIEW_BAD_MISSING_COUPLE_NAMES = "bad_missing_couple_names"
ACTIVE_REVIEW_AMBIGUOUS_BUSINESS_ROLE = "ambiguous_business_role"
ACTIVE_REVIEW_NO_EVENT_DATE = "no_event_date"

# model state suspended-review keys

SUSPENDED_REVIEW_NO_MINIMUM_BUSINESSS = "no_minimum_businesses"

# page types

PAGE_TYPE_BUSINESS = "business"
PAGE_TYPE_VIDEO = "video"
PAGE_TYPE_ARTICLE = "article"
PAGE_TYPE_CUSTOM_PAGE = "custom_page"

# buffered user event types

LSTV_USER_BUFFERED_EVENT_TYPE_CARD_IMPRESSION = 'card_impression'

# seconds...

SECONDS_IN = {
    'year': 365 * 24 * 60 * 60,
    'month': 30 * 24 * 60 * 60,
    'day': 24 * 60 * 60,
    'hour': 60 * 60,
    'minute': 60
}

# seconds time spans we use for cookies and other things

COOKIE_MAX_AGE_LOGGED_IN_USER = SECONDS_IN['day'] * 30
COOKIE_MAX_AGE_TOKEN = SECONDS_IN['day'] * 30
COOKIE_MAX_AGE_UNIQUE_GUEST_UUID = SECONDS_IN['year'] * 5

#   _______ _______ _            __      __   _
#  |__   __|__   __| |           \ \    / /  | |
#     | |     | |  | |       _____\ \  / /_ _| |_   _  ___  ___
#     | |     | |  | |      |______\ \/ / _` | | | | |/ _ \/ __|
#     | |     | |  | |____          \  / (_| | | |_| |  __/\__ \
#     |_|     |_|  |______|          \/ \__,_|_|\__,_|\___||___/

API_CACHE_TTL_REALTIME = 0  # no cache for real time requests.
API_CACHE_TTL_NEAR_REALTIME = 7  # no cache for real time requests.
API_CACHE_TTL_RARELY_CHANGES = 120

if settings.DEBUG:
    API_CACHE_TTL_STANDARD = 0
else:
    API_CACHE_TTL_STANDARD = 0

if settings.DEBUG:
    API_CACHE_TTL_PUBLIC_GET = 2  # two seconds for debug...
else:
    API_CACHE_TTL_PUBLIC_GET = 600  # ten minutes for production @TODO: Change after launch.

if settings.DEBUG:
    API_CACHE_TTL_PUBLIC_GET_LONG_TERM = 2  # two seconds for debug...
else:
    API_CACHE_TTL_PUBLIC_GET_LONG_TERM = 600 #  (60 * 60 * 2)  # two hours @TODO: Remove before launch

if settings.DEBUG:
    API_CACHE_TTL_PUBLIC_GET_LESS_FREQUENT = 2  # two seconds for debug...
else:
    API_CACHE_TTL_PUBLIC_GET_LESS_FREQUENT = 3600  # (60 * 1440)  # one day @TODO: Remove before launch
