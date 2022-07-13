import React from 'react';
import styled from 'styled-components';
import { WinnerData } from '/components/Pages/StaticPages/WFAWinners/content';
import { VerticalSpacer } from '../../../../utils/LSTVUtils';
import theme from '../../../../styledComponentsTheme';
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink';

type ContainerProps = {
    even: boolean;
}

type WinnerProps = {
    winner: WinnerData,
    even: boolean;
}

type WinnerDetailAwardIconProps = {
    icon: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 0;
  oveflow: hidden;

  @media ${theme.breakpoints.isMobileOrTablet} {
    flex-direction: column;
    margin: 0 5px 0 5px;
  }
`;

const WinnerVideo = styled.div<WinnerProps>`
  position: relative;
  border-radius: ${props => props.even ? '10px 0 0 10px' : '0px 10px 10px 0px'};
  order: ${props => props.even ? 0 : 1};
  flex: 0 0 776px;
  height: 436px;
  background-image: url(${props => '/images/2021-wfa/desktop/' + props.winner.thumbnail_url});

  background-repeat: no-repeat;
  background-size: 100% 100%;

  @media ${theme.breakpoints.isMobileOrTablet} {
    flex: 1 0 189px;
    order: 0;
    width: 100%;
    border-radius: 10px 10px 0 0;
  }
  @media ${theme.breakpoints.isTablet} {
    flex: 0 0 426px;
  }

  @media ${theme.breakpoints.isMobile} {
    background-image: url(${props => '/images/2021-wfa/mobile/' + props.winner.thumbnail_url});
  }


`;

const WinnerDetails = styled.div<WinnerProps>`
  background: ${props => props.winner.details_bg_color};
  border-radius: ${props => props.even ? '0 10px 10px 0' : '10px 0 0 10px'};
  order: ${props => props.even ? 1 : 0};
  flex: 1;
  display: flex;
  align-items: center;

  @media ${theme.breakpoints.isMobileOrTablet} {
    order: 1;
    flex: 1 0 346px;
    order: 0;
    width: 100%;
    text-align: center;
    border-radius: 0 0 10px 10px;
  }

  @media ${theme.breakpoints.isTablet} {
    flex: 0 0 250px;
    text-align: left;
  }


`;

const WinnerDetailObjects = styled.div`
  margin: 25px;
  position: relative;

  @media ${theme.breakpoints.isMobileOrTablet} {
    width: 100%;
  }
`;

const WinnerDetailAwardIcon = styled.div<WinnerDetailAwardIconProps>`
  width: 108px;
  height: 108px;
  background-image: url(${props => props.icon});
  background-size: 100% 100%;

  @media ${theme.breakpoints.isMobile} {
    width: 100%;
    background-position: center center;
  }

  @media ${theme.breakpoints.isTablet} {
    position: absolute;
    right: 0;
    top: 0;
  }

`;

const PlayButton = styled.div<WinnerDetailAwardIconProps>`
  position: absolute;
  height: 100%;
  width: 100%;
  background-image: url('/images/2021-wfa/play-button.svg');
  background-repeat: no-repeat;
  background-size: 15% 15%;
  background-position: center center;

  @media ${theme.breakpoints.isMobileOrTablet} {
    background-size: 25% 25%;
  }

  @media ${theme.breakpoints.isTablet} {
    background-size: 20% 20%;
  }


`;

const WinnerDetailAwardName = styled.div`
  font-family: Calibre;
  font-weight: 600;
  font-size: 29px;
  margin: 15px 0 25px 0;
  color: white;

  @media ${theme.breakpoints.isMobileOrTablet} {
    font-size: 25px !important;
    line-height: 29.3px;
  }

`;

const WinnerDetailTitle = styled.h2`
  font-family: 'Heldane Display';
  font-weight: 900;
  font-size: 45px !important;
  line-height: 50.4px;
  color: white;

  @media ${theme.breakpoints.isMobileOrTablet} {
    font-size: 40px !important;
    line-height: 46.28px;
  }

  @media ${theme.breakpoints.isTablet} {
    width: 80%;
  }


`;

const WinnerDetailCTA = styled.div`
  margin-top: 30px;
`;

const SeeAllButton = styled(OutlinedCTAButton)`
  width: 70%;
  margin: auto;
  max-width: 250px;
  color: white;
`;

const WFAWinner = ({ winner, even }: { winner: WinnerData, even: boolean }) =>
    <>
        <Container>
            <WinnerVideo winner={winner} even={even}>
                <a href={`https://lovestoriestv.com${winner.video_url}`} target={'_blank'}><PlayButton
                    icon={winner.award_svg_url} /></a>
            </WinnerVideo>
            <WinnerDetails winner={winner} even={even}>
                <WinnerDetailObjects>
                    <WinnerDetailAwardIcon icon={winner.award_svg_url} />
                    <WinnerDetailAwardName>{winner.title}</WinnerDetailAwardName>
                    <WinnerDetailTitle>{winner.video_title || winner.business_name}</WinnerDetailTitle>
                    <WinnerDetailCTA>
                        <SeeAllButton
                            onClick={() => window.open(`https://lovestoriestv.com${winner.business_url}`, '_blank')}>Contact
                            Filmmaker</SeeAllButton>
                    </WinnerDetailCTA>
                </WinnerDetailObjects>
            </WinnerDetails>
        </Container>
        <VerticalSpacer space={30} />
    </>;

export default WFAWinner;
