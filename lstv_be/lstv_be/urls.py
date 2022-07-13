"""lstv_be URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.http import HttpResponse
from django.conf.urls import include, url
from rest_framework.views import APIView

from lstv_api_v1 import urls
from lstv_api_v2 import urls as urls2
from lstv_api_v1.views.utils_views import SayHello
from .utils import custom404, custom500
from django.conf import settings

urlpatterns = [
    url(r'^v1/', include(urls)),
    url(r'^v2/', include(urls2)),
    url(r'^$',  SayHello.as_view(), name="Hello"),
]

if settings.DEBUG is False:
    handler500 = custom500
    handler404 = custom404
