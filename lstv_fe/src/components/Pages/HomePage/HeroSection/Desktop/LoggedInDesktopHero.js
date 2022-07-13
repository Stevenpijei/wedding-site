import React from 'react';
import styled from 'styled-components';
import MainDesktopLoggedInHero from '../../MainHeroSection/MainDesktopLoggedInHero';
import SecondaryDesktopLoggedInHero from '../../SecondaryHeroSection/SecondaryDesktopLoggedInHero';

const LoggedInDesktopHero = ({}) => {
    return (
        <Container>
            <StyledMainDesktopLoggedInHero />
            <SecondaryDesktopLoggedInHero />
        </Container>
    );
};

const StyledMainDesktopLoggedInHero = styled(MainDesktopLoggedInHero)`
    flex-grow: 1;
`;

const Container = styled.div`
    display: flex;
    height: 560px;
    margin: 40px 58px 55px 60px;
`;

export default LoggedInDesktopHero;
