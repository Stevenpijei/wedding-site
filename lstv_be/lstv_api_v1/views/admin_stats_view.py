from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.models import *
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.db.models.functions import TruncYear
from django.db.models.functions import TruncDay
from django.db.models.functions import TruncWeek


class IsLSTVAdmin(BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        return bool(request.user and not request.user.is_anonymous and request.user.user_type == UserTypeEnum.admin)


class AdminStatsView(APIView):
    """
    obtain all business role capacity types
    """
    permission_classes = ([IsLSTVAdmin])

    _metric_types = ['video_uploads']

    _granularity_types = ['day', 'week', 'month', 'year']

    _truncFunc = {
        'day': TruncDay,
        'week': TruncWeek,
        'month': TruncMonth,
        'year': TruncYear,

    }
    _metric = None
    _from_date = None
    _to_date = None
    _compare_from_date = None
    _compare_to_date = None
    _granularity = 'day'

    def metric_video_uploads(self):

        def calc_set(main=True):
            func = self._truncFunc[self._granularity]
            uploads = VideoSource.objects.filter(media_id__isnull=False,
                created_at__range=[self._from_date if main else self._compare_from_date,
                                   self._to_date if main else self._compare_to_date]) \
                .annotate(date=func('created_at')) \
                .values('date') \
                .annotate(count=Count('date'))

            set = []

            values = {}
            for upload in uploads:
                values[upload['date'].strftime('%m/%d')] = upload['count']

            date = datetime.strptime(self._from_date if main else self._compare_from_date, '%Y-%m-%d')
            to_date = datetime.strptime(self._to_date if main else self._compare_to_date, '%Y-%m-%d')
            span = (to_date - date).days + 1

            while date <= to_date:
                date_key = date.strftime('%m/%d')
                if date_key in values:
                    set.append({
                        "label": date.strftime('%m/%d'),
                        "count": values[date_key]
                    })
                else:
                    if self._granularity == 'day':
                        set.append({
                            "label": date.strftime('%m/%d'),
                            "count": 0
                        })
                date += timedelta(days=1)

            return set, span


        ms, ms_days = calc_set()
        if self._compare_to_date:
            cs, cs_days  = calc_set(False)
        else:
            cs = None
            cs_days = 0
        print(cs)

        return {
            "main_set_day_count": ms_days,
            "compare_set_day_count": cs_days,
            "main_set": ms,
            "compare_set": cs
        }

    def get(self, request, format=None):
        rc = []
        self._metric = request.query_params.get('metric', None)
        self._from_date = request.query_params.get('from_date', None)
        self._to_date = request.query_params.get('to_date', None)
        self._compare_from_date = request.query_params.get('compare_from_date', None)
        self._compare_to_date = request.query_params.get('compare_to_date', None)
        self._granularity = request.query_params.get('granularity', None)

        date = datetime.strptime(self._from_date, '%Y-%m-%d')
        to_date = datetime.strptime(self._to_date, '%Y-%m-%d')
        span = (to_date - date).days
        if self._compare_to_date and self._compare_from_date:
            c_date = datetime.strptime(self._compare_from_date, '%Y-%m-%d')
            c_to_date = datetime.strptime(self._compare_to_date, '%Y-%m-%d')
            c_span = (c_to_date - c_date).days
            if span != c_span:
                return response_40x(400, "date span and compare date span must have the same number of days")

        if not self._metric:
            return response_40x(400, "metric is required")

        if not self._from_date or not self._to_date:
            return response_40x(400, "from_date and to_date are required")

        if self._metric not in self._metric_types:
            return response_40x(400, f"invalid metric. allowable values: {', '.join(self._metric_types)}")

        if self._granularity not in self._granularity_types:
            return response_40x(400, f"invalid granularity. allowable values: {', '.join(self._granularity_types)}")

        rc = getattr(self, f"metric_{self._metric}")()

        return response_200(rc, ttl=0)
