from django.test import TestCase

from lstv_api_v1.models import *
from lstv_api_v1.utils import *


class UniversalSanity(TestCase):
    def setUp(self):
        # no need to setup this test. Math, logic and physics are already set up for us.
        pass

    def test_basic_universal_sanity(self):
        self.assertEqual(1+1, 2)
