from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    @staticmethod
    def add_group(name, def_roles=None):
        if def_roles is None:
            def_roles = []
        new_group = BusinessGroupType(name=name, slug=slugify_2(name))
        new_group.save()

        # add defaults
        businesses = Business.objects_all_states.filter(roles__slug__in=def_roles)

        if len(businesses) > 0:
            with alive_bar(len(businesses), f"- tagging businesses for '{name}' group", bar="blocks", length=10) as bar:
                for business in businesses:
                    if not business.groups.filter(slug=slugify_2(name)).first():
                        business.groups.add(new_group)
                    bar()

    def handle(self, *args, **options):

        # remove any content_query referenced by discover items

        for discover in Discover.objects.all():
            if discover.content_query:
                discover.content_query.delete()

        Discover.objects.all().delete()

        # create the main domain
        main_domain = Discover(order="D-001", name='standard', slug='standard', type=DiscoverElementTypeEnum.domain)
        main_domain.save()

        # create content_roots
        main_content = main_domain.add_content_root('Main Content', DiscoverElementTypeEnum.main_content)
        sidebar = main_domain.add_content_root('Recommended Channels', DiscoverElementTypeEnum.sidebar)

        tab_group = main_content.add_tab_group('Main Tab Group')

        # create high level elements

        videos = tab_group.add_tab('Videos')

        businesses = tab_group.add_tab('Businesses')

        vibes = tab_group.add_tab('Vibes')

        advice = tab_group.add_tab('advice')

        video_categories = videos.add_section("Video Categories")

        # videos categories

        most_watched_30d = video_categories.add_folder('Most Popular')
        recommended_for_you = video_categories.add_folder('Recommended For You')
        award_winners = video_categories.add_folder('Award Winners')
        editors_pick = video_categories.add_folder('Editor\'s Pick')
        inspiring_vows = video_categories.add_folder('Inspiring Vows')
        lgbtq_weddings = video_categories.add_folder('LGBTQ Weddings')
        emotional_first_looks = video_categories.add_folder('Emotional First Looks')
        weddings_cry = video_categories.add_folder('Weddings That Will Make You Cry')
        dance_inspo = video_categories.add_folder('Dance Inspiration')

        # content

        most_watched_30d.add_content(ContentSearchQuery(

            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.none,
            content_sort_method=ContentSearchQueryOrderType.most_watched_30d,
            target=f"discover-domain-{main_domain.slug}",
            header="Most Popular",
            slug=slugify("Most Popular"),
            cta_text="See All",
            sub_header="Our most-watched wedding videos last month. The best of the best. The MVPs. The GOATs. "
                       "You get it.",
            cta_url="/videos?sort=most-popular"
        ))

        recommended_for_you.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.recommended_for_you,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            target=f"discover-domain-{main_domain.slug}",
            header="Recommended For You",
            cta_text="See All",
            sub_header="Videos you're sure to like, curated just for you.",
            cta_url="/videos?search=recommended_for_you&sort=most-recent"
        ))

        award_winners.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_watched_30d,
            target=f"discover-domain-{main_domain.slug}",
            search_items=['award-winners'],
            header="Award Winners",
            cta_text="See All",
            sub_header="These award winning videos are the best of the best.",
            cta_url="/videos?search=vibe&search-items==award_winners&sort=most-popular"
        ))

        editors_pick.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['editors-pick'],
            target=f"discover-domain-{main_domain.slug}",
            header="Editor's Picks",
            cta_text="See All",
            sub_header="Watch the videos our staff handpicked for their awesomeness.",
            cta_url="/videos?search=vibe&search-items=most-romantic-vows&sort=most-popular"
        ))

        inspiring_vows.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['most-romantic-vows'],
            target=f"discover-domain-{main_domain.slug}",
            header="Inspiring Vows",
            cta_text="See All",
            sub_header="Those carefully crafted vows will without doubt inspire you..",
            cta_url="/videos?search=vibe&search-items=award_winners&sort=most-popular"
        ))

        lgbtq_weddings.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['lgbt+','gay','lesbian'],
            target=f"discover-domain-{main_domain.slug}",
            header="LGBTQ Weddings",
            cta_text="See All",
            sub_header="Happy Pride! Watch LGBTQ+ weddings videos to get ideas and find pros for yours...",
            cta_url="/videos?search=vibe&search-items=lgbtq+,gay,lesbian&sort=most_recent"
        ))

        emotional_first_looks.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['emotional-first-look'],
            target=f"discover-domain-{main_domain.slug}",
            header="Emotional First Look",
            cta_text="See All",
            sub_header="Those first looks are priceless. Watch them now.",
            cta_url="/videos?search=vibe&search-items=emotional-first-looks&sort=most_recent"
        ))

        weddings_cry.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['moms-who-will-make-you-cry', 'dads-who-will-make-you-cry'],
            target=f"discover-domain-{main_domain.slug}",
            header="Weddings That Will Make You Cry",
            cta_text="See All",
            sub_header="Grab some tissues and watch these emotional wedding videos.",
            cta_url="/videos?search=vibe&search-items=dads-who-will-make-you-cry,moms-who-will-make-you-cr&sort=most_recent"
        ))

        dance_inspo.add_content(ContentSearchQuery(
            content_type=ContentSearchQueryType.video,
            content_search_type=ContentSearchQuerySourcingType.vibe_to_video,
            content_sort_method=ContentSearchQueryOrderType.most_recent,
            search_items=['first-dance'],
            target=f"discover-domain-{main_domain.slug}",
            header="Dance Inspiration",
            cta_text="See All",
            sub_header="Try to keep your feet from not getting into the rhythm after watching these.",
            cta_url="/videos?search=vibe&search-items=first-dance&sort=most_recent"
        ))

