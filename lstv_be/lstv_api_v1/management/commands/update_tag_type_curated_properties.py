import csv
from django.core.management.base import BaseCommand
from lstv_api_v1.models import *


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            'csv-file',
            help='the csv file that is '
        )
        parser.add_argument(
            '--print-only',
            action='store_true',
            help='do not change database, print changes to the console'
        )

    def handle(self, *args, **options):
        keys = [
            "page_title",
            "page_description",
            "businesses_title",
            "middle_info_header_1",
            "middle_info_text_1",
            "middle_info_header_2",
            "middle_info_text_2",
            "middle_info_image_url",
            "middle_info_image_credit",
            "bottom_info_header_1",
            "bottom_info_text_1",
            "bottom_info_text_2",
            "bottom_info_image_url_1",
            "bottom_info_image_url_credit_1",
            "bottom_info_image_url_2",
            "bottom_info_image_url_credit_2",
        ]

        with open(options['csv-file'], 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                slug = row[0]
                if slug[-8:] == " wedding":
                    slug = slug[:-8]
                row_data = zip(keys, row[1:])

                print("working on tag type", slug)
                tag_type = TagType.objects.get(slug=slug)

                for (key, data) in row_data:
                    if options['print_only']:
                        print(f"for slug {slug} set {key} to {data}")
                        continue

                    # remove duplicates by removing all and recreating
                    active_props = tag_type.curated_properties.filter(
                        key=key, state=ContentModelState.active
                    )
                    if active_props.count() > 1:
                        active_props[1:].delete()

                    tag_type.curated_properties.update_or_create(
                        key=key,
                        defaults={"value_text": data}
                    )


        return