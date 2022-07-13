import json
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List
import pytz
import requests
from django.conf import settings
from django.db.models import Sum
from django.db.models import Q, F
from django.core.management.base import BaseCommand
from lstv_api_v1.models import (
    ContentModelState, Business, Like, Message, MessageContextTypeEnum,
    User, UserTypeEnum, Video, VideoPlaybackLog
)
from lstv_api_v1.utils.utils import notify_grapevine


tz = pytz.timezone("US/Eastern")


def back_to_monday(dt: datetime) -> datetime:
    while dt.weekday() != 0:
        dt = dt - timedelta(days=1)
    return dt


def minus_month(dt: datetime) -> datetime:

    if dt.month == 1:
        return dt.replace(month=12)
    try:
        rc = dt.replace(month=dt.month-1)
        return rc
    except ValueError:
        day_offset = 1
        while True:
            try:
                rc = dt.replace(month=dt.month-1, day=dt.day - day_offset)
                return rc
            except ValueError:
                day_offset += 1


def to_midnight(dt: datetime) -> datetime:
    return tz.localize(datetime.combine(dt, datetime.min.time()))


class Range:
    def __init__(
        self, desc: str,
        start: datetime, end: datetime,
        prev_start: datetime = None, prev_end: datetime = None
    ):
        self.desc = desc
        self.prev_start = prev_start
        self.prev_end = prev_end
        self.start = start
        self.end = end

    @property
    def has_prev(self):
        return self.prev_start and self.prev_end


class Stat:
    def __init__(self, model: str, title: str, conditions: List[Q] = []):
        self.model = model
        self.title = title
        self.conditions = conditions

    def get_count(self, r: Range):
        return 0

    def get_prev(self, r: Range):
        return 0

    def get_message(self, r: Range):
        count = self.get_count(r)
        if not r.has_prev:
            return f"{self.title}: `{count}`"
        prev = self.get_prev(r)
        if prev == 0:
            if count > 0:
                return f"{self.title}: `{count}` vs `0` :up-small:"
            else:
                return f"{self.title}: `{count}` vs `0`"

        pct = round((count - prev) / prev, 2)
        sign = "+" if pct > 0 else ""
        icon = ":up-small:" if pct > 0 else ":down-small:"
        if pct == 0.0:
            icon = ""
        if count == prev:
            return f"{self.title}: `{count:,}` vs `{prev:,}`"
        return f"{self.title}: `{count:,}` vs `{prev:,}`    ({sign}{round(pct * 100,2)}% {icon})"


class CountStat(Stat):
    def get_count(self, r: Range):
        return self.model.filter(
            created_at__gte=r.start, created_at__lt=r.end, *self.conditions
        ).count()

    def get_prev(self, r: Range):
        return self.model.filter(
            created_at__gte=r.prev_start, created_at__lt=r.prev_end, *self.conditions
        ).count()


class AccountClaimsStat(Stat):
    def get_count(self, r: Range):
        return self.model.filter(
            account_claimed_at__gte=r.start,
            account_claimed_at__lt=r.end,
            *self.conditions
        ).count()

    def get_prev(self, r: Range):
        return self.model.filter(
            account_claimed_at__gte=r.prev_start,
            account_claimed_at__lt=r.prev_end,
            *self.conditions
        ).count()


class Command(BaseCommand):
    def handle(self, *args, **options):
        now = datetime.now(tz)
        yesterday = now - timedelta(days=1)
        month = to_midnight(now.replace(day=1))
        last_month = minus_month(month)
        prev_month = minus_month(last_month)

        ranges = [
            Range(
                f'`{yesterday.strftime("%A, %B %d %Y")}`',
                to_midnight(now - timedelta(days=1)),
                to_midnight(now - timedelta(days=0)),
            )
        ]
        if now.weekday() == 0:
            ranges.append(
                Range(
                    '`Last week`',
                    to_midnight(now - timedelta(days=7)),
                    to_midnight(now - timedelta(days=0)),
                )
            )
        if now.day == 1:
            ranges.append(
                Range(
                    (
                        f'`{last_month.strftime("%B")} {last_month.year} '
                        f'vs {prev_month.strftime("%B")} {prev_month.year}`'
                    ),
                    last_month,
                    month,
                    prev_month,
                    last_month,
                )
            )
        stats = [
            CountStat(Video.objects, "Video uploads"),
            CountStat(
                Business.objects_all_states,
                "New businesses added",
                [Q(state=ContentModelState.suspended_review)]
            ),
            AccountClaimsStat(Business.objects, "Accounts claimed"),
            CountStat(Business.objects.filter(roles__slug__endswith='-designer'), "New designer sign-ups"),
            CountStat(Business.objects.exclude(roles__slug='videographer', roles__slug__endswith="-designer"), "New business sign-ups"),
            CountStat(Business.objects.filter(roles__slug='videographer'), "New filmmaker sign-ups"),
            CountStat(
                User.objects,
                "New consumer sign-ups",
                [Q(user_type=UserTypeEnum.consumer)]
            ),
            CountStat(
                Message.objects,
                "Inquiries",
                [Q(message_context=MessageContextTypeEnum.business_inquiry)]
            ),
        ]

        url = "https://api.quotable.io/random"
        payload = {}
        headers = {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
            'Cookie': ''
        }
        response = requests.request("GET", url, headers=headers, data=payload)
        quote = json.loads(response.text)

        greeting = f'HAPPY {now.strftime("%A")}'.upper()
        messages = [greeting, "Here's what you need to know."]
        for r in ranges:
            messages.append("")
            messages.append(r.desc)
            messages.append("")
            for stat in stats:
                messages.append(stat.get_message(r))

        messages.append("")
        messages.append(f"`Quote of the day`")
        messages.append(f">\"...{quote['content']}...\"  -- {quote['author']}")

        notify_grapevine('\r\r'.join(messages))
