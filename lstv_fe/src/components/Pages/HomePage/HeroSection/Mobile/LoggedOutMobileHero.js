import React from 'react';
import styled from 'styled-components';
import MainLoggedOutHero from '../../MainHeroSection/MainLoggedOutHero';
import SecondaryMobileLoggedOutHero from '../../SecondaryHeroSection/SecondaryMobileLoggedOutHero';

const LoggedOutMobileHero = ({}) => {
    return (
        <Container>
            <MainLoggedOutHero />
            <SecondaryMobileLoggedOutHero />
        </Container>
    );
};

const Container = styled.div``;

export default LoggedOutMobileHero;
