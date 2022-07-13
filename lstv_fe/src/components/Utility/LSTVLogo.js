/*
                      _                          _          _
 __   _____ _ __   __| | ___  _ __     _ __ ___ | | ___    (_) ___ ___  _ __
 \ \ / / _ \ '_ \ / _` |/ _ \| '__|   | '__/ _ \| |/ _ \   | |/ __/ _ \| '_ \
  \ V /  __/ | | | (_| | (_) | |      | | | (_) | |  __/   | | (_| (_) | | | |
   \_/ \___|_| |_|\__,_|\___/|_|      |_|  \___/|_|\___|   |_|\___\___/|_| |_|


 */

import React from 'react';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import {LSTVSVG} from "./LSTVSVG";
import {Link} from "react-router-dom";
import LogoSvg from "../../images/lstv_logo.svg";

const LSTVLogoContainer = styled.div`
    display: flex;
    align-items: 'center';
    background: ${props => props.background || LSTVGlobals.TEXT_AND_SVG_BLACK};
    transform: skew(-20deg);
    height: ${props => props.height || '100%'};
    width: ${props => props.width || '130px'};
    
    @media ${LSTVGlobals.UserDevice.isMobile} {
            
    }
    
    
`;

export const LSTVLogo = (props) => {

    return <LSTVLogoContainer {...props}>
            <LSTVSVG icon={'lstv-logo'} fillColor={props.color} transform={'skewX(20)'} />
    </LSTVLogoContainer>
};
