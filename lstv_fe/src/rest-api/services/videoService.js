import axios from 'axios';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const rtAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
rtAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
rtAxiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const VideoService = {
    cancelSource: source,
    
    async getBusinesses(offset, size, location) {
        location = location.replace('/location/', '/')
        const res = await rtAxiosInstance.get(`/contentSearch?content_type=business&content_sort_method=weight&offset=${offset}&size=${size}&limit_to_locations=${location}&verbosity=card`)
        return res.data.result;
    },
    async likeVideo(video_slug) {
        const res = await rtAxiosInstance.post(`video/${video_slug}/like`)
        return res.data.result;
    },
    async unLikeVideo(video_slug) {
        const res =  await rtAxiosInstance.request({
            method: 'delete',
            url: `video/${video_slug}/like`,
        });
        return res.data.result;
    },
    async getVideoLike(video_slug) {
        const res = await rtAxiosInstance.get(`video/${video_slug}/like`);
        return res.data.result;
    },
    async likeQandA(video_slug, qAndA_id) {
        const res = await rtAxiosInstance.post(`video/${video_slug}/qAndA/${qAndA_id}/like`)
        return res.data.result;
    },
    async unLikeQandA(video_slug, qAndA_id) {
        const res =  await rtAxiosInstance.request({
            method: 'delete',
            url: `video/${video_slug}/qAndA/${qAndA_id}/like`,
        });
        return res.data.result;
    },
    
    async getQandALike(video_slug, qAndA_id) {
        const res = await rtAxiosInstance.get(`video/${video_slug}/qAndA/${qAndA_id}/like`);
        return res.data.result;
    },
    async flag(video_slug, qAndA_id, body) {
        const res = await rtAxiosInstance.post(`video/${video_slug}/qAndA/${qAndA_id}/flag`, body);
        return res.data.result;
    },
    
};
export default VideoService;
