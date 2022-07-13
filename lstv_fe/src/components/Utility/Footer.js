import { faHeart } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { LSTVSVG } from '../../components/Utility/LSTVSVG';
import * as LSTVGlobals from '../../global/globals';
import { MenuButton } from '../../newComponents/buttons/BaseMenuButton';
import { Flex } from '../../utils/LSTVUtils';
import LSTVLink from "./LSTVLink";
import { LSTVLogo } from './LSTVLogo';
import { AppleIcon, FacebookIcon, InstagramIcon, PinterestIcon, TiktokIcon, TwitterIcon, YoutubeIcon } from './LSTVSVG';
import theme from '../../styledComponentsTheme'

const FooterStyle = styled.div`
    display: block;
    position: relative;
    width: 100%;
    min-height: 100px;
    height: auto;
    background-color: ${(props) => props.backgroundColor || 'transparent'};
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
`;

const Middle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
    flex-wrap: wrap;
    height: 100%;
    width: 100%;
    max-width: 692px;
    margin: auto;
    padding: 12px 0px 12px 0px;
    border-top: 1px solid #ebebeb;
    border-bottom: 1px solid #ebebeb;
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    @media ${LSTVGlobals.UserDevice.tablet} {
        flex-direction: row;
        padding: 54px 0px 54px 0px;
        justify-content: flex-start;
    }
    @media ${LSTVGlobals.UserDevice.laptop} {
        justify-content: space-evenly;
        max-width: none;
        flex-wrap: nowrap;
    }
`;

const Column = styled(Flex)`
    display: flex;
    justify-content: center;
    flex-basis: 50%;
    @media ${LSTVGlobals.UserDevice.tablet} {
        padding-bottom: 81px;
    }
    @media ${LSTVGlobals.UserDevice.laptop} {
        flex-basis: auto;
        padding-bottom: 0px;
    }
`;

const Copyright = styled.div`
    padding: 22px 20px;
    text-align: left;
    font-size: 0.937rem;
    line-height: 1.125rem;
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    display: flex;
    justify-content: center;
    flex-direction: column;
    @media ${LSTVGlobals.UserDevice.tablet} {
        flex-direction: row;
        text-align: center;
        p:first-child {
            margin-right: 7px;
        }
    }
`;

const LogoLink = styled(Link)`
    align-self: left;
    text-decoration: none;
    order: 5;
    padding: 26px 0px 38px 20px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        padding: 0px;
    }
    @media ${LSTVGlobals.UserDevice.laptop} {
        order: 0;
        align-self: center;
    }
`;

const StyledLogo = styled(LSTVLogo)`
    width: 136px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        width: 228px;
    }
    @media ${LSTVGlobals.UserDevice.laptop} {
        width: 210px;
    }
`;

const TitleContainer = styled.div`
    width: 100vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media ${LSTVGlobals.UserDevice.tablet} {
        width: 100%;
        margin: 5px 0 16px 0;
    }
`;

const FooterTitle = styled.h4`
    font-weight: 800;
    padding: 15px 20px 15px 20px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        padding: 0px;
    }
`;

const FooterButton = styled(MenuButton)`
    font-size: 0.937rem;
    line-height: 1.125rem;
    padding: 0px 20px 0px 20px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        padding: 0px;
    }
`;

const IconContainer = styled.div`
    height: 12px;
    width: 12px;
    display: inline-flex;
    padding-right: 29px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        display: none;
    }
`;

const StyledEvent = styled.div`
    font-size: 0.937rem;
    line-height: 1.1rem;
    margin-bottom: 32px;
    margin-left: 20px;
    @media ${LSTVGlobals.UserDevice.tablet} {
        margin-left: 0px;
    }
    small {
        font-size: 0.75rem;
        line-height: 0.875rem;
        color: ${LSTVGlobals.TEXT_LIGHT_GREY};
    }
    button {
        color: white;
        cursor: pointer;
        font-size: 0.75rem;
        line-height: 0.875rem;
        background: ${LSTVGlobals.SECONDARY_PURPLE};
        border-radius: 20px;
        padding: 5px 12px;
        margin-top: 9px;
        box-shadow: 0px 4px 4px rgba(210, 210, 210, 0.25);
        &:hover {
            background: ${LSTVGlobals.PRIMARY_PURPLE};
        }
    }
`;


const SocialLink = ({ to, children }) => (
    <a
        rel={'noreferrer'}
        target={'_blank'}
        href={to}
    >
        {children}
    </a>
);

const SocialLinks = () => {
    return (
        <SocialLinkContainer>
            <SocialLink to="https://www.youtube.com/channel/UC5ntpzpHROXC6lgBc6vuScQ">
                <YoutubeIcon />
            </SocialLink>
            <SocialLink to="https://www.facebook.com/LoveStoriesTV/">
                <FacebookIcon />
            </SocialLink>
            <SocialLink to="https://www.pinterest.com/lovestoriestv/">
                <PinterestIcon />
            </SocialLink>
            <SocialLink to="https://www.instagram.com/lovestoriestv/">
                <InstagramIcon />
            </SocialLink>
            <SocialLink to="https://twitter.com/lovestoriestv/">
                <TwitterIcon />
            </SocialLink>
            <SocialLink to="https://podcasts.apple.com/us/podcast/since-you-asked-a-podcast-on-your-wedding-questions/id1344248706?mt=2">
                <AppleIcon />
            </SocialLink>
            <SocialLink to="https://tiktok.com/@lovestoriestv">
                <TiktokIcon />
            </SocialLink>
        </SocialLinkContainer>
    );
};

const SocialLinkContainer = styled.div`
    display: flex;
    padding: 17px 35%;
    align-items: center;
    justify-content: space-evenly;
    border-top: 1px solid #EBEBEB;
    border-bottom: 1px solid #EBEBEB;

    @media ${theme.breakpoints.isMobileOrTablet} {
        a {
            margin: 0 8px;
        }
    }
`;

const Footer = (props) => {
    const [subMenuActive, setSubMenuActive] = useState('');

    // This will be replaced by API Call eventually
    const planYourWedding = [
        { text: 'Personalized Wedding Planner', to: '/designSystem' },
        { text: 'Find Wedding Pros Near You', to: '/' },
        { text: 'Get Wedding Planning from our Blog', to: '/' },
    ];

    const loveStoriesTV = [
        // { text: 'About Us', to: '/about' },
        { text: 'Meet Our Team', to: '/team' },
        { text: 'Contact Us', to: '/contact-us' },
        // { text: 'Press Center', to: '/press' },
        { text: 'FAQ', to: '/faq' },
        // { text: 'Nondiscrimination', to: '/nondiscrimination' },
        { text: 'For Wedding Vendors', to: '/for-wedding-pros' },
        { text: 'For Wedding Filmmakers', to: '/for-filmmakers' },
        { text: 'Advertising', to: '/for-brands' },
        { text: 'Privacy Policy', to: '/privacy-policy' },
        { text: 'DMCA Copyright Policy', to: '/dmca-copyright-policy' },
        { text: 'Terms of Use', to: '/terms-of-use' },
    ];

    const findVendors = [
        { text: 'Directory', to: '/wedding-vendors' },
        { text: 'Videographers', to: '/wedding-videographers' },
        { text: 'Venues', to: '/wedding-venues' },
        { text: 'Wedding Dress Designers', to: '/wedding-dresses' },
        { text: 'Photographers', to: '/wedding-photographers' },
        { text: 'DJs', to: '/wedding-djs' },
        { text: 'Coordinators', to: '/wedding-day-of-coordinators' },
        { text: 'Event Rentals', to: '/wedding-event-rentals-providers' },
        { text: 'Bridal Salons', to: '/wedding-bridal-salons' },
        { text: 'Planners', to: '/wedding-planners' },
    ];

    const weddingVideos = [
        { text: 'Wedding Videos', to: '/wedding-videos' },
        { text: 'Lesbian Weddings', to: '/style/lesbian' },
        { text: 'Vintage Weddings', to: '/style/vintage' },
        // { text: 'Bohemian Weddings', to: '/style/bohemian' },
        { text: 'Korean Weddings', to: '/style/korean' },
        { text: 'Mexican Weddings', to: '/style/mexican' },
        { text: 'Vietnamese Weddings', to: '/style/vietnamese' },
        { text: 'Irish Weddings', to: '/style/irish' },
        { text: 'Civil Weddings', to: '/style/civil' },
        { text: 'Buddhist Weddings', to: '/style/buddhist' },
    ];

    const more = [
        { text: 'Wedding Film Awards', to: 'https://www.weddingfilmawards.com/' },
        { text: 'Bridal Fashion Month', to: 'https://www.bridalfashionmonth.com' },
        { text: 'Luxury Influencer Getaway', to: 'https://lovestoriestvevents.com/homepage' },
        { text: 'Love Stories Radio', to: 'https://podcasts.apple.com/us/podcast/love-stories-radio-a-podcast-on-your-wedding-questions/id1344248706' },
    ];

    const social = [
        { text: 'Facebook', to: 'https://www.facebook.com/LoveStoriesTV/' },
        { text: 'Instagram', to: 'https://www.instagram.com/lovestoriestv/' },
        { text: 'Youtube', to: 'https://www.youtube.com/channel/UC5ntpzpHROXC6lgBc6vuScQ' },
        { text: 'Twitter', to: 'https://twitter.com/lovestoriestv/' },
        { text: 'Tik Tok', to: 'https://tiktok.com/@lovestoriestv' },
        { text: 'Pinterest', to: 'https://www.pinterest.com/lovestoriestv/' },
        {
            text: 'Apple Podcast',
            to:
                'https://podcasts.apple.com/us/podcast/since-you-asked-a-podcast-on-your-wedding-questions/id1344248706?mt=2',
        },
    ];

    // These paths aren't right or pages don't exist
    const quickLinks = [
        { text: 'About Love Stories TV', to: '/about' },
        { text: 'Contact Us', to: '/contact' },
        { text: 'FAQ', to: '/faq' },
        { text: 'Filmmaker Council', to: '/' },
        { text: 'Advertise', to: '/' },
        { text: 'Terms And Conditions', to: '/' },
        { text: 'Privacy Policy', to: '/' },
        { text: 'DCMA', to: '/' },
    ];

    //This will come from API someday and probably have actual date objects
    const upcomingEvents = [
        { date: 'October 1st', title: 'COVID 19 Soonlywed Workshop', to: '/' },
        { date: 'December 15', title: 'Partner Workshops', to: '/' },
    ];

    const renderColumn = (title, dataArray) => {
        return (
            <Column flexDirection={'column'} justifyContent={'flex-start'} flexBasis={'50%'}>
                <TitleContainer onClick={() => setSubMenuActive(subMenuActive === title ? '' : title)}>
                    <FooterTitle>{title}</FooterTitle>
                    <IconContainer>
                        {subMenuActive === title ? (
                            <LSTVSVG
                                icon="minus-sign"
                                fillColor={LSTVGlobals.PRIMARY_PURPLE}
                                strokeColor={LSTVGlobals.PRIMARY_PURPLE}
                            />
                        ) : (
                            <LSTVSVG
                                icon="plus-sign"
                                fillColor={LSTVGlobals.PRIMARY_PURPLE}
                                strokeColor={LSTVGlobals.PRIMARY_PURPLE}
                            />
                        )}
                    </IconContainer>
                </TitleContainer>
                <AnimateHeight
                    duration={LSTVGlobals.SIDEBAR_ACCORDION_SPEED}
                    height={subMenuActive === title || !isMobile ? 'auto' : 0}
                    animateOpacity={true}
                >
                    {(dataArray === loveStoriesTV || dataArray === findVendors || dataArray === weddingVideos || dataArray === more) &&
                        dataArray.map((item) => (
                            <LSTVLink to={item.to} key={item.text}>
                                <FooterButton>{item.text}</FooterButton>
                            </LSTVLink>
                        ))}
                    {(dataArray === quickLinks || dataArray === planYourWedding) &&
                        dataArray.map((item) => (
                            <LSTVLink to={item.to} key={item.text}>
                                <FooterButton>{item.text}</FooterButton>
                            </LSTVLink>
                        ))}
                    {dataArray === social &&
                        dataArray.map((item) => (
                            <LSTVLink to={item.to} key={item.text}>
                                <FooterButton>{item.text}</FooterButton>
                            </LSTVLink>
                        ))}
                    {dataArray === upcomingEvents &&
                        dataArray.map((item) => (
                            <StyledEvent key={item.title}>
                                <small>{item.date}</small>
                                <p>{item.title}</p>
                                <button onClick={() => console.log('This button is NOT wired up')}>Lets go</button>
                            </StyledEvent>
                        ))}
                </AnimateHeight>
            </Column>
        );
    };
    return (
        <FooterStyle {...props}>
            <Middle>
                <LogoLink to={'/'} key={'logo'}>
                    <StyledLogo color={LSTVGlobals.TEXT_AND_SVG_BLACK} background={LSTVGlobals.LSTV_YELLOW} />
                </LogoLink>
                {renderColumn('Love Stories TV', loveStoriesTV)}
                {renderColumn('Find Vendors', findVendors)}
                {renderColumn('Wedding Videos', weddingVideos)}
                {renderColumn('More', more)}
                {/* {renderColumn('Quick Links', quickLinks)}
                {renderColumn('Social', social)}
                {renderColumn('Upcoming Events', upcomingEvents)} */}

            </Middle>
            <SocialLinks />
            <Copyright>
                <p>© 2019-{new Date().getFullYear()} Love Stories TV, Inc. All Rights Reserved</p>
                <p>
                    Made with <FontAwesomeIcon color={LSTVGlobals.PRIMARY_COLOR} icon={faHeart} size={'xs'} /> in New
                    York City
                </p>
            </Copyright>
        </FooterStyle>
    );
};

export default Footer;
