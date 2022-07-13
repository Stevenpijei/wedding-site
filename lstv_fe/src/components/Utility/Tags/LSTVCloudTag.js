import React from 'react';
import * as LSTVGlobals from '../../../global/globals';
import styled, { css } from 'styled-components';
import {InView} from "react-intersection-observer";
import { isMobile } from 'react-device-detect';

const CloudTagContainer = styled.div`
    display: ${(props) => props.display || 'inline-flex'};
    margin: ${(props) => props.margin || '0'};
    padding: ${(props) => props.padding || '0'};
    align-items:  ${(props) => props.alignItems || 'center'};
    justify-content: ${(props) => props.justifyContent || 'flex-start'}; 
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
`;


export const BaseTagStyle = styled.div`
    background: ${(props) => props.background ||  LSTVGlobals.TAG_BG};
    border-radius: ${(props) => props.borderRadius};
    border-top: ${(props) => props.borderTop};
    border-bottom: ${(props) => props.borderBottom};
    border-left: ${(props) => props.borderLeft};
    border-right: ${(props) => props.borderRight};
    border-radius: 0 5px 5px 0;
    padding: ${(props) => props.padding || '2px 13px 2px 10px'};
    margin: ${(props) => props.margin || '0'};
    display: flex;
    position: relative;
    transition: background ${LSTVGlobals.FAST_EASE_OUT_ANIM};
    font-size: ${(props) => props.fontSize || '0.8rem'};
    font-weight: ${(props) => props.fontWeight || LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
`;

const LSTVCloudTag = (props) => {

    let children = null;

    if (props.trackVisibility && !isMobile) {
        children = React.Children.map(props.children, (child, i) => {
            return  <InView key={i} threshold={1}>
                {({ inView, ref, entry }) => (
                    <div ref={ref}>
                        {React.cloneElement(child, { inView: inView})}
                    </div>
                )}
            </InView>
        });
    }


    return <CloudTagContainer {...props}>
        {  children || props.children }
    </CloudTagContainer>;
};

export default LSTVCloudTag;

