import BusinessService from '../services/businessService';

import { useServerErrors } from './useServerErrors';
import { usePublicContentService } from './usePublicContentService';
import VideoService from '../services/videoService';

export const useVideoService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();
    const {  getSlugContent } = usePublicContentService();

    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            BusinessService.cancelSource.cancel(message);
        },
        async getVideo(slug) {
            const video = await getSlugContent({ slug: 'meow'})
        },
        async getBusinessesByLocation(offset, size, location) {
            return VideoService.getBusinesses(offset, size, location).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            )
        },
        async getVideoLike(video_slug) {
            return VideoService.getVideoLike(video_slug).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },
        async likeVideo(video_slug) {
            return VideoService.likeVideo(video_slug).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },
        async unLikeVideo(video_slug) {
            return VideoService.unLikeVideo(video_slug).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },

        async getQandALike(video_slug, qAndA_id) {
            return VideoService.getQandALike(video_slug, qAndA_id).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },
        async likeQandA(video_slug, qAndA_id) {
            return VideoService.likeQandA(video_slug, qAndA_id).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },
        async unLikeQandA(video_slug, qAndA_id) {
            return VideoService.unLikeQandA(video_slug, qAndA_id).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },
        async flagQandA(video_slug, qAndA_id, complaintValue) {
            return VideoService.flag(video_slug, qAndA_id, {
                "complaint": complaintValue
            }).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            ); 
        },

       
    };
};
