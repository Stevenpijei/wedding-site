import React, { useContext } from 'react';
import { useQueryClient } from 'react-query';

import KebabMenu from 'components/DataTable/EditRowMenu';
import { ModalContext } from 'contexts/ModalContext';
import { BusinessQueryKeys, useDeleteBusinessReview } from 'service/hooks/business';
import ReviewDetailsModal from './ReviewDetailsModal';
import { IBusinessReview } from 'interface';

interface Props {
    businessSlug: string;
    data: IBusinessReview;
}

const ReviewTableMenu: React.FC<Props> = ({ businessSlug, data }: Props) => {
    const { review_id: reviewId, title, content, rating } = data;
    const { showConfirmModal, showModal } = useContext(ModalContext);
    const queryClient = useQueryClient();

    const { mutateAsync: requestDeleteBusinessReview } = useDeleteBusinessReview();

    const handleEditClick = () => {
        showModal({
            header: `Edit review`,
            content: (
                <ReviewDetailsModal
                    title={title}
                    content={content}
                    rating={rating}
                    mode="edit"
                    businessSlug={businessSlug}
                    reviewId={reviewId}
                />
            ),
        });
    };

    const handleDeleteReview = async () => {
        await requestDeleteBusinessReview({
            businessSlug,
            reviewId,
        });
        await queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS_REVIEWS]);
    };

    const handleDeleteClick = () => {
        showConfirmModal({
            content: null,
            header: `Are you sure to delete this review?`,
            confirmButton: {
                name: 'Delete',
                action: handleDeleteReview,
            },
        });
    };

    return (
        <KebabMenu
            items={[
                {
                    title: 'Edit',
                    action: handleEditClick,
                },
                {
                    title: 'Delete',
                    action: handleDeleteClick,
                },
            ]}
        />
    );
};

export default ReviewTableMenu;
