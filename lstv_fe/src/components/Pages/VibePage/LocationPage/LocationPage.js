import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import theme from '../../../../styledComponentsTheme';
import { useMediaReady } from '../../../../utils/LSTVUtils';

import ConditionalWrapper from '../../../../newComponents/ConditionalWrapper';

import VibeHero from '../VibeHero';
import VibeVideos from '../VibeVideos';
import VibeInfo from '../VibeInfo';
import VibeMiddleInfoSection from '../VibeMiddleInfo';
import VibeBottomInfoSection from '../VibeBottomInfo';
import VibeBusinessGrid from '../VibeBusinessGrid';

import {
    Container,
    Content,
    DesktopContainer,
    Sidebar,
    Section,
    SectionTitle,
    SectionContent,
    SectionHeader,
    InfoCardContainer,
    StickyInfoCardContainer,
} from '../../../../newComponents/layout/TwoColumnLayoutBlocks';
import Recommended from '../../VideoPage/Recommended';
import PhotoGallery from '../../../../newComponents/PhotoGallery';


const VibePage = ({ data }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet, false);
    const { ref, inView } = useInView({
        threshold: 0,
    });
    const [videosCount, setVideosCount] = useState(0);
    const [isVideoRequestDone, setIsVideoRequestDone] = useState(false);

    const { curated_content, slug, place_url, state_province_url, country_url } = data;

    const calcLocation = () => {
        if(place_url) {
          return place_url
        } else if ( state_province_url ) {
          return state_province_url
        } else if ( country_url) {
          return country_url
        }
    }

    const location = calcLocation();

    const { page_title, page_description, businesses_title } = curated_content || {};

    const hasMiddleInfo = Boolean(curated_content?.middle_info_header_1 && curated_content?.middle_info_text_1);
    const hasBottomInfo = Boolean(curated_content?.bottom_info_header_1 && curated_content?.bottom_info_text_1);

    const handleVideosData = (response) => {
        if(response){
            setIsVideoRequestDone(true);
            setVideosCount(response?.scope?.total);
        }
        
    };

    const ConnectedVibeInfo= () => (
        <VibeInfo
            slug={place_url}
            title={page_title}
            description={page_description}
            name={data?.display_name}
            videosCount={videosCount}
            isLocation
        />
    );

    const shouldRenderVideosSection = !isVideoRequestDone || videosCount > 0;

    return ready ? (
        <Container>
            <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                {data?.mainVideo ? <VibeHero post={data.mainVideo} /> : null}
                <Content>
                    {isMobile ? (
                        <InfoCardContainer>
                            <div ref={ref}>
                                <ConnectedVibeInfo />
                            </div>
                        </InfoCardContainer>
                    ) : null}
                    {!isMobile ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>
                                    {businesses_title ||
                                        `Need vendors for your ${data?.display_name} wedding? These pros specialize in this style.`}
                                </SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <VibeBusinessGrid
                                    slug={location.replace('/location/', '')}
                                    onlyShowVenues={false}
                                    offset={0}
                                    size={4}
                                    isLocation
                                />
                            </SectionContent>
                        </Section>
                    ) : null}
                    {hasMiddleInfo ? <VibeMiddleInfoSection content={curated_content} /> : null}
                    {shouldRenderVideosSection ? (
                        <Section>
                            <SectionHeader>
                                {videosCount > 0 && <SectionTitle>
                                    {videosCount.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                                    {data?.display_name.replace(", United States","")} Videos
                                </SectionTitle>}
                            </SectionHeader>
                            <SectionContent>
                                <VibeVideos
                                    slug={location.replace('/location/', '')}
                                    onData={handleVideosData}
                                    isLocation
                                />
                            </SectionContent>
                        </Section>
                    ) : null}
                    {hasBottomInfo ? <VibeBottomInfoSection content={curated_content} /> : null}
                    {data?.photos?.length ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>{data?.display_name || ''} Wedding Photos</SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <PhotoGallery photos={data.photos} targetImageHeight={350} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    <Section>
                        <SectionHeader>
                            <SectionTitle>More {data?.display_name} Wedding Videos</SectionTitle>
                        </SectionHeader>
                        <SectionContent>
                            <VibeVideos slug={location.replace('/location/', '')} offset={8} size={8} isLocation />
                        </SectionContent>
                    </Section>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>These venues specialize in {data?.display_name} style weddings</SectionTitle>
                        </SectionHeader>
                        <SectionContent>
                            <VibeBusinessGrid
                                slug={location.replace('/location/', '')}
                                onlyShowVenues={true}
                                offset={0}
                                size={4}
                                isLocation
                            />
                        </SectionContent>
                    </Section>
                    <Recommended fullWidth isLast />
                </Content>
            </ConditionalWrapper>
            {!isMobile ? (
                <Sidebar>
                    <div ref={ref}>
                        <InfoCardContainer>
                            <ConnectedVibeInfo />
                        </InfoCardContainer>
                    </div>
                    {!inView ? (
                        <StickyInfoCardContainer hasDescription={Boolean(page_description)}>
                            <ConnectedVibeInfo />
                        </StickyInfoCardContainer>
                    ) : null}
                </Sidebar>
            ) : null}
        </Container>
    ) : null;
};

export default VibePage;
