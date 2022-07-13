import React from 'react';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../../global/globals';
import desktopBackgroundImage from '../../../../images/hero_background_desktop.png';
import mobileBackgroundImage from '../../../../images/hero_background_mobile.png';
import Search from '../../../../newComponents/Search';
import { JoinLink } from './JoinLink';

const MainLoggedOutHero = () => {
    return (
        <Container backgroundImage={isMobile ? mobileBackgroundImage : desktopBackgroundImage}>
            <GradientCover>
                <Contents>
                    <Header>Find Your Perfect Wedding Team</Header>
                    <SubHeaderWithMargins>Watch Weddings. Book Pros. Find Fashion.</SubHeaderWithMargins>
                    <SearchContainer>
                        <Search source="homepage" />
                    </SearchContainer>
                    <JoinLink />
                </Contents>
            </GradientCover>
        </Container>
    );
};

const SearchContainer = styled.div`
    margin-bottom: 35px;
    width: 740px;
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    border-radius: 80px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        width: 304px;
    }

    @media ${LSTVGlobals.UserDevice.isTablet} {
        width: 400px;
    }
`;

const Container = styled.div`
    background-image: ${({ backgroundImage }) => `url(${backgroundImage})`};
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 10px;
    overflow: visible;

    @media ${LSTVGlobals.UserDevice.tablet} {
        margin: 33px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        margin: 19px;
    }
`;

const GradientCover = styled.div`
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) -44.29%, rgba(0, 0, 0, 0.56) 3.57%, rgba(0, 0, 0, 0.75) 44.19%, rgba(0, 0, 0, 0.75) 56.98%);
`;

const Contents = styled.div`
    /* position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0; */
    height: 664px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        height: 580px;
    }

    @media ${LSTVGlobals.UserDevice.isMobileS} {
        height: 480px;
    }
`;

const Header = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 56px;
    line-height: 118.4%;
    text-align: center;
    color: ${({ theme }) => theme.white};

    @media ${LSTVGlobals.UserDevice.isMobile} {
        width: 80%;
        font-size: 40px;
        line-height: 115.7%;
    }
`;

const SubHeader = styled.h5`
    font-family: Calibre;
    font-style: normal;
    font-weight: 600;
    font-size: 21px;
    line-height: 25px;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${({ theme }) => theme.white};

    @media ${LSTVGlobals.UserDevice.isMobile} {
    }
`;

const SubHeaderWithMargins = styled(SubHeader)`
    margin: 6px 0 19px 0;
    @media ${LSTVGlobals.UserDevice.isMobile} {
        margin: 0 14px 14px 14px;
    }
`;

export default MainLoggedOutHero;
