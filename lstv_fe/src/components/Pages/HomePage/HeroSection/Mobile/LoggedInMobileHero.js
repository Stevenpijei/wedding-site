import React from 'react';
import styled from 'styled-components';
import MainMobileLoggedInHero from '../../MainHeroSection/MainMobileLoggedInHero';
import SecondaryMobileLoggedInHero from '../../SecondaryHeroSection/SecondaryMobileLoggedInHero';

const LoggedInMobileHero = ({}) => {
    return (
        <Container>
            <MainMobileLoggedInHero />
            <StyledSecondaryMobileLoggedInHero hideScrollController/>
        </Container>
    );
};

const StyledSecondaryMobileLoggedInHero = styled(SecondaryMobileLoggedInHero)`
    width: 90%;
    margin: 5%;
    width: unset;
`;

const Container = styled.div``;

export default LoggedInMobileHero;
