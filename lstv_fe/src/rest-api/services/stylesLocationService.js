import axios from 'axios';
import {
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_WATCHED_30D,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY,
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
        return res.data.result;
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
            throw e.response.data.erros;
        }
    },
    async getVibe(slug) {
        try {
            const res = await ccAxiosInstance.get(`/tag/${slug}`);
            return res?.data?.result;
        } catch (e) {
            throw e.response.data.erros;
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
};

export default PublicContentService;
