import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as LSTVGlobals from '../../global/globals';

const Container = styled('div')`
  font-family: Calibre;
  margin-bottom: 8px;
  margin-left: 10px;
  a {
    text-decoration: none;
  }
`;

const SideBarMenuItem = styled('div')`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 20px;
`;
const LinkDiv = styled('div')`
  margin: 0 0 0 5px;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    padding-left: 10px;
  }
`
const LinkName = styled('p')`
  font-family: Calibre;
  font-style: normal;
  font-size: 15px;
  line-height: 18px;
  font-weight: 500;
  margin: 0 0 0 5px;
`;
const LinkCount = styled(LinkName)`
  font-weight: 300;
  margin: 0 0 0 5px;
`
const LinkImage = styled('img')`
  height: 35px;
  width: 35px;
  border-radius: 17.5px;
`;
const SpacerDiv = styled('div')`
  margin-top: 30px;
`
const DiscoverSideBarContents = ({contents}) => {
    const links = contents.map((content, index) => (
        <Container key={index}>
          <Link to='/nowhere'>
            <SideBarMenuItem key={index}>
                <LinkImage src={content.thumbnail} />
                <LinkDiv>
                  <LinkName>{content.name}</LinkName>
                  <LinkCount>{content.count}</LinkCount>
                </LinkDiv>
              
            </SideBarMenuItem>
          </Link>
        </Container>
    ));
    return (
      <SpacerDiv>
        {links}
      </SpacerDiv>
    )
};

export default DiscoverSideBarContents;
