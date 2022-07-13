import React from 'react';
import styled from 'styled-components';
import BaseCTAButton from '/newComponents/buttons/BaseCtaButton';
import theme from '../../../../styledComponentsTheme';

type ImageProps = {
    src: string
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: 300px;
  margin-bottom: 30px;

  @media ${theme.breakpoints.isMobileOrTablet} {
    flex-direction: column;
    width: unset;
    height: unset;
    justify-content: unset;
  }



`;

const WFaHeaderText = styled.div`
  flex: 0 0 577px;
  width: 100%;
  padding: 20px 10px 20px 20px;

  @media ${theme.breakpoints.isMobileOrTablet} {
    order: 1;
    flex: 1;
    width: unset;
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media ${theme.breakpoints.isTablet} {
    flex: 0 0 350px;
  }
`;

const WFATitle = styled.div`

  h1 {
    font-size: 45px;
    line-height: 50.4px;

    @media ${theme.breakpoints.isMobileOrTablet} {
      font-size: 32px;
      line-height: 39.81px;
      text-align: center;
    }

    margin-bottom: 20px;


`;

const WFAParagraph = styled.div`
  padding-bottom: 22px;
  font-size: 20px;

  & p {
    font-family: Calibre;
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 15px;

    @media ${theme.breakpoints.isMobileOrTablet} {
      text-align: center;
    }
  }
`;

const WFAHeaderLogo = styled.div`
  flex: 0 0 430px;
  width: 100%;
  background-image: url('/images/2021-wfa/WeddingAward.svg') !important;
  background-repeat: no-repeat;
  background-size: 100% 100%;

  @media ${theme.breakpoints.isMobileOrTablet} {
    margin-top: 20px;
    flex: 0 0 180px;
    background-size: 100% 100%;
    background-position: center center;
    order: 0;
    margin-bottom: 10px;
  }

  @media ${theme.breakpoints.isTablet} {
    margin-top: 20px;
    flex: 0 0 280px;
    background-size: 100% 100%;
    background-position: center center;
    order: 0;
    margin-bottom: 10px;
  }

`;

export const SaveButtonStyle = {
    width: 152,
    height: 45,
};

const WFAHeader = () =>
    <Container>
        <WFaHeaderText>
            <WFATitle>
                <h1>2021 Wedding Film<br />Awards Winners</h1>
            </WFATitle>
            <WFAParagraph>
                <p>The Love Stories TV Wedding Film Awards is an annual competition that recognizes the most talented
                    wedding filmmakers from across the globe. The winning films were chosen either by a panel-vote from
                    our elite filmmaker judges, filmmaker vote or the Love Stories TV community to represent the most
                    impressive, creative, exceptional work being done by wedding videographers all over the world.</p>
                <p>Soonlyweds: Looking to hire an award-winning filmmaker for your upcoming wedding? Contact these
                    videographers directly below.</p>
                <p>Filmmakers: Start uploading your films to lovestoriestv.com now for the 2022 awards. Submissions will
                    open in January 2022.</p>
            </WFAParagraph>
            <BaseCTAButton  title={'Learn More Here'} size={'large'}
                           onClick={() => window.open('https://www.weddingfilmawards.com/', '_blank')}
                           hideIcon />
        </WFaHeaderText>
        <WFAHeaderLogo />
    </Container>;

export default WFAHeader;