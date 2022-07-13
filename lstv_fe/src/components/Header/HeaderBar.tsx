import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import theme from '../../styledComponentsTheme';
import * as S from './HeaderBar.styles';
import SignUpDropdown from './SignUpDropdown';
import UserMenuDropdown from './UserMenuDropdown';
import Badge from '../Badge';
import { MainLogo, MobileLogo } from '../../components/Utility/LSTVSVG';
import { searchSources } from '../../newComponents/Search';
import SimpleSearch from '../../newComponents/Search/SimpleSearch';
import { useSearch } from '../../newComponents/Search/use-search';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useMediaReady } from '../../utils/LSTVUtils';
import { IStore } from '../../store/store';

const HeaderBar = () => {
    const [isDesktop, ready] = useMediaReady(theme.breakpoints.laptop);
    const { shouldRenderSearchPanel } = useSearch();

    return ready ? (
        <S.HeaderBarContainer>
            {isDesktop ?
                <DesktopHeader hideSearchPanel={!shouldRenderSearchPanel} /> :
                <MobileHeader hideSearchPanel={!shouldRenderSearchPanel} />
            }
        </S.HeaderBarContainer>
    ) : null;
};

type HeaderProps = { hideSearchPanel?: boolean }

const links = [{
    label: 'Videographers',
    to: '/wedding-videographers'
}, {
    label: 'Venues',
    to: '/wedding-venues'
}, {
    label: 'Vendors',
    to: '/wedding-vendors'
}, {
    label: 'Fashion',
    to: '/wedding-fashion'
}, {
    label: 'Videos',
    to: '/wedding-videos'
},
// {
//     label: 'Advice',
//     to: '/wedding-advice'
// },
{
    label: 'Styles',
    to: '/wedding-styles'
}]

const DesktopHeader = ({ hideSearchPanel }: HeaderProps) => {
    const location = useLocation()
    const { loggedIn, goToLogin } = useAuthService()
    const user = useSelector((state: IStore) => state.user)

    return (
        <S.DesktopHeaderContainer>
            <S.TopContainer>
                <S.DesktopLogoLink to="/">
                    <MainLogo />
                </S.DesktopLogoLink>
                {!hideSearchPanel &&
                    <S.SearchBarWrapper>
                        <SimpleSearch source={searchSources.header} />
                    </S.SearchBarWrapper>
                }
            </S.TopContainer>

            <S.BottomContainer>
                <S.Links>
                    {links.map((link, index) =>
                        <S.StyledLink to={link.to} key={index}>
                            <S.StyledButton selected={location.pathname === link.to}>
                                { link.label }
                            </S.StyledButton>
                        </S.StyledLink>
                    )}
                </S.Links>
                {loggedIn ?
                    <UserMenuDropdown user={user} /> :
                    <S.SignInButtons>
                        <S.SignInButton onClick={goToLogin}>
                            Sign In <Badge id='avatar' style={{ marginLeft: 10 }} />
                        </S.SignInButton>
                        <SignUpDropdown />
                    </S.SignInButtons>
                }
            </S.BottomContainer>
        </S.DesktopHeaderContainer>
    );
};

const MobileHeader = ({ hideSearchPanel }: HeaderProps) => {
    // AK: confusing var name ... change this once we understand what's happening
    const secondary = !hideSearchPanel

    return (
        <S.MobileHeaderContainer showSearch={secondary}>
            <S.MobileLogoLink to={'/'} $large={!secondary}>
                { secondary ? <MobileLogo /> : <MainLogo /> }
            </S.MobileLogoLink>

            { secondary &&
                <S.SearchBarWrapper>
                    <SimpleSearch source={searchSources.header} />
                </S.SearchBarWrapper>
            }
        </S.MobileHeaderContainer>
    );
};

export default HeaderBar
