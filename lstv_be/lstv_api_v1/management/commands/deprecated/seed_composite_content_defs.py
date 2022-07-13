from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
from lstv_api_v1.models import *
import csv


class Command(BaseCommand):

    def handle(self, *args, **options):
        # cleanup first...
        CompositeContentBindingItem.objects.all().delete()
        CompositeContentElement.objects.all().delete()
        CompositeContentBinding.objects.all().delete()

        #   _____             _    __      __            _
        #  |  __ \           | |   \ \    / /           | |
        #  | |__) |___   ___ | |_   \ \  / /__ _ __   __| | ___  _ __
        #  |  _  // _ \ / _ \| __|   \ \/ / _ \ '_ \ / _` |/ _ \| '__|
        #  | | \ \ (_) | (_) | |_     \  /  __/ | | | (_| | (_) | |
        #  |_|  \_\___/ \___/ \__|     \/ \___|_| |_|\__,_|\___/|_|

        new_cce_main_video = CompositeContentElement(element_type=CompositeContentElementType.channel_main_video,
                                                     slug='root_business_main_video',
                                                     options={'auto_play': True,
                                                              'auto_mute': True,
                                                              'video_ads': True,
                                                              'next_video': True,
                                                              'next_video_source': 'same_business'})
        new_cce_main_video.save()

        new_cce_business_info_grid = CompositeContentElement(
            element_type=CompositeContentElementType.business_info_grid,
            slug='root_business_info_grid',
            options={'contact': True,
                     'show_description': True,
                     'show_business_location': True,
                     'alternate_description_template':
                         '[{{business_name}} is {{business_roles_nouns}}][based in {{business_business_location}}]'
                         '[with showcased work {{business_works_at}}][.][If you like their work, contact and book them'
                         ' for your upcoming wedding.]',
                     'show_worked_at_location': True,
                     'show_coverage_map': True,
                     'show_action_bar': True},
        )
        new_cce_business_info_grid.save()

        new_cce_business_content_grid = CompositeContentElement(element_type=CompositeContentElementType.content_grid,
                                                              slug='root_business_content_grid',
                                                              options={'role_divide': True,
                                                                       'role_sort': 'weight',
                                                                       'grid_sort': 'most-recent',
                                                                       'load_more_button': True,
                                                                       'initial_items_load': {'mobile': 6, 'tablet': 8,
                                                                                              'desktop': 16},
                                                                       'subsequent_items_load': {'mobile': 6,
                                                                                                 'tablet': 8,
                                                                                                 'desktop': 16},
                                                                       'grid_item_limit': 100,
                                                                       'verbosity': 'maximum',
                                                                       'filter': {
                                                                           'roles': True,
                                                                           'countries': True,
                                                                           'states': True,
                                                                           'places': True,
                                                                           'years': True,
                                                                           'venues': True}})
        new_cce_business_content_grid.save()

        new_ccb = CompositeContentBinding(slug='root_business')
        new_ccb.save()
        new_ccb.add_composite_content_element(new_cce_main_video, 1)
        new_ccb.add_composite_content_element(new_cce_business_info_grid, 2)
        new_ccb.add_composite_content_element(new_cce_business_content_grid, 3)
