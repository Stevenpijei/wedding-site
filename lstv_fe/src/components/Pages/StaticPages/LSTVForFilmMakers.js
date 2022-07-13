import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import StaticPageLayout from './StaticPageLayout';
import { useMediaReady } from '../../../utils/LSTVUtils';
import theme from '../../../styledComponentsTheme';
import BaseCtaButton from '../../../newComponents/buttons/BaseCtaButton'
import FilmmakerImage1 from '../../../images/filmmaker_1.png'
import FilmmakerImage2 from '../../../images/filmmaker_2.png'
import FilmmakerImage3 from '../../../images/filmmaker_3.png'
import FilmmakerImage4 from '../../../images/filmmaker_4.png'


//icons
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
  id: 'e147cd23-21ed-4d73-86bf-356cf81d2aba',
  order: 1,
  type: 'jwplayer',
  media_id: 'epHHBVIM',
  duration: 526,
  width: 1920,
  height: 800,
  thumbnail_url: 'https://cdn.lovestoriestv.com/images/site/content/a4a5ba9ef9a308262f654da4ed0c278e76334c49-orig.jpeg',
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
    {"desc": "More in-depth team intros and headshots", "icon": <Icon5/>},

    {"desc": "Sell products through your Business Page", "icon": <Icon3/>},

    {"desc": "Publish photos and promo videos", "icon": <Icon4/>},

    {"desc": "Customize your Frequently Works With section", "icon": <Icon2/>},

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
    return ready ? (
        <StaticPageLayout
            headerText="Your All-In-One Solution"
            headerSubtitle="Manage your videos and market your business with our platform built specifically for wedding filmmakers."
            wideContent
        >
            <Hero>
                <HeroTextContainer>
                    {isMobile ? (
                        <HeroTitle>
                            A Video-First <br /> platform
                        </HeroTitle>
                    ) : (
                        <HeroTitle>A Video-First Platform</HeroTitle>
                    )}
                    <HeroText align={isMobile ? 'center' : 'left'}>
                        Upload and manage privacy on unlimited wedding videos - for free. Embed videos on your website,
                        share them privately with your clients, and publish them to attract new couples.
                    </HeroText>
                </HeroTextContainer>
                <VideoWithCreditsContainer {...{isMobile}}>
                    <VideoContainer>
                        <VideoPlayer onPercentageComplete={null} onVideoComplete={null} video={video} upNextSlide={null} withPreRoll={false} />
                    </VideoContainer>
                    <CreditsContainer>Kimberly & Patrick by NST Pictures</CreditsContainer>
                </VideoWithCreditsContainer>
            </Hero>
            <Section>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Video Management</SectionTitle>
                        <SectionText>
                            Stop paying to host, share, and embed your work. We offer free, unlimited storage for your real wedding videos. Bulk upload, embed on your website, share private video links with your clients, and more.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Upload Now'} size={'large'} onClick={() => history.push('/dashboard/videos')} lightMode />

                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={FilmmakerImage1} shadow/>
                </SectionPanel>
            </Section>

            <Section reversePanels>
                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Your Business Page</SectionTitle>
                        <SectionText>
                            Tell your story and showcase your unique expertise on your complimentary Love Stories TV business page. Get inquiries from couples using lovestoriestv.com to find filmmakers for their wedding.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Manage Your Page'} size={'large'} onClick={() => history.push('/dashboard')} lightMode />

                    </SectionContent>
                </SectionPanel>
                <SectionPanel isMobile={isMobile}>
                    <SectionImage src={FilmmakerImage2} shadow/>
                </SectionPanel>
            </Section>

            <Section>

                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Get Discovered</SectionTitle>
                        <SectionText>
                            Get in front of potential customers on our search and directory pages. The more videos you upload, the more places you'll be listed.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Upload Now'} size={'large'} onClick={() => history.push("/dashboard/videos")} lightMode />

                    </SectionContent>
                </SectionPanel>
                <SectionPanel>
                    <SectionImage src={FilmmakerImage3} shadow/>
                </SectionPanel>
            </Section>
            <Section reversePanels>

                <SectionPanel primary>
                    <SectionContent>
                        <SectionTitle align={isMobile ? 'center' : 'left'}>Generate Leads</SectionTitle>
                        <SectionText>
                            Connect with couples looking for filmmakers. Upload your full body of work, provide wedding details, and tag your colleagues to get discovered by couples searching for specific locations, venues, and styles.
                        </SectionText>
                        <SpacerDiv spacing="22px"/>
                        <BaseCtaButton title={'Tag Your Colleagues'} size={'large'} onClick={() => history.push("/dashboard/videos")} lightMode />

                    </SectionContent>
                </SectionPanel>
                <SectionPanel>
                    <SectionImage src={FilmmakerImage4} shadow/>
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
    ) : null;
};

export default LSTVForFilmMakers;
