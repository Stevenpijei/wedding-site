import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import MediaQuery from 'react-responsive/src/Component';
import { SizeMe } from 'react-sizeme';
import styled, { css, ThemeProvider } from 'styled-components';
import BaseCtaButton from '../buttons/BaseCtaButton';
import { LSTVImage } from '/components/Utility/LSTVImage';
import LSTVLink from '/components/Utility/LSTVLink';
import { LSTVSVG } from '/components/Utility/LSTVSVG';
import * as LSTVGlobals from '/global/globals';
import {
    Flex,
    GenericContainer,
    getRolesStringFromBusiness,
    HorizontalSpacer,
    secsToTimeStr,
    shortHandValue,
    VerticalSpacer
} from '/utils/LSTVUtils';

//    ____              _   _____
//   / ___|__ _ _ __ __| | |_   _|   _ _ __   ___  ___
//  | |   / _` | '__/ _` |   | || | | | '_ \ / _ \/ __|
//  | |__| (_| | | | (_| |   | || |_| | |_) |  __/\__ \
//   \____\__,_|_|  \__,_|   |_| \__, | .__/ \___||___/
//                               |___/|_|

export const CARD_TYPE_WEDDING_VENDOR = 'wedding-business';
export const CARD_TYPE_VIDEO = 'video';
export const CARD_TYPE_BUSINESS = 'business';
export const CARD_TYPE_BUSINESS_DETAILS = 'business-details';
export const CARD_TYPE_ARTICLE = 'article';
export const CARD_TYPE_VIBE = 'vibe';
export const CARD_TYPE_SHOPPING_ITEM = 'shopping-iten';
export const CARD_TYPE_FOLDER = 'folder';
export const CARD_TYPE_CALENDAR_ITEM = 'calendar-item';
export const CARD_TYPE_PROMO_VIDEO = 'promo-video';
export const CARD_TYPE_MINI_ROUND_IMAGE = 'mini-round-image';
export const CARD_TYPE_VENDOR_GENERIC = 'business-generic';
export const CARD_TYPE_TEAM_MEMBER = 'team-member';

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
    border-radius: 10px;
    background: ${LSTVGlobals.CARD_BACKGROUND};
    width: 100%;
    text-decoration: none;
    box-shadow: 0px 0px 6px rgba(183, 183, 183, 0.25);
    transition: 0.3s ease-in;

    &:hover {
        box-shadow: 0px 0px 6px 4px rgba(183, 183, 183, 0.25);
    }

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

    ${(props) =>
        props.theme.cardType === CARD_TYPE_WEDDING_VENDOR &&
        css`
            border-radius: 10px;
            padding: 10px 57px 10x 10px;
            height: 125px;
            background: ${(props) => props.theme.bg_color};
        `};

    ${(props) =>
        props.theme.cardType === CARD_TYPE_CALENDAR_ITEM &&
        css`
            border-radius: 10px;
            background: ${(props) => props.theme.primaryPurple};
        `};

    ${(props) =>
        (props.theme.cardType === CARD_TYPE_MINI_ROUND_IMAGE || props.theme.cardType === CARD_TYPE_TEAM_MEMBER) &&
        css`
            border-radius: 0;
            border: none;

            box-shadow: none;

            &:hover {
                box-shadow: none;
            }
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
    top: 16px;
    right: 16px;
    height: 23px;
    /* width: 68px;  */
    padding: 1px 8px;
    text-align: center;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_MEDIUM};
    line-height: 23px;
    background: ${(props) => props.theme.primaryPurple};
    color: ${(props) => props.theme.white};
`;

const ColorBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 7px;
    width: 61px;
    background: ${(props) => props.color};
    z-index: ${LSTVGlobals.Z_INDEX_6_OF_100};

    ${(props) =>
        props.theme.imageOnly &&
        css`
            left: 20px;
        `};

    ${(props) =>
        props.theme.orientation === CARD_ORIENTATION_LANDSCAPE &&
        css`
            border-radius: 3px;
        `};
`;

const GradientBackground = styled(ColorBar)`
    width: 100%;
    height: 100%;
    left: 0;
    z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.67) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%);
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
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
    width: 100%;
    height: calc(${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')});
    min-height: calc(
        ${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')}
    );
    max-height: calc(
        ${(props) => props.size.width}px / ${(props) => (props.aspectRatio ? props.aspectRatio : '1.777')}
    );

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


  ${(props) =>
        props.theme.cardType === CARD_TYPE_MINI_ROUND_IMAGE &&
        css`
            height: 34px;
            width: 34px;
            min-width: unset;
            min-height: unset;
            max-height: unset;
            max-width: unset;
            flex: 0 0 34px;
            border-radius: 50%;
        `}

  ${(props) =>
        props.theme.cardType === CARD_TYPE_TEAM_MEMBER &&
        css`
            clip-path: circle(60px at center);
        `}

  ${(props) =>
        props.theme.cardType === CARD_TYPE_SHOPPING_ITEM &&
        css`
            /* height: calc(${(props) => props.size.width}px / ${(props) =>
                props.aspectRatio ? props.aspectRatio : '1.777'});
        min-height: calc(${(props) => props.size.width}px / ${(props) =>
                props.aspectRatio ? props.aspectRatio : '1.777'}); */
            max-height: unset;
            min-height: unset;
            overflow: unset;
            width: 100%;
            height: 300px;

            img {
                border-top-left-radius: 14px;
                border-top-right-radius: 14px;
                object-position: top;
            }
        `};
`;

const CardDetails = styled.div`
    padding: 10px 26px 10px 26px;
    color: ${(props) => props.theme.black};
    overflow: hidden;
    /* min-height: 60px; */
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

    ${(props) =>
        props.theme.cardType === CARD_TYPE_WEDDING_VENDOR &&
        css`
            padding: 10px;
        `};

    ${(props) =>
        props.theme.cardType === CARD_TYPE_SHOPPING_ITEM &&
        css`
            padding: 15px 13px 15px 13px;

            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex: unset;
            & button: {
                width: 100%;
            }
        `};

    ${(props) =>
        props.theme.cardType === CARD_TYPE_CALENDAR_ITEM &&
        css`
            @media ${LSTVGlobals.UserDevice.tablet} {
                padding: 0;
            }
        `};

    ${(props) =>
        props.theme.cardType === CARD_TYPE_MINI_ROUND_IMAGE &&
        css`
            padding: 10px 8px 10px 8px;
            display: flex;
            flex-direction: column;
        `};

    ${(props) =>
        props.theme.cardType === 'business-generic' &&
        css`
            padding: 15px 26px 15px 26px;
        `};
`;

const VideoCardTagsContainer = styled.div`
    padding: 8px 26px 26px 26px;
`;

const CardParagraph = styled.div`
    font-family: 'Calibre', sans-serif;
    font-weight: normal;
    font-style: normal;
    font-size: 1.125rem;
    line-height: 1.312rem;
    position: relative;
`;

const BlogCardPreview = styled(CardParagraph)`
    font-family: 'Calibre', sans-serif;
    font-weight: normal;
    font-style: normal;
    font-size: 0.937rem;
    line-height: 1.125rem;
    position: relative;
    max-height: 3.375rem;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    display: -webkit-box;
`;

const CardTitle = styled.div`
    font-family: 'Calibre', sans-serif;
    font-weight: normal;
    font-style: normal;

    max-height: 3.12rem;

    position: relative;

    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    display: -webkit-box;
`;

const CardInformation = styled.div`
    font-family: Calibre;
    font-style: normal;
    font-size: 0.973rem;
    font-weight: normal;
    line-height: 1.125rem;

    ${(props) =>
        (props.theme.cardType === CARD_TYPE_SHOPPING_ITEM || props.theme.cardType === CARD_TYPE_VENDOR_GENERIC) &&
        css`
            color: ${(props) => props.theme.darkGrey};
        `};
`;

const Price = styled(CardInformation)`
    color: ${(props) => props.theme.black};
    font-weight: 500;
`;

const PriceWas = styled.span`
    color: ${(props) => props.theme.darkGrey};
    font-weight: 500;
    font-size: 0.973rem;
    font-weight: normal;
    text-decoration: line-through;
`;

const LineLimiter = styled.div`
    -webkit-line-clamp: ${(props) => props.lines || '2'};
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    display: -webkit-box;
    overflow: hidden;
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

const BusinessRoles = styled.div`
    display: flex;
    align-items: center;
    overflow: hidden;
    flex: 1;
    width: 100%;
    height: 40px;
    border-radius: 0 0 14px 14px;
    flex: 0 0 36px;
`;

const BusinessRole = styled.div`
    flex: 1;
    background: ${props => props.bgColor};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 35px;
    color: ${(props) => props.theme.white};
    font-size: 0.973rem;
    line-height: 0.973rem;
    font-weight: bold;
`;

const FeaturedLabel = styled.span`
    padding: 2px 4px 2px 4px;
    background: ${(props) => props.theme.primaryPurple};
    color: ${(props) => props.theme.white};
    border-radius: 3px;
    float: right;
`;

const DiscountLabel = styled.span`
    color: ${(props) => props.theme.darkGrey};
`;

const WeddingBusinessPremiumTag = styled.span`
    display: inline-block;
    width: fit-content;
    padding: 1px 8px 1px 8px;
    border-radius: 3px;
    background: ${(props) => props.theme.white};
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.02rem;
    color: ${(props) => props.theme.bg_color};
    height: 19px;
    line-height: 19px;
`;

const WeddingBusinessName = styled.h5`
    font-size: 1.125rem;
    line-height: 1.4rem;
    max-height: 2.8rem;
    color: ${(props) => props.theme.white};
    font-weight: 500;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    display: -webkit-box;
    overflow: hidden;
    height: 100%;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1.125rem;
        line-height: 1.312rem;
        max-height: 2.624rem;
    }
`;

const BusinessRoleName = styled(WeddingBusinessName)`
    font-size: 0.75rem;
    line-height: 0.8rem;
    max-height: 1.6rem;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 0.937rem;
        line-height: 1rem;
        max-height: 2rem;
    }
`;

const ClickableCard = styled.div`
    cursor: pointer;
    ${(props) =>
        props.containerMode === CARD_CONTAINER_TYPE_GRID &&
        css`
            height: 100%;
        `}

    ${(props) =>
        props.cardType === CARD_TYPE_TEAM_MEMBER &&
        css`
            cursor: default;
        `};
`;

const FolderPlusSign = styled.h5`
    margin-top: auto;
    min-width: 1.5rem;
    text-align: right;
`;

const FolderTitle = styled.h5`
    flex: 1 0;
`;

const CalendarCardDate = styled.p`
    font-size: 2.562rem;
    line-height: 2.25rem;
    font-weight: 600;
    color: ${(props) => props.theme.white};
`;

const CalendarCardPlace = styled(CalendarCardDate)`
    font-size: 1.312rem;
    line-height: 1.562rem;
`;

const CalendarCardLocation = styled(CalendarCardDate)`
    font-size: 1rem;
    line-height: 1.187rem;
    font-weight: 500;
`;

const PromoVideoTitle = styled.h5``;

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

const MiniRoundedCardTitle = styled.div`
    font-size: 1rem;
    line-height: 1.115rem;
    font-weight: 500;
`;

const MiniRoundedCardSubTitle = styled.div`
    display: inline;
    font-size: 0.687rem;
    line-height: 0.818rem;
    font-weight: 500;
    color: ${(props) => props.theme.darkGrey};
`;

const MiniRoundedCardSubTitleBold = styled(MiniRoundedCardSubTitle)`
    display: inline;
    font-weight: 700;
`;

const BusinessStatElement = styled.div`
    display: inline-block;
`;

const getBottomSection = (cardTheme) => {
    switch (cardTheme.cardType) {
        case CARD_TYPE_BUSINESS:
        case CARD_TYPE_VENDOR_GENERIC: {
            const { roles } = cardTheme
            const moreThanOneFamily = roles.length > 1                
            let businessRoles;

            if(moreThanOneFamily) {
                businessRoles = roles.map((role, index) => 
                    index < 2 && (
                        <BusinessRole
                            key={index}
                            separator={index === 0}
                            bgColor={role.bg_color}
                        >
                            { role.name }
                        </BusinessRole>
                    )                        
                )
            } else {
                let roleNames = getRolesStringFromBusiness(roles);
                businessRoles = 
                    <BusinessRole
                        bgColor={roles[0]?.bg_color}
                        familyType={roles[0]?.family}
                    >
                        { roleNames }
                    </BusinessRole>;
            }

            return <BusinessRoles>{businessRoles}</BusinessRoles>
        }
        case CARD_TYPE_VIDEO: {
            {
                if (cardTheme.orientation === CARD_ORIENTATION_PORTRAIT && cardTheme.vibes.length > 0) {
                    return (
                        <VideoCardTagsContainer>
                            <CardTags>
                                {cardTheme.vibes.map((data, index) => {
                                    return <CardTagContainer key={index}>{data}</CardTagContainer>;
                                })}
                            </CardTags>
                        </VideoCardTagsContainer>
                    );
                }
            }
        }
    }
};

const getCardDetails = (cardTheme) => {
    switch (cardTheme.cardType) {
        case CARD_TYPE_VIDEO:
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
                        {/* {cardTheme.orientation === CARD_ORIENTATION_LANDSCAPE && (
                            <>
                                <HorizontalSpacer space={10} />
                                <FeaturedLabel>Featured</FeaturedLabel>
                            </>
                        )} */}

                        {(cardTheme.views > LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD ||
                            cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD) && (
                            <VerticalSpacer space={'10'} />
                        )}
                    </CardStats>
                </>
            );
        case CARD_TYPE_BUSINESS:
            return (
                <>
                    <h5>{cardTheme.name}</h5>
                    <CardInformation>{cardTheme.location?.display_name || ''}</CardInformation>
                    <VerticalSpacer space={'10'} />
                    <CardStats>
                        {cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD && (
                            <BusinessStatElement>
                                {shortHandValue(cardTheme.likes)}{' '}
                                <span style={{ fontWeight: 'bold', fontSize: '0.973rem' }}>Likes</span>
                                <HorizontalSpacer space={10} />
                            </BusinessStatElement>
                        )}

                        {cardTheme.videos > LSTVGlobals.ACTION_BAR_VIDEO_COUNT_DISPLAY_THRESHOLD && (
                            <BusinessStatElement>
                                {shortHandValue(cardTheme.videos)}{' '}
                                <span style={{ fontWeight: 'bold', fontSize: '0.973rem' }}>Videos</span>
                            </BusinessStatElement>
                        )}

                        {cardTheme.subscribers > LSTVGlobals.ACTION_BAR_SUBSCRIBER_DISPLAY_THRESHOLD && (
                            <BusinessStatElement>
                                {shortHandValue(cardTheme.subscribers)}{' '}
                                <span style={{ fontWeight: 'bold' }}>Subscribers</span>
                                <HorizontalSpacer space={10} />
                            </BusinessStatElement>
                        )}
                    </CardStats>
                </>
            );
        case CARD_TYPE_BUSINESS_DETAILS:
            return (
                <>
                    <CardTitle>{cardTheme.title}</CardTitle>
                    <VerticalSpacer space={'10'} />
                </>
            );
        case CARD_TYPE_ARTICLE: {
            let tags = cardTheme.tags.map((data, index) => {
                return <CardTagContainer key={index}>{data}</CardTagContainer>;
            });

            return (
                <>
                    <CardTitle>
                        <h5>{cardTheme.title}</h5>
                    </CardTitle>
                    <VerticalSpacer space={'10'} />
                    <BlogCardPreview>{cardTheme.contentPreview}</BlogCardPreview>
                    <VerticalSpacer space={'10'} />
                    <CardStats>
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
                                <HorizontalSpacer space={10} />
                            </>
                        )}

                        {(cardTheme.views > LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD ||
                            cardTheme.likes > LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD) && (
                            <VerticalSpacer space={10} />
                        )}
                    </CardStats>
                    <CardTags>{tags}</CardTags>
                </>
            );
        }
        case CARD_TYPE_VIBE:
            return (
                <>
                    <h5>{cardTheme.name}</h5>
                    <CardStats>
                        {cardTheme.videos > LSTVGlobals.ACTION_BAR_VIDEO_COUNT_DISPLAY_THRESHOLD && (
                            <>
                                {shortHandValue(cardTheme.videos)}{' '}
                                <span style={{ fontWeight: 'bold', fontSize: '0.973rem' }}>Videos</span>
                            </>
                        )}
                    </CardStats>
                </>
            );
        case CARD_TYPE_WEDDING_VENDOR:
            return (
                <>
                    <Flex flexDirection={'row'} flexWrap={'no-wrap'} alignItems={'stretch'} height={'100%'} flex={'1'}>
                        <Flex flexDirection={'column'} alignItems={'stretch'} width={'100%'}>
                            {cardTheme.premium && (
                                <WeddingBusinessPremiumTag>
                                    Suggested
                                </WeddingBusinessPremiumTag>
                            )}
                            <VerticalSpacer space={5} />
                            <GenericContainer height={"100%"}>
                                <WeddingBusinessName>{cardTheme.name}</WeddingBusinessName>
                            </GenericContainer>
                            <VerticalSpacer space={10} />
                            <Flex
                                flexDirection={'row'}
                                flexWrap={'no-wrap'}
                                alignItems={'center'}
                                width={'100%'}
                                height={'60px'}
                            >
                                <Flex flexDirection={'column'}>
                                    <BusinessRoleName>{cardTheme.role_name}</BusinessRoleName>
                                </Flex>
                                <Flex flexDirection={'column'} minWidth={"35px"}>
                                    <Flex
                                        flex={'0 0 34px'}
                                        flexDirection={'column'}
                                        justifyItems={'flex-end'}
                                        justifyContent={'flex-end'}
                                    >
                                        <LSTVSVG
                                            imageWidth={'36px'}
                                            imageHeight={'36px'}
                                            icon={'wedding-business-arrow'}
                                        />
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </>
            );
        case CARD_TYPE_SHOPPING_ITEM:
            return (
                <>
                    <GenericContainer padding={'0 15px 0 15px'}>
                        <LineLimiter lines={2}>
                            <h5>{cardTheme.name}</h5>
                        </LineLimiter>
                        <VerticalSpacer space={8} />

                        <CardInformation>{cardTheme.soldBy}</CardInformation>
                        <VerticalSpacer space={4} />
                        <CardInformation>{cardTheme.description}</CardInformation>
                        <VerticalSpacer space={8} />
                        <Price>{cardTheme.price}</Price>
                        {cardTheme.priceWas && (
                            <>
                                <PriceWas>{cardTheme.priceWas}</PriceWas>{' '}
                                <DiscountLabel>{cardTheme.discountLabel || 'List Price'}</DiscountLabel>
                            </>
                        )}
                        <VerticalSpacer space={12} />
                    </GenericContainer>
                    <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                        <BaseCtaButton title={cardTheme.ctaLabel || 'Shop Now'} size="fullWidth" />
                    </MediaQuery>
                    <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                        <BaseCtaButton title={cardTheme.ctaLabel || 'Shop Now'} size="fullWidth" />
                    </MediaQuery>
                </>
            );
        case CARD_TYPE_TEAM_MEMBER:
            return (
                <>
                    <GenericContainer textAlign={'center'} padding={'10px 15px 0 15px'}>
                        <LineLimiter lines={2}>
                            <h5>{cardTheme.name}</h5>
                        </LineLimiter>
                        <VerticalSpacer space={4} />
                        <CardInformation>{cardTheme.title}</CardInformation>
                    </GenericContainer>
                </>
            );
        case CARD_TYPE_FOLDER:
            return (
                <Flex width={'100%'}>
                    <FolderTitle>{cardTheme.name}</FolderTitle>
                    {cardTheme.showPlusSign && <FolderPlusSign>+</FolderPlusSign>}
                </Flex>
            );
        case CARD_TYPE_CALENDAR_ITEM: {
            return (
                <>
                    <VerticalSpacer space={15} />
                    <Flex flexDirection={'row'} flexWrap={'no-wrap'} alignItems={'stretch'}>
                        <div style={{ padding: '0 0 0 24px' }}>
                            <CalendarCardDate>{cardTheme.date}</CalendarCardDate>
                            <VerticalSpacer space={30} />
                            <CalendarCardPlace>{cardTheme.place}</CalendarCardPlace>
                            <VerticalSpacer space={5} />
                            <CalendarCardLocation>{cardTheme.location}</CalendarCardLocation>
                            <VerticalSpacer space={16} />
                        </div>
                        <Flex
                            padding={'0 24px 0 0'}
                            flexDirection={'column'}
                            justifyItems={'flex-end'}
                            justifyContent={'flex-start'}
                        >
                            <LSTVSVG
                                flex="1"
                                imageWidth={'36px'}
                                imageHeight={'36px'}
                                icon={'wedding-business-arrow'}
                            />
                        </Flex>
                    </Flex>
                </>
            );
        }
        case CARD_TYPE_PROMO_VIDEO:
            return (
                <>
                    <PromoVideoTitle>{cardTheme.title}</PromoVideoTitle>
                </>
            );
        case CARD_TYPE_MINI_ROUND_IMAGE:
            return (
                <>
                    <MiniRoundedCardTitle>{cardTheme.title}</MiniRoundedCardTitle>
                    {cardTheme.subtitle && !cardTheme.count && !cardTheme.countLabel && (
                        <MiniRoundedCardSubTitle>{cardTheme.subtitle}</MiniRoundedCardSubTitle>
                    )}
                    {cardTheme.count && cardTheme.countLabel && (
                        <MiniRoundedCardSubTitle>
                            {shortHandValue(cardTheme.count)}{' '}
                            <MiniRoundedCardSubTitleBold>{cardTheme.countLabel}</MiniRoundedCardSubTitleBold>
                        </MiniRoundedCardSubTitle>
                    )}
                </>
            );
        case CARD_TYPE_VENDOR_GENERIC:
            return (
                <>
                    <h5>{cardTheme.name}</h5>
                    <CardInformation>{cardTheme.subTitle}</CardInformation>
                </>
            );
    }
};

const LSTVCard = (props) => {
    const [thumbnailUrl, setThumbnailUrl] = useState();

    useEffect(() => {
        if(props.data.thumbnailUrl) {
            setThumbnailUrl(props.data.thumbnailUrl)
        }
    }, [props.data])

    const cardTheme = { ...props.options, ...props.data };
    cardTheme.duration = cardTheme.duration ? <VideoDuration>{secsToTimeStr(cardTheme.duration)}</VideoDuration> : null;
    cardTheme.premium = cardTheme.premium ? <PremiumBadge>Suggested</PremiumBadge> : null;
    cardTheme.colorBar = cardTheme.colorBar ? (
        <ColorBar imageOnly={cardTheme.imageOnly} color={cardTheme.colorBar} />
    ) : null;

    let cardContent = (
        <ThemeProvider theme={cardTheme}>
            <CardOutline
                onMouseEnter={() => {
                    if (cardTheme.previewGIFUrl) setThumbnailUrl(cardTheme.previewGIFUrl);
                }}
                onMouseLeave={() => {
                    if (cardTheme.previewGIFUrl) setThumbnailUrl(cardTheme.thumbnailUrl);
                }}
            >
                <CardElements>
                    <SizeMe monitorWidth={true} monitorHeight={true}>
                        {({ size }) => (
                            <>
                                {cardTheme.cardType !== CARD_TYPE_WEDDING_VENDOR &&
                                    cardTheme.cardType !== CARD_TYPE_CALENDAR_ITEM && (
                                        <CardThumbnail size={size}>
                                            <LSTVImage url={thumbnailUrl} alt={cardTheme.thumbnailAlt} />
                                            {cardTheme.orientation === CARD_ORIENTATION_PORTRAIT && cardTheme.premium}
                                            {cardTheme.duration}
                                            {cardTheme.colorBar}
                                            {cardTheme.imageOnly && <GradientBackground />}
                                        </CardThumbnail>
                                    )}
                                <CardDetails size={size}>{getCardDetails(cardTheme)}</CardDetails>
                                {getBottomSection(cardTheme)}
                            </>
                        )}
                    </SizeMe>
                </CardElements>
            </CardOutline>
        </ThemeProvider>
    );

    // is clicking this card invoking a react-router route?
    if (cardTheme.cardSlug) {
        return (
            <LSTVLink noStyle to={`${cardTheme.cardSlug}`}>
                {cardContent}
            </LSTVLink>
        );
    } else if (cardTheme.clickHandler && cardTheme.clickHandler) {
        // or are we handling the card click?
        return (
            <ClickableCard
                containerMode={props.options.containerMode}
                cardType={cardTheme.cardType}
                onClick={() => {
                    cardTheme.clickHandler(cardTheme.cardId || 'card without cardId defined.');
                }}
            >
                {cardContent}
            </ClickableCard>
        );
    } else {
        throw `${cardTheme.cardType} card options must include either cardSlug, cardUrl or [clickHandler + cardId]`;
    }
};

LSTVCard.propTypes = {
    options: PropTypes.object,
    data: PropTypes.object,
};

export default LSTVCard;
