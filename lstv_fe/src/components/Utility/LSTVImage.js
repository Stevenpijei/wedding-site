import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import { LSTVSVG } from './LSTVSVG';
import { isMobileOnly, isMobile, isTablet, isBrowser } from 'react-device-detect';
import { getDeviceImageUrl } from '../../utils/LSTVUtils';
import PropTypes from 'prop-types';
import { AspectRatio } from 'react-aspect-ratio';

const LSTVImageStyle = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
`;

const addDefaultSrc = (ev) => {
    ev.target.src = 'https://d3g1ohya32imgb.cloudfront.net/images/site/nothumb.jpg';
};


export const LSTVImage = (props) => {
    let url = getDeviceImageUrl(props.url);
    return <LSTVImageStyle onError={addDefaultSrc} src={url} />
};

LSTVImage.propTypes = {
    url: PropTypes.string,
    size: PropTypes.object,
};

LSTVImage.defaultProps = {};
