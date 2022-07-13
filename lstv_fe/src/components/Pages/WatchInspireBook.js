import React from 'react'
import styled from 'styled-components';
import {  UserDevice } from '../../global/globals';
import {  Section } from './VideoPage/LayoutComps';
import birdsImage from '../../images/cross-birds.png';

const Callout = styled.h3`
    font-family: Heldane;
    font-style: normal;
    font-weight: bold;
    font-size: 2.5rem;
    line-height: 115.7%;
    text-align: center;
    margin-bottom: 30px;
    @media ${UserDevice.tablet} {
        font-size: 3.5rem;
        line-height: 118.7%;
       
    }
`;
const WatchInspireBookContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 180px 30px 30px 30px;
    margin: 20px 0px 20px 0px;
    align-items: center;
    position: relative;
    @media ${UserDevice.tablet} {
        margin: 70px 0px;
        padding: 30px;
        justify-content: center;
    }
`;
const Birds = styled.img`
    position: absolute;
    top: 0px;
    right: -40px;
    @media ${UserDevice.tablet} {
        position: relative;
    }
`;

const WatchInspireBook = (props) => {
    return (
        <Section {...props}>
            <WatchInspireBookContainer>
                <Callout marginLeft>Watch, Get Inspired, Book.</Callout>
                <Birds src={birdsImage} />
            </WatchInspireBookContainer>
        </Section>
    )
}

export default WatchInspireBook
