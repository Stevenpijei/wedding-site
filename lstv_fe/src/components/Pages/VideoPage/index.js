/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import LSTVLink from '../../Utility/LSTVLink';
import DateAndContent from './DateAndContent';
import DidYouWork from './DidYouWorkOn';
import { MoreFromLocation, MoreFromVideographer } from './Grids';
import { Section, SectionTitle } from './LayoutComps';
import Location from './Location';
import MoreBusinesses from './MoreBusinesses';
import Photography from './Photography';
import QandA from './QandA/index';
import Recommended from './Recommended';
import Shop from './Shop';
import VideoCard from './VideoCard';
import VideoStickyMenu from './VideoStickyMenu';
import WatchInspireBook from './WatchInspireBook';
import WeddingTeam from './WeddingTeam';
import { MAX_DESKTOP_CONTENT_WIDTH, UserDevice } from '/global/globals';
import { BaseChip } from '/newComponents/BaseTag';
import ConditionalWrapper from '/newComponents/ConditionalWrapper';
import SEO from '/newComponents/SEO';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import { useVideoService } from '/rest-api/hooks/useVideoService';
import { useMediaReady } from '/utils/LSTVUtils';

const VideoPageContainer = styled.div`
    max-width: ${MAX_DESKTOP_CONTENT_WIDTH};
    margin: auto;
    display: grid;
    position: relative;
    grid-template-columns: [left] minmax(0, 1fr) [right] 400px;
    grid-column-gap: 60px;
    padding: 20px;

    @media ${UserDevice.isWithinTablet} {
        display: block;
        padding: 0;
    }
    @media ${UserDevice.isWithinLaptop} {
        grid-column-gap: 10px;
    }
`;

const DesktopContainer = styled('div')`
    flex: 1;
`;

const VideoSidebar = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StylesContainer = styled.div`
    margin: 20px 20px;

    div {
        display: flex;
        flex-wrap: wrap;
    }

    a {
        margin-right: 10px;
    }
`;

const shuffle = (arr) =>
    [...arr].reduceRight((res, _, __, s) => (res.push(s.splice(0 | (Math.random() * s.length), 1)[0]), res), []);

const Styles = (props) => {
    const [shuffled, setShuffled] = useState(props.styles);

    useEffect(() => {
        setShuffled(shuffle(props.styles));
    }, []);

    return (
        <Section {...props}>
            <StylesContainer>
                <SectionTitle>Styles</SectionTitle>
                <div>
                    {shuffled.slice(0, props.isMobile ? 3 : 99).map((style) => (
                        <LSTVLink to={`style/${style.slug}`} key={style.name} noStyle>
                            <BaseChip title={style.name} />
                        </LSTVLink>
                    ))}
                </div>
            </StylesContainer>
        </Section>
    );
};

export const useVideoLike = (slug) => {
    const [isLiked, setIsLiked] = useState(false);
    const { getVideoLike, likeVideo, unLikeVideo } = useVideoService();
    const { loggedIn } = useAuthService();

    useEffect(() => {
        if (loggedIn && slug) {
            getVideoLike(slug).then((response) => {
                setIsLiked(response?.like);
            });
        }
    }, [slug, loggedIn]);

    const handleLike = () => {
        if (isLiked) {
            unLikeVideo(slug);
        } else {
            likeVideo(slug);
        }
        setIsLiked(!isLiked);
    };

    return [isLiked, handleLike];
};

const VideoPage = ({ data }) => {
    const {
        title,
        event_date,
        content,
        location,
        videosSources,
        likes,
        views,
        businesses,
        vibes,
        slug,
        photos,
        q_and_a,
        id,
        post_properties,
        shopping,
    } = data;
    const [isMobile, ready] = useMediaReady(UserDevice.isWithinTablet, false);
    const [isLiked, handleLike] = useVideoLike(slug);

    const { ref, inView } = useInView({
        threshold: 0,
        initialInView: true,
    });

    return (
        ready && (
            <>
                <SEO
                    postTitle={title}
                    postDescription={content?.length > 0 && `${content.slice(0, 300)}...`}
                    postImage={videosSources[0].thumbnail_url}
                    url={slug}
                />
                <VideoPageContainer>
                    {!inView && isMobile && <VideoStickyMenu handleLike={handleLike} isLiked={isLiked} data={data} />}
                    <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                        <Section>
                            <VideoCard handleLike={handleLike} isLiked={isLiked} isDesktop={!isMobile} isAutoPlay={true} data={data} />
                        </Section>
                        {!isMobile && <Styles styles={vibes} isLast />}
                        {isMobile &&
                            <WeddingTeam
                              ref={ref}
                              businesses={businesses}
                              videoId={id}
                            />
                        }
                        <DateAndContent event_date={event_date} content={content} isDesktop={!isMobile} />
                        <Shop shopping={shopping} />
                        <Photography data={data} />
                        <QandA data={data} />
                        {!isMobile && (
                            <Location location={location} businesses={businesses} isMobile={isMobile} isLast />
                        )}
                        {isMobile && <Styles styles={vibes} isMobile />}
                        {isMobile && <Location location={location} businesses={businesses} isMobile={isMobile} />}
                        {isMobile && <MoreFromVideographer businesses={businesses} data={data} isMobile={isMobile} />}
                        {isMobile && <MoreBusinesses location={location} />}
                        {isMobile && <MoreFromLocation location={location} data={data} isMobile={isMobile} isLast />}
                    </ConditionalWrapper>
                    {!isMobile && (
                        <VideoSidebar>
                            <WeddingTeam
                              videoId={id}
                              businesses={businesses}
                            />
                            <MoreFromVideographer businesses={businesses} data={data} isMobile={isMobile} />
                            <MoreBusinesses location={location} />
                            <MoreFromLocation location={location} data={data} isMobile={isMobile} isLast />
                        </VideoSidebar>
                    )}
                    <DidYouWork fullWidth />
                    <Recommended fullWidth isLast />
                    <WatchInspireBook fullWidth isLast />
                </VideoPageContainer>
            </>
        )
    );
};

export default VideoPage;
