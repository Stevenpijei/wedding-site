from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        businesses = Business.objects_all_states.filter(state=ContentModelState.suspended_dmz)
        index = 1
        with alive_bar(len(businesses), "- Repairing dmz status of businesses", bar="blocks", length=10) as bar:
            for business in businesses:
                try:
                    d = json.loads(business.state_desc[0])
                    Business.objects_all_states.filter(pk=business.id).update(
                        dmz_originating_business=Business.objects_all_states.filter(pk=d['suggested_by_business_id']).first())
                    Business.objects_all_states.filter(pk=business.id).update(
                        dmz_originating_video=Video.objects_all_states.filter(pk=d['video_id']).first())
                except:
                    print(f"business {id} has no json")
                bar()
