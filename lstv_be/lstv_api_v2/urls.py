from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from lstv_api_v2.views.base.test_view import TestView

urlpatterns = [
    url(r'^test$', TestView.as_view(), name="v2_test"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
