import React from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { FooterImage } from './icons';

const Footer = ({}) => {
    return isMobile ? (
        <MobileContainer>
            <Title>Watch, Get <br/>Inspired, Book.</Title>
            <PositionedFooterImage />
        </MobileContainer>
    ) : (
        <DesktopContainer>
            <Title>Watch, Get Inspired, Book.</Title>
            <FooterImage style={{ width: 220 }} />
        </DesktopContainer>
    );
};

const PositionedFooterImage = styled(FooterImage)`
    position: absolute;
    right: -35px;
    width: 220px;
    height: 190px;
    top: 18px;
`;

const MobileContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    height: 280px;
    text-align: center;
    align-self: stretch;

`;

const DesktopContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 74px;
`;

const Title = styled.h3`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 115.7%;
`;

export default Footer;
