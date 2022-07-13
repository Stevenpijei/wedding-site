import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserMenu } from '/components/Header/UserMenuDropdown';
import {    
    AvatarIcon,
    FashionIcon,
    StylesIcon,
    VendorsIcon,
    VideosIcon
} from '/components/Utility/LSTVSVG';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import theme from '../../styledComponentsTheme';
import Modal from '../Modal';

const enterAnimation = (props) => keyframes`
    0% { bottom: -${props.headerHeight}; }
    90% {bottom: 5px }
    100% {bottom: 0px }
`;

const Container = styled.div`
    position: fixed;
    bottom: 0px;
    box-shadow: 0px -3px 4px rgba(178, 178, 178, 0.25);
    width: 100%;
    z-index: ${theme.zIndex.mobileFooter};
    transition: height 0.6s ease-out;
    animation-name: ${enterAnimation};
    animation-duration: 0.6s;
    animation-timing-function: ease-out;
    overflow-y: hidden;
    background-color: ${theme.white};

    @media ${theme.breakpoints.laptop} {
        display: none;
    }
`;

const Content = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 20px;
    max-width: 500px;
    padding: 16px;
    margin: 0 auto;
`;

const LinkContainer = styled(Link)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
`;

const LinkIcon = styled.div`
    svg {
        transform: ${(props) => (props.isActive ? 'scale(1.2)' : 'none')};
    }
`;

const LinkText = styled.p`
    color: ${(props) => (props.isActive ? theme.black : theme.darkGrey)};
    font-family: 'Calibre', sans-serif;
    font-weight: 600;
`;

const MobileFooter = () => {
    return (
        <Container>
            <Content>
                <MobileFooterLink to="/wedding-vendors" title="Vendors" Icon={VendorsIcon} />
                <MobileFooterLink to="/wedding-videos" title="Videos" Icon={VideosIcon} />
                <MobileFooterLink to="/wedding-fashion" title="Fashion" Icon={FashionIcon} />
                <MobileFooterLink to="/wedding-styles" title="Styles" Icon={StylesIcon} />
                <UserButton />
            </Content>
        </Container>
    );
};

const UserButton = () => {
    const { loggedIn, user } = useAuthService();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [shouldTriggerAnimation, setShouldTriggerAnimation] = useState(false);

    const closeProfile = () => setIsProfileOpen(false);

    const openProfile = () => {
        if (!isProfileOpen) {
            setIsProfileOpen(true);
        } else {
            setShouldTriggerAnimation(true);
            setTimeout(() => {
                setShouldTriggerAnimation(false);
                setIsProfileOpen(!isProfileOpen);
                // If you change timing, you have to update the animation timing as well
            }, 270);
        }
    };

    return loggedIn ? (
        <>
            <ButtonContainer role="button" onClick={openProfile}>
                <LinkIcon isActive={isProfileOpen}>
                    <AvatarIcon fillColor={isProfileOpen ? theme.primaryPurple : theme.darkGrey} />
                </LinkIcon>
                <LinkText isActive={isProfileOpen}>Profile</LinkText>
            </ButtonContainer>
            <Modal open={isProfileOpen} onClose={closeProfile} showCloseButton customStyles={customModalStyles}>
                <UserMenu
                    user={user}
                    onItemClick={closeProfile}
                    animation={shouldTriggerAnimation}
                    isOpen={isProfileOpen}
                />
            </Modal>
        </>
    ) : (
        <MobileFooterLink
            to={loggedIn ? '/profile' : '/sign-in'}
            title={loggedIn ? 'Profile' : 'Log In'}
            Icon={AvatarIcon}
        />
    );
};

const MobileFooterLink = ({ to, title, Icon }) => {
    const { pathname } = useLocation();
    const isActive = pathname === to;

    return (
        <LinkContainer to={to}>
            <LinkIcon isActive={isActive}>
                <Icon fillColor={isActive ? theme.primaryPurple : theme.darkGrey} />
            </LinkIcon>
            <LinkText isActive={isActive}>{title}</LinkText>
        </LinkContainer>
    );
};
const customModalStyles = {
    content: { paddingTop: 100 },
};

export default MobileFooter;
