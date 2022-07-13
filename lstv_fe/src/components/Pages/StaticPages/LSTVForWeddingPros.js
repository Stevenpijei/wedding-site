import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import StaticPageLayout from './StaticPageLayout';
import { useMediaReady } from '/utils/LSTVUtils';
import theme from '../../../styledComponentsTheme';
import BaseCtaButton from '/newComponents/buttons/BaseCtaButton';
import weddingPro1 from '/images/wedding_pro_1.png';
import weddingPro2 from '/images/wedding_pro_2.png';
import weddingPro3 from '/images/wedding_pro_3.png';
import { Icon1, Icon2, Icon3, Icon4, Icon5, Icon6} from '../../Utility/LSTVSVG';
import {
    Hero,
    HeroText,
    HeroTitle,
    HeroTextContainer,
    HeroImage,
    Section,
    SectionPanel,
    SectionContent, SectionImage,
    SectionText,
    SectionTitle,
} from './commonComponents';
import VideoPlayer from '../../Video/VideoPlayer';

const video = {
  id: '98d8d416-fa5f-4553-924a-ed97828dde13',
  order: 1,
  type: 'jwplayer',
  media_id: 'Pl6PVKnS',
  duration: 170,
  width: 1920,
  height: 1080,
  thumbnail_url: 'https://cdn.lovestoriestv.com/images/site/content/ce4eb9485218077b0289779368a8bfa8546d2204-orig.jpeg',
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

const PurpleCardDiv = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-left: 120px;
  padding-right: 120px;
  flex-wrap: wrap;
  @media ${theme.breakpoints.isMobileOrTablet} {
    flex-direction: column;
    padding-left: 10px;
    padding-right: 10px;
  }
`

export const LastSection = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.reversePanels ? 'row-reverse' : 'row')};
  margin-top: 48px;
  // height: 500px;
  grid-auto-flow: dense;

  @media ${theme.breakpoints.isMobileOrTablet} {
    flex-direction: column;
    margin: 0;
    // height: 850px;
  }
`;

const CardDiv = styled.div`
  width: 285px;
  height: 160px;
  background-color: #6A25FF;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin: auto;
  margin-top: 30px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 25px;
  padding-bottom: 25px;

`
const SpacerDiv = styled.div`
  font-size: 0;
  height: ${props => props.spacing};
  flex-shrink: 0;
`
const FinalContent = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

`
const CardIcon = styled.div`
  width: 35px;
  height: 35px;
  padding-left: 10px;

`

const CardText = styled.p`
  //styleName: h5;
  font-family: Calibre;
  font-size: 21px;
  font-style: normal;
  font-weight: 600;
  line-height: 21px;
  letter-spacing: 0em;
  text-align: left;
  color: white;
  margin: 10px;
  padding-top: 10px;
`
const cards = [
    {"desc": "Top directory placement in the locations of your choice", "icon": <Icon1/>},
    {"desc": "More in-depth team intros and headshots", "icon": <Icon4/>},
    {"desc": "Sell products through your Business Page", "icon": <Icon5/>},
    {"desc": "Publish photos and promo videos", "icon": <Icon2/>},
    {"desc": "Customize your Frequently Works With section", "icon": <Icon3/>},
    {"desc": "And more...", "icon": <Icon6/>}
]

const Cards = cards.map((card, index) => {
    return (
        <CardDiv key={index}>
            <CardIcon>{card.icon}</CardIcon>
            <CardText>{card.desc}</CardText>
        </CardDiv>
    )
})

const CardTitle = styled.div`
  //styleName: H2_Heldane;
  font-family: Heldane Display Test;
  font-size: 34px;
  font-style: normal;
  font-weight: 700;
  line-height: 50px;
  letter-spacing: 0em;
  text-align: center;
  padding-top: 60px;
`

const CardSubheader = styled.div`
  text-align: center;
  max-width: 350px;
`

const LSTVForFilmMakers = () => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);
    const history = useHistory();
    const handleLearnMore = () => {
        window.open("mailto:upgrade@lovestoriestv.com", "_blank");
    }

    if(!ready) return null

    return (
        <StaticPageLayout
            headerText="Your All-In-One Solution"
            headerSubtitle="Showcase your work and market your business with our platform built specifically for wedding pros."
            wideContent
        >
            <Hero>
                <HeroTextContainer>
                    {isMobile ? (
                        <HeroTitle>
                            Unlock the <br /> power of video
                        </HeroTitle>
                    ) : (
                        <HeroTitle>Unlock the power of video</HeroTitle>
                    )}
                    <HeroText align={isMobile ? 'center' : 'left'}>
                        {`On lovestoriestv.com, wedding videographers upload their work and tag the other pros who worked on the wedding. When you're tagged, those videos automatically appear on your complimentary Business Page, creating a professionally-produced, high-quality video gallery that showcases your business.`}
                    </HeroText>
                </HeroTextContainer>
                <VideoWithCreditsContainer {...{isMobile}}>
                    <VideoContainer>
                        <VideoPlayer onPercentageComplete={null} onVideoComplete={null} video={video} upNextSlide={null} withPreRoll={false} />
                    </VideoContainer>
                    <CreditsContainer>Rachel & Austin by Key Moment Films</CreditsContainer>
                </VideoWithCreditsContainer>
            </Hero>

            <Section reversePanels>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Your Business Page</SectionTitle>
                        <SectionText>
                            Tell your story and showcase your unique expertise on your complimentary Love Stories TV business page. Get inquiries from couples using lovestoriestv.com to find pros for their wedding.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Manage Your Page'} size={'large'} onClick={() => history.push("/dashboard/videos")} lightMode />
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={weddingPro1} shadow/>
                </SectionPanel>
            </Section>

            <Section>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Get Discovered</SectionTitle>
                        <SectionText>
                            Get in front of potential customers on our search and directory pages. Increase visibility in the locations you serve.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Learn More'} size={'large'} onClick={handleLearnMore} lightMode />
                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={weddingPro3} shadow/>
                </SectionPanel>
            </Section>

            <Section reversePanels>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Generate Leads</SectionTitle>
                        <SectionText>
                            Connect with couples looking for vendors. Encourage your videographer colleagues to publish
                            videos of the weddings you've worked on together. The more videos you're tagged in, the more
                            discoverable you are.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Learn More'} size={'large'} onClick={handleLearnMore} lightMode />
                    </SectionContent>
                </SectionPanel>
                <SectionPanel>
                    <SectionImage src={weddingPro2} shadow/>
                </SectionPanel>
            </Section>

            <LastSection>
                <SectionPanel>
                    <FinalContent>
                        <SpacerDiv spacing="30px"/>
                        <CardTitle>
                            Get More
                        </CardTitle>
                        <CardSubheader>
                            Upgrade to a Basic, Plus, or Premium membership to unlock more features
                        </CardSubheader>
                        <SpacerDiv spacing="30px"/>
                        <BaseCtaButton title={'Upgrade Now'} size={'large'} onClick={handleLearnMore}  />
                    </FinalContent>
                    <SpacerDiv spacing="30px"/>
                    <PurpleCardDiv>
                        {Cards}
                    </PurpleCardDiv>
                </SectionPanel>
            </LastSection>
        </StaticPageLayout>
    )
};

export default LSTVForFilmMakers;
