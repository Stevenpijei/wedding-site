import axios from 'axios';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const reviewsAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
reviewsAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
reviewsAxiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const ReviewsService = {
    cancelSource: source,
    async getReviews(elementId, elementType) {
        if (!elementId) {
            throw new Error('[reviewsService.getReviews] tried to get revieews without element_id');
        }
        const res = await reviewsAxiosInstance.get(`/reviews?element_id=${elementId}&element_type=${elementType}`);
        return res.data.result;
    },
    async postReview(data) {
        if (!data?.element_id || !data?.element_type || !data?.content || (!data?.rating && data.rating !== 0)) {
            throw new Error(
                '[reviewsService.postReview] one or more of following params are missing: element_id, element_type, rating, content'
            );
        }
        const res = await reviewsAxiosInstance.post(
            `/reviews?element_id=${data.element_id}&element_type=${data.element_type}`,
            data
        );
        return res.data.result;
    },
    async editReview(reviewId, { rating, title, content }) {
        if (!reviewId || !content || (!rating && rating !== 0)) {
            throw new Error(
                '[reviewsService.editReview] one or more of following params are missing: reviewId, content, rating'
            );
        }
        const res = await reviewsAxiosInstance.patch(`/reviews`, {
            review_id: reviewId,
            rating,
            title,
            content,
        });
        return res.data.result;
    },
    async deleteReview(reviewId) {
        if (!reviewId) {
            throw new Error('[reviewsService.deleteReview] tried to delete review without an id');
        }
        const res = await reviewsAxiosInstance.delete(`/reviews?review_id=${reviewId}`);
        return res.data.result;
    },
    async flag({ review_id, complaint }) {
        if (!review_id) {
            throw new Error('[reviewsService.flag] tried to flag review without an id');
        }
        const res = await reviewsAxiosInstance.post(`/reviews/flag`, {
            complaint,
            review_id,
        });
        return res.data.result;
    },
};

export default ReviewsService;
