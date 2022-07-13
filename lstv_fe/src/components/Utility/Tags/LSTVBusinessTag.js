import React, { useState } from 'react';
import * as LSTVGlobals from '../../../global/globals';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { BaseTagStyle } from './LSTVCloudTag';
import { Hole } from './LSTVTicketTag';
import { LSTVSVG } from '../LSTVSVG';
import { Flex } from '../../../utils/LSTVUtils';

const Tag = styled(BaseTagStyle)`
    position: relative;
    height: 30px;
    line-height: 30px;
    border-radius: 266px 999px 999px 266px;
    padding: ${(props) => props.padding || '2px 40px 2px 10px'};
    //clip-path: polygon(0% 50%, 10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%);
    //mask-image: radial-gradient(circle farthest-side at 10px, transparent 3px, white 3px);
    a {
        z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    }

    &:hover {
        color: ${LSTVGlobals.ABSOLUTE_WHITE};
        background: ${LSTVGlobals.PRIMARY_COLOR};
    }
    
    ${props => !props.inView && css`
        opacity: 0;
        pointer-events: none;
    `}
`;

const BusinessRoleIconContainer = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 2px solid ${props => props.iconBorderColor || LSTVGlobals.TAG_BG};
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    transition: all ${LSTVGlobals.FAST_EASE_OUT_ANIM};
    //box-shadow: none;
    //transform: perspective(0px) rotateY(0deg);

    svg {
        position: absolute;
        width: 60%;
        height: 60%;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
    }

    ${(props) =>
        props.hover &&
        css`
            background: ${LSTVGlobals.ABSOLUTE_WHITE};
            border: 2px solid ${LSTVGlobals.PRIMARY_COLOR};
            //transform: perspective(190px) rotateY(-20deg);
            //margin-left: -4px;
            //margin-right: 4px;
            //box-shadow: 9px 0px 9px -5px #808080;
            //width: 34px;
            //height: 36px;
        `}
`;

const LSTVBusinessTag = (props) => {
    const [hover, setHover] = useState(false);

    return (
        <Link style={{ textDecoration: 'none' }} to={props.link}>
            <Flex
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                alignItems={'center'}
                justifyContent={'flex-start'}
                margin={'0 5px 5px 0'}
            >
                <Tag {...props} data-tip={props.tooltip} data-for={'mainTooltip'}>
                    {props.name}
                    <Hole />
                    <BusinessRoleIconContainer iconBorderColor={props.iconBorderColor} hover={hover}>
                        <LSTVSVG
                            icon={props.icon}
                            strokeColor={LSTVGlobals.TEXT_AND_SVG_BLACK}
                        />
                    </BusinessRoleIconContainer>
                </Tag>
            </Flex>
        </Link>
    );
};

LSTVBusinessTag.defaultProps = {
    inView: true
}

export default LSTVBusinessTag;
