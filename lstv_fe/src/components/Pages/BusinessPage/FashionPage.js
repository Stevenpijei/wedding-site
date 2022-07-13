import React, { useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

import { useMediaReady } from '../../../utils/LSTVUtils';
import theme from '../../../styledComponentsTheme';
import Map from '../../../newComponents/map/Map';
import ReviewsSection from '../../../newComponents/reviews';
import ConditionalWrapper from '../../../newComponents/ConditionalWrapper';
import ShopItems from '../../../newComponents/ShopItems';
import EventCard from '../../../newComponents/cards/EventCard';

import BusinessStickyPanel from './BusinessStickyPanel';
import BusinessInfo from './BusinessInfo';
import BusinessVideos from './BusinessVideos';
import BusinessHero from './BusinessHero';
import BusinessPromoVideos from './BusinessPromoVideos';
import BusinessCards from '../BusinessCards';

import { MapContainer } from './BusinessLayout';
import {
    Container,
    Content,
    DesktopContainer,
    InfoCardContainer,
    Section,
    SectionContent,
    SectionHeader,
    SectionSubtitle,
    SectionTitle,
    Sidebar,
    StickyInfoCardContainer,
} from '../../../newComponents/layout/TwoColumnLayoutBlocks';
import Recommended from '../VideoPage/Recommended';
import { LSTVImage } from '../../Utility/LSTVImage';
import PhotoGallery from '../../../newComponents/PhotoGallery';
import BusinessTeam from './BusinessTeam';
import BusinessFaq from './BusinessFaq';

const EventsContainer = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, 0.33fr);
  grid-gap: 20px;
  margin: 24px 0 0 0;

  @media ${theme.breakpoints.isMobileOrTablet} {
    display: flex;
    overflow-x: scroll;
    flex-wrap: no-wrap;
  }
`;

const BrandsContainer = styled('div')`
  display: flex;
  margin: 24px 0 0 0;

  @media ${theme.breakpoints.isMobileOrTablet} {
    overflow-x: scroll;
  }
`;

const EventContainer = styled('div')`
  width: 100%;

  @media ${theme.breakpoints.isMobileOrTablet} {
    margin: 0 16px;
    min-width: 75vw;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;

const Brand = styled('img')`
  height: 80px;
  width: 80px;
  border-radius: 40px;
  border: 1px solid ${theme.midGrey};
  margin: 0 8px;
  object-fit: contain;

  &:first-of-type {
    margin-left: 0;
  }
`;

const SoldAtSection = ({ businesses, isMobile }) => {
    return businesses?.length ? (
        <Section>
            <SectionTitle>Sold At</SectionTitle>
            <SectionContent>
                <BusinessCards businesses={businesses} hideScrollController={isMobile} />
            </SectionContent>
        </Section>
    ) : null;
};

const BrandsSection = ({ brands }) => {
    return brands?.length ? (
        <Section>
            <SectionTitle>Family of Brands</SectionTitle>
            <SectionContent>
                {brands?.length ? (
                    <BrandsContainer>
                        {brands?.map((brand, index) => (
                            <Link to={brand?.link} key={index}>
                                <Brand src={brand.logo_image_url} key={index} />
                            </Link>
                        ))}
                    </BrandsContainer>
                ) : null}
            </SectionContent>
        </Section>
    ) : null;
};

const PromoVideosSection = ({ videos, isMobile }) => {
    return videos?.length > 0 ? (
        <Section>
            <SectionTitle>Promo Videos</SectionTitle>
            <SectionContent>
                <BusinessPromoVideos videos={videos} isMobile={isMobile} />
            </SectionContent>
        </Section>
    ) : null;
};

const Events = ({ events }) => {
    return (
        <EventsContainer>
            {events?.map((event) => (
                <EventContainer key={event.id}>
                    <EventCard event={event} />
                </EventContainer>
            ))}
        </EventsContainer>
    );
};

const FashionPage = ({
                         business,
                         onEditReview,
                         onDeleteReview,
                         onAddReview,
                         onLikeReview,
                         canAddReview,
                         onSubscribe,
                         isUserSubscribed,
                         flagReview,
                     }) => {
    const {
        id,
        isPremium,
        soldAt,
        brandsFamily,
        description,
        events,
        slug,
        name,
        email,
        altContactCTALabel,
        altContactCTALink,
        contact,
        faq,
        publicTeamFaq,
        team,
        photos,
        thumbnailUrl,
        profileImageUrl,
        reviews,
        location,
        shopItems,
        roles,
        mainVideo,
        promoVideos,
    } = business;

    const [videosCount, setVideosCount] = useState(0);
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet, false);
    const { ref, inView: businessInfoInView } = useInView({
        threshold: 0.2,
        initialInView: true,
    });

    const ConnectedBusinessInfo = () => (
        <BusinessInfo
            isFashion
            withThumbnail
            id={id}
            slug={slug}
            name={name}
            email={email}
            phones={contact?.phones}
            website={contact?.website}
            altContactCTALabel={altContactCTALabel}
            altContactCTALink={altContactCTALink}
            socialLinks={contact?.socialLinks}
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
    };

    const coords =
        typeof location?.lat !== 'undefined' && typeof location?.long !== 'undefined'
            ? { lat: location.lat, lng: location.long }
            : undefined;

    return ready ? (
        <Container>
            {!businessInfoInView ? (
                <BusinessStickyPanel
                    business={{ website: contact?.website, name, thumbnailUrl, slug, isFashion: true }}
                >
                    <ConnectedBusinessInfo />
                </BusinessStickyPanel>
            ) : null}
            <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                {!isMobile ? <BusinessHero video={mainVideo} business={business} /> : null}
                <Content>
                    {!mainVideo &&
                    <LSTVImage
                        url={photos[0].url || 'https://cdn.lovestoriestv.com/images/site/default_business_header.jpg'} />
                    }
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
                                    <BusinessHero video={mainVideo} business={business} />
                                </SectionContent>
                            </Section>
                            <SoldAtSection businesses={soldAt} isMobile={isMobile} />
                            <BrandsSection brands={brandsFamily} />
                        </>
                    ) : null}
                    <Section>
                        {videosCount > 0 && <SectionTitle>{videosCount} Videos featuring</SectionTitle>}
                        {videosCount > 0 && <SectionSubtitle>{name}</SectionSubtitle>}
                        <SectionContent>
                            <BusinessVideos slug={slug} isMobile={isMobile} onData={handleVideosFeaturingReady} />
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
                    {photos?.length ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>{roles.find(element => element?.slug === 'dress-designer') ? "Dress" +
                                    " Gallery" : "Photo Gallery"}</SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <PhotoGallery photos={photos} photoCredit={name} targetImageHeight={350} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    {events && events?.length ? (
                        <Section>
                            <SectionTitle>Shopping Events Calendar</SectionTitle>
                            <SectionContent>
                                <Events events={events} />
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
                            <SectionTitle>Flagship Location</SectionTitle>
                            {location?.display_name ?
                                <SectionSubtitle>{location?.display_name}</SectionSubtitle> : null}
                            <SectionContent>
                                <MapContainer>
                                    <Map
                                        markers={[coords]}
                                        defaultCenter={coords}
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
                        onFlag={flagReview}
                        onLike={onLikeReview}
                        business={business}
                    />
                    {isPremium && isMobile ? <PromoVideosSection videos={promoVideos} isMobile={isMobile} /> : null}
                    <Recommended fullWidth isLast />
                </Content>
            </ConditionalWrapper>
            {!isMobile ? (
                <Sidebar>
                    <div ref={ref}>
                        <InfoCardContainer>
                            <ConnectedBusinessInfo />
                        </InfoCardContainer>
                        <SoldAtSection businesses={soldAt} isMobile={isMobile} noPaddingBottom />
                        <BrandsSection brands={brandsFamily} />
                        {isPremium ? <PromoVideosSection videos={promoVideos} isMobile={isMobile} /> : null}
                    </div>
                    {!businessInfoInView ? (
                        <StickyInfoCardContainer hasDescription={Boolean(description)}>
                            <ConnectedBusinessInfo />
                        </StickyInfoCardContainer>
                    ) : null}
                </Sidebar>
            ) : null}
        </Container>
    ) : null;
};

export default FashionPage;
