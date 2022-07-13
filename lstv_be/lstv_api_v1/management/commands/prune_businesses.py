from django import db
from django.core.management.base import BaseCommand
from django.db import IntegrityError

from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo
from lstv_api_v1.utils.utils import retire_tag_type_and_replace_with_another, \
    purge_business_and_replace_video_team_tag_with_tag


class Command(BaseCommand):

    def handle(self, *args, **options):
        # DELETE

        # A Venue
        # Iceland                       > Make sure country for all of these is Iceland
        # Various
        # Paris                         > Make sure city is Paris, france
        # ?
        # \"Vodolei\"
        # A Country Oasis
        # A Venue In Ipswich
        # @Boshoek
        # Ã˜rslev Egnshus
        # Åšw. Jadwigi KÃ³lowej
        # A Tuscan Hill

        biz = ['A Venue',
               'Iceland',
               'Various',
               'Paris',
               '?',
               '\"Vodolei\"',
               'A Country Oasis',
               'A Venue In Ipswich',
               '@Boshoek',
               'Ørslev Egnshus',
               'Św. Jadwigi Kólowej',
               'A Tuscan Hill']

        for name in biz:
            biz = Business.objects.filter(name=name).first()
            if biz:
                biz.dangerously_purge_from_system()
            else:
                print(f"cant find {name}")

        # create new venue type tags
        venue_types_tag_family = TagFamilyType.objects.filter(slug='venue-types').first()
        if not venue_types_tag_family:
            print("issue finding venue-type tag family")
            exit(1)

        if not TagType.objects.filter(slug='city').first():
            nt = TagType(name="City Wedding", slug='city',
                         tag_family_type=venue_types_tag_family,
                         legacy_term_id=None,
                         legacy_url=None)
            nt.save()

        if not TagType.objects.filter(slug='desert').first():
            nt = TagType(name="Desert Wedding", slug='desert',
                         tag_family_type=venue_types_tag_family,
                         legacy_term_id=None,
                         legacy_url=None)
            nt.save()

        if not TagType.objects.filter(slug='lake-house').first():
            nt = TagType(name="Lake House Wedding", slug='lake-house',
                         tag_family_type=venue_types_tag_family,
                         legacy_term_id=None,
                         legacy_url=None)
            nt.save()

        if not TagType.objects.filter(slug='stream').first():
            nt = TagType(name="Stream Wedding", slug='stream',
                         tag_family_type=venue_types_tag_family,
                         legacy_term_id=None,
                         legacy_url=None)
            nt.save()


        # change/merge  tag types
        retire_tag_type_and_replace_with_another('private-home', 'home')
        retire_tag_type_and_replace_with_another('lake', 'lake-house')
        retire_tag_type_and_replace_with_another('lakefront', 'lake-house')

        # rename event-hall to hall in venue types and in venue type tags

        tag = TagType.objects.filter(slug='event-hall').first()
        if tag:
            tag.name = "Hall Wedding"
            tag.slug = "hall"
            tag.save()

        # biz -> delete biz -> make it a tag instead

        purge_business_and_replace_video_team_tag_with_tag('a-mountaintop', 'mountain')
        purge_business_and_replace_video_team_tag_with_tag('mountain', 'mountain')
        purge_business_and_replace_video_team_tag_with_tag('a-villa', 'villa')
        purge_business_and_replace_video_team_tag_with_tag('a-tent', 'tent')
        purge_business_and_replace_video_team_tag_with_tag('a-stream', 'stream')
        purge_business_and_replace_video_team_tag_with_tag('a-restaurant', 'restaurant')
        purge_business_and_replace_video_team_tag_with_tag('a-spacious-ranch', 'ranch')
        purge_business_and_replace_video_team_tag_with_tag('a-lodge', 'lodge')
        purge_business_and_replace_video_team_tag_with_tag('lake-house', 'lake-house')
        purge_business_and_replace_video_team_tag_with_tag('lakefront', 'lake-house')
        purge_business_and_replace_video_team_tag_with_tag('a-hotel', 'hotel')
        purge_business_and_replace_video_team_tag_with_tag('hotel', 'hotel')
        purge_business_and_replace_video_team_tag_with_tag('private', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-family-home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('family-home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('private-residence', 'home')
        purge_business_and_replace_video_team_tag_with_tag('home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-private-property', 'home')
        purge_business_and_replace_video_team_tag_with_tag('private-property', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-house', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-big-house', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('house', 'home')
        purge_business_and_replace_video_team_tag_with_tag('backyard', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-private-home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('private-home', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-country-house', 'home')
        purge_business_and_replace_video_team_tag_with_tag('a-reception-hall', 'hall')
        purge_business_and_replace_video_team_tag_with_tag('a-golf-course', 'golf-course')
        purge_business_and_replace_video_team_tag_with_tag('a-forest', 'forest')
        purge_business_and_replace_video_team_tag_with_tag('a-field', 'field')
        purge_business_and_replace_video_team_tag_with_tag('a-family-farm', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('private-farm', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('family-farm', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('a-farmhouse', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('backyard-farm', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('a-farm', 'farm')
        purge_business_and_replace_video_team_tag_with_tag('private-estate', 'estate')
        purge_business_and_replace_video_team_tag_with_tag('a-desert', 'desert')
        purge_business_and_replace_video_team_tag_with_tag('a-courthouse', 'courthouse')
        purge_business_and_replace_video_team_tag_with_tag('a-cliff', 'cliff')
        purge_business_and_replace_video_team_tag_with_tag('city', 'city')
        purge_business_and_replace_video_team_tag_with_tag('a-church', 'church')
        purge_business_and_replace_video_team_tag_with_tag('a-catholic-church', 'church')
        purge_business_and_replace_video_team_tag_with_tag('church', 'church')
        purge_business_and_replace_video_team_tag_with_tag('a-family-chapel', 'church')
        purge_business_and_replace_video_team_tag_with_tag('castle', 'castle')
        purge_business_and_replace_video_team_tag_with_tag('a-beach', 'beach')
        purge_business_and_replace_video_team_tag_with_tag('beach', 'beach')
        purge_business_and_replace_video_team_tag_with_tag('beach-house', 'beach')
        purge_business_and_replace_video_team_tag_with_tag('a-barn', 'barn')

        with alive_bar(Video.objects.count(), "- adding tags for venue types to all videos", bar="blocks",
                       length=10) as bar:
            # tag videos with venues but no tags of the "venue type" family with those tags according to the venue type
            for vid in Video.objects.all():
                for b in vid.businesses.all():
                    if b.venue_type:
                        for f in vid.vibes.filter(tag_family_type__slug='venue-type'):
                            vid.vibes.remove(f)

                        tag_slug = b.venue_type.slug
                        if tag_slug == 'lake' or tag_slug == 'lakefront':
                            tag_slug = 'lake-house'
                        if tag_slug == 'event-hall':
                            tag_slug = 'hall'

                        t = TagType.objects.filter(slug=tag_slug).first()
                        if not t:
                            print(f"------cant find tag {tag_slug}")
                        else:
                            vid.vibes.add(t)
                            #print(f"added {t.name} ({t.slug}) to {vid.post.slug}")
                bar()




        # special attention

        # JW Marriot	10			These should all be tagged with the specific Marriott, we can flag for Alicia
        # Four Seasons Hotel	16			These should all be re-tagged with the actual Four Seasons locationÉ we can flag for Alicia who can do this
