import React from 'react';
import styled from 'styled-components';
import winners from './content';
import WFAWinner from '/components/Pages/StaticPages/WFAWinners/WFAWinner';
import WFAHeader from '/components/Pages/StaticPages/WFAWinners/WFAHeader';
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink';
import theme from '../../../../styledComponentsTheme';

const WFAWinnersGrid = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto;
`;

const WFAContainer = styled.div`
  width: 100%;
  max-width: 1288px;
  margin: 80px auto;

  @media ${theme.breakpoints.isMobileOrTablet} {
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

 
`;

const  SeeAllButton = styled(OutlinedCTAButton)`
  width: 70%;
  margin: auto;
  max-width: 250px;
  color: black;
`;
const PageCTA = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const Sponsor = styled.div`
  position: relative;
  margin: 40px 5px 5px 5px;
  border-top: 1px solid #EBEBEB;
  padding-top: 20px;
  text-align: center;
  
  p {
    font-family: 'Heldane Display';
    font-weight: 900;
    font-size: 32px !important;
    line-height: 32px;
    text-align: left;
  }
  
  
`;


const SponsorImage = styled.div`
  margin: 20px auto;
  width: 309px;
  height: 126px;
  background-image: url('/images/2021-wfa/prim1.rgb.black.png') !important;
  background-repeat: no-repeat;
  background-size: 100% 100%;

  @media ${theme.breakpoints.isMobileOrTablet} {
    width: 100%;
    margin: 30px 0 0 0;
    background-size: 70% 80%;
    background-position: center;

  @media ${theme.breakpoints.isTablet} {
    background-size: 40% 80%;
  }
`;

const WFAWinners = () => {
    return (
        <WFAContainer>
            <WFAHeader />
            <WFAWinnersGrid>
                {winners.map((winner, index) => <WFAWinner
                    key={index}
                    even={index % 2 == 1}
                    winner={winner} />)}
            </WFAWinnersGrid>
            <PageCTA>
                <SeeAllButton onClick={() => window.open('https://www.weddingfilmawards.com/', '_blank')}>Learn More About WFA</SeeAllButton>
            </PageCTA>
            <Sponsor>
                <p>Our Sponsor</p>
                <a href={"https://archaiuscreative.com/"} target={"_blank"}><SponsorImage/></a>
            </Sponsor>
        </WFAContainer>
    );
};

export default WFAWinners;
