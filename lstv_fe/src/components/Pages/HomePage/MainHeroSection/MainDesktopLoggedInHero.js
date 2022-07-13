import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../../global/globals';
import desktopBackgroundImage from '../../../../images/purple_x_background.png';
import Search from '../../../../newComponents/Search'

const MainDesktopLoggedInHero = ({ className }) => {
    return (
        <Container className={className}>
            <BackgroundImg src={desktopBackgroundImage} />
            <ContentsContainer>
                <Contents>
                    <Header>Let's find your perfect Wedding Team</Header>
                    <SubHeaderWithMargins>
                        Search over 50,000+ local professionals and watch <br />
                        real wedding videos that feature their work.
                    </SubHeaderWithMargins>
                    <SearchContainer>
                        <Search source="homepage" />
                    </SearchContainer>
                </Contents>
            </ContentsContainer>
        </Container>
    );
};

const Container = styled.div`
    position: relative;
`;


const SearchContainer = styled.div`
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    border-radius: 80px;
    width: 100%;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        width: 180px;
    }
`;

const ContentsContainer = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Contents = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 80%;
`;

const BackgroundImg = styled.img`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
`;

const Header = styled.h1`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 56px;
    line-height: 118.4%;
    color: ${({ theme }) => theme.white};

    @media ${LSTVGlobals.UserDevice.isMobile} {
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

export default MainDesktopLoggedInHero;
