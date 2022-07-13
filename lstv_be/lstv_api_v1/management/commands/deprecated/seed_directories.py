from django.core.management.base import BaseCommand
from lstv_api_v1.tasks import tasks
from lstv_api_v1.utils.aws_utils import invalidate_public_cdn_path, invalidate_server_endpoint
from lstv_api_v1.utils.legacy_model_utils import *
from alive_progress import alive_bar
import csv


class Command(BaseCommand):
    defs = {}

    def handle(self, *args, **options):

        business_show_in_dropdown = {

        }

        def business_create_single(role_type):
            sd = DirectoryType(
                priority=business_show_in_dropdown.get(slugify_2(role_type.plural), {}).get('priority', None) or 9999,
                show_in_dropdown=business_show_in_dropdown.get(slugify_2(role_type.plural)) is not None,
                name=business_show_in_dropdown.get(role_type.slug, {}).get('name_override', None) or role_type.plural,
                slug="wedding-" + slugify_2(
                    business_show_in_dropdown.get(slugify_2(role_type.plural), {}).get('name_override',
                                                                                       None) or slugify_2(
                        role_type.plural)),
                content_type=DirectoryPageClass.business)
            sd.slug = sd.slug.replace("wedding-wedding", "wedding").replace("wedding-green-wedding-consultants",
                                                                            "green-wedding-consultants")
            sd.save()
            if type(role_type) == BusinessRoleType:
                sd.role_types.add(role_type)
            if type(role_type) == VideoBusinessCapacityType:
                sd.role_capacity_types.add(role_type)

        def create_aggregation(role_types, priority, name, show_in_dropdown):
            sd = DirectoryType(
                priority=priority,
                name=name,
                content_type=DirectoryPageClass.business,
                slug="wedding-" + slugify_2(name.replace(" & ", " and ")),
                subtitle_name_plural=name + " Wedding Vendors",
                subtitle_name_singular=name + " Wedding Vendor",
                show_in_dropdown=show_in_dropdown
            )

            sd.slug = sd.slug.replace("wedding-wedding", "wedding")
            sd.save()
            for s in role_types:
                s = s.split('|')
                r = BusinessRoleType.objects.filter(slug=slugify_2(s[0])).first()
                if not r:
                    r = VideoBusinessCapacityType.objects.filter(slug=slugify_2(s[0])).first()
                if type(r) == BusinessRoleType:
                    sd.role_types.add(r)
                if type(r) == VideoBusinessCapacityType:
                    sd.role_capacity_types.add(r)

        for co in DirectoryType.objects.all():
            co.delete_deep()

        # business (role + role capacity + aggregation)

        for role_type in BusinessRoleType.objects.all():
            business_create_single(role_type)

        for role_capacity_type in VideoBusinessCapacityType.objects.all():
            business_create_single(role_capacity_type)

        create_aggregation(
            business_roles['Venues'], 2,
            "Venues", True)

        create_aggregation(
            business_roles['Fashion'], 3,
            "Fashion", True)

        create_aggregation(
            business_roles['Planning & Design'], 5,
            "Planning & Design", True)

        create_aggregation(
            business_roles['Florals'], 7,
            "Florals", True)

        create_aggregation(
            business_roles['Food & Beverage'], 8,
            "Food & Beverage", True)

        create_aggregation(
            business_roles['Music & Entertainment'], 6,
            "Music & Entertainment", True)

        create_aggregation(
            business_roles['Officiant & Ceremony'], 10,
            "Officiant & Ceremony", True)

        create_aggregation(
            business_roles['Signage & Stationery'], 11,
            "Signage & Stationery", True)

        create_aggregation(
            business_roles['Decor & Rentals'], 9,
            "Decor & Rentals", True)

        create_aggregation(
            ['brides-dress-designer'], 9999, "Wedding Dresses", False)

        create_aggregation(
            business_roles['Beauty'], 4,
            "Beauty", True)

        create_aggregation(
            business_roles['Jewelry'], 12,
            "Jewelry", False)

        # all businesses

        sd = DirectoryType(
            priority=9999,
            name="Wedding Vendors",
            content_type=DirectoryPageClass.business,
            slug="wedding-vendors",
            show_in_dropdown=False
        )
        sd.save()

        # video

        sd = DirectoryType(
            priority=9999,
            name="Wedding Videos",
            content_type=DirectoryPageClass.video,
            slug="wedding-videos",
            show_in_dropdown=False,
            show_search=False
        )
        sd.save()

        # styles

        sd = DirectoryType(
            priority=9999,
            name="Wedding Styles",
            content_type=DirectoryPageClass.style,
            slug="wedding-styles",
            show_in_dropdown=False,
            show_search=False
        )
        sd.save()

        # articles

        sd = DirectoryType(
            priority=9999,
            name="Advice",
            content_type=DirectoryPageClass.article,
            slug="wedding-advice",
            subtitle_name_plural="Articles",
            subtitle_name_singular="Article",
            show_in_dropdown=False,
            show_search=False
        )
        sd.save()

        print("business directories")
        print("--------------------")

        for d in DirectoryType.objects.all():

            if d.slug == 'wedding-videographer':
                d.description = "Did you know the #1 regret of newlyweds is NOT hiring a videographer? Don't " \
                                "let this happen to you! Browse and discover videographers by location to find " \
                                "the perfect team to capture your big day."

            elif d.slug == 'wedding-video-and-photo':
                d.description = "Not hiring a videographer or a photographer for your wedding is a common mistake " \
                                "newlyweds often regret. Don't let this happen to you! Browse and discover " \
                                "videographers, photographers and other professional and forever capture your big day."

            elif d.slug == 'wedding-venues':
                d.description = "You can't plan your wedding until you know where you're going to have it! Browse " \
                                "wedding venues and watch real weddings hosted there to find the perfect setting for " \
                                "your big day."

            elif d.slug == 'wedding-venues':
                d.description = "You can't plan your wedding until you know where you're going to have it! Browse " \
                                "wedding venues and watch real weddings hosted there to find the perfect setting for " \
                                "your big day."

            elif d.slug == 'wedding-vendors':
                d.description = "Find your wedding dream team! Browse and discover pros by location to find the ideal " \
                                "group of experts to help you plan your big day."

            elif d.slug == 'wedding-fashion':
                d.description = "Browse and discover wedding dress, bridesmaid dress, and suiting designers. Watch " \
                                "real wedding videos featuring these brands to find the perfect styles for your big " \
                                "day."

            elif d.slug == 'wedding-videos':
                d.description = "Browse our massive library of wedding videos to find pros, products, and services " \
                                "for your wedding! Search by location to get inspiration from real weddings hosted " \
                                "near you."

            elif d.slug == 'wedding-advice':
                d.description = "The Love Stories TV team is here to help! Re-planning your wedding because of the " \
                                "pandemic? Writing your own vows? Planning a lesbian ceremony? Not sure how to hire " \
                                "the perfect wedding planner? We've got you covered!"

            elif d.slug == 'wedding-styles':
                d.description = "Browse and discover wedding videos by style to get ideas for your big day. From " \
                                "bohemian elopements to black-tie ballroom affairs, to country backyard weddings -- " \
                                "prepare to be inspired!"

            elif d.content_type == DirectoryPageClass.business:
                roles = []
                for rt in d.role_types.all():

                    if rt.slug != "dj":
                        roles.append(rt.plural.lower())
                    else:
                        roles.append(rt.plural)

                for rct in d.role_capacity_types.all():
                    roles.append(rct.plural.lower())
                role_str = " and ".join([", ".join(roles[:-1]), roles[-1]] if len(roles) > 2 else roles)
                d.description = f"Browse and discover {role_str} by location to find the perfect team for your " \
                                f"big day"

            d.save()
            bg_color = {"#000000": 0}
            for rt in d.role_types.all():
                if not d.bg_color or d.bg_color == "#000000":
                    if rt.role_family_type.bg_color not in bg_color:
                        bg_color[rt.role_family_type.bg_color] = 1
                    else:
                        bg_color[rt.role_family_type.bg_color] += 1

            for rct in d.role_capacity_types.all():
                if not d.bg_color or d.bg_color == "#000000":
                    if rct.business_role_type.role_family_type.bg_color not in bg_color:
                        bg_color[rct.business_role_type.role_family_type.bg_color] = 1
                    else:
                        bg_color[rct.business_role_type.role_family_type.bg_color] += 1

            val = 0
            bg_choice = None
            for k in bg_color.keys():
                if bg_color[k] > val:
                    val = bg_color[k]
                    bg_choice = k
            d.bg_color = bg_choice or "#000000"
            if d.slug == 'wedding-videographers':
                d.priority = 0
                d.show_in_dropdown = True
            if d.slug == 'wedding-photographers':
                d.priority = 1
                d.show_in_dropdown = True
            d.save()

    invalidate_server_endpoint("/v1/directory*")
