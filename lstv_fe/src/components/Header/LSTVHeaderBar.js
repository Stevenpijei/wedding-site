import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import theme from '../../styledComponentsTheme';

import { useSearch } from '../../newComponents/Search/use-search';
import { useScrollPosition } from '../../global/use-scroll';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useMediaReady } from '../../utils/LSTVUtils';

import * as S from './LSTVHeaderBar.styles';
import { SearchIcon, MobileLogo, MainLogo, UserAvatarIcon } from '../Utility/LSTVSVG';

import Search, { searchSources } from '../../newComponents/Search';
import SearchBar from './SearchBar';
import { UserMenuButton } from './UserMenuButton';

const LSTVHeaderBar = (props) => {
    const position = useScrollPosition();
    const [isDesktop, ready] = useMediaReady(theme.breakpoints.laptop);
    const { shouldRenderSearchPanel } = useSearch();
    const isScrolling = position?.y > 10;

    return ready ? (
        <S.LSTVHeaderBarContainer {...props} isScrolling={isScrolling}>
            {isDesktop ? (
                <DesktopHeader isScrolling={false} hideSearchPanel={!shouldRenderSearchPanel} />
            ) : (
                <MobileHeader isScrolling={isScrolling} hideSearchPanel={!shouldRenderSearchPanel} />
            )}
        </S.LSTVHeaderBarContainer>
    ) : null;
};

const DesktopHeader = ({ isScrolling, hideSearchPanel }) => {
    const { loggedIn, goToLogin } = useAuthService();
    const { currentFocusedField, fields, currentSearchSource, isResultsOpen } = useSearch();
    const user = useSelector((state) => state.user);
    const [hideLinks, setHideLinks] = useState(false);

    useEffect(() => {
        if (
            (currentFocusedField === fields.FREETEXT || currentFocusedField === fields.LOCATION || isResultsOpen) &&
            currentSearchSource === searchSources.header
        ) {
            setHideLinks(true);
            return;
        }

        setHideLinks(false);
    }, [currentFocusedField, isResultsOpen, currentSearchSource]);

    useEffect(() => {
        setHideLinks(false)
    }, [location.pathname])

    return (
        <>
            <S.LeftContainer>
                <S.DesktopLogoLink to="/">
                    {isScrolling ? (
                        <S.FadeIn>
                            <MobileLogo imageHeight="65px" imageWidth="65px" />
                        </S.FadeIn>
                    ) : (
                        <S.FadeIn>
                            <MainLogo />
                        </S.FadeIn>
                    )}
                </S.DesktopLogoLink>

                {!hideLinks ? (
                    <S.LinksLeft>
                        <S.StyledLink to="/wedding-videographers">
                            <S.StyledButton isScrolling={isScrolling}>Videographers</S.StyledButton>
                        </S.StyledLink>
                        <S.StyledLink to="/wedding-venues">
                            <S.StyledButton isScrolling={isScrolling}>Venues</S.StyledButton>
                        </S.StyledLink>
                        <S.StyledLink to="/wedding-vendors">
                            <S.StyledButton isScrolling={isScrolling}>Vendors</S.StyledButton>
                        </S.StyledLink>
                        <S.StyledLink to="/wedding-fashion">
                            <S.StyledButton isScrolling={isScrolling}>Fashion</S.StyledButton>
                        </S.StyledLink>
                    </S.LinksLeft>
                ) : null}
                {!hideSearchPanel ? (
                    <S.SearchBarWrapper fullWidth={hideLinks}>
                        <Search expendable source={searchSources.header} autoFocus={false} />
                    </S.SearchBarWrapper>
                ) : null}
            </S.LeftContainer>

            <S.RightContainer>
                <S.LinksRight>
                    <S.StyledLink to="/wedding-videos">
                        <S.StyledButton isScrolling={isScrolling}>Videos</S.StyledButton>
                    </S.StyledLink>
                    {/*<S.StyledLink to="/wedding-advice">*/}
                    {/*    <S.StyledButton isScrolling={isScrolling}>Advice</S.StyledButton>*/}
                    {/*</S.StyledLink>*/}
                    <S.StyledLink to="/wedding-styles">
                        <S.StyledButton isScrolling={isScrolling}>Styles</S.StyledButton>
                    </S.StyledLink>
                </S.LinksRight>

                {loggedIn ? (
                    <UserMenuButton user={user} />
                ) : (
                    <>
                        <S.SignInIcon onClick={() => goToLogin()}>
                            <UserAvatarIcon fillColor={isScrolling ? theme.black : theme.white} />
                        </S.SignInIcon>
                        <S.SignInButton onClick={() => goToLogin()}>
                            Sign In <UserAvatarIcon imageHeight="24px" imageWidth="24px" fillColor={theme.black} />
                        </S.SignInButton>
                    </>
                )}
            </S.RightContainer>
        </>
    );
};

const MobileHeader = ({ isScrolling, hideSearchPanel }) => {
    const secondary = !hideSearchPanel 

    return (
        <S.MobileHeaderContainer isScrolling={secondary}>
            <S.MobileLogoLink to={'/'} $large={!secondary}>
                {secondary ? <MobileLogo imageHeight="65px" imageWidth="65px" /> : <MainLogo />}
            </S.MobileLogoLink>

            {secondary ? (
                <S.SearchBarWrapper fullWidth>
                    <Search source="header" />
                </S.SearchBarWrapper>
            ) : null}
        </S.MobileHeaderContainer>
    );
};

export default LSTVHeaderBar;
