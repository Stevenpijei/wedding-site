import React, { useState } from 'react';
import * as LSTVGlobals from '../../../global/globals';
import styled from 'styled-components';
import { Flex } from '../../../utils/LSTVUtils';
import { BaseTagStyle } from './LSTVCloudTag';
import { Link } from 'react-router-dom';

const Tag = styled(BaseTagStyle)`
    background: ${LSTVGlobals.TAG_BG};
    position: relative;
    font-size: 0.8rem;
    line-height: 1rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_NORMAL};
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    border-radius: 15px;
    padding: 3px 8px 3px 8px;
    margin: 0 7px 7px 0;
    
    
     a {
        z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    }

    &:hover {
        background: ${LSTVGlobals.PRIMARY_COLOR};
        color: ${LSTVGlobals.ABSOLUTE_WHITE};
    }
`;

const LSTVRoundedCornerTag = (props) => {
    return (
        <Link style={{ textDecoration: 'none' }} to={props.link}>
            <Tag {...props} data-tip={props.tooltip} data-for={'mainTooltip'}>
                {props.name}
            </Tag>
        </Link>
    );
};

export default LSTVRoundedCornerTag;
