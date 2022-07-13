import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import theme from '../../../styledComponentsTheme';
import { getLocationCoords, useMediaReady } from '../../../utils/LSTVUtils';

import Map from '../../../newComponents/map/Map';
import ReviewsSection from '../../../newComponents/reviews';
import ConditionalWrapper from '../../../newComponents/ConditionalWrapper';

import BusinessPromoVideos from './BusinessPromoVideos';
import BusinessHero from './BusinessHero';
import BusinessVideos from './BusinessVideos';
import BusinessStickyPanel from './BusinessStickyPanel';
import BusinessInfo from './BusinessInfo';
import BusinessTeam from './BusinessTeam';
import BusinessFaq from './BusinessFaq';
import BusinessWorksWith from './BusinessWorksWith';

import { MapContainer } from './BusinessLayout';
import {
    Container,
    Content,
    DesktopContainer,
    InfoCardContainer,
    Section,
    SectionContent,
    SectionCtaContainer,
    SectionHeader,
    SectionSubtitle,
    SectionTitle,
    Sidebar,
    StickyInfoCardContainer,
} from '../../../newComponents/layout/TwoColumnLayoutBlocks';
import Recommended from '../VideoPage/Recommended';
import { LSTVImage } from '../../Utility/LSTVImage';
import PhotoGallery from '../../../newComponents/PhotoGallery';
import ShopItems from '../../../newComponents/ShopItems';
import { OutlinedCTAButton } from '../../Utility/OutlinedCTALink';

const PromoVideosSection = ({ videos, isMobile, onVideoChange }) => {
    return videos?.length ? (
        <Section>
            <SectionTitle>Promo Videos</SectionTitle>
            <SectionContent>
                <BusinessPromoVideos {...{ videos, isMobile, onVideoChange }} />
            </SectionContent>
        </Section>
    ) : null;
};

const BusinessPage = ({
    business,
    onEditReview,
    onAddReview,
    onDeleteReview,
    onFlagReview,
    onLikeReview,
    onSubscribe,
    isUserSubscribed,
    canAddReview,
}) => {
    const {
        id,
        isPremium,
        description,
        slug,
        name,
        contact,
        email,
        altContactCTALink,
        altContactCTALabel,
        publicTeamFaq,
        team,
        profileImageUrl,
        thumbnailUrl,
        reviews,
        photos,
        shopItems,
        location,
        roles,
        mainVideo,
    } = business;

    const [selectedVideo, setSelectedVideo] = useState(null);
    const currentVideo = selectedVideo ? { ...mainVideo, videosSources: [selectedVideo] } : mainVideo;
    const [videosCount, setVideosCount] = useState(0);
    const [anyVideos, setAnyVideos] = useState(false);
    const [isVideosRequestDone, setIsVideosRequestDone] = useState(false);
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet, false);
    const { ref, inView } = useInView({
        threshold: 0.2,
        initialInView: true,
    });

    const ConnectedBusinessInfo = () => (
        <BusinessInfo
            id={id}
            slug={slug}
            name={name}
            email={email}
            phones={contact?.phones}
            website={contact?.website}
            socialLinks={contact?.socialLinks}
            altContactCTALink={altContactCTALink}
            altContactCTALabel={altContactCTALabel}
            roles={roles}
            description={description}
            isPremium={isPremium}
            thumbnailUrl={thumbnailUrl}
            profileImageUrl={profileImageUrl}
            location={location?.display_name}
            isUserSubscribed={isUserSubscribed}
            onSubscribe={onSubscribe}
        />
    );

    const handleVideosFeaturingReady = (response) => {
        setVideosCount(response?.scope?.total);
        setAnyVideos(response?.scope?.total);
    };

    const handleVideoChange = (video) => {
        setSelectedVideo(video);
        const videoElement = document.getElementsByTagName('video')[0];
        if (videoElement) {
            videoElement.scrollIntoView({ block: 'center' });
        }
    };

    const isVideographer = business?.roles?.filter(({ slug }) => slug === 'videographer').length > 0;


    let zoomLevel = 12;
    if (location?.classification === 'county')
        zoomLevel = 8;
    if (location?.classification === 'state_province')
        zoomLevel = 5;
    if (location?.classification === 'country')
        zoomLevel = 2;

    return ready ? (
        <Container>
            {!inView ? (
                <BusinessStickyPanel business={{ name, isPremium, slug, thumbnailUrl }}>
                    <ConnectedBusinessInfo />
                </BusinessStickyPanel>
            ) : null}
            <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                {!isMobile ? (
                    <BusinessHero video={currentVideo} business={business} isAutoPlay={selectedVideo !== null} />
                ) : null}
                <Content>
                    {!mainVideo && (
                        <LSTVImage
                            url={
                                photos[0]?.url ||
                                'https://cdn.lovestoriestv.com/images/site/default_business_header.jpg'
                            }
                        />
                    )}
                    {isMobile ? (
                        <>
                            <InfoCardContainer>
                                <div ref={ref}>
                                    <ConnectedBusinessInfo />
                                </div>
                            </InfoCardContainer>
                            <Section>
                                {/* <SectionTitle>Featured Wedding</SectionTitle> */}
                                <SectionContent>
                                    <BusinessHero
                                        video={currentVideo}
                                        business={business}
                                        isAutoPlay={selectedVideo !== null}
                                    />
                                </SectionContent>
                            </Section>
                        </>
                    ) : null}
                    <Section hide={!anyVideos}>
                        {videosCount > 0 && (
                            <SectionTitle>
                                {videosCount} Videos {isVideographer ? 'by' : 'featuring'} {name}
                            </SectionTitle>
                        )}
                        {/* {videosCount > 0 &&<SectionSubtitle>{name}</SectionSubtitle>} */}
                        <SectionContent hide={!anyVideos}>
                            <BusinessVideos
                                hide={!anyVideos}
                                slug={slug}
                                isMobile={isMobile}
                                onData={handleVideosFeaturingReady}
                            />
                        </SectionContent>
                    </Section>

                    {shopItems?.length ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Shop Now</SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <ShopItems name={name} items={shopItems} />
                            </SectionContent>
                        </Section>
                    ) : null}

                    {business?.photos?.length && business?.photos[0]['scope'] !== 'placeholder' ? (
                        <Section>
                            <SectionTitle>Photography Featuring</SectionTitle>
                            <SectionSubtitle>{name}</SectionSubtitle>
                            <SectionContent>
                                <PhotoGallery photos={photos} photoCredit={name} targetImageHeight={350} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    {isPremium && (team?.length || publicTeamFaq?.length) ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Meet The Team</SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                {team?.length ? <BusinessTeam team={team} /> : null}
                                {publicTeamFaq?.length ? <BusinessFaq faq={publicTeamFaq} /> : null}
                            </SectionContent>
                        </Section>
                    ) : null}
                    {location ? (
                        <Section>
                            <SectionTitle>Business Location</SectionTitle>
                            {location?.display_name ? (
                                <SectionSubtitle>{location?.display_name}</SectionSubtitle>
                            ) : null}
                            <SectionContent>
                                <MapContainer>
                                    <Map
                                        defaultCenter={getLocationCoords(location)}
                                        defaultZoom={zoomLevel}
                                        markers={[getLocationCoords(location)]}
                                        loadingElement={<div style={{ height: `100%` }} />}
                                        containerElement={<div style={{ height: `400px` }} />}
                                        mapElement={<div style={{ height: `100%` }} />}
                                    />
                                </MapContainer>
                            </SectionContent>
                        </Section>
                    ) : null}
                    <ReviewsSection
                        summary={reviews?.summary}
                        reviews={reviews?.reviews}
                        rating={reviews?.rating}
                        onAdd={onAddReview}
                        canAdd={canAddReview}
                        onEdit={onEditReview}
                        onDelete={onDeleteReview}
                        onFlag={onFlagReview}
                        onLike={onLikeReview}
                        business={business}
                    />
                    {isPremium && isMobile ? (
                        <PromoVideosSection
                            videos={business?.promoVideos}
                            isMobile={isMobile}
                            onVideoChange={handleVideoChange}
                        />
                    ) : null}
                    {business?.worksWith?.length ? (
                        <Section>
                            <SectionTitle>Frequently Works With</SectionTitle>
                            <SectionContent>
                                <BusinessWorksWith businesses={business?.worksWith || []} isMobile={isMobile} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    <Recommended fullWidth isLast />
                </Content>
            </ConditionalWrapper>
            {!isMobile ? (
                <Sidebar>
                    <div ref={ref}>
                        <InfoCardContainer>
                            <ConnectedBusinessInfo />
                        </InfoCardContainer>
                        {isPremium ? (
                            <PromoVideosSection
                                videos={business?.promoVideos}
                                isMobile={isMobile}
                                onVideoChange={handleVideoChange}
                            />
                        ) : null}
                    </div>
                    {!inView ? (
                        <StickyInfoCardContainer hasDescription={Boolean(description)}>
                            <ConnectedBusinessInfo />
                        </StickyInfoCardContainer>
                    ) : null}
                </Sidebar>
            ) : null}
        </Container>
    ) : null;
};

export default BusinessPage;
