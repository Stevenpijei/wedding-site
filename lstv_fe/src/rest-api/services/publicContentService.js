import axios from 'axios';
import {
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_WATCHED_30D,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_WATCHED,
} from '../../global/globals';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const ccAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
ccAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
ccAxiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const PublicContentService = {
    cancelSource: source,
    async getSlugContent(data) {
        const res = await ccAxiosInstance.get('/slugContent', { params: { ...data } });
        return res.data.result;
    },
    async getVideo() {
        const res = await ccAxiosInstance.get('/video');
        return res.data.result;
    },
    async contentSearch(data) {
        const res = await ccAxiosInstance.get('/contentSearch', { params: { ...data } });
        return res.data;
    },
    async getContentComposition(params) {
        const res = await ccAxiosInstance.get('/contentComposition', { params: params });
        return res.data.result;
    },
    async getShoppingItems(elementId, elementType) {
        const res = await ccAxiosInstance.get('/shoppingItem', {
            params: {
                element_type: elementType,
                element_id: elementId,
            },
        });
        return res.data.result;
    },
    async getVibesForCard(slug) {
        try {
            const res = await ccAxiosInstance.get(`/slugContent?slug=/vibe/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.errors;
        }
    },
    async getVibe(slug) {
        try {
            const res = await ccAxiosInstance.get(`/tag/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.errors;
        }
    },
    async getVibeVideo(slug) {
        const res = await ccAxiosInstance.get('/contentSearch', {
            params: {
                content_type: CONTENT_GRID_CONTENT_TYPE_VIDEO,
                content_search_type: CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_EVENT_STORY,
                search_items: slug,
                content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                exclude_items: [],
                offset: 0,
                size: 1,
            },
        });
        return res.data.result;
    },
    /**
     * Use along with uploadVideo(). Returns a response with upload_url and temporary_token
     * @param {string} fileName
     */
    async getSignedVideoUploadUrl(fileName) {
        try {
            return ccAxiosInstance.get(`/preAuthorizeUserVideoUpload?filename=${encodeURIComponent(fileName)}`)
        } catch (error) {
            console.error("getSignedUrl error", error)
            throw new Error(error.message)
        }
    },

    /**
     * PUT a video to S3 and enqueue its processing
     * @param {File} file
     * @param {string} signedUploadUrl
     * @param {string} uploadToken
     * @param {Function} handlePercentUpdates
     */
    async uploadVideo(file, signedUploadUrl, uploadToken, handlePercentUpdates) {
        const reportProgress = (progressEvent) => {
            const precentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            handlePercentUpdates(precentCompleted)
        }

        try {
            const config = {
                method: 'put',
                url: signedUploadUrl,
                headers: { 'Content-Type': 'video/mp4' },
                data: file,
                onUploadProgress: reportProgress,
            }

            // TODO: we should listen for an error response on this and throw an Error
            await axios(config);

            return ccAxiosInstance.post(`/queueVideoProcessing/${uploadToken}`);

        } catch(error) {
            console.error("uploadVideo error", error)
            throw new Error(error.message)
        }
    },

    async checkVideoProcessing(videoUploadToken) {
        const resp = await ccAxiosInstance.get(`checkVideoProcessing/${videoUploadToken}`)
        return resp.data.result
    },

    /**
     * Upload a file to s3 via a signed URL
     * @param {File} file
     * @returns Download URL for the image
    */
    async uploadPhoto(file) {
        try {
            const res = await ccAxiosInstance.get(`preAuthorizePhotoUpload?filename=${encodeURIComponent(file.name)}`)
            const { upload_url, download_url } = res.data.result

            await axios({
                method: 'put',
                url: upload_url,
                headers: { 'Content-Type': file.type },
                data: file
            })

            return download_url

        } catch(e) {
            console.error("uploadPhoto error", e)
            throw new Error(e.message)
        }
    },
    async getLocation(slug) {
        try {
            const res = await ccAxiosInstance.get(`/location/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.erros;
        }
    },
    async getLocationVideo(slug) {
        const res = await ccAxiosInstance.get('/contentSearch', {
            params: {
                content_type: CONTENT_GRID_CONTENT_TYPE_VIDEO,
                content_search_type: CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY,
                search_items: slug,
                content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
                exclude_items: [],
                offset: 0,
                size: 1,
            },
        });
        return res.data.result;
    },
    async search(term, limit_to_location) {
        const res = await ccAxiosInstance.get(`/search`, {
            params: {
                term,
                limit_to_location,
            },
        });
        return res.data.result;
    },
    async selectSearch(term, type) {
        const res = await ccAxiosInstance.get('/search', {
            params: {
                term,
                type
            }
        })
        return res;
    },

    async postVideo(video, businessSlug) {
        return ccAxiosInstance.post(`/business/${businessSlug}/videos`, video)
    },

    async patchVideo(video, videoId, businessSlug) {
        return ccAxiosInstance.patch(`/business/${businessSlug}/videos/${videoId}`, video)
    },

    /**
     * Returns the 12 directories for the large tile global search menu
     */
    async getSearchDirectories() {
        const res = await ccAxiosInstance.get(`/directory?dropdown=true`);
        return res.data.result;
    },
    /**
     * Returns the ~24 directories used in the biz type search refinement dropdown
     */
    async getSearchRoleDirectories() {
        const res = await ccAxiosInstance.get(`/directory?search_roles=true`);
        return res.data.result;
    },
    async getSearchDirectoriesTimestamp() {
        const res = await ccAxiosInstance.get(`/directory?timestamp`);
        return res.data;
    },
    async getAllSearchDirectories() {
        const res = await ccAxiosInstance.get(`/directory`);
        return res.data;
    },
};

export default PublicContentService;
