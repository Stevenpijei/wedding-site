import { useState } from 'react';
import RealTimeService from '../services/realTimeService';
import { useServerErrors } from './useServerErrors';

export const useRealTimeService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            RealTimeService.cancelSource.cancel(message);
        },
        
        getLike(element_type, {video_slug, qAndA_id,  review_id, business_slug}) {
            let url = 'no element_type given'
            switch (element_type) {
                case 'video':
                    url = `video/${video_slug}/like`
                    break;
                case 'qAndA':
                    url = `video/${video_slug}/qAndA/${qAndA_id}/like`
                    break;
                case 'review':
                    url = `/business/${business_slug}/reviews/${review_id}/like`
                    break;
                default:
                    break;
            }
            return RealTimeService.getLike(url).then(
                (data) => data,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        like(state, element_type, {video_slug, qAndA_id, review_id, business_slug}) {
            let url = 'no element_type given'
            switch (element_type) {
                case 'video':
                    url = `video/${video_slug}/like`
                    break;
                case 'qAndA':
                    url = `video/${video_slug}/qAndA/${qAndA_id}/like`
                    break;
                case 'review':
                    url = `/business/${business_slug}/reviews/${review_id}/like`
                    break;
                default:
                    break;
            }
            if(url.includes('undefined')) {
                console.error("You are missing an id in your likable heart instnace")
                console.error(url);
            }
            if(state) {
                console.log('liking')
                return RealTimeService.like(url);
            }   else {
                console.log('unliking')
                return RealTimeService.unLike(url);
            }
            
        },
        logVideoPlayback(data) {
            return RealTimeService.logVideoPlayback(data).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        logAdPlayback(data) {
            return RealTimeService.logAdPlayback(data).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        logAdPlaybackClick(data) {
            return RealTimeService.logAdPlaybackClick(data).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        logContentView(element_type, element_id) {
            return RealTimeService.logContentView(element_type, element_id).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        contactBusiness(
            fromPage,
            guestName,
            guestEmail,
            weddingDate,
            message,
            businessName,
            businessRole,
            business_slug,
            googleLocationComponent,
            GoogleLocationFormatted,
            latitude,
            longitude,
            videoId = null
        ) {
            return RealTimeService.contactBusiness(
                fromPage,
                guestName,
                guestEmail,
                weddingDate,
                message,
                businessName,
                businessRole,
                business_slug,
                googleLocationComponent,
                GoogleLocationFormatted,
                latitude,
                longitude,
                videoId
            ).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        contactBrideOrGroom(name, email, from_page, message) {
            return RealTimeService.contactBrideOrGroom(name, email, from_page, message).then(
                (data) => data.result,
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
    };
};
