import React from 'react';
import styled from 'styled-components';
import { MobileHeartIcon, MobilePinIcon, MobilePlayIcon } from '../icons';
import * as LSTVGlobals from '../../../../global/globals';

const PromotionTeaser = ({ Image, title, subtitle, className, imageLeftPosition }) => {
    return (
        <PromotionTeaserContainer className={className}>
            <ImageContainer >
                <Image style={{position: 'absolute', height: 200, left: imageLeftPosition}}/>
            </ImageContainer>
            <TeaserTitle>{title}</TeaserTitle>
            <TeaserSubTitle>{subtitle}</TeaserSubTitle>
        </PromotionTeaserContainer>
    );
};

const PromotionTeaserContainer = styled.div`
    margin-bottom: 50px;
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
`;

const TeaserTitle = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 2rem;
    line-height: 124.4%;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
`;

const TeaserSubTitle = styled.p`
    font-family: Calibre;
    font-style: normal;
    font-weight: normal;
    font-size: 1.25rem;
    line-height: 1.5rem;
    padding: 0px 10px;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
`;

const SecondaryMobileLoggedOutHero = ({}) => {
    return (
        <Container>
            <Title>
                Plan the wedding <br />
                you've always wanted
            </Title>
            <PromotionContainer>
                <PromotionTeaser
                    Image={MobilePlayIcon}
                    title="Discover Ideas"
                    subtitle="Browse more than 20,000 real wedding videos"
                    imageLeftPosition={46}
                    />
                <PromotionTeaser
                    Image={MobilePinIcon}
                    title="Find Wedding Professionals"
                    subtitle="50,000+ are waiting to help"
                    imageLeftPosition={-46}
                    />
                <PromotionTeaser
                    Image={MobileHeartIcon}
                    title="Get Inspired"
                    subtitle="Ideas for vows, speeches, dances, fashion, music, decor, and more"
                    imageLeftPosition={25}
                />
            </PromotionContainer>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: 68px;
`;

const PromotionContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
`;

const Title = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 115.7%;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
    margin: 0 10px;
`;

export default SecondaryMobileLoggedOutHero;
