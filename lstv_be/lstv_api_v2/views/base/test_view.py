import os
from datetime import time

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from lstv_be import settings
from lstv_api_v2.views.utils.response import *


class TestView(APIView):
    permission_classes = ([AllowAny])

    def get(self, request, format=None):
        result = {
            'name': 'LSTV Application Server',
            'version': settings.VERSION,
            'host': os.environ.get("HOSTNAME", default="dev host machine")
        }

        #raise Exception("bad")
        #return failed(400, [{"name": "way too short"}, {"age": "Way too old!"}])
        #return failed(400, {"name": "way too short"})

        # return failed(400, "this is all wrong")
        # return failed(400, ["this is all wrong", "this is wrong too"])

        return success(200, result)
