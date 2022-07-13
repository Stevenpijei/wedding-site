from django import db
from django.core.management.base import BaseCommand
from django.db import IntegrityError

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.utils import retire_tag_type_and_replace_with_another, \
    purge_business_and_replace_video_team_tag_with_tag, retire_tag, slugify_2


class Command(BaseCommand):

    def handle(self, *args, **options):
        # retire_tag_type_and_replace_with_another('private-home', 'home')

        to_delete = ['Bride & Groom',
                     'Love Story',
                     'Saris Dresses',
                     'Blush Pink',
                     'Light Pink',
                     'Wine',
                     'Maroon',
                     'Off White',
                     'Gold and Blue',
                     'Light Green',
                     'Light Purple',
                     'Show Me Your MuMu',
                     'Anthropologie',
                     'Assorted Bright Colors',
                     'baby blue',
                     'Beige Saari\'s',
                     'Berry',
                     'Blush + Leather Jackets',
                     'Blush and Burgundy',
                     'Blush Dresses',
                     'Cranberry',
                     'Dark Red',
                     'Dark Red Dresses',
                     'Dirty Pink',
                     'Dusty Rose',
                     'Eggshell',
                     'Emerald Green',
                     'Fog',
                     'garnet',
                     'Gray',
                     'Greens and Blues',
                     'Grey & Brown',
                     'Hunter Green',
                     'Ice Blue',
                     'Ice Mint',
                     'Ivory & Gold',
                     'Kuraje',
                     'Kuraje Salon',
                     'Lace White',
                     'Light Blue',
                     'light grey',
                     'Light Pink Dresses',
                     'Light Purple Dresses',
                     'Lilac',
                     'Lilac and Mauve',
                     'Maroon, red',
                     'Mauve / Mismatched Pinks / Sequin',
                     'MAxMara',
                     'Mint and Light Blue',
                     'Mint Dresses',
                     'none',
                     'Nude/Pale Pink',
                     'Orange',
                     'Pale Blue',
                     'Pale Blush',
                     'Pale Pink Dresses',
                     'Pastel Blue',
                     'Pastel floral',
                     'Peach',
                     'Pink and Teal',
                     'Pink Dresses (Designer: Bill Levkoff)',
                     'powder blue',
                     'Rose',
                     'rose gold',
                     'Rose Gold Sequin',
                     'Royal Blue',
                     'Royal Blue and Deep Red',
                     'Salmon',
                     'Sea blue',
                     'Seafoam',
                     'shades of nude + light pink',
                     'Shades of Nude + Pink',
                     'Silver Sage',
                     'Silver/ Gray',
                     'Soft Blue',
                     'Teal',
                     'Tiffany Blue',
                     'Turquoise/Blue Dresses',
                     'Unnamed',
                     'various colors',
                     'White and Satin',
                     'Wildberry',
                     'Yellow',
                     'Aqua',
                     'Black and gold',
                     'Bohemian Rhapsody (mauve)',
                     'mint green',
                     'Pale Pink / Beige',
                     'Sea Foam']

        for tag in to_delete:
            retire_tag(slugify_2(tag))

        retire_tag_type_and_replace_with_another('flower-headband-hairstyle', 'flower-hairstyle')

        for tag in TagType.objects.filter(tag_family_type__slug__in=['dress-color', 'dress-style', 'hair-style', 'suit-style']):
            print(f"suspending {tag.slug} ({tag.tag_family_type.slug})")
            tag.state = ContentModelState.suspended
            tag.save()
    