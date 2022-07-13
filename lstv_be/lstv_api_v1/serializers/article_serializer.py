import statistics
from json import JSONDecodeError

from rest_framework import serializers
from lstv_api_v1.serializers.base_serializers import LSTVBaseSerializer
from lstv_api_v1.serializers.business_serializer import BusinessSerializer
from lstv_api_v1.serializers.serializers_content_interaction import ReviewsSerializer
from lstv_api_v1.serializers.serializers_messaging import InPageMessagingSerializer
from lstv_api_v1.serializers.serializers_posts import PropertySerializer, \
    BusinessRoleTypeSerializer, BusinessPhoneSerializer, BusinessCohortSerializer, BusinessSocialLinksSerializer, \
    BusinessVenueTypesSerializer, BusinessLocationSerializer, BusinessLocationAndCoverageSerializer, \
    BusinessPublicTeamSerializer, BusinessAssociateBrandsSerializer, BusinessSoldAtSerializer, TagSerializer
from lstv_api_v1.serializers.serializers_utils import validate_uuid
from lstv_api_v1.serializers.location_serializer import LocationSerializer
from lstv_api_v1.serializers.tag_type_serializer import TagTypeSerializer
from lstv_api_v1.utils.model_utils import slugify_2
from lstv_api_v1.models import *
from lstv_api_v1.utils.utils import convert_legacy_blog_content, convert_legacy_blog_content_with_soup
from lstv_api_v1.views.utils.view_utils import legacy_url_image


class ArticleSerializer(LSTVBaseSerializer):
    def to_representation(self, obj):
        article = Article.objects.filter(post__slug=obj.slug).first()
        if not article:
            return None

        if self.verbosity == ContentVerbosityType.slug:
            return {'slug': obj.slug}

        locations = []
        for location in article.locations.filter(country__isnull=False):
            location_obj = LocationSerializer(verbosity=ContentVerbosityType.full).to_representation(location)
            locations.append(location_obj)
        businesses = BusinessSerializer(many=True, verbosity=ContentVerbosityType.slug).to_representation(
            article.businesses)
        tags = TagTypeSerializer(many=True).to_representation(article.tags)
        blog_name_tag = None

        for tag in article.tags.all():
            if tag.tag_family_type.slug == 'lstv-editorial':
                blog_name_tag = tag
            article.tags.remove(blog_name_tag)

        if self.verbosity in [ContentVerbosityType.admin_list, ContentVerbosityType.admin_full]:
            rc = {
                'id': article.id,
                'post_id': obj.id,
                'created_at': obj.created_at,
                'updated_at': obj.updated_at,
                'slug': obj.slug,
                'location': locations,
                'views': article.views,
                'likes': article.likes,
                'businesses': businesses,
                'tags': tags,
                'thumbnail_url': legacy_url_image(article.thumbnail.get_serve_url() if article.thumbnail else None),
                'author_id': obj.author.id if obj.author else None,
                'author_name': obj.author.get_full_name_or_email() if obj.author and obj.author.get_full_name_or_email() else "LSTV Staff",
                'author_email': obj.author.email if obj.author else None,
                'author_thumbnail_url': obj.author.profile_image.get_serve_url() if (obj.author and
                                                                                     obj.author.profile_image) else None,
                'title': obj.title,
                'properties': PropertySerializer(many=False).to_representation(obj.properties.exclude(
                    key__contains='legacy_'))
            }

            if self.verbosity in [ContentVerbosityType.admin_full]:
                rc['content'] = article.content or convert_legacy_blog_content_with_soup(article.content_legacy)

            if self.scope in ['active_review', 'suspended_review']:
                try:

                    rc["issue"] = json.loads(obj.state_desc[0]).get('issue', None) if obj.state_desc else None
                except JSONDecodeError:
                    rc["issue"] = None
            if self.scope == 'deleted':
                rc['deleted_at'] = obj.deleted_at

            return rc

        data = {
            'id': article.id,
            "obj_type": "article",
            'slug': obj.slug,
            'location': locations,
            'blog_name': blog_name_tag.name if blog_name_tag else None,
            'views': article.views,
            'likes': article.likes,
            'shares': article.shares,
            'businesses': businesses,
            'tags': tags,
            'content': article.content or convert_legacy_blog_content_with_soup(article.content_legacy),
            'thumbnail_url': legacy_url_image(article.thumbnail.get_serve_url() if article.thumbnail else None),
            'publish_date': obj.created_at.date(),
            'author': obj.author.get_full_name_or_email() if obj.author and obj.author.get_full_name_or_email() else "LSTV Staff",
            'author_id': obj.author.id if obj.author else None,
            'author_email': obj.author.email if obj.author else None,
            'author_thumbnail_url': obj.author.profile_image.get_serve_url() if (obj.author and
                                                                                 obj.author.profile_image) else None,
            'title': obj.title,
            'properties': PropertySerializer(many=False).to_representation(obj.properties.exclude(
                key__contains='legacy_'))
        }

        return data

    class Meta:
        model = Post
