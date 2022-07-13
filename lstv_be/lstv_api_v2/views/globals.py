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

# cache time

API_CACHE_TTL_STANDARD = 0