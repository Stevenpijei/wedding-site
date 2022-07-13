import reviewsService from '../services/reviewsService';
import { useServerErrors } from './useServerErrors';

export const useReviewsService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            reviewsService.cancelSource.cancel(message);
        },
        async getReviews(elementId, elementType) {
            try {
                return reviewsService.getReviews(elementId, elementType);
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async submitBusinessReview({ businessId, title, rating, content }) {
            try {
                return reviewsService.postReview({
                    element_type: 'business',
                    element_id: businessId,
                    content: content,
                    rating: rating,
                    title,
                });
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async editReview(reviewId, data) {
            try {
                return reviewsService.editReview(reviewId, data);
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async deleteReview(reviewId) {
            try {
                return reviewsService.deleteReview(reviewId);
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async flagReview(reviewId, complaint) {
            try {
                return reviewsService.flag({
                    review_id: reviewId,
                    complaint,
                });
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
    };
};
