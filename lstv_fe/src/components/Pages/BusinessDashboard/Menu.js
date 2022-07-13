import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import BaseCTAButton from '/newComponents/buttons/BaseCtaButton';
import theme from '../../../styledComponentsTheme';
import LSTVLink from '../../Utility/LSTVLink';
import { BusinessIcon, PlayIcon, PublishIcon } from '../../Utility/LSTVSVG';
import { useAuthService } from '/rest-api/hooks/useAuthService'
import { isPaidUser, isVideographerUser } from '/utils/LSTVUtils'

const Container = styled.div`
    *, & { box-sizing: border-box; }
    position: sticky;
    top: 140px;
    background: ${theme.white};
    box-shadow: 0px 10px 14px rgba(186, 186, 186, 0.25);
    width: 317px;
    height: 100%;
    padding: 40px 20px 20px;
`;

const Nav = styled.nav`
    margin-top: 30px;
`;

const StyledLink = styled(Link)`
    display: flex;
    padding: 16px 8px;
    margin-bottom: 5px;
    border-radius: 10px;
    text-decoration: none;
    align-items: center;
    color: ${theme.black};
    background: ${(props) => (props.$isActive ? theme.midGrey : theme.white)};

    &:hover {
        background: ${theme.midGrey};
    }
`;

const LinkText = styled.p`
    margin-left: 16px;
    font-family: Calibre;
    font-size: 1.125em;
    font-weight: 500;
`;

const PromotionContainer = styled.div`
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding: 30px 24px;
    margin: 30px 0 0 0;
    background: ${theme.primaryPurple};
    border-radius: 10px;
`;

const PromotionTitle = styled.h5`
    font-family: Calibre;
    font-weight: 600;
    font-size: 1.25em;
    padding: 0;
    color: white;
`;

const PromotionDescription = styled.p`
    font-family: Calibre;
    font-weight: 400;
    font-size: 1.125em;
    color: white;
`;

export const PromotionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 45px;
    background: none;
    border: 2px solid #ffffff;
    border-radius: 90px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    :hover {
        background-color: #9980FD;
        border: 2px solid  #9980FD;
    }
    a {
      color: #fff;
      text-decoration: none;
    }
`;

const UpgradePremiumPromotion = () => {
  return (
    <PromotionContainer>
      <PromotionTitle>
        Love Stories TV Premium
      </PromotionTitle>
      <PromotionDescription>
        Reach more couples and upgrade your business page.
      </PromotionDescription>
      <PromotionButton>
        <a href="mailto:upgrade@lovestoriestv.com">Upgrade</a>
      </PromotionButton>
    </PromotionContainer>
  );
};

const Menu = () => {
  const location = useLocation();
  const { user } = useAuthService()
  const hasVideos = isPaidUser(user) || isVideographerUser(user)

  const links = [{
    to: '/dashboard/info',
    icon: BusinessIcon,
    text: 'Business Information',
    order: 1,
  }]

  if(hasVideos) {
    links.push({
      to: '/dashboard/videos',
      icon: PlayIcon,
      text: 'Videos',
      order: 2,
    })
  }

  return (
    <Container>
      { hasVideos &&
        <LSTVLink noStyle to={`/dashboard/upload-video`}>
          <BaseCTAButton title="Upload New Video" icon={<PublishIcon />} style={{ margin: '0 auto ' }} />
        </LSTVLink>
      }
      <Nav>
        {links
          .sort((a, b) => a.order - b.order)
          .map(({ to, text, icon: Icon }) => (
            <StyledLink to={to} key={to} $isActive={location.pathname === to}>
              <Icon fillColor={location.pathname === to ? theme.primaryPurple : theme.black} />
              <LinkText>{text}</LinkText>
            </StyledLink>
          ))}
      </Nav>
      <UpgradePremiumPromotion />
    </Container>
  );
};

export default Menu;
