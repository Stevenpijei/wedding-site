/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types';
import {  IconContainer, Stat } from "./LayoutComps";
import styled, { keyframes } from 'styled-components';
import {  CARD_BACKGROUND, UserDevice, ACTION_BAR_OWNER_TYPE_VIDEO, VENDOR_ROLE_VIDEOGRAPHER, PRIMARY_COLOR } from '../../../global/globals';
import VideoPlayer from '../../Video/VideoPlayer';
import  ContentShareWidget  from '../../Utility/ContentShareWidget';
import { GetVideoShareOptions, couplesNamesFromProperties } from "../../../utils/LSTVUtils";

import ShareModal from '../../../newComponents/ShareModal';
import LikableHeart from '../../Utility/LikableHeart';
import { ContactBusinessButton }  from '../../../components/Forms/LSTVInlineContactButtons';
var dayjs = require('dayjs')

const glimmerAnimation = props => keyframes`
    0%{background-position:0% 48%}
    50%{background-position:100% 53%}
    100%{background-position:0% 48%}
`
const VideoCardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 20px;
    /* width: 100%; */
    background: ${CARD_BACKGROUND};
    
    /* style={{display: 'flex', flex: '1', height: '534px', width: '100%', backgroundColor: 'grey', margin: 'auto', borderRadius: "15px"}} */
    &>.video {
        display: flex;
        flex: 1;
        min-height: 150px;
        height: 100%;
        width: 100%;
        background-image: linear-gradient(273deg, #dfd0ff, #6a25ff);
        background-size: 400% 400%;
        border-radius: 5px; 
        animation: ${glimmerAnimation} 3s ease infinite;
        @media ${UserDevice.tablet} {
            height: 100%;
            min-height: 300px;
        }
    }
`;

const BottomContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    position: relative;
    top: -200px;
`

const BottomContainerDesktop = styled.div`
    display: flex;
    width: 100%;
    margin-top: 30px;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    top: -200px;
`

const VideoCardTitle = styled.div`
    align-self: flex-start;
    padding: 25px 0px 0px 0px;
    h1 {
        font-size: 2rem;
        padding: 0px;
        margin-top: 10px;
        font-weight: 800;
        line-height: 1.7rem;
    }
`
const DateAndViews = styled.div`
    display: flex;
    margin: 8px 0px;
    p{
        font-size: 0.937rem;
        font-weight: 500;
        line-height: 1.125rem;
    }
`
const TinyCircle = styled.div`
    width: 6px;
    height: 6px;
    background-color: ${PRIMARY_COLOR};
    border-radius: 100%;
    margin: auto 10px;
`

const LikableHeartContainer = styled(IconContainer)`
    padding-right: 10px;
    @media ${UserDevice.laptopL} {
        padding-right: 5px;
    }    
`

const Location = styled.h3`
     font-family: Calibre;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.5rem;
`

const VideoCardStats = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-evenly;
    padding: 25px 0px;
`;
const RightSideStats = styled.div`
        margin-top: 20px;
`

const ViewsComp = ({views}) => (
    <Stat>{`${views}`}<strong>View{views > 1 && `s`}</strong></Stat>
)
const LikesComp = ({likes}) => (
    <Stat>
        <LikableHeartContainer><LikableHeart /></LikableHeartContainer>{`${likes} `} <strong>Like{likes !== 1 && `s`}</strong>
    </Stat>
)
export const ShareComp = ({post, videoIndex=0, showText=true}) => {
    const {id, videos, short_url_token} = post.videos[videoIndex];
    const coupleNames = couplesNamesFromProperties(post.properties)

    return (
    <ContentShareWidget 
        ownerType={ACTION_BAR_OWNER_TYPE_VIDEO}
        ownerId={id}
        shareOptions={GetVideoShareOptions({
            shortUrlToken:short_url_token,
            coupleNames: coupleNames,
            shareThumbnailUrl: videos[0].thumbnail_url,
        })}
        shareThumbnailUrl={videos[0].thumbnail_url}
        fontSize={'1.2em'}
        textColor={'black'}
        fillColor={'black'}
        showText={showText}
    />
    )
}
    


const VideoCard = ({post, videoIndex=0, isDesktop, CustomCTA=undefined, hideDetails, style  }) => {
    const {id,title, event_date, location, videos, likes, views, short_url_token, businesses} = post.videos[videoIndex];
    const coupleNames = couplesNamesFromProperties(post.properties)
    const videoGrapher = businesses.find((business)=> business.role_slug === VENDOR_ROLE_VIDEOGRAPHER);

    return (
        <>
            <VideoCardContainer style={style?.container}>
                <div className="video">
                    <VideoPlayer
                        isAutoPlay={true}
                        onPercentageComplete={null}
                        onVideoComplete={null}
                        video={post.videos[videoIndex]}
                        upNextSlide={null}
                    />
                </div>

                {!isDesktop && !hideDetails && (
                    <BottomContainer>
                    <VideoCardTitle>
                        <h1>{coupleNames || title}</h1>
                        
                        <Location>in {location.place}, {location.state_province}</Location>
                    </VideoCardTitle>        
                    <VideoCardStats>
                        <ViewsComp views={views} />
                        <LikesComp likes={likes} />
                        <ShareComp post={post} />
                        <Location location={location} />
                    </VideoCardStats>
                    {CustomCTA ? CustomCTA :
                        <ContactBusinessButton
                                id={'videographer-contact'}
                                business={videoGrapher}
                                videoId={id}
                                tooltip={'Contact The Videographer'}
                                title={'Contact ' + videoGrapher.name}
                                message={
                                    `I watched ${coupleNames}'s wedding video on Love Stories TV, in which you are tagged as ` +
                                    `the videographer. I'm impressed and would like to inquire about your services for my ` +
                                    `upcoming wedding.`
                                }
                                size='fullWidth'
                        />
                }
                </BottomContainer>)}
                {isDesktop && !hideDetails && ( 
                    <BottomContainerDesktop>
                    <VideoCardTitle>
                        <h1>{coupleNames || title}</h1>
                        <Location>in {location.place}, {location.state_province}</Location>
                        <DateAndViews><p>{dayjs(event_date).format("MMM D YYYY")}</p><TinyCircle/><ViewsComp views={views} /></DateAndViews>
                    </VideoCardTitle>
                    <RightSideStats>
                        {CustomCTA ? CustomCTA :

                            <ContactBusinessButton
                                id={'videographer-contact'}
                                business={videoGrapher}
                                videoId={id}
                                tooltip={'Contact The Videographer'}
                                title={videoGrapher.name}
                                message={
                                    `I watched ${coupleNames}'s wedding video on Love Stories TV, in which you are tagged as ` +
                                    `the videographer. I'm impressed and would like to inquire about your services for my ` +
                                    `upcoming wedding.`
                                }
                                size='large'
                            />
                        }
                        <VideoCardStats>
                            <LikesComp likes={likes}/> 
                            <ShareComp post={post} />
                        </VideoCardStats>
                    </RightSideStats>
                </BottomContainerDesktop>)}
            </VideoCardContainer>
            <ShareModal />
        </>
    )
}

VideoCard.propTypes = {
    post: PropTypes.object,
    videoIndex: PropTypes.number,
    isDesktop: PropTypes.bool,
    // CustoCTA is an optional component, if you need a custom CTA elemnent
    CustomCTA: PropTypes.object,

};

export default VideoCard
