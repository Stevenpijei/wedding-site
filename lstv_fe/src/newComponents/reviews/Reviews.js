import React, { useState } from 'react';
import styled from 'styled-components';

import theme from '../../styledComponentsTheme';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useModals } from '../../global/use-modals'
import { OutlinedCTAButton } from '../../components/Utility/OutlinedCTALink';
import { Section, SectionHeader, SectionTitle } from '../layout/TwoColumnLayoutBlocks';

import Rate from './Rate';
import Stars from './Stars';
import ReviewsPosts from './ReviewsPosts';
import AddReview from './AddReview';
import EditReview from './EditReview';

const CtaContainer = styled('div')`
    margin: 16px 0 0 0;
    width: 188px;

    > button {
        height: 36px;
    }

    @media ${theme.breakpoints.isWithinMobile} {
        width: auto;

        > button {
            padding: 8px;
            display: flex;
            align-items: center;
            width: auto;
        }
    }

    @media ${theme.breakpoints.laptop} {
        > button {
            width: 100%;
            padding: 0;
        }
    }
`;

const Content = styled('div')`
    width: 100%;
`;

const Subheader = styled('div')`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    @media ${theme.breakpoints.isWithinMobile} {
        flex-direction: column;
    }
`;

const AverageContainer = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    margin: 16px 0;

    @media ${theme.breakpoints.isMobileOrTablet} {
        align-items: center;
    }
`;

const AverageTitle = styled('h4')`
    font-weight: 800;
    font-size: 2rem;
    text-align: center;
    align-items: center;
`;

const PostsContainer = styled('div')`
    margin: 50px 0 0 0;
`;

const Reviews = ({ business, summary, reviews, rating, onDelete, onEdit, onAdd, canAdd, onFlag, onLike }) => {
    const [renderAddReview, setRenderAddReview] = useState(false);
    const [currentEditReview, setCurrentEditReview] = useState(null);
    const { openLoginModal } = useModals()
    const { loggedIn } = useAuthService()

    const handleOpenAddReview = () => {
        if (!loggedIn) {
            openLoginModal()
            return
        }

        setRenderAddReview(true);
    };

    const handleOpenEditReview = (id) => {
        const review = reviews.find(({ review_id }) => id === review_id);
        setCurrentEditReview(review);
    };

    const handleSubmitEditReview = async (data) => {
        setCurrentEditReview(null);
        onEdit && onEdit(currentEditReview.review_id, data);
    };

    const handleDeleteReview = async (id) => {
        onDelete && onDelete(id);
    };

    return (
        <Content>
            <Section>
                <SectionHeader>
                    <SectionTitle>Reviews</SectionTitle>
                    <CtaContainer>
                        <OutlinedCTAButton onClick={handleOpenAddReview} disabled={!canAdd}>
                            {summary?.num_reviews ? 'Write a Review' : 'Leave the first review'}
                        </OutlinedCTAButton>
                    </CtaContainer>
                </SectionHeader>
                <Subheader>
                    <Rate rating={rating} />
                    {summary?.num_reviews ? (
                        <AverageContainer>
                            <AverageTitle>
                                {summary?.average_rating || 0} ({summary?.num_reviews || 0} Reviews)
                            </AverageTitle>
                            <Stars rate={summary?.average_rating || 0} />
                        </AverageContainer>
                    ) : null}
                </Subheader>
                <PostsContainer>
                    {reviews?.length ? (
                        <ReviewsPosts
                            businessSlug={business.slug}
                            posts={reviews}
                            onEdit={handleOpenEditReview}
                            onDelete={handleDeleteReview}
                            onFlag={onFlag}
                            onLike={onLike}
                        />
                    ) : null}
                </PostsContainer>
                <AddReview
                    open={renderAddReview}
                    onClose={() => setRenderAddReview(false)}
                    onAdd={onAdd}
                    business={business}
                />
                <EditReview
                    review={currentEditReview}
                    open={currentEditReview}
                    onEdit={handleSubmitEditReview}
                    onClose={() => setCurrentEditReview(null)}
                    business={business}
                />
            </Section>
        </Content>
    );
};

export default Reviews;
