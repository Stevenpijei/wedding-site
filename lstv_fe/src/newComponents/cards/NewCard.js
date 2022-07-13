import React, { useState } from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import {
    HorizontalSpacer,
    secsToTimeStr,
    shortHandValue,
    VerticalSpacer,
} from '../../utils/LSTVUtils';
import { LSTVImage } from '../../components/Utility/LSTVImage';
import { SizeMe } from 'react-sizeme';
import PropTypes from 'prop-types';
import LSTVLink from '../../components/Utility/LSTVLink';

export const CARD_TYPE_EVENT_STORY = 'event-story';

// card container types

export const CARD_CONTAINER_TYPE_GRID = 'grid';
export const CARD_CONTAINER_TYPE_MASONRY = 'masaonry';
export const CARD_CONTAINER_TYPE_HSCROLL = 'h-scroll';

// card orientation

export const CARD_ORIENTATION_PORTRAIT = 'portrait';
export const CARD_ORIENTATION_LANDSCAPE = 'landscape';

// card constraints

export const CARD_CONSTRAINTS_NO_LOCATION = 'no_location';
export const CARD_CONSTRAINTS_NO_VIDEOGRAPHER = 'no_videographer';


const CardOutline = styled.div`
    position: relative;
    border-radius: 14px;
    background: ${LSTVGlobals.CARD_BACKGROUND};
    width: 100%;
    text-decoration: none;
    box-shadow: 0px 0px 6px rgba(183, 183, 183, 0.25);
    transition: 0.3s ease-in;
    &:hover {
        box-shadow: 0px 0px 6px 4px rgba(183, 183, 183, 0.25);
    }
    height: 100%;

    ${(props) =>
        props.theme.containerMode &&
        props.theme.containerMode === CARD_CONTAINER_TYPE_GRID &&
        css`
            height: 100%;
        `}
    ${(props) =>
        props.theme.containerMode &&
        props.theme.containerMode === CARD_CONTAINER_TYPE_MASONRY &&
        css`
            margin-bottom: 15px;
        `}
    ${(props) =>
        props.theme.containerMode &&
        props.theme.containerMode === CARD_CONTAINER_TYPE_HSCROLL &&
        css`
            width: ${LSTVGlobals.HSCROLL_CARD_SIZES_LAPTOP}px;
            height: 100%;

            @media ${LSTVGlobals.UserDevice.isMobileS} {
                width: ${LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_SMALL}px;
            }

            @media ${LSTVGlobals.UserDevice.isMobileM} {
                width: ${LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_MEDIUM}px;
            }

            @media ${LSTVGlobals.UserDevice.isMobileL} {
                width: ${LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_LARGE}px;
            }

            @media ${LSTVGlobals.UserDevice.isTablet} {
                width: ${LSTVGlobals.HSCROLL_CARD_SIZES_TABLET}px;
            }
        `}
        
    ${(props) =>
        props.imageOnly &&
        css`
            left: 20px;
        `};

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            border-radius: 3px;
        `};

`;

const VideoDuration = styled.div`
    position: absolute;
    border-radius: 4px;
    bottom: 8px;
    right: 8px;
    height: 31px;
    width: 51px;
    text-align: center;
    font-weight: normal;
    line-height: 31px;
    background: ${LSTVGlobals.BLACK};
    color: ${LSTVGlobals.ABSOLUTE_WHITE};

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            font-size: 0.75rem;
            height: 1rem;
            line-height: 1rem;
            width: 42px;
        `};
`;

const PremiumBadge = styled.div`
    position: absolute;
    border-radius: 3px;
    top: 25px;
    right: 16px;
    padding: 1px 8px;
    height: 23px;
    width: 68px;
    text-align: center;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_MEDIUM};
    line-height: 23px;
    background: ${LSTVGlobals.CARD_LABEL_COLOR_VENDOR};
    color: ${LSTVGlobals.BLACK};
`;


const CardElements = styled.div`
    display: flex;
    flex-direction: ${(props) => (props.theme.orientation === CARD_ORIENTATION_PORTRAIT ? 'column' : 'row')};

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            align-items: center;
        `}

    ${(props) =>
        props.theme.containerMode === CARD_CONTAINER_TYPE_GRID &&
        css`
            height: 100%;
        `}
`;

const CardThumbnail = styled.div`
    flex: 1;
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    width: 100%;
    height: calc(${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')});
    min-height: calc(${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')});
    max-height: calc(${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')});

    ${(props) =>
        props.theme.imageOnly &&
        css`
            border-radius: 14px 14px 14px 14px;
        `}

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            height: 88px;
            width: 155.76px;
            min-width: unset;
            min-height: unset;
            max-height: unset;
            max-width: unset;
            flex: 0 0 156px;
            border-radius: 3px;
        `}
`;

const CardDetails = styled.div`
    padding: 10px 26px 10px 26px;
    color: ${(props) => props.theme.black};
    overflow: hidden;
    min-height: 60px;
    flex: 1 0;

    ${(props) =>
        props.theme.imageOnly &&
        css`
            display: block;
            position: absolute;
            bottom: 10px;
            padding: 0 0 10px 0;
            left: 20px;
            color: white;
            z-index: 8;
            width: calc(100% - 30px);
        `};

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            //height: 100%;
            padding: 0 0 0 20px;
        `}
`;

const VideoCardTagsContainer = styled.div`
  padding: 5px 26px 0  26px;
`;

const CardParagraph = styled.div`
    font-family: 'Calibre', sans-serif;
    font-weight: normal;
    font-style: normal;
    font-size: 1.125rem;
    line-height: 1.312rem;
    position: relative;
`;

const CardInformation = styled.div`
    font-family: Calibre;
    font-style: normal;
    font-size: 0.973rem;
    font-weight: normal;
    line-height: 1.125rem;
`;

const CardStats = styled.div`
    font-family: Calibre;
    font-style: normal;
    font-size: 1rem;
    font-weight: normal;
    line-height: 1.1rem;
`;

const CardTags = styled.div`
    font-size: 0.973rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_MEDIUM};
    line-height: 1.125rem;
    color: ${(props) => props.theme.black};
`;

const FeaturedLabel = styled.span`
    padding: 2px 4px 2px 4px;
    background: ${(props) => props.theme.primaryPurple};
    color: ${(props) => props.theme.white};
    border-radius: 3px;
    float: right;
`;


const CardTagContainer = styled.div`
    display: inline-block;
    background: ${(props) => props.theme.midGrey};
    padding: 3.5px 6px 3.5px 6px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 3px;
    font-weight: 500;
    font-size: 0.937rem;
    line-height: 1.115rem;
`;


const getBottomSection = (cardTheme) => {
       
        return <VideoCardTagsContainer theme={cardTheme}>
            <CardTags theme={cardTheme}>
                {cardTheme?.vibes.map((data, index) => {
                    return <CardTagContainer key={index}>{data}</CardTagContainer>;
                })}
            </CardTags>
        </VideoCardTagsContainer>;
};

const getCardDetails = (cardTheme) => {
    return (
        <>
            <h5>{cardTheme.coupleNames}</h5>

            {(!cardTheme.constraints || cardTheme.constraints !== CARD_CONSTRAINTS_NO_VIDEOGRAPHER) && (
                <CardParagraph>{cardTheme.videographer}</CardParagraph>
            )}
            {cardTheme.orientation === CARD_ORIENTATION_PORTRAIT && <VerticalSpacer space={'10'} />}
            <CardInformation>
                {(!cardTheme.constraints || cardTheme.constraints !== CARD_CONSTRAINTS_NO_VIDEOGRAPHER) && (
                    <>
                        {cardTheme.venueName}
                        <br />
                    </>
                )}{' '}
                {(!cardTheme.constraints || cardTheme.constraints) !== CARD_CONSTRAINTS_NO_LOCATION &&
                    cardTheme.location}
            </CardInformation>

            <CardStats>
                {(cardTheme.views > LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD ||
                    cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD) && (
                    <VerticalSpacer space={'10'} />
                )}
                {cardTheme.views > LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD && (
                    <>
                        {shortHandValue(cardTheme.views)} <span style={{ fontWeight: 'bold' }}>Views</span>
                        <HorizontalSpacer space={10} />
                    </>
                )}
                {cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD && (
                    <>
                        {shortHandValue(cardTheme.likes)}{' '}
                        <span style={{ fontWeight: 'bold', fontSize: '0.973rem' }}>Likes</span>
                    </>
                )}
                {cardTheme.orientation === CARD_ORIENTATION_LANDSCAPE && (
                    <>
                        <HorizontalSpacer space={10} />
                        <FeaturedLabel>Featured</FeaturedLabel>
                    </>
                )}

                {(cardTheme.views > LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD ||
                    cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD) && (
                    <VerticalSpacer space={'10'} />
                )}
            </CardStats>

        </>
    );
        
};

const NewVideoCard = (props) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(props.data.thumbnailUrl);
    let cardTheme = { ...props.options, ...props.data };
    let cardContent = (
            <CardOutline
                onMouseEnter={() => {
                    if (cardTheme.previewGIFUrl) setThumbnailUrl(cardTheme.previewGIFUrl);
                }}
                onMouseLeave={() => {
                    if (cardTheme.previewGIFUrl) setThumbnailUrl(cardTheme.thumbnailUrl);
                }}
                theme={cardTheme}
            >
                <CardElements theme={cardTheme}>
                    <SizeMe monitorWidth={true} monitorHeight={true}>
                        {({ size }) => (
                            <>
                                <CardThumbnail size={size} theme={cardTheme}>
                                    <LSTVImage url={thumbnailUrl} alt={cardTheme.thumbnailAlt} />
                                    <PremiumBadge>Suggested</PremiumBadge>
                                    <VideoDuration>{secsToTimeStr(cardTheme.duration)}</VideoDuration>
                                </CardThumbnail>
                                <CardDetails size={size} theme={cardTheme}>{getCardDetails(cardTheme)}</CardDetails>
                                {getBottomSection(cardTheme)}
                            </>
                        )}
                    </SizeMe>

                </CardElements>
            </CardOutline>
    );

    return (
        <LSTVLink noStyle to={`${cardTheme.cardSlug}`}>
            {cardContent}
        </LSTVLink>
    );
};

NewVideoCard.propTypes = {
    options: PropTypes.object,
    data: PropTypes.object,
};

export default NewVideoCard;
