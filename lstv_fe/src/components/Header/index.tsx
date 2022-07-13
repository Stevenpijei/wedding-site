/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { isMobileOnly } from 'react-device-detect';
import Sticky from 'react-sticky-el';
import styled from 'styled-components';
import HeaderBar from './HeaderBar';
import GoogleAd from '../../components/Pages/PageSupport/GoogleAd';
import * as LSTVGlobals from '../../global/globals';
import { isBackdropFilterSupported, VerticalSpacer } from '../../utils/LSTVUtils';

const Container = styled.div`
  position: relative;
  z-index: ${LSTVGlobals.Z_INDEX_9_OF_100_HEADER_OVERLAY};
`;

type Props = {
  withBanner?: boolean
}

const Header = ({ withBanner }: Props) => {
  const [fixed, setFixed] = useState(false)
  const backdropSupported = isBackdropFilterSupported()
  const stickyStyle = backdropSupported ?
    LSTVGlobals.TOP_STICKY_NAVBAR :
    LSTVGlobals.TOP_STICKY_NAVBAR_NO_BLUR

  return (
    <Container>
      { (fixed && withBanner) &&
        <>
          <GoogleAd
            width={isMobileOnly ? 320 : 728}
            height={isMobileOnly ? 50 : 90}
            adUnitPath={isMobileOnly ? '/164808479/Mobile320x50' : '/164808479/lstv2-leaderboards'}
          />
          <VerticalSpacer space={5} />
        </>
      }
      <Sticky onFixedToggle={() => setFixed(!fixed)} style={stickyStyle}>
        <HeaderBar />
      </Sticky>
    </Container>
  )
}

export default Header
