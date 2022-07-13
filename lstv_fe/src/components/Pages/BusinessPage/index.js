import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { POST_PAGE_LOADER_SIZE } from '../../../global/globals';
import LoadSpinner from '../../Utility/LoadSpinner';

import BusinessPage from './BusinessPage';
import FashionPage from './FashionPage';

import NotFound from '../NotFound'
import { useBusinessService } from '../../../rest-api/hooks/useBusinessService';
import { useAuthService } from '../../../rest-api/hooks/useAuthService';

const ConnectedBusinessPage = () => {
    const { slug } = useParams();
    const {
        getBusiness,
        subscribeBusiness,
        unsubscribeBusiness,
        addBusinessReview,
        getBusinessReviews,
        editBusinessReview,
        deleteBusinessReview,
        flagBusinessReview,
        likeBusinessReview,
        getIsUserSubscribed,
    } = useBusinessService();
    const { loggedIn, user } = useAuthService()
    const [business, setBusiness] = useState();
    const [isUserAddedReviews, setIsUserAddedReviews] = useState(false);
    const [isUserSubscribed, setIsUserSubscribed] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        init();
    }, [slug]);

    const init = async () => {
        try {
            setBusiness(undefined)
            const business = await getBusiness(slug);

            if (!business.id) {
                setNotFound(true)
                return
            }

            const processed = processBusiness(business);
            setBusiness(processed);

            if (loggedIn) {
                const isSubscribed = await getIsUserSubscribed(slug);
                setIsUserSubscribed(isSubscribed);
            }
        } catch (error) {
            console.log(error)
        }
    };

    const checkIfUserAddedReviews = (reviews) => {
        if (reviews?.length) {
            const isAdded = reviews?.map(({ author_id }) => author_id).includes(user.uid);
            setIsUserAddedReviews(isAdded);
        }
    };

    const processBusiness = (business) => {
        const data = {
            description: business?.properties?.legacy_your_business_description,
            contact: {
                socialLinks: business?.social_links,
                website: business?.website,
                phones: business?.phones,
            },
            isPremium: business?.premium,
            email: business?.inquiry_email,
            isFashion: business.roles?.map(({ family }) => family).includes('Fashion'),
            thumbnailUrl: business.card_thumbnail_url,
            team: business?.publicTeam,
            altContactCTALink: business?.alt_contact_cta_link,
            altContactCTALabel: business?.alt_contact_cta_label,
            profileImageUrl: business.profile_image,
            events: business?.organized_events,
            photos: business?.photos,
            promoVideos: business?.promo_videos,
            soldAt: business?.sold_at_businesses,
            brandsFamily: business?.associate_brands,
            shopItems: business?.shopping,
            location: business?.business_locations?.length && business?.business_locations[0],
            worksWith: business?.cohorts,
            ...business,
        };

        if (business?.sold_at_businesses) {
            data.soldAt = business?.sold_at_businesses.map(({ role_family, ...rest}) => ({
                ...rest,
                role_family: role_family?.toLowerCase()
            }))
        }

        if (data.reviews) {
            data.reviews.rating = calculateRating(business.reviews?.reviews || []);
            checkIfUserAddedReviews(business?.reviews?.reviews || []);
        }

        return data;
    };

    const calculateRating = (reviews) => {
        const stars = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        for (let review of reviews) {
            stars[Math.floor(review.rating)]++;
        }

        return Object.keys(stars).map((key) => ({
            label: `${key} Stars`,
            value: Math.round((stars[key] * 100) / reviews?.length) || 0,
        }));
    };

    if (notFound) {
        return <NotFound />;
    }

    if (!business && !notFound) {
        return (
            <div style={{ height: '80vh' }}>
                <LoadSpinner size={POST_PAGE_LOADER_SIZE} />
            </div>
        );
    }

    const refreshReviews = async (reviewId, data) => {
        if (reviewId, data) {
            const review = business?.reviews?.reviews.find(({ review_id }) => review_id === reviewId);
            review.content = data?.content;
            review.title = data?.title;
            review.rate = data?.rate;

            const processed = processBusiness({
                ...business,
                reviews: business?.reviews,
            });
            setBusiness(processed);
        } else {
            const reviews = await getBusinessReviews(business.id, 'business');
            const processed = processBusiness({
            ...business,
            reviews,
        });
        setBusiness(processed);
        }
    };

    const handleNewReview = async ({ title, rating, content }) => {
        const response = await addBusinessReview(business.slug, {
            rating,
            content,
            title,
        });

        // @MODIFY THAT WHEN WE HAVE THE REVIEW RETURN TO NOT REFRESH BUT JUST PUSH IT TO THE BUSINES REVIEW
        if (response?.review_id) {
            if (business?.reviews?.reviews) {
                business?.reviews?.reviews.push(response);
            } else {
                business.reviews.reviews = [response]
            }
            const proccesed = processBusiness(business);
            setBusiness(proccesed)
        }

        return response;
    };

    const handleEditReview = async (reviewId, data) => {
        await editBusinessReview(business.slug, reviewId, data);

        await refreshReviews(reviewId, data);
    };

    const handleDeleteReview = async (reviewId) => {
        await deleteBusinessReview(business.slug, reviewId);
        await refreshReviews();
        setIsUserAddedReviews(false)
    };

    const handleFlagReview = async (reviewId, complaint) => {
        await flagBusinessReview(business.slug, reviewId, complaint)
    }

    const handleLikeReview = async (reviewId, isLiked) => {
        await likeBusinessReview(business.slug, reviewId, isLiked);
    };

    const handleSubscribe = () => {
        if (isUserSubscribed) {
            unsubscribeBusiness(business?.slug);
        } else {
            subscribeBusiness(business?.slug);
        }

        setIsUserSubscribed(!isUserSubscribed);
    };

    const pageProps = {
        business,
        isUserSubscribed,
        onEditReview: handleEditReview,
        onDeleteReview: handleDeleteReview,
        onSubscribe: handleSubscribe,
        onAddReview: handleNewReview,
        canAddReview: !isUserAddedReviews,
        onFlagReview: handleFlagReview,
        onLikeReview: handleLikeReview,
    };

    return business.isFashion ? <FashionPage {...pageProps} /> : <BusinessPage {...pageProps} />;
};

export default ConnectedBusinessPage;
