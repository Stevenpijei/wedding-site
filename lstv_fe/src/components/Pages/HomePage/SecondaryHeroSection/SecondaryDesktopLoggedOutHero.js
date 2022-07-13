import React from 'react';
import styled from 'styled-components';
import { BubbleIcon, HeartIcon, PinIcon, PlayIcon, XIcon } from '../icons';
import * as LSTVGlobals from '../../../../global/globals';

const PromotionTeaser = ({ Image, title, subtitle, className, imageLeftTilt, imageRightTilt, imageTopTilt, href }) => {
    return (
        
        <PromotionTeaserContainer className={className} href={href}>
            <ImageContainer>
                <Image style={{ height: 200, position: 'absolute', right: imageRightTilt, left: imageLeftTilt, top: imageTopTilt }} />
            </ImageContainer>
            <TeaserTitle>{title}</TeaserTitle>
            <TeaserSubTitle>{subtitle}</TeaserSubTitle>
        </PromotionTeaserContainer>
    );
};

const PromotionTeaserContainer = styled.a`
    text-decoration: none;
    width: 200px;
`;

const ImageContainer = styled.div`
    height: 200px;
    position: relative;
`;

const TeaserTitle = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 32px;
    line-height: 124.4%;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
`;

const TeaserSubTitle = styled.h1`
    font-family: Calibre;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 24px;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
`;

const SecondaryDesktopLoggedOutHero = ({}) => {
    return (
        <Container>
            <Title>
                Plan the wedding <br />
                you've always wanted
            </Title>
            <Contents>
                <PositionedBubbleIcon />
                <PromotionContainer>
                    <PromotionTeaser
                        Image={PlayIcon}
                        title="Discover Ideas"
                        subtitle="Browse more than 20,000 real wedding videos"
                        imageLeftTilt={40}
                        imageTopTilt={-20}
                        href="/wedding-videos"
                    />
                    <PromotionTeaser
                        Image={PinIcon}
                        title="Find Wedding Professionals"
                        subtitle="50,000+ are waiting to help"
                        imageRightTilt={50}
                        href="/wedding-vendors"
                    />
                    <PromotionTeaser
                        Image={HeartIcon}
                        title="Get Inspired"
                        subtitle="Ideas for vows, speeches, dances, fashion, music, decor, and more"
                        imageRightTilt={50}
                        href='/wedding-advice'
                    />
                </PromotionContainer>
                <PositionedXIcon />
            </Contents>
        </Container>
    );
};

const PositionedBubbleIcon = styled(BubbleIcon)`
    position: absolute;
    left: 0;
    width: 300px;
    transform: translateX(-50%);
    top: -100px;

    @media ${LSTVGlobals.UserDevice.isWithinTablet} {
        display: none;
    }
`;

const PositionedXIcon = styled(XIcon)`
    position: absolute;
    right: 0;
    width: 300px;
    transform: translateX(50%);
    top: -100px;

    @media ${LSTVGlobals.UserDevice.isWithinTablet} {
        display: none;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: 68px;
`;

const PromotionContainer = styled.div`
    display: flex;
    flex: 1;
    justify-content: space-evenly;
`;

const Contents = styled.div`
    display: flex;
    position: relative;
    justify-content: center;
`;

const Title = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 56px;
    line-height: 118.4%;
    color: ${LSTVGlobals.DARK_NIGHT_BLACK};
    text-align: center;
`;

export default SecondaryDesktopLoggedOutHero;
