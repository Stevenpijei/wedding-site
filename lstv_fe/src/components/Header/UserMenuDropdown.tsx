import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import { generateMenuItems } from './generateMenuItems';
import * as S from './HeaderBar.styles';
import Dropdown from '/components/Dropdown';
import Avatar from '/newComponents/Avatar';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import { useMediaReady } from '/utils/LSTVUtils';

export const UserMenu = () => {
    const { user, signOut } = useAuthService();
    const history = useHistory();
    const [laptop, ready] = useMediaReady(theme.breakpoints.laptop)
    const [menuItems, setMenuItems] = useState([])

    useEffect(() => {
        if(user && ready) {
          // if not at least laptop size exclude dashboard links
          const items = generateMenuItems(user, !laptop)
          setMenuItems(items)
        }
    }, [user, ready])

    const handleMenuClick = useCallback(to => {
        history.push(to);
    }, []);

    const renderProfileMenuItem = ({ title, subTitle, to, imageSrc }) => (
        <S.ProfileMenuItem onClick={() => handleMenuClick(to)} key={title}>
            <Avatar imageSrc={imageSrc} initial={title.slice(0, 1)?.toUpperCase()} />
            <div>
                <p>{title}</p>
                <small>{subTitle}</small>
            </div>
        </S.ProfileMenuItem>
    );

    return (
        <S.DropdownMenu>
            <>
                {menuItems.map(link =>
                    link.type === 'PROFILE' ?
                        renderProfileMenuItem(link) :
                        <S.UserMenuItem onClick={() => handleMenuClick(link.to)} key={link.name}>
                            {link.name}
                        </S.UserMenuItem>
                )}
                <S.NonLinkMenuItem onClick={signOut}>Sign Out</S.NonLinkMenuItem>
            </>
        </S.DropdownMenu>
    )
};

const Button = styled.div`
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
`

const UserMenuDropdown = ({ user }: { user: any /* TSFIXME */}) => {
    const { profileThumbnail, firstName, lastName } = user;
    const name = `${firstName ?? ''} ${lastName ?? ''}`

    const toggle =
        <Button>
            <S.UserName>{name}</S.UserName>
            <Avatar
                size='30px'
                fontSize='15px'
                imageSrc={profileThumbnail}
                initial={firstName?.slice(0, 1)?.toUpperCase()}
            />
        </Button>

    const menu = <UserMenu />

    return (
        <Dropdown
            id='user_menu_dropdown'
            alignEnd
            toggle={toggle}
            menu={menu}
        />
    )
}

export default UserMenuDropdown
