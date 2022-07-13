import React from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {  MID_GRAY_COLOR, UserDevice } from '../../../global/globals';

export const SectionContainer = styled.div`
    grid-column: ${(props) => props.fullWidth ? '1 / 3': 'auto'};
    width: 100%;
    position: relative;
    box-sizing: border-box;
`;

export const Section = (props) => (
    <>
    <SectionContainer {...props}>
        {props.children}
    </SectionContainer>
     {!props.isLast && <SectionSeperator fullWidth={props.fullWidth} />}
     </>
)
export const SectionTitle = styled.h2`
    font-weight: 800;
    font-size: 2rem;
    margin-bottom: 16px;
    margin-left: ${props => props.marginLeft ? "20px" : "unset"};
    span {
        font-family: Calibre;
        font-style: normal;
        font-weight: 600;
        font-size: 1.3rem;
        line-height: 1.6rem;
        display:block;
    }
`;

export const SectionSeperator = styled.hr`
    /* margin: 0px 20px; */
    border: none;
    border-top: 1px solid ${MID_GRAY_COLOR};
    margin: 20px 20px 20px;
    grid-column: ${(props) => props.fullWidth ? '1 / 3' : 'auto'};
    @media ${UserDevice.laptop} {
        width: ${(props) => props.fullWidth ? 'unset' : 'calc(100% - 40px)'};
    }
`;

export const IconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: unset;
    @media ${UserDevice.laptop} {
        height: 20px;
        width: 20px;
    }
`;

export const Stat = styled.div`
    /* flex-grow: 1; */
    justify-content: center;
    font-size: 1.125rem;
    line-height: 1.3rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    max-height: 35px;

    &>strong {
        font-weight: 700;
        font-size: 1.125rem;
        padding-left: 5px;
        line-height: 1.3rem;
    }
    @media ${UserDevice.laptop} {
        flex-grow: 0;
        font-size: 0.937rem;
        line-height: 1.125rem;
        &>strong {
            font-size: 0.937rem;
            line-height: 1.125rem;
        }
    }
`

const SimpleGridContainer = styled.div`
    display: flex;
    flex-wrap: nowrap;
    margin: 0px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    /* width: 100vw; */
    margin-left: -5px;
    padding: 5px;
    &::-webkit-scrollbar {
        display: none;
    }
    /* div:last-child {
        padding-right: 100px;
    } */

    /* margin-right: -20px; */
    @media ${UserDevice.tablet} {
        flex-wrap: wrap;
        width: unset;
        overflow-x: hidden;
        /* margin: 0px; */
        /* div:last-child {
         padding-right: 0px;
        } */
    }
`;
const Spacer = styled.div`
    padding-right: 100px;
    media ${UserDevice.laptopL} {
        padding-right: 0px;
        display: none;
    }
`

export const SimpleCardGrid = (props) => (
    <SimpleGridContainer style={props.style} {...props}>
        {props.children}
        <Spacer style={{width: '100px'}}/>
    </SimpleGridContainer>
);

SimpleCardGrid.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    style: PropTypes.object,
};

export const KnockoutButton = styled.button`
    border: 2px solid black;
    border-radius: 20px;
    background-color: white;
    font-size: 0.937rem;
    padding: 5px 25px;
    cursor: pointer;
`;
