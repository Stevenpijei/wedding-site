from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.legacy_model_utils import get_posts
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup


class Command(BaseCommand):

    def handle(self, *args, **options):
        businesses = Business.objects_all_states.filter(state=ContentModelState.suspended_review)
        index = 1
        with alive_bar(len(businesses), "- Repairing dmz status of businesses", bar="blocks", length=10) as bar:
            for business in businesses:
                if len(business.state_desc) and business.state_desc[0].startswith('added by'):
                    #business.state = ContentModelState.suspended_dmz
                    d = business.state_desc[0]
                    a = d.split('for video')
                    biz = Business.objects.filter(name=a[0].replace('added by', '').strip()).first()
                    video_slug = a[1].replace(": https://lovestoriestv.com/", "").replace(": https://lstvtest.com/", "")
                    v = Video.objects_all_states.filter(post__slug=video_slug).first()
                    print(f"{biz.name} - {video_slug}")
                    desc = {
                        "issue": "vendor suggested business",
                        "video_slug": video_slug,
                        "video_id": str(v.id) if v else None,
                        "suggested_by_business_id": str(biz.id),
                        "suggested_by_business_slug": biz.slug,
                        "suggested_by_business_name": biz.name,
                    }
                    Business.objects_all_states.filter(pk=business.id).update(state=ContentModelState.suspended_dmz,
                                                                              state_desc=[json.dumps(desc)])

                bar()


