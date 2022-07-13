from django.core.management.base import BaseCommand
from django.db import connections
from django.db.models import Count

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_recalc_weight, get_legacy_businesses_from_business_type
from lstv_api_v1.utils.legacy_model_utils import get_usermeta_for_business_name, get_business_legacy_props, \
    translate_legacy_parent, create_business_from_legacy, get_dict


class Command(BaseCommand):

    def process_business(self, business):
        """
        migrate business into LSTV2
        """

        success = False
        results, user_ids = get_usermeta_for_business_name(business['name'].strip())

        # do we have a user for this legacy business?

        business_props = None

        if len(results) > 0:
            business_props = get_business_legacy_props(user_ids)

        # get business parent
        business_parent = translate_legacy_parent(business['parent_slug'], business['grandparent_slug'])

        # if this is a venue, we need, and this is an exception, the venue type associated with this venue.
        # we require this information later in the business creation process.

        venue_type = None
        venues_emails_and_websites = None

        # venues are special in LSTV1 (nice way to say fucked up). The emails are very detached if there's no user
        # account claiming the venue.

        success = False
        venues_emails_and_websites = []

        if business_parent is not None:
            success = create_business_from_legacy(business, business_parent, business_props, venue_type,
                                                  venues_emails_and_websites)

        # did we make it?
        return success

    def handle(self, *args, **options):

        results, term_ids = get_legacy_businesses_from_business_type({'term_id': 51663})

        # process business type results...
        num_success = 0
        with alive_bar(len(results), "- Importing precious metal dudes.", bar="blocks", length=10) as bar:
            for result in results:
                if result['name'] == 'Platinum':
                    if self.process_business(result) is True:
                        # search for videos

                        cursor = connections['migrate'].cursor()
                        cursor.execute(f"select object_id from term_taxonomy "
                                       f"join term_relationships on term_relationships.term_taxonomy_id = term_taxonomy.term_taxonomy_id "
                                       f"where term_id = {result['term_id']}")
                        videos = get_dict(cursor)
                        biz = Business.objects.get(name=result['name'])
                        print(biz.name)
                        for video in videos:
                            vid = Video.objects.filter(post__legacy_post_id=video['object_id']).first()
                            if vid:
                                bb = VideoBusiness(business=biz, business_role_type=biz.roles.first())
                                bb.save()
                                vid.businesses.add(bb)
                                print(vid.id)

                        cursor.close()

                        print(
                            f"imported {result['name']} - {result['term_id']} - "
                            f"https://lstv2web-r.ngrok.io/business/{result['slug']}")

        print(Business.objects.count())
        print(Properties.objects.count())
