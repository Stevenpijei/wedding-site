import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import { ButtonTopNavTextStyles } from '../../components/typography';
import { PRIMARY_COLOR, PRIMARY_PURPLE, size, TEXT_AND_SVG_BLACK, UserDevice } from '../../global/globals';
import { MenuButton } from '../../newComponents/buttons/BaseMenuButton';
import { L2SeparatorVertical } from '../../utils/LSTVUtils';

const { isMobile, tablet, laptop } = UserDevice

export const HeaderBarContainer = styled.nav`
    display: flex;
    flex-direction: row;
    height: ${theme.headerHeight};
    margin: 0 auto;
    position: relative;
    justify-content: center;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    z-index: 1000;
    background: ${theme.white};
    box-shadow: 0px 1px 6px 1px rgba(210, 210, 210, 0.25);
    transition: background-color 800ms linear;

    @media ${isMobile} {
        transition: background-color 300ms linear;
    }

    @media ${laptop} {
        height: auto;
        flex-direction: column;
        justify-content: flex-start;
    }
`;

export const DesktopHeaderContainer = styled.div`
    width: 100%;
    max-width: ${size.laptopWidthLimit};
    padding: 10px 20px 0;
    // it's crazy that this is required
    box-sizing: border-box;
`

export const TopContainer = styled.div`
    position: relative;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

export const BottomContainer = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    height: 48px;

    @media ${laptop} {
        height: auto;
    }
`;

export const UserMenuHeader = styled.div`
    padding: 16px;
`

export const DesktopLogoLink = styled(Link)`
    display: none;
    
    @media ${laptop} {
        padding-right: 24px;
        max-width: 165px;
        display: flex;
    }
`;

export const Links = styled('nav')`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    margin-right: 130px;
    max-width: 900px;
`;

export const StyledLink = styled(Link)`
    text-decoration: none;
`;

export const StyledButton = styled(MenuButton)`
    height: ${theme.headerHeight};
    color: ${theme.black};
    display: none;

    @media ${laptop} {
        display: flex;
        height: auto;
        // puts the hover purple bar right at the bottom edge of the header container
        padding-bottom: 15px;
        padding-top: 11px;
        border-radius: 0;
    }
`;

export const VerticalBar = styled(L2SeparatorVertical)`
    border-left: 1px solid ${(props) => (props.isScrolling ? theme.black : theme.white)};
    height: 33px;
    display: none;

    @media ${tablet} {
        display: flex;
    }
`;

export const IconContainer = styled.button`
    height: ${(props) => props.height || '100%'};
    width: ${(props) => props.width || '30px'};
    padding: ${(props) => props.padding || '0px'};
    background: transparent;
    color: ${TEXT_AND_SVG_BLACK};
`;

export const Burger = styled(IconContainer)`
    height: 30px;
    margin-left: 4px;
    padding-left: 18px;
    padding-right: 5px;
    width: 50px;

    @media ${tablet} {
        display: none;
    }
`;

export const SearchButton = styled(IconContainer)`
    height: 22px;
    padding: 0px 22px 0px 0px;
    width: 41px;

    @media ${tablet} {
        height: 24px;
    }
    
    @media ${laptop} {
        display: none;
    }
`;

export const SearchBarWrapper = styled.div`
    width: 100%;

    @media ${tablet} {
        width: 282px;
    }
`;

export const SignInButtons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    max-width: 196px;
    // to align with the StyledButton links which use padding instead
    // of flex (because of their hover/selected state) to achieve their position
    padding-bottom: 4px;
`

export const SignInButton = styled.div`
    display: none;
    position: relative;
    cursor: pointer;
    font-size: 18px;
    font-weight: 500;    
    background-color: transparent;
    align-items: center;
    white-space: nowrap;
    color: ${theme.black};
    transition: all 0.2s linear;

    :hover {
        color: ${PRIMARY_PURPLE};
    }

    @media ${laptop} {
        display: flex;
    }
`;

export const SignInMenu = styled.div`
    background-color: white;    
    border-radius: 10px;
    width: 230px;
    box-shadow : 0px 0px 6px rgba(186, 186, 186, 0.25);
`

export const SignInMenuItem = styled.div`
    padding: 18px 25px;
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    border-bottom: ${props => props.noSeparator ? 'none' : `1px solid ${props.theme.midGrey}`};

    :hover {
        color:  ${PRIMARY_PURPLE};
    }
`

export const SignInMenuItemIcon = styled.div`
    width: 25px;
    height: 25px;
    margin-right: 10px;
`

export const UserMenuItem = styled.div`
    border-bottom: 1px solid ${(props) => props.theme.lightGrey};
    font-size: 0.937rem;
    line-height: 21.42px;
    padding: 14px 12px;
    cursor: pointer;
    ${ButtonTopNavTextStyles}

    :hover {
        color: ${PRIMARY_COLOR};
    }
`;

export const NonLinkMenuItem = styled.div`
    border: none;
    font-size: 0.937rem;
    line-height: 21.42px;
    padding: 14px 12px;
    cursor: pointer;
    ${ButtonTopNavTextStyles}
`;

export const ProfileMenuItem = styled(UserMenuItem)`
    display: flex;
    align-items: center;
    padding: 16px 12px;

    div:nth-child(2) {
        margin-left: 10px;
        line-height: 1rem;
        font-size: 0.937rem;
        max-width: 200px;

        & small {
            font-size: 0.8rem;
            line-height: 0.875rem;
            color: #9b9b9b;
        }
    }
`;

export const DropdownMenu = styled.div`
    background: #fff;
    position: relative;
    border-radius: 3px;
    display: flex;
    flex-direction: column;

    @media ${tablet} {
        filter: drop-shadow(0 0 8px rgba(169, 169, 169, 0.25));
        min-width: 232px;
    }
`;

export const UserName = styled.span`
    font-weight: 500;
    font-size: 18px;
    margin-right: 10px;
`

export const UserAvatarImage = styled.img`
    border-radius: 50%;
    width: ${(props) => props.size || '32px'};
    height: ${(props) => props.size || '32px'};
    background-color: ${(props) => props.theme.midGrey};
`;

export const UserInitialImage = styled.div`
    width: ${(props) => props.size || '32px'};
    height: ${(props) => props.size || '32px'};
    border-radius: ${(props) => props.size || '32px'};
    background-color: ${PRIMARY_PURPLE};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    
    p {
        font-size: 1.125rem;
        line-height: 1.125rem;
        font-weight: 600;
    }
`;

export const MobileHeaderContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: ${props => props.showSearch ?  "flex-start" : "center"};
    padding-right: 20px;
    padding-left: ${props => props.showSearch ? '0' : '20px'};
    background: #ffffff;
    box-shadow: 0px 1px 6px 1px rgba(210, 210, 210, 0.25);

    @media ${tablet} {
        justify-content: ${props => props.showSearch ?  "space-between" : "center"};
    }
`;

export const MobileLogoLink = styled(Link)`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: ${(props) => (props.$large ? '175px' : '75px')};
    height: ${theme.headerHeight};
    margin-right: 20px;
`;
