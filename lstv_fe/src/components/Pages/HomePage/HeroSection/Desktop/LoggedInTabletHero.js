import React from 'react';
import styled from 'styled-components';
import SecondaryDesktopLoggedInHero from '../../SecondaryHeroSection/SecondaryDesktopLoggedInHero';
import MainMobileLoggedInHero from '../../MainHeroSection/MainMobileLoggedInHero';

const LoggedInTabletHero = ({}) => {
    return (
        <Container>
            <MainMobileLoggedInHero />
            <StyledSecondaryDesktopLoggedInHero />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledSecondaryDesktopLoggedInHero = styled(SecondaryDesktopLoggedInHero)`
  width: unset;
  margin: 0 51px;
`

export default LoggedInTabletHero;
