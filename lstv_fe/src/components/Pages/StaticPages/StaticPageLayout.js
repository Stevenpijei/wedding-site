import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from '../HomePage/Footer';
import * as LSTVGlobals from '/global/globals';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 70px;

  * {
    box-sizing: border-box;
  }
`;

const Contents = styled.div`
  width: ${props => props.wide ? '90%' : '60%'};
  padding-bottom: 100px;

  @media ${LSTVGlobals.UserDevice.isMobile} {
    width: 100%;
    padding: 16px 16px 75px 16px;
  }
`;

const StaticPageLayout = ({
                              children,
                              wideContent,
                              headerText,
                              headerSubtitle,
                              headerBackgroundColor,
                              headerImageX,
                              showFooter = true,
                              showHeader = true,
                          }) => {
    return (
        <Container>
            {showHeader && <Header
                text={headerText}
                subtitle={headerSubtitle || ''}
                backgroundColor={headerBackgroundColor}
                imageX={headerImageX} />}
            <Contents wide={wideContent}>
                {children}
            </Contents>
            {showFooter && <Footer />}
        </Container>
    );
};

export default StaticPageLayout;
