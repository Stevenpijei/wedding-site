from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from lstv_api_v1.tasks.tasks import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):

    def handle(self, *args, **options):
        ContentSearchQuery.objects.all().delete()

        #   _                                _   _____         _    _
        #  | |                              | | |_   _|       | |  | |
        #  | |     ___   __ _  __ _  ___  __| |   | |  _ __   | |__| | ___  _ __ ___   ___
        #  | |    / _ \ / _` |/ _` |/ _ \/ _` |   | | | '_ \  |  __  |/ _ \| '_ ` _ \ / _ \
        #  | |___| (_) | (_| | (_| |  __/ (_| |  _| |_| | | | | |  | | (_) | | | | | |  __/
        #  |______\___/ \__, |\__, |\___|\__,_| |_____|_| |_| |_|  |_|\___/|_| |_| |_|\___|
        #  |  __ \       __/ | __/ |
        #  | |__) |_ _  |___/ |___/
        #  |  ___/ _` |/ _` |/ _ \
        #  | |  | (_| | (_| |  __/
        #  |_|   \__,_|\__, |\___|
        #               __/ |
        #              |___/

        def generate(target):
            # Anne Barge

            # Most Popular

            s = ContentSearchQuery(
                target=target,
                order=1,
                header="Most Popular",
                slug="most-popular",
                cta_text="Top 100 popular videos",
                cta_url="/wedding-videos",
                content_type=ContentSearchQueryType.video,
                content_search_type=ContentSearchQuerySourcingType.none,
                content_sort_method=ContentSearchQueryOrderType.most_watched_30d,
                fixed_content_items=None,
                search_items=None)
            s.save()

            s = ContentSearchQuery(
                target=target,
                order=2,
                header="COVID-19 Weddings",
                slug="covid-19-love-stories",
                cta_text="All COVID-19 Wedding Videos",
                cta_url=None,
                content_type=ContentSearchQueryType.video,
                content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
                content_sort_method=ContentSearchQueryOrderType.most_recent,
                fixed_content_items=None,
                search_items=['covid-19-love-stories'])
            s.save()

            # Featured Videographers

            s = ContentSearchQuery(
                target=target,
                order=3,
                header="Recommended Videographers",
                slug="featured-videographers",
                cta_text="All Featured Videographers",
                cta_url="/wedding-videographers",
                content_type=ContentSearchQueryType.business,
                content_search_type=ContentSearchQuerySourcingType.fixed_business_list,
                content_sort_method=ContentSearchQueryOrderType.none,
                search_items=None,
                fixed_content_items=['stopgolove', 'anchored-films', 'pgp-wedding-films', 'nst-pictures'])
            s.save()

            # Maggie Sottero Designs

            s = ContentSearchQuery(
                target=target,
                order=4,
                header="Maggie Sottero Designs",
                slug="covid-19-love-stories",
                cta_text="All Maggie Sottero Videos",
                cta_url=None,
                content_type=ContentSearchQueryType.video,
                content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
                content_sort_method=ContentSearchQueryOrderType.most_recent,
                fixed_content_items=None,
                search_items=['covid-19-love-stories'])
            s.save()

            # Lesbian Weddings

            s = ContentSearchQuery(
                target=target,
                order=5,
                header="Lesbian Weddings",
                slug="lesbian",
                cta_text="All Lesbian Wedding Videos",
                cta_url=None,
                content_type=ContentSearchQueryType.video,
                content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
                content_sort_method=ContentSearchQueryOrderType.most_recent,
                fixed_content_items=None,
                search_items=['lesbian'])
            s.save()

            # Featured Vendors

            s = ContentSearchQuery(
                target=target,
                order=3,
                header="Recommended Wedding Vendors",
                slug="recommended-vendors",
                cta_text="All Wedding Vendors",
                cta_url="/wedding-vendors",
                content_type=ContentSearchQueryType.business,
                content_search_type=ContentSearchQuerySourcingType.fixed_business_list,
                content_sort_method=ContentSearchQueryOrderType.none,
                search_items=None,
                fixed_content_items=['beautini', 'lauren-addison-jewelry', 'bloombar', 'zingermans-cornman-farms'])
            s.save()

        generate('logged_in_home_page')
        generate('logged_out_home_page')
