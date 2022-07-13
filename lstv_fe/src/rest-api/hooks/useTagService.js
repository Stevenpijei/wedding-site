import { CONTENT_GRID_CONTENT_TYPE_PHOTO, CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT } from '../../global/globals';
import PublicContentService from '../services/publicContentService';
import TagService from '../services/tagService';
import { useServerErrors } from './useServerErrors';

export const useTagService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        async subscribeTag(tag) {
            try {
                return TagService.subscribeTag(tag);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async unsubscribeTag(tag) {
            try {
                return TagService.unsubscribeTag(tag);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async subscribeLocation(slug) {
            try {
                return TagService.subscribeLocation(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async unsubscribeLocation(slug) {
            try {
                return TagService.unsubscribeLocation(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async isSubscribedToTag(tag) {
            try {
                return TagService.isSubscribedToTag(tag);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async isSubscribedToLocation(slug) {
            try {
                return TagService.isSubscribedToLocation(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getVibe(slug, withVideo) {
            try {
                const vibe = await PublicContentService.getVibe(slug);
                const photos = await PublicContentService.contentSearch({
                    content_type: CONTENT_GRID_CONTENT_TYPE_PHOTO,
                    limit_to_tags: slug,
                    content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                    offset: 0,
                    size: 10,
                });

                vibe.photos = photos && photos.result;

                if (withVideo) {
                    const searchRequest = await PublicContentService.getVibeVideo(slug);

                    if (searchRequest && searchRequest[0] && searchRequest[0].slug) {
                        const video = await PublicContentService.getSlugContent({ slug: searchRequest[0].slug });

                        if (video) {
                            vibe.mainVideo = video;
                        }
                    }
                }

                return vibe;
            } catch (error) {
                return analyzeServerErrors(error)
            }
        },
        async getLocation(slug, withVideo = true) {
            try {
                const location = await TagService.getLocation(slug);
                const getLocationUrl = (location) =>
                    location?.place_url || location?.state_province_url || location?.country_url;

                const photos = await PublicContentService.contentSearch({
                    content_type: CONTENT_GRID_CONTENT_TYPE_PHOTO,
                    limit_to_locations: encodeURIComponent(slug),
                    content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                    offset: 0,
                    size: 10,
                });
                location.photos = photos && photos.result;

                if (location && withVideo) {
                    const url = getLocationUrl(location);
                    const searchRequest = await PublicContentService.getLocationVideo(url.replace('/location/', ''));

                    if (searchRequest && searchRequest[0] && searchRequest[0].slug) {
                        const video = await PublicContentService.getSlugContent({ slug: searchRequest[0].slug });

                        if (video) {
                            location.mainVideo = video;
                        }
                    }
                }

                return location;
            } catch (error) {
                return analyzeServerErrors
            }
        },
        getVibeVideo(slug) {
            return PublicContentService.getVibeVideo(slug).then(
                (data) => data,
                (error) => {
                    console.log(error);
                    throw analyzeServerErrors(error);
                }
            );
        },
    };
};
