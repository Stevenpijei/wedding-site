import React, { useState, useEffect } from 'react';
import styled, { keyframes} from 'styled-components';
import {  WHITE, PRIMARY_COLOR, UserDevice  } from '../../../global/globals';

import { ShareComp } from './VideoCard';
import { ArrowRight, ShareIcon } from '../../Utility/LSTVSVG';
import {  IconContainer } from "./LayoutComps";
import MobileStickyPanel from '../../../newComponents/layout/MobileStickyPanel';
import LikableHeart from '../../Utility/LikableHeart';
import { couplesNamesFromProperties, useMediaReady } from '../../../utils/LSTVUtils'
import WeddingTeam from './WeddingTeam';
import { useVideoService } from '../../../rest-api/hooks/useVideoService';



const StickyHeader = styled.div`
    display: flex;
    justify-content: space-between;
    /* magical code that makes it work on safar, do not remove! */
    transform: translate3d(0,0,0);
    background: white;
    align-items: center;
    padding: 10px 15px;
    height: 65px;
    z-index: 10;

    button {
        height: 50px;
        width: 50px;
        border-radius: 45px;
        color: white;
        margin-right: 10px;
        background-color: ${PRIMARY_COLOR};
        filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.25));
    }
`

const StickyHeaderTitle = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    h2 {
        font-size: 1.125rem;
        font-family: Calibre;
        font-style: normal;
        font-weight: 600;
        line-height: 1.5rem;
        margin-top: 8px;
    }
`
const IconsContainer = styled.div`
    display: flex;
    flex-direction:row;
    padding-bottom: 5px;
`

const rotateAnimation = keyframes`
    0% { transform: rotate(-90deg); }
    100% {transform: rotate(90deg); }
`

const ArrowIconContainer = styled(IconContainer)`
    transform: rotate(-90deg);
    height: 18px;
    width: 18px;
    margin: auto;
    &.open {
        transform: rotate(90deg);
        animation-name: ${rotateAnimation};
        animation-duration: 0.6s;
    }
    &.closing {
        animation-name: ${rotateAnimation};
        transform: rotate(-90deg);
        animation-direction: reverse;
        animation-duration: 0.6s;
        animation-timing-function: ease-in;
    }
`;

const Content = styled.div`
    /* margin: 24px 0 0 0; */
    /* padding: 24px 0 0 0; */
    border-top: 1px solid ${props => props.theme.midGrey};
`

const StyledweddingTeam = styled(WeddingTeam)`
    margin: unset;
`;

const RenderStickyHeader = ({data, handleClick, isOpen, hasOpened, handleLike, isLiked }) => {
    const { slug, post_properties} = data;

    return (
        <StickyHeader>
            <StickyHeaderTitle>
                <IconsContainer className="iconsContainer">
                    <IconContainer style={{paddingRight: '30px'}}>
                        <LikableHeart onLike={() => handleLike()} isLiked={isLiked} />
                    </IconContainer>
                    <ShareComp data={data} showText={false} />
                </IconsContainer>
                <h2>{couplesNamesFromProperties(post_properties)}</h2>
            </StickyHeaderTitle>
            <button onClick={()=>handleClick()}><ArrowIconContainer className={`${isOpen && hasOpened && 'open'} ${!isOpen && hasOpened && 'closing'}`}><ArrowRight fillColor={WHITE} strokeColor={"none"}/></ArrowIconContainer></button>
        </StickyHeader>
    )
}

const VideoStickyMenu = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    const handleClick = () => {
        if(!isOpen && !hasOpened) {
            setIsOpen(true)
            setHasOpened(true)
        }
        else{
            setIsOpen(!isOpen) 
        }
    }

    

    return (
        <MobileStickyPanel
            header={<RenderStickyHeader {...props} handleClick={handleClick} isOpen={isOpen} hasOpened={hasOpened} />}
            headerHeight="85px"
            isOpen={isOpen}
        >
            <Content>
                <StyledweddingTeam
                    isLast
                    businesses={props.data.businesses}
                    showOutline={false}
                    centerTitle={false}
                />
            </Content>
        </MobileStickyPanel>
    );
}

export default VideoStickyMenu