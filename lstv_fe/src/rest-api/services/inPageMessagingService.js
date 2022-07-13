import axios from 'axios';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const MessagingAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
MessagingAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
MessagingAxiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const InPageMessagingService = {
    cancelSource: source,

    async postRootLevelQuestion(slug, data) {
        const res = await MessagingAxiosInstance.post(`/video/${slug}/qAndA`, data);
        return res.data.result;
    },

    async editElement(videoSlug, message_id, data) {
        const res = await MessagingAxiosInstance.patch(`/video/${videoSlug}/qAndA/${message_id}`, data);
        return res.data.result;
    },
    async deleteElement(videoSlug, message_id,) {
        const res = await MessagingAxiosInstance.delete(`/video/${videoSlug}/qAndA/${message_id}`);
        return res.data.result;
    },
    async getElement({ element_type, element_id }) {
        const res = await MessagingAxiosInstance.get(
            `/inPageMessaging?element_id=${element_id}&element_type=${element_type}`
        );
        return res.data.result;
    },
    async flagComment(data) {
        const res = await MessagingAxiosInstance.post(`/inPageMessaging/flag`, data);
        return res.data.result;
    },
};

export default InPageMessagingService;
