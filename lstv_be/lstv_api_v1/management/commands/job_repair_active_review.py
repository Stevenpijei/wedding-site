from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        businesses = Business.objects_all_states.filter(state=ContentModelState.active_review)
        index = 1
        with alive_bar(len(businesses), "- Repairing active_review", bar="blocks", length=10) as bar:
            i = 0
            for business in businesses:
                f = json.loads(business.state_desc[0])
                if f['issue'] == 'ambiguous':
                    if business.roles.count() > 1:
                        business.state = ContentModelState.active
                        business.state_desc = None
                        business.save()
                        i += 1
                    else:
                        f['issue'] = f"migration role ambiguity ({', '.join(f['options'])})"
                        business.state_desc =[json.dumps(f)]
                        business.save()
                bar()
            print(f"{i} businesses out of {businesses.count()} have been freed from the ambiguous state")

        with alive_bar(len(businesses), "- populating state_reason", bar="blocks", length=10) as bar:
            i = 0
            for business in businesses:
                f = json.loads(business.state_desc[0])
                business.state_reason = f['issue'].replace(",", ", ")
                business.save()
                bar()
