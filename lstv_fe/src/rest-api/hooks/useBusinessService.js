import BusinessService from '../services/businessService';
import { useDispatch } from 'react-redux';
import { useServerErrors } from './useServerErrors';
import { userLoginSuccess } from '../../store/actions';
import { usePublicContentService } from './usePublicContentService';
import {
    CONTENT_GRID_CONTENT_TYPE_PHOTO,
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
} from '../../global/globals';

export const useBusinessService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();
    const { contentSearch, getSlugContent } = usePublicContentService();
    const dispatch = useDispatch();

    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            BusinessService.cancelSource.cancel(message);
        },
        async getBusiness(slug, withVideo = true) {
            try {
                const business = await BusinessService.getBusiness(slug);

                const photos = await contentSearch({
                    content_type: CONTENT_GRID_CONTENT_TYPE_PHOTO,
                    limit_to_business: slug,
                    content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                    offset: 0,
                    size: 10,
                });

                business.photos = [...business.photos, ...photos.result]


                if (withVideo) {
                    if (business?.promo_videos && business?.promo_videos?.length) {
                        const normalizedPromoVideo = {
                            title: business?.promo_videos[0]?.title,
                            videosSources: [business?.promo_videos[0]],
                            businesses: [business],
                        };
                        business.mainVideo = normalizedPromoVideo;
                    } else {
                        const searchRequest = await contentSearch({
                            content_search_type: CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY,
                            content_type: CONTENT_GRID_CONTENT_TYPE_VIDEO,
                            search_items: slug,
                            content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                            offset: 0,
                            size: 1,
                        });

                        if (searchRequest && searchRequest.result && searchRequest.result[0] && searchRequest.result[0].slug) {
                            const video = await getSlugContent({ slug: searchRequest.result[0].slug });

                            if (video) {
                                business.mainVideo = video;
                            }
                        }
                    }
                }

                return business;
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async subscribeBusiness(businessSlug) {
            try {
                return BusinessService.subscribeBusiness(businessSlug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async unsubscribeBusiness(businessSlug) {
            try {
                return BusinessService.unsubscribeBusiness(businessSlug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async contactBusiness(data) {
            try {
                return BusinessService.contactBusiness(data);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async addBusinessReview(slug, data) {
            try {
                const request = await BusinessService.postBusinessReview(slug, data);
                return request;
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async getBusinessReviews(slug, data) {
            try {
                return BusinessService.getBusinessReviews(slug, data);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async editBusinessReview(slug, reviewId, data) {
            try {
                return BusinessService.editBusinessReview(slug, reviewId, data);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async deleteBusinessReview(slug, reviewId) {
            try {
                return BusinessService.deleteBusinessReview(slug, reviewId);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async flagBusinessReview(slug, reviewId, complaint) {
            try {
                return BusinessService.flagBusinessReview(slug, reviewId, complaint);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },

        async likeBusinessReview(slug, reviewId, isLiked) {
            try {
                return BusinessService.likeBusinessReview(slug, reviewId, isLiked);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getIsLikedBusinessReview(slug, reviewId) {
            try {
                return BusinessService.getIsLikedBusinessReview(slug, reviewId);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getIsUserSubscribed(slug) {
            try {
                return BusinessService.isUserSubscribed(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessRoles(slug) {
            try {
                return BusinessService.getBusinessRoles(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async editBusinessRoles(id, roles) {
            try {
                return BusinessService.editBusinessRoles(id, roles);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessPublicTeamFaq(slug) {
            try {
                return BusinessService.getBusinessPublicTeamFaq(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessLocations(slug) {
            try {
                return BusinessService.getBusinessLocations(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessTeam(slug) {
            try {
                return BusinessService.getBusinessTeam(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessPhones(slug) {
            try {
                return BusinessService.getBusinessPhones(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessSocialLinks(slug) {
            try {
                return BusinessService.getBusinessSocialLinks(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessBrands(slug) {
            try {
                return BusinessService.getBusinessBrands(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessSoldAt(slug) {
            try {
                return BusinessService.getBusinessSoldAt(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async createBusiness(
            businessName,
            premium,
            businessRoles,
            businessLocationID = undefined,
            googleLocation = undefined,
            profileImage = undefined
        ) {
            return BusinessService.createBusiness(
                businessName,
                premium,
                businessRoles,
                businessLocationID,
                googleLocation,
                profileImage
            ).then(
                (data) => data,
                (error) => {
                    console.log(error);
                    return analyzeServerErrors(error);
                }
            );
        },
        async getBusinessTags(slug) {
            try {
                return BusinessService.getBusinessTags(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getBusinessVideosDashboard(slug, offset, size, videoType) {
            try {
                return BusinessService.getBusinessVideosForDashboard(slug, offset, size, videoType);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async getPinnedVideosDashboard(slug) {
            try {
                return BusinessService.getPinnedVideosForDashboard(slug);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async postPinnedVideoOrder(slug, videosArray) {
            try {
                return BusinessService.postPinnedVideoOrder(slug, videosArray);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async patchBusinessVideoStatus(slug, videoId, status) {
            try {
                return BusinessService.patchBusinessVideoStatus(slug, videoId, status);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async deleteBusinessVideo(slug, videoId) {
            try {
                return BusinessService.deleteBusinessVideo(slug, videoId);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async editBusinessInfo(id, data) {
            try {
                const resp = await BusinessService.patchBusinessinfo(id, data);

                if(resp.success) {
                    // a little hacky but userLoginSuccess updates the redux user object.
                    // we'll be getting rid of redux soon enough anyway.
                    // there's a bad mishmash of field names where the form names
                    // don't correspond to the user object names, hence the conditionals
                    // and conversion.
                    const updatedUser = {}
                    
                    if(data.profile_image_url) {
                        updatedUser.businessThumbnail = data.profile_image_url
                    }

                    if(resp.result.new_slug) {
                        updatedUser.businessSlug = resp.result.new_slug
                    }

                    if(resp.result.new_business_name) {
                        updatedUser.businessName = resp.result.new_business_name
                    }

                    // TODO: also roles? b/e isn't reurning what would be necessary for that
                    dispatch(userLoginSuccess(updatedUser))
                    return resp
                }

            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async editBusinessPhone(businessId, phoneId, data) {
            try {
                return BusinessService.patchBusinessPhone(businessId, phoneId, data);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async postBusinessPhone(id, data) {
            try {
                return BusinessService.postBusinessPhone(id, data);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async postBusinessSocialLink(slug, link) {
            try {
                return BusinessService.postBusinessSoclialLink(slug, link);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async editBusinessSocialLink(slug, link) {
            try {
                return BusinessService.patchBusinessSoclialLink(slug, link);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
        async deleteBusinessSocialLinks(slug, linkId) {
            try {
                return BusinessService.deleteBusinessSoclialLink(slug, linkId);
            } catch (error) {
                console.log(error);
                return analyzeServerErrors(error);
            }
        },
    };
};
