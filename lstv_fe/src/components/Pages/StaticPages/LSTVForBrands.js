import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'

import theme from '../../../styledComponentsTheme'
import { useMediaReady } from '../../../utils/LSTVUtils';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import brandPageImage from '../../../images/your_brand_page.png';
import brandVideoImage from '../../../images/your_brand_video.png';
import secondBrandVideoImage from '../../../images/your_brand_video_2.png';
import brandSocialImage from '../../../images/your_brand_social.png';
import brandEventsImage from '../../../images/your_brand_events.png';
import BrandNewImage from '../../../images/brands-new-image.png';

import businessCardPreview from '../../../images/business_card_preview.png';
import StaticPageLayout from './StaticPageLayout';
import {
    Hero,
    HeroText,
    HeroTitle,
    HeroTextContainer,
    HeroImage,
    Section,
    SectionContent,
    SectionPanel,
    SectionCta,
    SectionCtaHelperText,
    SectionImage,
    SectionText,
    SectionTitle,
} from './commonComponents';
import VideoPlayer from '../../Video/VideoPlayer';

const video = {
  id: 'a7e16389-29a5-4344-9d24-26fcdef7386d',
  order: 1,
  type: 'jwplayer',
  media_id: '5uUHtfhE',
  duration: 359,
  width: 1920,
  height: 1080,
  thumbnail_url: 'https://cdn.lovestoriestv.com/images/site/content/2eee61627d688e623c0635e5068369b82d052da5-orig.jpeg',
}

const VideoWithCreditsContainer = styled.div`
  margin: ${props => props.isMobile ? '44px -16px 54px' : '0'};
`

const VideoContainer = styled.div`
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 8px rgba(103,103,103,0.25);
`

const CreditsContainer = styled.div`
  margin-top: 6px;
  font-size: 15px;
  font-weight: 500;
  text-align: right;
`

const LSTVForBrands = () => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet)

    const handleLearnMore = () => {
        window.open("mailto:katie@lovestoriestv.com", "_blank");
    }

    return (
        <StaticPageLayout
            headerText="Unlock the Power of Video"
            headerSubtitle="Authentic, high quality, professionally produced videos that show your products and brand in context at real weddings."
            wideContent
        >
            <Hero>
                <HeroTextContainer>
                    <HeroTitle>Leverage the impact of movement and sound</HeroTitle>
                    <HeroText align={isMobile ? 'center' : 'left'}>
                        On lovestoriestv.com wedding filmmakers from all over the world upload their videos and provide
                        details about the wedding. Engaged couples search lovestoriestv.com to find products, pros, and
                        ideas for their weddings.
                    </HeroText>
                </HeroTextContainer>
                <VideoWithCreditsContainer {...{isMobile}}>
                    <VideoContainer>
                        <VideoPlayer onPercentageComplete={null} onVideoComplete={null} video={video} upNextSlide={null} withPreRoll={false} />
                    </VideoContainer>
                    <CreditsContainer>Georgia & Willis by This Modern Revelry</CreditsContainer>
                </VideoWithCreditsContainer>
            </Hero>

            <Section>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Your Brand Page</SectionTitle>
                        <SectionText>
                            Get discovered, drive quality traffic to your website, promote your products, stores,
                            upcoming events and more from your premium Love Stories TV page.
                        </SectionText>
                        <SectionCta>
                            <BaseCTAButton title="Learn More" size="fullWidth" lightMode onClick={handleLearnMore} />

                        </SectionCta>
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage shadow src={brandPageImage} />
                </SectionPanel>
            </Section>

            <Section reversePanels>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Custom Video</SectionTitle>
                        <SectionText>
                            Tell your story and build brand affinity with custom video content that features your brand
                            and products in context at real weddings.
                        </SectionText>
                        <SectionCta>
                            <BaseCTAButton title="Learn More" size="fullWidth" lightMode onClick={handleLearnMore} />

                        </SectionCta>
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage shadow src={BrandNewImage} />
                </SectionPanel>
            </Section>
            <Section>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Social</SectionTitle>
                        <SectionText>
                            Drive traffic, grow your channels, boost engagement, and increase your social reach with
                            viral video content that features your brand and products.
                        </SectionText>
                        <SectionCta>
                            <BaseCTAButton title="Learn More" size="fullWidth" lightMode onClick={handleLearnMore} />

                        </SectionCta>
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={brandSocialImage} />
                </SectionPanel>
            </Section>
            <Section reversePanels>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Pre-Roll</SectionTitle>
                        <SectionText>
                            Increase your brand awareness, engagement, favorability, and purchase intent among our
                            audience of soonlyweds with 15-30 second pre-roll video ads.
                        </SectionText>
                        <SectionCta>
                            <BaseCTAButton title="Learn More" size="fullWidth" lightMode onClick={handleLearnMore} />

                        </SectionCta>
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage shadow src={brandVideoImage} />
                </SectionPanel>
            </Section>

            <Section>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Events</SectionTitle>
                        <SectionText>
                            Gather realtime feedback, actionable insights, and leads from new and existing customers.
                            Leverage our expert onair and live talent to present your team and brand in the most
                            compelling way.
                        </SectionText>
                        <SectionCta>
                            <BaseCTAButton title="Learn More" size="fullWidth" lightMode onClick={handleLearnMore} />

                        </SectionCta>
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={brandEventsImage} />
                </SectionPanel>
            </Section>
        </StaticPageLayout>
    );
};

export default LSTVForBrands;
