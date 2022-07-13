
import PublicContentService from '../services/publicContentService';
import { useServerErrors } from './useServerErrors';

export const usePublicContentService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();
    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            PublicContentService.cancelSource.cancel(message);
        },
        getSlugContent(data) {
            return PublicContentService.getSlugContent(data).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        getVideo() {
            return PublicContentService.getVideo().then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        contentSearch(data) {
            return PublicContentService.contentSearch(data).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        search(query, location) {
            return PublicContentService.search(query, location).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        getContentComposition(params) {
            return PublicContentService.getContentComposition(params).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        getShoppingItems(elementId, elementType) {
            return PublicContentService.getShoppingItems(elementId, elementType).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        async getLocation(slug, withVideo) {
            const location = await PublicContentService.getLocation(slug);

            if (withVideo) {
                const searchRequest = await PublicContentService.getLocationVideo(slug);

                if (searchRequest && searchRequest[0] && searchRequest[0].slug) {
                    const video = await PublicContentService.getSlugContent({ slug: searchRequest[0].slug });

                    if (video) {
                        location.mainVideo = video;
                    }
                }
            }

            return location;
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

 }