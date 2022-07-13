from django.conf.urls import url
from django.urls import path
from django.contrib.sitemaps.views import sitemap, index as sitemap_index
from rest_framework.urlpatterns import format_suffix_patterns

from lstv_api_v1.views.account_management_views import UserPropertiesView, BusinessPropertiesView, BusinessFaqView
from lstv_api_v1.views.admin_stats_view import AdminStatsView
from lstv_api_v1.views.article_view import ArticleView
from lstv_api_v1.views.authentication_views import LogoutView, VerifyToken, PasswordResetRequestView, \
    PasswordResetActionView, VerifyPasswordChangCode, VerifyPasswordChangeToken, VerifyAccountClaim
from lstv_api_v1.views.directory_view import DirectoryView
from lstv_api_v1.views.content_views import DiscoverView, MainVideoView, HomeCardSectionView, \
    ContentSearchView, SlugContentView
from lstv_api_v1.views.business_view import BusinessView
from lstv_api_v1.views.location_view import LocationView
from lstv_api_v1.views.photo_view import PhotoView
from lstv_api_v1.views.search_view import SearchView
from lstv_api_v1.views.tag_type_view import TagTypeView
from lstv_api_v1.views.upload_views import PreAuthorizeUserVideoUploadView, RemoveUploadedVideo, \
    QueueVideoProcessingView, CheckVideoProcessingView, PreAuthorizePhotoUploadView
from lstv_api_v1.views.video_view import VideoView
from lstv_api_v1.views.event_tracking_views import VideoPlaybackLogView, AdPlaybackLogView, AdPlaybackClickLogView, \
    UserEventView, ContentWatchLogView, UserBufferedEventsView
from lstv_api_v1.views.experimental_views import GeoStatsView
from lstv_api_v1.views.general_status_views import BusinessRoleTypesView, BusinessCapacityTypesView, \
    FrontEndSettings
from lstv_api_v1.views.messaging_views import ContactBusinessView, ContactBrideGroomView
from lstv_api_v1.sitemap import lstv_sitemaps
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token
from rest_framework_jwt.blacklist.views import BlacklistView

from lstv_api_v1.views.user_views import UserView
from lstv_api_v1.views.utils_views import VetEmail, LegacyTermUUIDView
from lstv_api_v1.views.webhooks_views import slack_webhook, slack_webhook_interactive, slack_webhook_interactive_select, \
    jwp_webhook, sendgrid_hook
from lstv_api_v1.views.tag_family_type_view import TagFamilyTypeView

urlpatterns = [

    #   ____  __ __  ______  __ __    ___  ____   ______  ____     __   ____  ______  ____   ___   ____
    #  /    T|  T  T|      T|  T  T  /  _]|    \ |      Tl    j   /  ] /    T|      Tl    j /   \ |    \
    # Y  o  ||  |  ||      ||  l  | /  [_ |  _  Y|      | |  T   /  / Y  o  ||      | |  T Y     Y|  _  Y
    # |     ||  |  |l_j  l_j|  _  |Y    _]|  |  |l_j  l_j |  |  /  /  |     |l_j  l_j |  | |  O  ||  |  |
    # |  _  ||  :  |  |  |  |  |  ||   [_ |  |  |  |  |   |  | /   \_ |  _  |  |  |   |  | |     ||  |  |
    # |  |  |l     |  |  |  |  |  ||     T|  |  |  |  |   j  l \     ||  |  |  |  |   j  l l     !|  |  |
    # l__j__j \__,_j  l__j  l__j__jl_____jl__j__j  l__j  |____j \____jl__j__j  l__j  |____j \___/ l__j__j

    url(r'^login$', obtain_jwt_token, name="login"),
    url(r'^tokenRefresh$', refresh_jwt_token, name="tokenRefresh"),
    url(r'^tokenBlacklist$', BlacklistView.as_view({'post': 'create'}), name="BlacklistView"),
    url(r'^logout$', LogoutView.as_view(), name="logout"),
    url(r'^tokenVerify$', VerifyToken.as_view(), name="verifyToken"),
    url(r'^passwordResetRequest$', PasswordResetRequestView.as_view(), name="passwordResetRequest"),
    url(r'^verifyPasswordChangeToken$', VerifyPasswordChangeToken.as_view(), name="verifyPasswordChangeToken"),
    url(r'^passwordResetAction$', PasswordResetActionView.as_view(), name="passwordResetAction"),
    url(r'^verifyPasswordChangeCode$', VerifyPasswordChangCode.as_view(),
        name="videoPlaybackLog"),
    path('user/<str:action>', UserView.as_view(), name='userView'),
    url(r'^user$', UserView.as_view(), name="userView"),
    url(r'^verifyAccountClaim$', VerifyAccountClaim.as_view()),

    #   ____     __     __   ___   __ __  ____   ______      ___ ___   ____  ___ ___  ______
    #  /    T   /  ]   /  ] /   \ |  T  T|    \ |      T    |   T   T /    T|   T   T|      T
    # Y  o  |  /  /   /  / Y     Y|  |  ||  _  Y|      |    | _   _ |Y   __j| _   _ ||      |
    # |     | /  /   /  /  |  O  ||  |  ||  |  |l_j  l_j    |  \_/  ||  T  ||  \_/  |l_j  l_j
    # |  _  |/   \_ /   \_ |     ||  :  ||  |  |  |  |      |   |   ||  l_ ||   |   |  |  |
    # |  |  |\     |\     |l     !l     ||  |  |  |  |      |   |   ||     ||   |   |  |  |
    # l__j__j \____j \____j \___/  \__,_jl__j__j  l__j      l___j___jl___,_jl___j___j  l__j

    url(r'^userProperties$', UserPropertiesView.as_view(),
        name="userProperties"),
    url(r'^businessProperties$', BusinessPropertiesView.as_view(),
        name="businessProperties"),
    url(r'^businessFaq$', BusinessFaqView.as_view(),
        name="businessFaq"),

    #   ____    ___  ____     ___  ____    ____  _              _____ ______   ____  ______  __ __   _____
    #  /    T  /  _]|    \   /  _]|    \  /    T| T            / ___/|      T /    T|      T|  T  T / ___/
    # Y   __j /  [_ |  _  Y /  [_ |  D  )Y  o  || |     _____ (   \_ |      |Y  o  ||      ||  |  |(   \_
    # |  T  |Y    _]|  |  |Y    _]|    / |     || l___ |     | \__  Tl_j  l_j|     |l_j  l_j|  |  | \__  T
    # |  l_ ||   [_ |  |  ||   [_ |    \ |  _  ||     Tl_____j /  \ |  |  |  |  _  |  |  |  |  :  | /  \ |
    # |     ||     T|  |  ||     T|  .  Y|  |  ||     |        \    |  |  |  |  |  |  |  |  l     | \    |
    # l___,_jl_____jl__j__jl_____jl__j\_jl__j__jl_____j         \___j  l__j  l__j__j  l__j   \__,_j  \___j

    url(r'^frontEndSettings$', FrontEndSettings.as_view(), name="frontEndSettings"),
    url(r'^businessRoleTypes$', BusinessRoleTypesView.as_view(), name="businessRoleTypes"),
    url(r'^businessCapacityTypes$', BusinessCapacityTypesView.as_view(), name="businessCapacityTypes"),
    url(r'^directory$', DirectoryView.as_view(), name="directory"),

    #     __   ___   ____   ______    ___  ____   ______
    #    /  ] /   \ |    \ |      T  /  _]|    \ |      T
    #   /  / Y     Y|  _  Y|      | /  [_ |  _  Y|      |
    #  /  /  |  O  ||  |  |l_j  l_jY    _]|  |  |l_j  l_j
    # /   \_ |     ||  |  |  |  |  |   [_ |  |  |  |  |
    # \     |l     !|  |  |  |  |  |     T|  |  |  |  |
    #  \____j \___/ l__j__j  l__j  l_____jl__j__j  l__j

    url(r'^discover$', DiscoverView.as_view(), name="discover"),
    url(r'^mainVideo$', MainVideoView.as_view(), name="mainVideoData"),
    url(r'^homeCardSections$', HomeCardSectionView.as_view(), name="homeCardSections"),
    url(r'^contentSearch$', ContentSearchView.as_view(), name="content"),
    url(r'^slugContent$', SlugContentView.as_view(), name="slugContent"),
    url(r'^search$', SearchView.as_view(), name="search"),
    path('sitemap.xml', sitemap_index, { 'sitemaps': lstv_sitemaps }, name='sitemap-index'),
    path(
        'sitemap-<section>.xml',
        sitemap,
        { 'sitemaps': lstv_sitemaps, 'template_name': 'sitemap-extended.html' },
        name='django.contrib.sitemaps.views.sitemap'
    ),

    #  __ __  ____   _       ___    ____  ___     _____
    # |  T  T|    \ | T     /   \  /    T|   \   / ___/
    # |  |  ||  o  )| |    Y     YY  o  ||    \ (   \_
    # |  |  ||   _/ | l___ |  O  ||     ||  D  Y \__  T
    # |  :  ||  |   |     T|     ||  _  ||     | /  \ |
    # l     ||  |   |     |l     !|  |  ||     | \    |
    #  \__,_jl__j   l_____j \___/ l__j__jl_____j  \___j

    url(r'^preAuthorizeUserVideoUpload$', PreAuthorizeUserVideoUploadView.as_view(), name="preAuthorizeUpload"),
    path('removeUploadedVideo/<str:token>', RemoveUploadedVideo.as_view(), name="removeUploadedVideo"),
    path('queueVideoProcessing/<str:token>', QueueVideoProcessingView.as_view(), name="queueVideoProcessing"),
    path('checkVideoProcessing/<str:token>', CheckVideoProcessingView.as_view(), name="checkVideoProcessing"),
    url(r'^preAuthorizePhotoUpload$', PreAuthorizePhotoUploadView.as_view(), name="preAuthorizePhotoUpload"),


    #    ___  ____           ____   __ __   _____ ____  ____     ___   _____  _____
    #   /  _]|    \  __     |    \ |  T  T / ___/l    j|    \   /  _] / ___/ / ___/
    #  /  [_ |  D  )|  T    |  o  )|  |  |(   \_  |  T |  _  Y /  [_ (   \_ (   \_
    # Y    _]|    / l__j    |     T|  |  | \__  T |  | |  |  |Y    _] \__  T \__  T
    # |   [_ |    \  __     |  O  ||  :  | /  \ | |  | |  |  ||   [_  /  \ | /  \ |
    # |     T|  .  Y|  T    |     |l     | \    | j  l |  |  ||     T \    | \    |
    # l_____jl__j\_jl__j    l_____j \__,_j  \___j|____jl__j__jl_____j  \___j  \___j

    path('business', BusinessView.as_view(), name='business'),
    path('business/<str:id>', BusinessView.as_view(), name='business'),
    path('business/<str:id>/<str:subobj>', BusinessView.as_view(), name='business'),
    path('business/<str:id>/<str:subobj>/<str:subid>', BusinessView.as_view(), name='business'),
    path('business/<str:id>/<str:subobj>/<str:subid>/<str:action>', BusinessView.as_view(), name='business'),

    #    ___  ____           __ __  ____  ___      ___   ___
    #   /  _]|    \  __     |  T  |l    j|   \    /  _] /   \
    #  /  [_ |  D  )|  T    |  |  | |  T |    \  /  [_ Y     Y
    # Y    _]|    / l__j    |  |  | |  | |  D  YY    _]|  O  |
    # |   [_ |    \  __     l  :  ! |  | |     ||   [_ |     |
    # |     T|  .  Y|  T     \   /  j  l |     ||     Tl     !
    # l_____jl__j\_jl__j      \_/  |____jl_____jl_____j \___/

    path('video', VideoView.as_view(), name='video'),
    path('video/<str:id>', VideoView.as_view(), name='video'),
    path('video/<str:id>/<str:subobj>', VideoView.as_view(), name='video'),
    path('video/<str:id>/<str:subobj>/<str:subid>', VideoView.as_view(), name='video'),
    path('video/<str:id>/<str:subobj>/<str:subid>/<str:action>', VideoView.as_view(), name='video'),

    #    ___  ____           ____   __ __   ___   ______   ___
    #   /  _]|    \  __     |    \ |  T  T /   \ |      T /   \
    #  /  [_ |  D  )|  T    |  o  )|  l  |Y     Y|      |Y     Y
    # Y    _]|    / l__j    |   _/ |  _  ||  O  |l_j  l_j|  O  |
    # |   [_ |    \  __     |  |   |  |  ||     |  |  |  |     |
    # |     T|  .  Y|  T    |  |   |  |  |l     !  |  |  l     !
    # l_____jl__j\_jl__j    l__j   l__j__j \___/   l__j   \___/

    path('photos', PhotoView.as_view(), name='photos'),
    path('photos/<str:id>', PhotoView.as_view(), name='photos'),

    #    ___  ____            ____  ____   ______  ____     __  _        ___   _____
    #   /  _]|    \  __      /    T|    \ |      Tl    j   /  ]| T      /  _] / ___/
    #  /  [_ |  D  )|  T    Y  o  ||  D  )|      | |  T   /  / | |     /  [_ (   \_
    # Y    _]|    / l__j    |     ||    / l_j  l_j |  |  /  /  | l___ Y    _] \__  T
    # |   [_ |    \  __     |  _  ||    \   |  |   |  | /   \_ |     T|   [_  /  \ |
    # |     T|  .  Y|  T    |  |  ||  .  Y  |  |   j  l \     ||     ||     T \    |
    # l_____jl__j\_jl__j    l__j__jl__j\_j  l__j  |____j \____jl_____jl_____j  \___j

    path('articles', ArticleView.as_view(), name='articles'),
    path('articles/<str:id>', ArticleView.as_view(), name='articles'),

    #    ___  ____           ______   ____   ____      ______  __ __  ____     ___
    #   /  _]|    \  __     |      T /    T /    T    |      T|  T  T|    \   /  _]
    #  /  [_ |  D  )|  T    |      |Y  o  |Y   __j    |      ||  |  ||  o  ) /  [_
    # Y    _]|    / l__j    l_j  l_j|     ||  T  |    l_j  l_j|  ~  ||   _/ Y    _]
    # |   [_ |    \  __       |  |  |  _  ||  l_ |      |  |  l___, ||  |   |   [_
    # |     T|  .  Y|  T      |  |  |  |  ||     |      |  |  |     !|  |   |     T
    # l_____jl__j\_jl__j      l__j  l__j__jl___,_j      l__j  l____/ l__j   l_____j

    path('tag', TagTypeView.as_view(), name='tag'),
    path('tag/<str:id>', TagTypeView.as_view(), name='tag'),
    path('tag/<str:id>/<str:subobj>', TagTypeView.as_view(), name='tag'),
    path('tag/<str:id>/<str:subobj>/<str:subid>', TagTypeView.as_view(), name='tag'),

    #    ___  ____           _       ___      __   ____  ______  ____   ___   ____
    #   /  _]|    \  __     | T     /   \    /  ] /    T|      Tl    j /   \ |    \
    #  /  [_ |  D  )|  T    | |    Y     Y  /  / Y  o  ||      | |  T Y     Y|  _  Y
    # Y    _]|    / l__j    | l___ |  O  | /  /  |     |l_j  l_j |  | |  O  ||  |  |
    # |   [_ |    \  __     |     T|     |/   \_ |  _  |  |  |   |  | |     ||  |  |
    # |     T|  .  Y|  T    |     |l     !\     ||  |  |  |  |   j  l l     !|  |  |
    # l_____jl__j\_jl__j    l_____j \___/  \____jl__j__j  l__j  |____j \___/ l__j__j

    path('location', LocationView.as_view(), name='tag'),
    path('location/<str:country>/<str:state_province>/<str:county>/<str:place>/<str:action>', LocationView.as_view(),
         name='tag'),
    path('location/<str:country>/<str:state_province>/<str:county>/<str:place>', LocationView.as_view(), name='tag'),
    path('location/<str:country>/<str:state_province>/<str:county>/<str:place>', LocationView.as_view(), name='tag'),
    path('location/<str:country>/<str:state_province>/<str:place_or_county>', LocationView.as_view(), name='tag'),
    path('location/<str:country>/<str:place_or_county_or_state_province>', LocationView.as_view(), name='tag'),
    path('location/<str:country>', LocationView.as_view(), name='tag'),

    #    ___  __ __    ___  ____   ______   _____        ______  ____    ____     __  __  _  ____  ____    ____
    #   /  _]|  T  |  /  _]|    \ |      T / ___/       |      T|    \  /    T   /  ]|  l/ ]l    j|    \  /    T
    #  /  [_ |  |  | /  [_ |  _  Y|      |(   \_  _____ |      ||  D  )Y  o  |  /  / |  ' /  |  T |  _  YY   __j
    # Y    _]|  |  |Y    _]|  |  |l_j  l_j \__  T|     |l_j  l_j|    / |     | /  /  |    \  |  | |  |  ||  T  |
    # |   [_ l  :  !|   [_ |  |  |  |  |   /  \ |l_____j  |  |  |    \ |  _  |/   \_ |     Y |  | |  |  ||  l_ |
    # |     T \   / |     T|  |  |  |  |   \    |         |  |  |  .  Y|  |  |\     ||  .  | j  l |  |  ||     |
    # l_____j  \_/  l_____jl__j__j  l__j    \___j         l__j  l__j\_jl__j__j \____jl__j\_j|____jl__j__jl___,_j

    url(r'^videoPlaybackLog$', VideoPlaybackLogView.as_view(),
        name="videoPlaybackLog"),
    url(r'^adPlaybackLog$', AdPlaybackLogView.as_view(),
        name="adPlaybackLog"),
    url(r'^adPlaybackClickLog$', AdPlaybackClickLogView.as_view(),
        name="adPlaybackClickLog"),
    url(r'^userEvent$', UserEventView.as_view(),
        name="userEvent"),
    url(r'^contentWatchLog$', ContentWatchLogView.as_view(),
        name="contentWatchLog"),
    url(r'^userBufferedEvents$', UserBufferedEventsView.as_view(),
        name="userBufferedEvents"),

    #  ___ ___    ___   _____  _____  ____   ____  ____  ____    ____
    # |   T   T  /  _] / ___/ / ___/ /    T /    Tl    j|    \  /    T
    # | _   _ | /  [_ (   \_ (   \_ Y  o  |Y   __j |  T |  _  YY   __j
    # |  \_/  |Y    _] \__  T \__  T|     ||  T  | |  | |  |  ||  T  |
    # |   |   ||   [_  /  \ | /  \ ||  _  ||  l_ | |  | |  |  ||  l_ |
    # |   |   ||     T \    | \    ||  |  ||     | j  l |  |  ||     |
    # l___j___jl_____j  \___j  \___jl__j__jl___,_j|____jl__j__jl___,_j

    url(r'^contactBusiness$', ContactBusinessView.as_view(),
        name="contactBusiness"),
    url(r'^contactBrideGroom$', ContactBrideGroomView.as_view(),
        name="contactBrideGroom"),

    #  ____  ____   ______    ___  ____    ____     __  ______  ____   ___   ____
    # l    j|    \ |      T  /  _]|    \  /    T   /  ]|      Tl    j /   \ |    \
    #  |  T |  _  Y|      | /  [_ |  D  )Y  o  |  /  / |      | |  T Y     Y|  _  Y
    #  |  | |  |  |l_j  l_jY    _]|    / |     | /  /  l_j  l_j |  | |  O  ||  |  |
    #  |  | |  |  |  |  |  |   [_ |    \ |  _  |/   \_   |  |   |  | |     ||  |  |
    #  j  l |  |  |  |  |  |     T|  .  Y|  |  |\     |  |  |   j  l l     !|  |  |
    # |____jl__j__j  l__j  l_____jl__j\_jl__j__j \____j  l__j  |____j \___/ l__j__j

    # url(r'^like$', LikeView.as_view(), name="like"),
    # url(r'^reviews$', ReviewsViews.as_view(), name="reviews"),
    # url(r'^reviews/flag', ReviewsViewsFlag.as_view(), name="reviews/flag"),

    #  __ __  ______  ____  _       _____
    # |  T  T|      Tl    j| T     / ___/
    # |  |  ||      | |  T | |    (   \_
    # |  |  |l_j  l_j |  | | l___  \__  T
    # |  :  |  |  |   |  | |     T /  \ |
    # l     |  |  |   j  l |     | \    |
    #  \__,_j  l__j  |____jl_____j  \___j

    url(r'^vetEmail$', VetEmail.as_view(), name="vetEmail"),

    #  __    __    ___  ____   __ __   ___    ___   __  _   _____
    # |  T__T  T  /  _]|    \ |  T  T /   \  /   \ |  l/ ] / ___/
    # |  |  |  | /  [_ |  o  )|  l  |Y     YY     Y|  ' / (   \_
    # |  |  |  |Y    _]|     T|  _  ||  O  ||  O  ||    \  \__  T
    # l  `  '  !|   [_ |  O  ||  |  ||     ||     ||     Y /  \ |
    #  \      / |     T|     ||  |  |l     !l     !|  .  | \    |
    #   \_/\_/  l_____jl_____jl__j__j \___/  \___/ l__j\_j  \___j

    url(r'^isaacEvent', slack_webhook, name="isaacEvent"),
    url(r'^isaacInteractive', slack_webhook_interactive, name="isaacInteractive"),
    url(r'^isaacInteractiveSelect', slack_webhook_interactive_select, name="isaacInteractiveSelect"),
    url(r'^jwpwebhook', jwp_webhook, name="isaacInteractiveSelect"),
    url(r'^sendgrid_hook', sendgrid_hook, name="sendgrid_hook"),

    #  _        ___   ____   ____     __  __ __         ____     ___  ___    ____  ____     ___     __  ______
    # | T      /  _] /    T /    T   /  ]|  T  T       |    \   /  _]|   \  l    j|    \   /  _]   /  ]|      T
    # | |     /  [_ Y   __jY  o  |  /  / |  |  | _____ |  D  ) /  [_ |    \  |  T |  D  ) /  [_   /  / |      |
    # | l___ Y    _]|  T  ||     | /  /  |  ~  ||     ||    / Y    _]|  D  Y |  | |    / Y    _] /  /  l_j  l_j
    # |     T|   [_ |  l_ ||  _  |/   \_ l___, |l_____j|    \ |   [_ |     | |  | |    \ |   [_ /   \_   |  |
    # |     ||     T|     ||  |  |\     ||     !       |  .  Y|     T|     | j  l |  .  Y|     T\     |  |  |
    # l_____jl_____jl___,_jl__j__j \____jl____/        l__j\_jl_____jl_____j|____jl__j\_jl_____j \____j  l__j

    url(r'^legacyUUIDToURL$', LegacyTermUUIDView.as_view(),
        name="contactBusiness"),

    #   _______                 ______              _ _           _______               
    #  |__   __|               |  ____|            (_) |         |__   __|              
    #     | | __ _  __ _ ______| |__ __ _ _ __ ___  _| |_   _ ______| |_   _ _ __   ___ 
    #     | |/ _` |/ _` |______|  __/ _` | '_ ` _ \| | | | | |______| | | | | '_ \ / _ \
    #     | | (_| | (_| |      | | | (_| | | | | | | | | |_| |      | | |_| | |_) |  __/
    #     |_|\__,_|\__, |      |_|  \__,_|_| |_| |_|_|_|\__, |      |_|\__, | .__/ \___|
    #               __/ |                                __/ |          __/ | |         
    #              |___/                                |___/          |___/|_|         
    url(r'^tagFamilyType$', TagFamilyTypeView.as_view(), name="tagFamily"),

    #   ____  ____        _____ ______   ____  ______   _____
    #  /    T|    \      / ___/|      T /    T|      T / ___/
    # Y  o  ||  o  )    (   \_ |      |Y  o  ||      |(   \_
    # |     ||   _/      \__  Tl_j  l_j|     |l_j  l_j \__  T
    # |  _  ||  |        /  \ |  |  |  |  _  |  |  |   /  \ |
    # |  |  ||  |        \    |  |  |  |  |  |  |  |   \    |
    # l__j__jl__j         \___j  l__j  l__j__j  l__j    \___j

    url(r'^admin_stats$', AdminStatsView.as_view(), name="adminStats"),


    #    ___  __ __  ____     ___  ____   ____  ___ ___    ___  ____   ______   ____  _
    #   /  _]|  T  T|    \   /  _]|    \ l    j|   T   T  /  _]|    \ |      T /    T| T
    #  /  [_ |  |  ||  o  ) /  [_ |  D  ) |  T | _   _ | /  [_ |  _  Y|      |Y  o  || |
    # Y    _]l_   _j|   _/ Y    _]|    /  |  | |  \_/  |Y    _]|  |  |l_j  l_j|     || l___
    # |   [_ |     ||  |   |   [_ |    \  |  | |   |   ||   [_ |  |  |  |  |  |  _  ||     T
    # |     T|  |  ||  |   |     T|  .  Y j  l |   |   ||     T|  |  |  |  |  |  |  ||     |
    # l_____j|__j__|l__j   l_____jl__j\_j|____jl___j___jl_____jl__j__j  l__j  l__j__jl_____j

    url(r'^stats$', GeoStatsView.as_view(), name="stats"),

]

urlpatterns = format_suffix_patterns(urlpatterns)
