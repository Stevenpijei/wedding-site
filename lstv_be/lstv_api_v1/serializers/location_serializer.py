from rest_framework import serializers

#   _                     _   _                _____           _       _ _
#  | |                   | | (_)              / ____|         (_)     | (_)
#  | |     ___   ___ __ _| |_ _  ___  _ __   | (___   ___ _ __ _  __ _| |_ _______ _ __
#  | |    / _ \ / __/ _` | __| |/ _ \| '_ \   \___ \ / _ \ '__| |/ _` | | |_  / _ \ '__|
#  | |___| (_) | (_| (_| | |_| | (_) | | | |  ____) |  __/ |  | | (_| | | |/ /  __/ |
#  |______\___/ \___\__,_|\__|_|\___/|_| |_| |_____/ \___|_|  |_|\__,_|_|_/___\___|_|

from lstv_api_v1.models import CuratedLocation, Properties, ContentVerbosityType
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer


class LocationSerializer(LSTVBaseSerializer):
    # a-la-carte items (can be used or omitted individually)
    page_title = serializers.CharField(max_length=100, min_length=3, required=False)
    page_description = serializers.CharField(max_length=500, min_length=3, required=False)
    businesses_title = serializers.CharField(max_length=100, min_length=3, required=False)

    # middle info group (must be all or none)
    middle_info_header_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_header_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_text_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_text_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    middle_info_image_url = serializers.CharField(max_length=150, min_length=3, required=False)

    # bottom info group (must be all or none)
    bottom_info_header_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_text_1 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_text_2 = serializers.CharField(max_length=100, min_length=3, required=False)
    bottom_info_image_url_1 = serializers.CharField(max_length=150, min_length=3, required=False)
    bottom_info_image_url_2 = serializers.CharField(max_length=150, min_length=3, required=False)

    # bottom info group (must be all or none)

    def get_fields(self, *args, **kwargs):
        """
        When we're on PATCH or DELETE we do not require most of the mandatory fields.
        """
        fields = super(LocationSerializer, self).get_fields()
        method = getattr(self.request, 'method', None)
        return fields

    def validate(self, data):
        method = getattr(self.request, 'method', None)

        if method == 'POST':
            cur_loc = CuratedLocation.objects.filter(place=self.element.place,
                                                     state_province=self.element.state_province,
                                                     county=self.element.county, country=self.element.country).first()
            if cur_loc:
                raise serializers.ValidationError("curated content already exists for this location.")

        middle_fields = ["middle_info_header_1",
                         "middle_info_header_2",
                         "middle_info_text_1",
                         "middle_info_text_2",
                         "middle_info_image_url"]

        bottom_fields = ["bottom_info_header_1",
                         "bottom_info_text_1",
                         "bottom_info_text_2",
                         "bottom_info_image_url_1",
                         "bottom_info_image_url_2"]

        if any(key in data for key in middle_fields):
            if not all(key in data for key in middle_fields):
                raise serializers.ValidationError(
                    f"if one middle_info field is used, all middle_info fields "
                    f"must be used too ({', '.join(middle_fields)})")

        if any(key in data for key in bottom_fields):
            if not all(key in data for key in bottom_fields):
                raise serializers.ValidationError(
                    f"if one bottom_fields field is used, all bottom_fields fields "
                    f"must be used too ({', '.join(bottom_fields)})")

        return data

    def create(self, validated_data):
        cur_loc = CuratedLocation(place=self.element.place,
                                  state_province=self.element.state_province,
                                  county=self.element.county, country=self.element.country)
        cur_loc.save()

        for key in validated_data:
            p = Properties(key=key, value_text=validated_data[key])
            p.save()
            cur_loc.curated_fields.add(p)

        return {self.element.id}

    def update(self, instance, validated_data):
        fields = ["page_title",
                  "page_description",
                  "businesses_title",
                  "middle_info_header_2",
                  "middle_info_text_1",
                  "middle_info_text_2",
                  "middle_info_image_url",
                  "bottom_info_header_1",
                  "bottom_info_text_1",
                  "bottom_info_text_2",
                  "bottom_info_image_url_1",
                  "bottom_info_image_url_2"]

        cur_loc = curated_location = CuratedLocation.objects.filter(place=instance.place,
                                                                    state_province=instance.state_province,
                                                                    county=instance.county,
                                                                    country=instance.country).first()
        if cur_loc:
            for field in fields:
                if validated_data[field]:

                    prop = curated_location.curated_fields.filter(key=field).first()
                    if prop:
                        prop.value_text = validated_data[field]
                        prop.save()
                    else:
                        prop = Properties(key=field, value_text=validated_data[field])
                        prop.save()
                        curated_location.curated_fields.add(prop)

            return {"updated": str(instance) + " curated content"}

        return None

    def process_custom_fields(self, curated_content, obj, data):
        for cci in curated_content.keys():
            curated_content[cci] = curated_content[cci].replace("{weight_videos}", f"{data['weight_videos']:,}")
            curated_content[cci] = curated_content[cci].replace("{name}", f"{str(obj)}")
            curated_content[cci] = curated_content[cci].replace("{full}", f"{str(obj)}")

            curated_content[cci] = curated_content[cci].replace("{place}", obj.place.name if obj.place else "")
            curated_content[cci] = curated_content[cci].replace("{state_province}",
                                                                obj.state_province.name if obj.state_province else "")
            curated_content[cci] = curated_content[cci].replace("{county}", obj.county.name if obj.county else "")
            curated_content[cci] = curated_content[cci].replace("{country}", obj.country.name if obj.country else "")
        return curated_content

    def to_representation(self, obj):
        def get_obj_dict(obj):
            if self.verbosity == ContentVerbosityType.card:
                return {"display_name": str(obj)}
            data = {"location_id": obj.id}
            if obj.address1:
                data['address'] = obj.address1
            if obj.address2:
                data['address_number_suite_floor'] = obj.address2
            if obj.lat:
                data['lat'] = obj.lat
            if obj.long:
                data['long'] = obj.long
            if obj.country:
                data['classification'] = 'country'
                data['weight_videos'] = obj.country.weight_videos
                data['weight_articles'] = obj.country.weight_articles
                data['weight_photos'] = obj.country.weight_photos
                data['weight_businesses_based_at'] = obj.country.weight_businesses_based_at
                data['weight_businesses_worked_at'] = obj.country.weight_businesses_work_at
                data['display_name'] = str(obj)
                data['country'] = obj.country.name
                data['country_id'] = obj.country.id
                data['country_slug'] = obj.country.slug
                data['country_url'] = obj.get_country_url()

            if obj.state_province:
                data['classification'] = 'state_province'
                data['weight_videos'] = obj.state_province.weight_videos
                data['weight_articles'] = obj.state_province.weight_articles
                data['weight_photos'] = obj.state_province.weight_photos
                data['weight_businesses_based_at'] = obj.state_province.weight_businesses_based_at
                data['weight_businesses_worked_at'] = obj.state_province.weight_businesses_work_at
                data['state_province'] = obj.state_province.name
                data['state_province_id'] = obj.state_province.id
                data['state_province_slug'] = obj.state_province.slug
                data['state_province_url'] = obj.get_state_province_url()

            if obj.county:
                data['classification'] = 'county'
                data['weight_videos'] = obj.county.weight_videos
                data['weight_articles'] = obj.county.weight_articles
                data['weight_photos'] = obj.county.weight_photos
                data['weight_businesses_based_at'] = obj.county.weight_businesses_based_at
                data['weight_businesses_worked_at'] = obj.county.weight_businesses_work_at
                data['county'] = obj.county.name
                data['county_id'] = obj.county.id
                data['county_slug'] = obj.county.slug
                data['county_url'] = obj.get_county_url()

            if obj.place:
                data['classification'] = 'place'
                data['weight_videos'] = obj.place.weight_videos
                data['weight_articles'] = obj.place.weight_articles
                data['weight_photos'] = obj.place.weight_photos
                data['weight_businesses_based_at'] = obj.place.weight_businesses_based_at
                data['weight_businesses_worked_at'] = obj.place.weight_businesses_work_at
                data['place'] = obj.place.name
                data['place_id'] = obj.place.id
                data['place_slug'] = obj.place.slug
                data['place_url'] = obj.get_place_url()

            # curated content?

            curated_location = CuratedLocation.objects.filter(place=obj.place,
                                                              state_province=obj.state_province,
                                                              county=obj.county,
                                                              country=obj.country).first()
            if curated_location:
                curation = {}
                curated_fields = curated_location.curated_fields.all()
                for field in curated_fields:
                    curation[field.key] = field.value_text
                data["curated_content"] = self.process_custom_fields(curation, obj, data)

            return data

        if isinstance(obj, list):
            rc = []
            for e in obj:
                rc.append(get_obj_dict(e))
            return rc

        else:
            return get_obj_dict(obj)
