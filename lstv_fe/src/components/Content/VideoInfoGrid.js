import React, { useStatey } from 'react';
import * as LSTVGlobals from '../../global/globals';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { ContactBrideAndGroomButton, ContactBusinessButton } from '../Forms/LSTVInlineContactButtons';
import {
    FancySeparator,
    Flex,
    generateLocationJSX,
    generateBusinessRoleJSX,
    generateVenueNameJSX,
    GetVideoShareOptions,
    businessFromVideo,
} from '../../utils/LSTVUtils';
import { isMobileOnly, isMobile } from 'react-device-detect';
import ContentActionBar from '../Utility/ContentActionBar';
import InfoBar, { InfoNumWithAppendix, InfoPlaceHolder } from '../Utility/InfoBar';
import Button, { ButtonBaseStyle } from '../Utility/Button';
import { Link } from 'react-router-dom';
import LSTVLink from '../Utility/LSTVLink';

const VideoGridStyle = styled.div`
    width: 100%;
    display: grid;
    grid-gap: 3px;
    grid-template-columns: 1fr ${(props) => (props.embedded ? '0px' : '60px')};
`;

const GridItem = styled.div`
    align-items: center;
    font-size: ${(props) => props.fontSize || '1.2em'};
    line-height: ${(props) => props.LineHeight || '1.5em'};
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    font-weight: ${(props) => props.fontWeight};
    text-align: ${(props) => props.textAlign || 'left'};
`;

const VideoInfoGrid = (props) => {
    let coupleNames = props.postProperties['spouse_1'] + ' & ' + props.postProperties['spouse_2'];
    let history = useHistory();

    const flexLink = {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        height: '100%',
        lineHeight: isMobile ? '2.0rem' : '2.3rem',
    };

    return (
        <VideoGridStyle embedded={props.embedded}>
            <GridItem fontWeight={LSTVGlobals.FONT_WEIGHT_BLACK} fontSize={isMobile ? '1.1rem' : '1.3rem'}>
                <Flex lineHeight={isMobile ? '2.0rem' : '2.3rem'} alignItems={'center'} justifyContent={'flex-start'}>
                    {!props.embedded && (
                        <React.Fragment>
                            {coupleNames.toUpperCase()}

                            {props.withWatchLink && (
                                <Link to={props.directLink} style={flexLink}>
                                    <Button
                                        style={{
                                            ...ButtonBaseStyle,
                                            background: LSTVGlobals.TEXT_AND_SVG_BLACK,
                                            color: LSTVGlobals.ABSOLUTE_WHITE,
                                            fontSize: '0.8rem',
                                            fontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
                                            textAlign: 'center',
                                            margin: '0 0 0 20px',
                                            padding: '3px 8px 3px 8px',
                                            minWidth: '80px',
                                        }}
                                    >
                                        WATCH
                                    </Button>
                                </Link>
                            )}
                        </React.Fragment>
                    )}
                    {props.embedded && <LSTVLink to={props.directLink}>{coupleNames.toLocaleUpperCase()}</LSTVLink>}
                </Flex>
                <FancySeparator noMargin />
            </GridItem>
            <GridItem textAlign={'right'}>
                {!props.embedded && props.contactCouple && (
                    <Flex height={'100%'} width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                        <ContactBrideAndGroomButton
                            id={'bride-groom-contact'}
                            coupleNames={coupleNames}
                            contactFrom={window.location.pathname}
                            message={`I watched your wedding video and I wanted to ask...`}
                            tooltip={'Message The Bride & Groom'}
                        />
                    </Flex>
                )}
            </GridItem>

            <GridItem fontSize={isMobileOnly ? '1.0' : '1.2rem'}>
                by{' '}
                {generateBusinessRoleJSX(
                    props.video.businesses,
                    'videographer',
                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                    '1em',
                    null,
                    'inline',
                    null,
                    false,
                    props.embedded
                )}
                <FancySeparator margin={'5px 0 0 0'} />
            </GridItem>
            <GridItem textAlign={'right'}>
                {!props.embedded && props.contactBusinesses && (
                    <Flex height={'100%'} width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                        <ContactBusinessButton
                            id={'videographer-contact'}
                            business={businessFromVideo(props.video.businesses, 'videographer')}
                            videoId={props.video.id}
                            tooltip={'Contact The Videographer'}
                            title={'Contact ' + businessFromVideo(props.video.businesses, 'videographer').name}
                            message={
                                `I watched ${coupleNames}'s wedding video on Love Stories TV, in which you are tagged as ` +
                                `the videographer. I'm impressed and would like to inquire about your services for my ` +
                                `upcoming wedding.`
                            }
                        />
                    </Flex>
                )}
            </GridItem>

            <GridItem fontSize={isMobileOnly ? '1.0' : '1.2rem'}>
                at{' '}
                {generateVenueNameJSX(
                    props.video.businesses,
                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                    isMobileOnly ? '1.0rem' : '1.2rem',
                    null,
                    'inline',
                    props.embedded
                )}{' '}
                {generateLocationJSX(
                    props.video.location,
                    LSTVGlobals.FONT_WEIGHT_NORMAL,
                    isMobileOnly ? '1rem' : '1.2rem',
                    null,
                    'inline',
                    'in',
                    props.embedded
                )}
                <FancySeparator margin={'5px 0 0 0'} />
            </GridItem>
            <GridItem textAlign={'right'}>
                {!props.embedded && props.contactBusinesses && (
                    <Flex height={'100%'} width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                        <ContactBusinessButton
                            id={'venue-contact'}
                            business={businessFromVideo(props.video.businesses, 'venue')}
                            videoId={props.video.id}
                            tooltip={'Contact The Wedding Venue'}
                            title={'Contact ' + businessFromVideo(props.video.businesses, 'venue').name}
                            message={
                                `I watched ${coupleNames}'s wedding video on Love Stories TV held at your wedding venue. ` +
                                `I'm impressed and would like to inquire about your services for my ` +
                                `upcoming wedding.`
                            }
                        />
                    </Flex>
                )}
            </GridItem>
            <GridItem fontSize={isMobileOnly ? '1.0' : '1.2rem'}>
                <InfoBar fontSize={isMobileOnly ? '1.0rem' : '1.2rem'} textColor={LSTVGlobals.TEXT_AND_SVG_BLACK}>
                    {props.video.views >= LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD && (
                        <InfoNumWithAppendix appendixStr={'views'} count={props.video.views} />
                    )}

                    {props.video.likes >= LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD && (
                        <InfoNumWithAppendix appendixStr={'likes'} count={props.video.likes} />
                    )}

                    {props.video.shares >= LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD && (
                        <InfoNumWithAppendix appendixStr={'shares'} count={props.video.shares} />
                    )}

                    {!props.embedded &&
                        props.video.views < LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD &&
                        props.video.likes < LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD &&
                        props.video.shares < LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD && <InfoPlaceHolder />}
                </InfoBar>

                {props.embedded &&
                    (props.video.views >= LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD ||
                        props.video.likes >= LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD ||
                        props.video.shares >= LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD) && (
                        <FancySeparator margin={'10px 0 0 0'} />
                    )}
            </GridItem>
            <GridItem>
                {!props.embedded && (
                    <Flex height={'100%'} width={'100%'} alignItems={'center'}>
                        <ContentActionBar
                            embedded={props.embedded}
                            embeddedWidth={props.embeddedSize ? props.embeddedSize.width : 0}
                            ownerType={LSTVGlobals.ACTION_BAR_OWNER_TYPE_VIDEO}
                            ownerId={props.video.id}
                            useShorthand={true}
                            showLikeToggle={true}
                            likeAnimStyle={isMobileOnly ? 'mobile-card-heart' : 'standard'}
                            fontSize={'1.2em'}
                            separatorColor={LSTVGlobals.CARD_MOBILE_ACTION_BAR_ELEMENT_COLOR}
                            iconWidth={'inherit'}
                            likeShowThreshold={LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD}
                            likeCount={props.video.likes}
                            showLikeCount={false}
                            showLikeAppendix={false}
                            showViewCount={false}
                            viewCount={props.videoviews}
                            viewShowThreshold={LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD}
                            showViewsAppendix={true}
                            showShareAction={!props.embedded}
                            shareOptions={GetVideoShareOptions({
                                shortUrlToken: props.video.short_url_token,
                                coupleNames: coupleNames,
                                shareThumbnailUrl: props.video.videos[0].thumbnail_url,
                            })}
                            shareCount={props.video.shares}
                            showShareCount={false}
                            showSharesAppendix={false}
                            shareShowThreshold={LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD}
                            justifyContent={'center'}
                        />
                    </Flex>
                )}
            </GridItem>
        </VideoGridStyle>
    );
};

export default VideoInfoGrid;
