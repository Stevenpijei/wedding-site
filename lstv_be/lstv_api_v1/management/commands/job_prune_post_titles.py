from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar

from lstv_api_v1.tasks.tasks import job_process_ip_to_geo


class Command(BaseCommand):

    def handle(self, *args, **options):


        forbidden = ['na', 'test',
                     'teaser', 'cinematography', 'loose leaf weddings', 'promo video', 'wedding video may 2020',
                     'highlight reel 2020', '2019 brides', 'milan photo cine art', 'cinematic', '2019 review',
                     'reel0.1', 'wedding video april 2019']

        with alive_bar(Video.objects.count(), "- pruning video browse tab titles for accuracy", length=10,
                       bar="blocks") as bar:
            for video in Video.objects.all():
                venue = video.businesses.filter(business_role_type__slug='venue').values_list('business__name',
                                                                                              flat=True).first()
                if not venue:
                    print(video.post.slug + " -> " + " no venue")
                    video.state = ContentModelState.suspended_review
                    video.save()

                if not video.location or not video.post.properties.filter(
                        key='spouse_1').first() or video.properties.filter(
                    key='spouse_2').first():
                    if not video.post.properties.filter(key='spouse_1').first() or not video.properties.filter(
                            key='spouse_2').first():
                        video.state = ContentModelState.suspended_review
                        couple = video.title.split('|')[0].split("+")
                        if len(couple) == 2 and couple[0].strip().lower() not in forbidden and couple[
                            1].strip().lower() not in forbidden and not couple[0].strip().isnumeric() and not couple[
                            1].strip().isnumeric() and not (couple[0].strip().lower() == couple[1].strip().lower()):
                            print(f"{video.post.slug} -> no couples - fixable: --> {couple[0]} + {couple[1]}")
                            video.state = ContentModelState.active

                            s1 = Properties(key='spouse_1', value_text=couple[0].title())
                            s1.save()
                            video.post.properties.add(s1)
                            s2 = Properties(key='spouse_2', value_text=couple[1].title())
                            s2.save()
                            video.post.properties.add(s2)

                            if len(couple[0]) < 2 or len(couple[1]) < 2:
                                video.state = ContentModelState.active_review
                        video.save()

                if video.state in [ContentModelState.active, ContentModelState.active_review]:
                    venue = video.businesses.filter(business_role_type__slug='venue').values_list('business__name',
                                                                                                  flat=True).first()
                    video.title = f"{video.post.properties.filter(key='spouse_1').first().value_text} + " \
                                  f"{video.post.properties.filter(key='spouse_2').first().value_text} | {str(video.location)} | " \
                                  f"{venue}"
                    video.save()
                bar()

        with alive_bar(Video.objects.count(), "- checking titles", length=10,
                       bar="blocks") as bar:
            for video in Video.objects.all():
                s = video.title.split('|')

                if len(s) < 1 or len(s[0].strip()) < 1 or len(s[0].split("+")) < 2:
                    print(f"{video.post.slug} -> no couple names")
                if len(s) < 2 or len(s[1].strip()) < 3:
                    print(f"{video.post.slug} -> no location -> {video.title} -> {s[1].strip()}")

                if len(s) < 3 or len(s[2].strip()) < 1:
                    print(f"{video.post.slug} -> no venue")
                bar()

        print(f"total: {Video.objects.count()}")
