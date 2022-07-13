import React, { useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';

import theme from '../../../styledComponentsTheme';
import { useMediaReady } from '../../../utils/LSTVUtils';

import ConditionalWrapper from '../../../newComponents/ConditionalWrapper';

import VibeHero from './VibeHero';
import VibeVideos from './VibeVideos';
import VibeInfo from './VibeInfo';
import VibeMiddleInfoSection from './VibeMiddleInfo';
import VibeBottomInfoSection from './VibeBottomInfo';

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
} from '../../../newComponents/layout/TwoColumnLayoutBlocks';
import VibeBusinessGrid from './VibeBusinessGrid';
import Recommended from '../VideoPage/Recommended';
import PhotoGallery from '../../../newComponents/PhotoGallery';

const Placeholder = styled.div`
    height: 300px;
    background: blue;
`;

const VibePage = ({ data }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet, false);
    const { ref, inView } = useInView({
        threshold: 0,
    });

    const { curated_content, slug } = data;
    const { page_title, page_description, businesses_title } = curated_content || {};

    const hasMiddleInfo = Boolean(curated_content?.middle_info_header_1 && curated_content?.middle_info_text_1);
    const hasBottomInfo = Boolean(curated_content?.bottom_info_header_1 && curated_content?.bottom_info_text_1);

    const ConnectedVibeInfo = () => (
        <VibeInfo
            slug={slug}
            title={page_title}
            description={page_description}
            name={data?.name}
            videosCount={data?.weight_videos}
        />
    );

    return ready ? (
        <Container>
            <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                <VibeHero post={data.mainVideo} />
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
                                        `Need vendors for your ${data?.name} wedding? These pros specialize in this style.`}
                                </SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <VibeBusinessGrid slug={data?.slug} onlyShowVenues={false} offset={0} size={4} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    {hasMiddleInfo ? <VibeMiddleInfoSection content={curated_content} /> : null}
                    <Section>
                        <SectionHeader>
                            <SectionTitle>{data.name} Wedding Videos</SectionTitle>
                        </SectionHeader>
                        <SectionContent>
                            <VibeVideos slug={slug} />
                        </SectionContent>
                    </Section>
                    {hasBottomInfo ? <VibeBottomInfoSection content={curated_content} /> : null}
                    {data?.photos?.length ? (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>{data.name} Wedding Photos</SectionTitle>
                            </SectionHeader>
                            <SectionContent>
                                <PhotoGallery photos={data.photos} targetImageHeight={350} />
                            </SectionContent>
                        </Section>
                    ) : null}
                    <Section>
                        <SectionHeader>
                            <SectionTitle>More {data.name} Wedding Videos</SectionTitle>
                        </SectionHeader>
                        <SectionContent>
                            <VibeVideos slug={slug} offset={8} size={8} />
                        </SectionContent>
                    </Section>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>These venues specialize in {data.name} style weddings</SectionTitle>
                        </SectionHeader>
                        <SectionContent>
                            <VibeBusinessGrid slug={data?.slug} onlyShowVenues={true} offset={0} size={4} />
                        </SectionContent>
                    </Section>
                    <Recommended />
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
