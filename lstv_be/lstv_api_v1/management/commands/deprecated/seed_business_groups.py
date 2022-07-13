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

        BusinessGroupType.objects.all().delete()

        self.add_group('Content Providers', ['videographer', 'photographer'])
        self.add_group('Fashion Businesses',
                       ['dress-designer', 'suit-designer', 'shoe-designer', 'fashion-stylist', 'headpiece-designer'])
        self.add_group('Cosmetology Businesses', ['henna-artist-salon', 'makeup-artist', 'hairstylist'])
        self.add_group('Retail/Ecommerce Businesses', ['bridal-shop', 'gifts', 'registry'])
        self.add_group('Food/Drink Businesses',
                       ['bakery', 'bar-and-beverage-services', 'caterer', 'desserts', 'wedding-cakes'])
        self.add_group('Non-Fashion Designers',
                       ['event-designer', 'jewelry-designer', 'lighting-design', 'sound-design',
                        'wedding-designer', 'decor', 'signage', 'stationery', 'invitations'])
        self.add_group('Equipment Businesses', ['event-rentals', 'photobooth-provider'])
        self.add_group('Coaching/Instruction Businesses', ['ceremony-coach', 'dance-instruction'])
        self.add_group('Planning/Coordinating Businesses',
                       ['day-of-coordinator', 'social-media-planner', 'wedding-planner'])
        self.add_group('Service Place Of Business/Establishment',
                       ['venue', 'spa', 'bridal_salon'])
        self.add_group('Live Performance Businesses', ['band', 'dj', 'ensemble', 'officiant', 'soloist', 'variety-acts'])
        self.add_group('Creative Content Businesses',
                       ['calligrapher', 'caricature-artist', 'event-artist', 'hashtag-author', 'invitations', 'signage',
                        'vow-writer', 'boudoir-photographer'])
        self.add_group('Goods Providers', ['gifts', 'wedding-favors'])
        self.add_group('Accommodation/Transport Businesses',
                       ['guest-accommodations', 'cruise-operator'])
