import React from 'react';
import * as LSTVGlobals from '../../../global/globals';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { BaseTagStyle } from './LSTVCloudTag';
import LSTVBusinessTag from "./LSTVBusinessTag";

export const Hole = styled.div`
    display: none;
    position: absolute;
    z-index: ${LSTVGlobals.Z_INDEX_6_OF_100};
    top: 50%;
    left: 8px;
    width: 6px;
    height: 6px;
    background: transparent;
    border-top: 1px solid ${LSTVGlobals.TAG_HOLE_SHADOW};
    border-radius: 999px;
    transform: translateY(-50%);
`;

const Tag = styled(BaseTagStyle)`
    padding-left: 20px;
    clip-path: polygon(0% 50%, 10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%);
    mask-image: radial-gradient(circle farthest-side at 10px, transparent 3px, white 3px);
    a {
        z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    }

    &:hover {
        background: ${LSTVGlobals.PRIMARY_COLOR};
        color: ${LSTVGlobals.ABSOLUTE_WHITE};
    }

    ${(props) =>
        !props.inView &&
        css`
            opacity: 0;
            pointer-events: none;
        `}
`;

const LSTVTicketTag = (props) => {
    return (
        <Link style={{ textDecoration: 'none' }} to={props.link}>
            <Tag {...props} data-tip={props.tooltip} data-for={'mainTooltip'}>
                {props.name}
                <Hole />
            </Tag>
        </Link>
    );
};


LSTVTicketTag.defaultProps = {
    inView: true
}

export default LSTVTicketTag;
