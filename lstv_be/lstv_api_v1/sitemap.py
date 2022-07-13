from django.contrib.sitemaps import Sitemap, GenericSitemap
from django.contrib.sites.models import Site

from lstv_api_v1.models import Business, Post, TagType, DirectoryType
from lstv_be.settings import WEB_SERVER_URL


class StaticSitemap(Sitemap):
    changefreq='daily'

    def items(self):
        # taken from lstv_fe/src/components/Routes.js
        return [
            "/",
            "/privacy-policy",
            "/terms-of-use",
            "/nondiscrimination",
            "/for-wedding-pros",
            "/for-filmmakers",
            "/for-brands",
            "/faq",
            "/dmca-copyright-policy",
            "/about",
            "/team",
            "/press",
            "/Sign-in",
            "/sign-up",
            "/sign-up-pro"
        ]

    def location(self, item):
        return item


class TupleSitemap(Sitemap):
    def __init__(self, model, prefix):
        self.model = model
        self.prefix = prefix
        self.protocol = "https"

    def get_urls(self, site=None, **kwargs):
        site = Site(domain=WEB_SERVER_URL.replace("https://",""), name=WEB_SERVER_URL.replace("https://",""))
        return super().get_urls(site=site, **kwargs)

    def items(self):
        return self.model.objects.order_by('created_at').values_list('slug', 'updated_at')

    def lastmod(self, item):
        return item[1]

    def location(self, item):
        return f"{self.prefix}/{item[0]}"


class VideoSitemap(Sitemap):
    limit = 1000

    def __init__(self):
        self.protocol = "https"

    def get_urls(self, site=None, **kwargs):
        site = Site(domain=WEB_SERVER_URL.replace("https://",""), name=WEB_SERVER_URL.replace("https://",""))
        urls = super().get_urls(site=site, **kwargs)
        for url in urls:
            post = url['item']
            video = post.videos.first()
            if not video:
                continue
            source = video.videos.first()
            if not source:
                continue
            url['video'] = {
                'title': video.title,
                'thumbnail_url': video.get_thumbnail_url(),
                'duration': source.duration,
                'content_url': source.source_url,
                'description': video.content,
                'view_count': video.views,
                'pub_date': source.uploaded_at.isoformat() if source.uploaded_at else "",
                'tags': video.get_public_tags()[:32],
            }
        return urls

    def items(self):
        return Post.objects.order_by('created_at')

    def lastmod(self, item):
        return item.updated_at

    def location(self, item):
        return f"/{item.slug}"


business_sitemap = TupleSitemap(Business, '/business')
post_sitemap = VideoSitemap()
style_sitemap = TupleSitemap(TagType, '/style')
directory_sitemap = TupleSitemap(DirectoryType, '')

lstv_sitemaps = {
    'static': StaticSitemap(),
    'businesses': business_sitemap,
    'videos': post_sitemap,
    'styles': style_sitemap,
    'directories': directory_sitemap
}
