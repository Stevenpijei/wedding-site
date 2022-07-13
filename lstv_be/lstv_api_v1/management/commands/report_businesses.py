from django.core.management.base import BaseCommand
from lstv_api_v1.models import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):

    def handle(self, *args, **options):
        rows = []
        i=0
        with alive_bar(Business.objects.all().count(), "gathering businesses", bar="blocks", length=10) as bar:
            for business in Business.objects.all().order_by("-created_at").iterator():
                team_member = BusinessTeamMember.objects.filter(business=business).first()
                biz_loc = business.business_locations.first()
                if biz_loc and not biz_loc.has_content():
                    biz_loc = None
                row = [f"{business.created_at.strftime('%Y-%m-%d')}",
                       business.name,
                       business.get_roles_as_text(),
                       str(biz_loc) if biz_loc else "",
                       team_member.user.email if team_member else "",
                       team_member.user.get_name() if team_member else "",
                       business.weight_videos,
                       business.weight_photos,
                       business.video_views,
                       ]
                rows.append(row)
                i+=1
                # if i > 100:
                #     break;
                bar()

        # field names
        fields = ['created_at', 'Name', 'Roles', 'Location', 'Admin Email', 'Admin Name', 'Weight:Videos',
                  'Weight:Photos', 'Video Views']

        # name of csv file
        filename = "test.csv"

        # writing to csv file
        with open(filename, 'w') as csvfile:
            # creating a csv writer object
            csvwriter = csv.writer(csvfile)

            # writing the fields
            csvwriter.writerow(fields)

            # writing the data rows
            csvwriter.writerows(rows)
