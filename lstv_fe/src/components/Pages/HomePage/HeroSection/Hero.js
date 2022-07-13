import React from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { useAuthService } from '../../../../rest-api/hooks/useAuthService';
import LoggedInDesktopHero from './Desktop/LoggedInDesktopHero';
import LoggedInTabletHero from './Desktop/LoggedInTabletHero';
import LoggedOutDesktopHero from './Desktop/LoggedOutDesktopHero';
import LoggedInMobileHero from './Mobile/LoggedInMobileHero';
import LoggedOutMobileHero from './Mobile/LoggedOutMobileHero';

const Hero = ({}) => {
    const { loggedIn } = useAuthService()

    return loggedIn && isTablet ? (
        <LoggedInTabletHero />
    ) :loggedIn && !isMobile ? (
        <LoggedInDesktopHero />
    ) : !loggedIn && !isMobile ? (
        <LoggedOutDesktopHero />
    ) : loggedIn && isMobile ? (
        <LoggedInMobileHero />
    ) : (
        <LoggedOutMobileHero />
    )
};

export default Hero;
