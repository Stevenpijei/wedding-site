import axios from 'axios';
import {
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SORT_METHOD_IMPORTANCE,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY, CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT,
} from '../../global/globals';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const api = axios.create({ baseURL: `${API_URL}/v1` });
api.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
api.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const PublicContentService = {
    cancelSource: source,
    async subscribeTag(tag) {
        if (!tag) {
            throw new Error('[tagService.subscribeTag] tried to subscribe a tag without a slug');
        }
        const res = await api.post(`/tag/${tag}/subscribers`);
        return res.data.result
    },
    async unsubscribeTag(tag) {
        if (!tag) {
            throw new Error('[tagService.unsubscribeTag] tried to unsubscribe a tag without a slug');
        }
        const res = await api.delete(`/tag/${tag}/subscribers`);
        return res.data.result;
    },
    async subscribeLocation(slug) {
        if (!slug) {
            throw new Error('[tagService.subscribeLocation] tried to unsubscribe a tag without a slug');
        }
        
        const res = await api.post(`${slug}/subscribers`);
        return res.data.result;
    },
    async unsubscribeLocation(slug) {
        if (!slug) {
            throw new Error('[tagService.unsubscribeLocation] tried to unsubscribe a tag without a slug');
        }
        
        const res = await api.delete(`${slug}/subscribers`);
        return res.data.result;
    },
    async isSubscribedToTag(tag) {
        if (!tag) {
            throw new Error('[tagService.isSubscribedToTag] tried to unsubscribe a tag without a slug');
        }
        const res = await api.get(`/tag/${tag}/verifySubscription`);
        return res.data.result?.subscribed;
    },
    async isSubscribedToLocation(slug) {
        if (!slug) {
            throw new Error('[tagService.isSubscribeToLocation] tried to unsubscribe a tag without a slug');
        }
        const res = await api.get(`${slug}/verifySubscription`);
        return res.data.result;
    },
    async getVibe(slug) {
        try {
            const res = await api.get(`/tag/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.erros;
        }
    },
    async getVibeVideo(slug) {
        const res = await api.get('/contentSearch', {
            params: {
                content_type: CONTENT_GRID_CONTENT_TYPE_VIDEO,
                content_search_type: CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_EVENT_STORY,
                search_items: slug,
                content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT,
                exclude_items: [],
                offset: 0,
                size: 1,
            },
        });
        return res.data.result;
    },
    async getLocation(slug) {
        try {
            const res = await api.get(`/location/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.erros;
        }
    },
    async getLocationVideo(slug) {
        const res = await api.get('/contentSearch', {
            params: {
                content_type: CONTENT_GRID_CONTENT_TYPE_VIDEO,
                content_search_type: CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY,
                search_items: slug,
                content_sort_method: CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT,
                exclude_items: [],
                offset: 0,
                size: 1,
            },
        });
        return res.data.result;
    },
};

export default PublicContentService;
