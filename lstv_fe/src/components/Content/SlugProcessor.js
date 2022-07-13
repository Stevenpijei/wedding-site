import React, { useState, useEffect } from 'react';
import NotFound from '../Pages/NotFound';
import LoadSpinner from '../Utility/LoadSpinner';
import { POST_PAGE_LOADER_SIZE, LSTV_POST_TYPE_EVENT, LSTV_POST_TYPE_BLOG } from '../../global/globals';
import { withRouter } from 'react-router';
import VideoPage from '../Pages/VideoPage/';
import Article from '../Pages/ArticlePage/';
import { usePublicContentService } from '../../rest-api/hooks/usePublicContentService';

const tempData = {
    success: true,
    timestamp: 1604447620,
    result: {
        id: 'b8fb71ff-86a9-4166-a04b-8df2083f628e',
        event_date: null,
        created_at: '2020-01-25',
        title: 'Mckenzie + Jonathan | Taormina, Italy | Villa Antonio',
        location: {},
        businesses: [
            {
                name: 'Travel House Collective',
                slug: 'travel-house-collective',
                role_name: 'Videographer',
                role_name_is: null,
                role_slug: 'videographer',
                premium: false,
                role_family: 'video-photo',
                weight: 0,
            },
            {
                name: 'Villa Antonio',
                slug: 'villa-antonio',
                role_name: 'Venue',
                role_name_is: null,
                role_slug: 'venue',
                premium: false,
                role_family: 'venue',
                weight: 0,
                business_capacity_type_name: 'Reception Venue',
                business_capacity_type_slug: 'reception-venue',
            },
            {
                name: 'Casa Cuseni',
                slug: 'casa-cuseni',
                role_name: 'Venue',
                role_name_is: null,
                role_slug: 'venue',
                premium: false,
                role_family: 'venue',
                weight: 0,
                business_capacity_type_name: 'Ceremony Venue',
                business_capacity_type_slug: 'ceremony-venue',
            },
        ],
        content:
            "Mckenzie and Jonathan met when Mckenzie came to Bangalore, India for a week with her best friend.  She was just there to do some video work for a few organizations and honestly did NOT plan to ever go back to India after this trip. But Jonathan and his large biceps (as he would tell the story) was asked to pick up the girls from the airport and show them around the city.  The three of them connected quickly, and Mckenzie and Jonathan sparked an interest for each other from the first day.  Through a series of funny, adventurous, and meaningful moments during the week in India, Mckenzie and Jonathan felt that God had specifically set them up to meet and decided to continue the friendship over video chat.  They got engaged just 5 months later on Mckenzie's second trip to India.\r\nMckenzie and Jonathan chose to get married in the beautiful coastal town of Taormina, Sicily in order to get both of their families away from their normal cultures so they could create a totally new experience together.  It was beyond magical. \r\n\r\nMckenzie and Jonathan moved to India after the wedding. And it's safe to say Mckenzie is not only in love with Jonathan, but she's also now in love with India.",
        type: 'wedding-ceremony-and-reception',
        short_url_token: 'v9524',
        views: 0,
        likes: 0,
        shares: 0,
        vibes: [
            {
                name: 'Christian',
                slug: 'christian',
                weight: 0,
                type: 'Culture/Religion',
                importance: '00010-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Indian',
                slug: 'indian',
                weight: 0,
                type: 'Culture/Religion',
                importance: '00010-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'American',
                slug: 'american',
                weight: 0,
                type: 'Culture/Religion',
                importance: '00010-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Coastal',
                slug: 'coastal',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Intimate',
                slug: 'intimate',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Adventurous',
                slug: 'adventurous',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Romantic',
                slug: 'romantic',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Mountain',
                slug: 'mountain',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Destination',
                slug: 'destination',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Elegant',
                slug: 'elegant',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Luxury',
                slug: 'luxury',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Fairytale',
                slug: 'fairytale',
                weight: 0,
                type: 'Wedding Style',
                importance: '00007-00000',
                type_group: 'wedding_tag',
            },
            {
                name: 'Bride & Groom',
                slug: 'bride-groom',
                weight: 0,
                type: 'Sexual Orientation',
                importance: '00001',
                type_group: 'wedding_tag',
            },
        ],
        tags: [],
        shopping: [],
        q_and_a: [],
        properties: {},
        videosSources: [
            {
                id: '0e4a5336-9adf-4f83-9beb-c29b41d73da5',
                order: 1,
                type: 'jwplayer',
                media_id: 'JafJj57Y',
                duration: null,
                width: 1920,
                height: 1080,
                thumbnail_url: 'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/JafJj57Y.png',
            },
        ],
        photos: [],
        post_slug: 'mckenzie-jonathan-wedding-video-march-2019',
        post_properties: {
            spouse_1: 'Mckenzie',
            spouse_2: 'Jonathan',
        },
    },
};

const SlugProcessor = (props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(tempData.result);
    // const [data, setData] = useState(undefined);
    const { errorMessages, getSlugContent, cancel } = usePublicContentService();

    useEffect(() => {
        setLoading(true);
        getSlugContent({ slug: props.match.params.slug }).then((data) => {
            if (data) {
                setData(data);
                setLoading(false);
            }
        });
        return () => {
            //cancel()
        };
    }, [props.match.params.slug]);

    const renderPage = (data) => {
        if (data?.obj_type && data?.obj_type === LSTV_POST_TYPE_BLOG) {
            return <Article post={data} />;
        }

        if (data?.type && data?.type === LSTV_POST_TYPE_EVENT) {
            return (
                <div>
                    <VideoPage data={data} />
                </div>
            );
        }

        return (
            <div>
                <NotFound />
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <div style={{ height: '60vh' }}>
                    <LoadSpinner size={POST_PAGE_LOADER_SIZE} />
                </div>
            ) : (
                renderPage(data)
            )}
        </>
    );
};

export default withRouter(SlugProcessor);
