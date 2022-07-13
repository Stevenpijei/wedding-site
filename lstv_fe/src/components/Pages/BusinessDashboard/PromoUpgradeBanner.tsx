import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink'
import BirdsArtwork from '/images/birds_artwork.svg'

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.lightGrey};
  padding: 30px;
  overflow: hidden;
  position: relative;
  height: 316px;
`

const ImageContainer = styled.div`
  position: absolute;
  right: 0;
  top: -40px;
  bottom: 0;
  width: 470px;
`

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
`

type Props = { style?: CSSProperties }

const PromoUpgradeBanner = ({ style }: Props) => {
  const onUpgradeClick = () => {
    window.open('mailto:upgrade@lovestoriestv.com', '_blank');
  }

  return (
    <Container style={style}>
      <div style={{ maxWidth: 300 }}>
        <Title>Promo Videos</Title>
        <p style={{ fontSize: 18, margin: '8px 0 12px' }}>
          Upgrade now to showcase a promotional or compilation video
          that features your work on your business page
        </p>
        <OutlinedCTAButton onClick={onUpgradeClick}>Upgrade</OutlinedCTAButton>
      </div>
      <ImageContainer>
        <img src={BirdsArtwork} style={{ width: '100%' }} />
      </ImageContainer>      
    </Container>
  )
}

export default PromoUpgradeBanner