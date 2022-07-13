import React from 'react'
import Review from './Review'

const ReviewsPosts = ({ posts: reviews, onEdit, businessSlug, onDelete, onLike, onFlag }) => {
    return reviews.map((review) => (
        <Review key={review.review_id} review={review} businessSlug={businessSlug} onEdit={onEdit} onDelete={onDelete} onLike={onLike} onFlag={onFlag} />
    ));
};

export default ReviewsPosts;
