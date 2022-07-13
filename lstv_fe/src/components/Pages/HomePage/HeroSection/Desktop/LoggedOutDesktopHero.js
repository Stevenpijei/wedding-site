import React from 'react';
import styled from 'styled-components';
import MainLoggedOutHero from '../../MainHeroSection/MainLoggedOutHero';
import SecondaryDesktopLoggedOutHero from '../../SecondaryHeroSection/SecondaryDesktopLoggedOutHero';

const LoggedOutDesktopHero = ({}) => {
    return (
        <Container>
            <MainLoggedOutHero />
            <SecondaryDesktopLoggedOutHero />
        </Container>
    );
};

const Container = styled.div`
`;

export default LoggedOutDesktopHero;
