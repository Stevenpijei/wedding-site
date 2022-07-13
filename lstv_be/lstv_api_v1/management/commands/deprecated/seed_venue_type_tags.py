from django import db
from django.core.management.base import BaseCommand
from django.db import IntegrityError

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo


class Command(BaseCommand):

    def handle(self, *args, **options):

        # tag family exists?
        repurposed = 0
        added = 0
        venue_types_tag_family = TagFamilyType.objects.filter(slug='venue-types').first()
        if not venue_types_tag_family:
            venue_types_tag_family = TagFamilyType(name='Venue Types', slug='venue-types', legacy_term_ids=[])
            venue_types_tag_family.save()

        print(venue_types_tag_family.slug)
        print(f"{BusinessVenueType.objects.count()} total venue types")

        TagType.objects.filter(tag_family_type__slug=venue_types_tag_family.slug).delete()
        for venue_type in BusinessVenueType.objects.all():
            # print(f"adding {venue_type.name}")
            try:
                nt = TagType(name=f"{venue_type.name} Wedding", slug=venue_type.slug,
                             tag_family_type=venue_types_tag_family,
                             legacy_term_id=None,
                             legacy_url=None)
                nt.save()
                added += 1
            except db.utils.IntegrityError:
                et = TagType.objects.filter(slug=venue_type.slug).first()
                if et:
                    print(f"wow! {venue_type.name} ({et.tag_family_type.name}) exists! re-purposing for venue types")
                    et.tag_family_type = venue_types_tag_family
                    et.save()
                    repurposed += 1

        print(f"{TagType.objects.count()} total tag types")
        print(f"{TagType.objects.filter(tag_family_type__slug='venue-types').count()} total venue-type types")
        print(f"{added} venue type tags added")
        print(f"{repurposed} venue tag types repurposed")


