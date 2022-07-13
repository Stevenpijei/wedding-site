import React from 'react';
import styled from 'styled-components';
import mobileBackgroundImage from '../../../../images/purple_x_background_mobile.png';
import Search from '../../../../newComponents/Search'
import * as LSTVGlobals from '../../../../global/globals';

const MainMobileLoggedInHero = () => {
    return (
        <Container>
            <BackgroundImg src={mobileBackgroundImage} />
            <ContentsContainer>
                <Contents>
                    <Header>Find Your Perfect</Header>
                    <SubHeader>Wedding Team</SubHeader>
                    <SearchContainer>
                        <Search source="homepage" />
                    </SearchContainer>
                </Contents>
            </ContentsContainer>
        </Container>
    );
};

const Container = styled.div`
    height: 190px;
    position: relative;
    margin-top: 14px;
`;

const SearchContainer = styled.div`
     width: 73%;
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    border-radius: 80px;
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
`;

const Contents = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const BackgroundImg = styled.img`
    position: absolute;
    top: 0;
    left: 5%;
    height: 165px;
    width: 90%;
`;

const Header = styled.h4`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 32px;
    line-height: 124.4%;
    color: ${({ theme }) => theme.white};
    margin-top: 25px;
`;

const SubHeader = styled(Header)`
    margin-top: unset;
    margin-bottom: 17px;
`

export default MainMobileLoggedInHero;
