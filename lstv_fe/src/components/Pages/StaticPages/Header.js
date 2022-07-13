import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '/global/globals';
import theme from '../../../styledComponentsTheme'
import imageXMobile from '/images/HeroBanner_X_Mobile.svg'
import imageXDesktop from '/images/HeroBanner_X_Desktop.svg'
import imageOMobile from '/images/HeroBanner_O_Mobile.svg'
import imageODesktop from '/images/HeroBanner_O_Desktop.svg'

const Header = ({ text, subtitle, backgroundColor, imageX }) => {
  return (
    <Container {...{ backgroundColor, imageX }}>
      <Text>{text}</Text>
      <Subtext>{subtitle}</Subtext>
    </Container>
  )
}

const Container = styled.div`
    background-color: ${(props) => props.backgroundColor || theme.business_role_family_color.default_purple};
    background-image: url(${(props) => (props.imageX ? imageXMobile : imageOMobile)});
    background-position: right;
    background-size: auto 100%;
    background-repeat: no-repeat;
    min-height: 142px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px 10px;
    text-align: center;

    @media ${LSTVGlobals.UserDevice.tablet} {
        background-image: url(${(props) => (props.imageX ? imageXDesktop : imageODesktop)});
        border-radius: 10px;
        height: 268px;
        margin: 20px 0 30px;
        // will be revisited when we do layouts properly
        width: 90%;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        width: auto;
        margin-left: 20px;
        margin-right: 20px;
        align-self: stretch;
    }
`;

const Text = styled.h1`
    font-size: 32px;
    line-height: 1.12;
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    padding-bottom: 0; 

    @media ${LSTVGlobals.UserDevice.tablet} {
        font-size: 56px;
    }
`;

const Subtext = styled.h2`
    font-family: Calibre;
    font-style: normal;
    font-weight: 600;
    font-size: 1.375em;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    text-align: center;
    max-width: 535px;
    margin-top: 5px;

    @media ${LSTVGlobals.UserDevice.tablet} {
        margin-top: 16px;
    }
`;

export default Header;
