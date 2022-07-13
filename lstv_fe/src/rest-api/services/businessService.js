import axios from 'axios';
import dayjs from 'dayjs';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const businessAxiosInstance = axios.create({ baseURL: `${API_URL}/v1/business` });
businessAxiosInstance.defaults.withCredentials = true;
businessAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)

const source = axios.CancelToken.source();

const BusinessService = {
    cancelSource: source,

    /**
     * returns the full public profile of a given bussiness
     * @param slug business slug to get
     * @returns response data, or error report
     */
    async getBusiness(slug) {
        if (!slug) {
            throw new Error('[BusinessService.getBusiness] called with null/undefined slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}`);
        return res.data.result;
    },

    /**
     * creates a new business record
     * @param businessName the business name
     * @param premium is the business premium? true/false
     * @param businessRoles array of business role slugs (e.g. ['videographer', 'photographer'])
     * @param businessLocationID based-at location of business is an existing location record identified by uuid
     * @param googleLocation based-at location given as the output of google places autocomplete object
     * @param profileImage base64 string for the profile image of the business (e.g. logo image)
     * @returns response confirmtion, or error report
     */
    async createBusiness(businessName, premium, businessRoles, businessLocationID, googleLocation, profileImage) {
        if (!businessName || !premium || !businessRoles || (!businessLocationID && !googleLocation)) {
            throw new Error(
                '[BusinessService.getBusiness] businessName, premium, businessRoles' +
                    ' and (businessLocationID or googleLocation) are mandatory fields'
            );
        }
        let data = {
            business_name: businessName,
            premium: premium,
            business_roles: businessRoles,
            profile_image: profileImage,
            business_location: {},
        };
        if (businessLocationID) data.business_location.location_id = businessLocationID;
        if (googleLocation) data.business_location.google = googleLocation;

        const res = await businessAxiosInstance.post(`/`, data);
        return res.data.result;
    },
    async subscribeBusiness(slug) {
        if (!slug) {
            throw new Error('[BusinessService.subscribeBuseiness] businessSlug is required');
        }

        const res = await businessAxiosInstance.post(`/${slug}/subscribers`);
        return res.data.result;
    },
    async unsubscribeBusiness(slug) {
        if (!slug) {
            throw new Error('[BusinessService.subscribeBuseiness] businessSlug is required');
        }

        const res = await businessAxiosInstance.delete(`/${slug}/subscribers`);
        return res.data.result;
    },
    async contactBusiness({
        fromPage,
        guestName,
        guestEmail,
        weddingDate,
        message,
        businessName,
        businessRole,
        businessSlug,
        googleLocationComponent,
        GoogleLocationFormatted,
        latitude,
        longitude,
        videoId = null,
        userUid,
        optIn,
    }) {
        const params = {
            from_page: fromPage,
            name: guestName,
            email: guestEmail,            
            message: message,
            business_name: businessName,
            business_role: businessRole,
            business_slug: businessSlug,
            video_id: videoId || undefined,            
            unique_guest_uuid: userUid,
            opt_in: optIn,
        };

        if(googleLocationComponent) {
            params.location = {
                components: googleLocationComponent,
                formatted: GoogleLocationFormatted,
                position: {
                    lat: latitude,
                    long: longitude,
                }
            }
        }

        if(weddingDate) {
            params.wedding_date = dayjs(weddingDate).format('YYYY-MM-DD')
        }

        const res = await businessAxiosInstance.post(`/${businessSlug}/contact`, params);
        return res.data.result;
    },
    async getBusinessReviews(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessReviews] tried to get reviews without slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/reviews`);
        return res.data.result;
    },
    async getIsLikedBusinessReview(slug, reviewId) {
        if (!reviewId) {
            throw new Error('[businessService.getIsLikedBusinessReview] tried to get review like status without id');
        }

        const res = await businessAxiosInstance.get(`/${slug}/reviews/${reviewId}/like`);
        return res.data.result;
    },
    /**
     *
     * @param {*} slug
     * @param {Object} data
     * @param {string} data.title
     * @param {string} data.content
     * @param {number} data.rating
     */
    async postBusinessReview(slug, data) {
        if (!slug || !data?.title || !data?.content || (!data?.rating && data.rating !== 0)) {
            throw new Error(
                '[businessService.postReview] one or more of following params are missing: title, content, rating'
                );
            }
        const res = await businessAxiosInstance.post(`/${slug}/reviews`, data)
        return res.data.result;
    },
    async editBusinessReview(slug, reviewId, data) {
        if (!reviewId || !slug || !data) {
            throw new Error(
                '[businessService.editReview] one or more of following params are missing: reviewId, slug, data'
            );
        }
        const res = await businessAxiosInstance.patch(`/${slug}/reviews/${reviewId}`, data);
        return res.data.result;
    },
    async deleteBusinessReview(slug, reviewId) {
        if (!reviewId || !slug) {
            throw new Error('[businessService.deleteReview] tried to delete review without an id or a slug');
        }
        const res = await businessAxiosInstance.delete(`/${slug}/reviews/${reviewId}`);
        return res.data.result;
    },
    async flagBusinessReview(slug, reviewId, complaint) {
        if (!reviewId || !slug || !complaint) {
            throw new Error('[businessService.flagReview] tried to flag review without a slug, review or complaint');
        }
        const res = await businessAxiosInstance.post(`/${slug}/reviews/${reviewId}/flag`, { complaint });
        return res.data.result;
    },
    async likeBusinessReview(slug, reviewId, isLiked) {
        let res;

        if (!reviewId || !slug) {
            throw new Error('[businessService.flagReview] tried to flag review without a slug, review');
        }

        if (isLiked) {
            res = await businessAxiosInstance.post(`/${slug}/reviews/${reviewId}/like`);
        } else {
            res = await businessAxiosInstance.delete(`/${slug}/reviews/${reviewId}/like`);
        }

        return res.data.result;
    },
    async isUserSubscribed(slug) {
        if (!slug) {
            throw new Error('[businessService.isUserSubscribed] tried to check if user subscribed without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/verifySubscription`);
        return res.data.result?.subscribed;
    },
    async getBusinessRoles(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessRoles] tried to get business role without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/roles`);
        return res.data.result;
    },
    async editBusinessRoles(id, roles) {
        if (!id || !roles) {
            throw new Error('[businessService.getBusinessRoles] tried to edit business role without a slug or roles');
        }
        const res = await businessAxiosInstance.patch(`/${id}/roles`, roles);
        return res.data;
    },
    async getBusinessPublicTeamFaq(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessPublicTeamFaq] tried to get business faq without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/publicTeamFaq`);
        return res.data.result;
    },
    async getBusinessLocations(slug) {
        if (!slug) {
            throw new Error('[businessService.businessLocations] tried to get business locations without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/businessLocations`);
        return res.data.result;
    },
    async getBusinessTeam(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessTeam] tried to get business team without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/teamMembers`);
        return res.data.result;
    },
    async getBusinessPhones(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessPhones] tried to get business phones without a slug');
        }
        const res = await businessAxiosInstance.get(`/${slug}/phones`);
        return res.data.result;
    },
    async getBusinessSocialLinks(slug) {
        if (!slug) {
            throw new Error(
                '[businessService.getBusinessSocialLinks] tried to get business social links without a slug'
            );
        }
        const res = await businessAxiosInstance.get(`/${slug}/socialLinks`);
        return res.data.result;
    },
    async getBusinessBrands(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessBrands] tried to get business brands without a slug');
        }

        const res = await businessAxiosInstance.get(`/${slug}/associateBrands`);
        return res.data.result;
    },
    async getBusinessSoldAt(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessBrands] tried to get business soldAt without a slug');
        }

        const res = await businessAxiosInstance.get(`/${slug}/soldAt`);
        return res.data.result;
    },
    async getBusinessTags(slug) {
        if (!slug) {
            throw new Error('[businessService.getBusinessTags] tried to get business tags without a slug');
        }

        const res = await businessAxiosInstance.get(`/${slug}/tags`);
        return res.data.result;
    },
    // Dashboard routes
    async getBusinessVideosForDashboard(businessSlug, offset, size, videoType) {
        if (!businessSlug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to get business videos without a slug');
        }

        let route = `/${businessSlug}/videos?offset=${offset}&size=${size}`
        if(videoType) {
            route += `&video_type=${videoType}`
        }
        const res = await businessAxiosInstance.get(route);
        return res.data;
    },
    async getPinnedVideosForDashboard(businessSlug) {
        if (!businessSlug) {
            throw new Error('[businessService.getPinnedVideosForDashboard] tried to get pinned business videos without a slug');
        }

        const res = await businessAxiosInstance.get(`/${businessSlug}/videoOrder`);
        return res.data;
    },
    async postPinnedVideoOrder(businessSlug, videosArray) {
        if (!businessSlug) {
            throw new Error('[businessService.postPinnedVideoOrder] tried to get pinned business videos without a slug');
        }

        const res = await businessAxiosInstance.post(`/${businessSlug}/videoOrder`, { "ordered_videos": videosArray });
        return res.data;
    },
    async patchBusinessVideoStatus(businessSlug, videoId, status) {
        if (!businessSlug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to PATCH business videos without a slug');
        }
        const res = await businessAxiosInstance.patch(`/${businessSlug}/videos/${videoId}`, { "visibility": status});
        return res.data;
    },
    async deleteBusinessVideo(businessSlug, videoId) {
        if (!businessSlug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        const res = await businessAxiosInstance.delete(`/${businessSlug}/videos/${videoId}`);
        return res.data;
    },
    async patchBusinessinfo(businessId, data) {
        if (!businessId) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        // console.log('data', data)
        const res = await businessAxiosInstance.patch(`/${businessId}`, {...data});
        return res.data;
    },
    async patchBusinessPhone(businessId, phoneId, data) {
        if (!businessId) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        // console.log('data', data)
        const res = await businessAxiosInstance.patch(`/${businessId}/phones/${phoneId}`, {...data});
        return res.data;
    },
    async postBusinessPhone(id, data) {
        if (!id) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        // console.log('data', data)
        const res = await businessAxiosInstance.post(`/${id}/phones`, {...data});
        return res.data;
    },
    async postBusinessSoclialLink(businessSlug, link) {
        if (!businessSlug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        // console.log('data', data)
        const res =  await businessAxiosInstance.post(`/${businessSlug}/socialLinks`, {"type": link.type, "account": link.link})
        return res.data;
        
    },
    async patchBusinessSoclialLink(slug, link) {
        if (!slug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        if (!link.id || link.id === "new") {
            throw new Error('we dont have an id for that link, it might be new');
        }
        const res =   await businessAxiosInstance.patch(`/${slug}/socialLinks/${link.id}`, {"type": link.type, "account": link.link})
        return res.data;
    },
    async deleteBusinessSoclialLink(slug, linkId) {
        if (!slug) {
            throw new Error('[businessService.getBusinessVideosForDashboard] tried to Delete business video without a slug');
        }
        // console.log('data', data)
        const res = await businessAxiosInstance.delete(`/${slug}/socialLinks/${linkId}`);
        return res.data;
    }
};

export default BusinessService;
