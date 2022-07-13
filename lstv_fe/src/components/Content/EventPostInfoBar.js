import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMapMarkerAlt } from '@fortawesome/pro-light-svg-icons';
import {
    FancySeparator,
    Flex,
    GenericContainer,
    generateLocationJSX,
    generateBusinessRoleJSX,
    generateVenueNameJSX,
    generateWeddingDateJSX,
    businessFromVideo,
    GetVideoShareOptions
} from '../../utils/LSTVUtils';
import { isMobileOnly, isMobile } from 'react-device-detect';
import ContentActionBar from '../Utility/ContentActionBar';
import { withRouter } from 'react-router';
import MediaQuery from 'react-responsive/src/Component';
import InlineLabelAndContent from '../Utility/InlineLabelAndContent';
import Button, { ButtonImageRound } from '../Utility/Button';
import DateBadge from '../Utility/DateBadge';
import ModalContainer from '../Utility/ModalContainer';
import ContactBusinessForm from '../Forms/ContactBusinessForm';
import BrideGroomContactForm from '../Forms/BrideGroomContactForm';
import LSTVLink from '../Utility/LSTVLink';

const EventPostInfoBarContainer = styled.div`
    display: inline;
    position: relative;

    ${(props) =>
        props.background &&
        css`
            //background-image: ${LSTVGlobals.DIAGONAL_BACKGROUND};
        `};

    width: 100%;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        padding-bottom: 5px;
        padding-left: 2px;
    }
`;

const InfoContainer = styled(GenericContainer)`
    display: inline;
    flex-wrap: ${(props) => (props.mobile ? 'nowrap' : 'wrap')};
    flex-direction: ${(props) => (props.mobile ? 'column' : 'row')};
    flex: 1 1 auto;
    flex-wrap: wrap;
    justify-content: start;
    align-items: ${(props) => (props.mobile ? 'stretch' : 'center')};
    word-break: break-word;
    order: 1;
    font-size: 1.3rem;
    line-height: 1.1rem;
    
    ${(props) =>
        props.embedded &&
        css`
            font-size: 3.2vw;
            line-height: 3.2vw;

            @media ${LSTVGlobals.UserDevice.isMobile} {
                font-size: 5.2vw;
                line-height: 5.2vw;
            }
        `}

    ${(props) =>
        props.embeddedWidth &&
        props.embeddedWidth < 300 &&
        css`
            font-size: 16px;
            line-height: 16px;
        `}

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        max-width: 100%;;
        margin-top: 2px;
        padding-left: 2px;
        padding-right: 2px;
        
        ${(props) =>
            props.loveStoryExists &&
            !props.embedded &&
            css`
                border-bottom: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
            `}
            
            
    }
    
     @media ${LSTVGlobals.UserDevice.isMobile} {
         margin: 0;
         border: 0;
         padding: 0;
         //border-bottom: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
         padding-bottom: 2px;
     }
     
     @media ${LSTVGlobals.UserDevice.isTablet} {
        padding-bottom: 5px;   
     }
`;

const EventPostItem = styled.div`
    display: inline;
    position: relative;
    padding: ${(props) => (props.inlineMode ? '3px 0 3px 0' : '3px 0 3px 0')};
    font-weight: ${(props) => (props.bold ? LSTVGlobals.FONT_WEIGHT_BOLD : LSTVGlobals.FONT_WEIGHT_NORMAL)};

    img {
        width: 20px;
        height: 30px;
    }
  
    ${(props) =>
        props.embedded &&
        css`
            padding: 0 3px 0 0;
        `}
    
`;

export const ContactAction = styled.div`
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    position: relative;
    color: ${LSTVGlobals.TEXT_AND_SVG_LIGHTER_BLACK};
    padding: 2px 10px 2px 10px;
    border: 1px solid ${LSTVGlobals.TEXT_AND_SVG_LIGHTER_BLACK};
    border-radius: 10px;
    transition: all ${LSTVGlobals.SUPER_FAST_EASE_OUT_ANIM};
    cursor: pointer;
    height: ${(props) => props.height || 'auto'};

    &:hover {
        color: ${LSTVGlobals.PRIMARY_COLOR};
        border: 1px solid ${LSTVGlobals.PRIMARY_COLOR};
    }

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        padding: 2x 5px 2px 5px;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        //float: right;
    }
`;

const PostInfoBarDateBadgeContainer = styled.div`
    position: absolute;
    top: 3px;
    left: 4px;
    width: 50px;
    height: 45px;
    background: yellow;
`;

class EventPostInfoBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            postProperties: props.postProperties,
            video: props.video,
            contactFilmmakerOpen: false,
            contactVenueOpen: false,
            contactBrideGroomOpen: false,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.video.id !== prevProps.video.id) {
            ////console.log("new properties for info bar!!!!");
            this.setState({
                postProperties: this.props.postProperties,
                video: this.props.video,
            });
        }
    }

    componentDidMount() {}

    activateContactModal = (stateElementName) => {
        let open = this.state[stateElementName];

        this.setState({
            ...this.state,
            [stateElementName]: !open,
        });
    };

    onContactModalClosed = (stateElementName) => {
        this.setState({
            ...this.state,
            [stateElementName]: false,
        });
    };

    render() {
        let videographerName = generateBusinessRoleJSX(
            this.state.video.businesses,
            'videographer',
            LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
            '1em',
            null,
            'inline-block',
            null,
            true,
            this.props.embedded
        );

        let coupleNames = this.state.postProperties['spouse_1'] + ' & ' + this.state.postProperties['spouse_2'];

        let eventDate = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                <InlineLabelAndContent embedded={this.props.embedded}>
                    {generateWeddingDateJSX(
                        this.state.video.event_date,
                        LSTVGlobals.FONT_WEIGHT_NORMAL,
                        'inherit',
                        null,
                        this.props.embedded
                    )}
                </InlineLabelAndContent>
            </EventPostItem>
        );

        let eventDateMobile = <DateBadge dateStr={this.state.video.event_date} />;

        let couple = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly} bold={true}>
                {!this.props.embedded && !this.props.linkToVideo ? (
                    coupleNames
                ) : (
                    <LSTVLink
                        to={this.props.embedded ? this.props.directLink : this.props.slug}
                    >{coupleNames}</LSTVLink>
                )}
            </EventPostItem>
        );

        let coupleMobile = coupleNames;

        let venue = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                {(!isMobileOnly || this.props.embedded) && (
                    <React.Fragment>
                        <FontAwesomeIcon className="fa" icon={faMapMarkerAlt} />
                        &nbsp;
                    </React.Fragment>
                )}
                {generateVenueNameJSX(
                    this.state.video.businesses,
                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                    '1em',
                    null,
                    'inline',
                    this.props.embedded
                )}
            </EventPostItem>
        );

        let venueLocation = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                {generateLocationJSX(
                    this.state.video.location,
                    LSTVGlobals.FONT_WEIGHT_NORMAL,
                    '1em',
                    null,
                    'inline',
                    'in',
                    this.props.embedded
                )}
            </EventPostItem>
        );

        let venueAndLocation = (
            <EventPostItem embedded={this.props.embedded}>
                {generateVenueNameJSX(
                    this.state.video.businesses,
                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                    '1em',
                    null,
                    'inline',
                    this.props.embedded
                )}
                <br />
                {generateLocationJSX(
                    this.state.video.location,
                    LSTVGlobals.FONT_WEIGHT_NORMAL,
                    '1em',
                    null,
                    'inline',
                    null,
                    this.props.embeded
                )}
            </EventPostItem>
        );

        let videographer = (
            <EventPostItem embedded={this.props.embedded} className={'videographer'} inlineMode={isMobileOnly}>
                {generateBusinessRoleJSX(
                    this.state.video.businesses,
                    'videographer',
                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                    '1em',
                    null,
                    'inline',
                    'by',
                    false,
                    this.props.embedded
                )}
            </EventPostItem>
        );

        let contactVenue = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                    <ContactAction
                        onClick={() => {
                            this.activateContactModal('contactVenueOpen');
                        }}
                        data-for="mainTooltip"
                        data-tip={'Contact This Venue'}
                    >
                        CONTACT
                    </ContactAction>
                </MediaQuery>
                <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                    <Button
                        onClick={() => {
                            this.activateContactModal('contactVenueOpen');
                        }}
                        style={ButtonImageRound}
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </Button>
                </MediaQuery>
            </EventPostItem>
        );

        let contactCouple = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                    <ContactAction
                        onClick={() => {
                            this.activateContactModal('contactBrideGroomOpen');
                        }}
                        data-for="mainTooltip"
                        data-tip={'Message The Bride & Groom'}
                    >
                        MESSAGE
                    </ContactAction>
                </MediaQuery>
                <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                    <Button
                        onClick={() => {
                            this.activateContactModal('contactBrideGroomOpen');
                        }}
                        style={ButtonImageRound}
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </Button>
                </MediaQuery>
            </EventPostItem>
        );

        let contactVideographer = (
            <EventPostItem embedded={this.props.embedded} inlineMode={true}>
                <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                    <ContactAction
                        onClick={() => {
                            this.activateContactModal('contactFilmmakerOpen');
                        }}
                        data-for="mainTooltip"
                        data-tip={'Contact This Filmmaker'}
                    >
                        CONTACT
                    </ContactAction>
                </MediaQuery>
                <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                    <Button
                        onClick={() => {
                            this.activateContactModal('contactFilmmakerOpen');
                        }}
                        style={ButtonImageRound}
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </Button>
                </MediaQuery>
            </EventPostItem>
        );

        let embeddedFontSize = isMobileOnly
            ? this.props.embedded
                ? '4vw'
                : '1em'
            : this.props.embedded
            ? '2.8vw'
            : '1em';

        if (this.props.embeddedSize) {
            if (this.props.embeddedSize.width < 300) embeddedFontSize = '16px';
        }

        let actionBar = (
            <EventPostItem embedded={this.props.embedded} inlineMode={isMobileOnly}>
                <ContentActionBar
                    embedded={this.props.embedded}
                    embeddedWidth={this.props.embeddedSize ? this.props.embeddedSize.width : 0}
                    ownerType={LSTVGlobals.ACTION_BAR_OWNER_TYPE_VIDEO}
                    ownerId={this.state.video.id}
                    useShorthand={true}
                    showLikeToggle={true}
                    likeAnimStyle={isMobileOnly ? 'mobile-card-heart' : 'standard'}
                    fontSize={embeddedFontSize}
                    separatorColor={LSTVGlobals.CARD_MOBILE_ACTION_BAR_ELEMENT_COLOR}
                    iconWidth={'inherit'}
                    likeShowThreshold={LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD}
                    likeCount={this.state.video.likes}
                    showLikeCount={true}
                    showLikeAppendix={false}
                    showViewCount={true}
                    viewCount={this.state.video.views}
                    viewShowThreshold={LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD}
                    showViewsAppendix={true}
                    showShareAction={!this.props.embedded}
                    shareOptions={GetVideoShareOptions({
                        shortUrlToken: this.state.video.short_url_token,
                        coupleNames: coupleNames,
                        shareThumbnailUrl: this.state.video.videos[0].thumbnail_url
                    })}

                    shareCount={this.state.video.shares}
                    showShareCount={!this.props.embedded}
                    showSharesAppendix={false}
                    shareShowThreshold={LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD}
                    justifyContent={'center'}
                />
            </EventPostItem>
        );

        return (
            <EventPostInfoBarContainer {...this.props}>
                {!this.props.embedded && (
                    <ModalContainer
                        id={'videographer-contact'}
                        open={this.state.contactFilmmakerOpen}
                        closeHandler={() => {
                            this.onContactModalClosed('contactFilmmakerOpen');
                        }}
                        modalTitle={'Contact ' + videographerName}
                    >
                        <ContactBusinessForm
                            id={'videographer-contact-form'}
                            business={businessFromVideo(this.state.video.businesses, 'videographer')}
                            video_id={this.state.video.id}
                            contactFrom={window.location.pathname}
                            message={
                                `I watched ${coupleNames}'s wedding video on Love Stories TV, in which you are tagged as ` +
                                `the videographer. I'm impressed and would like to inquire about your services for my ` +
                                `upcoming wedding.`
                            }
                        />
                    </ModalContainer>
                )}

                {!this.props.embedded && (
                    <ModalContainer
                        id={'venue-contact'}
                        open={this.state.contactVenueOpen}
                        closeHandler={() => {
                            this.onContactModalClosed('contactVenueOpen');
                        }}
                        modalTitle={'Contact ' + businessFromVideo(this.state.video.businesses, 'venue').name}
                    >
                        <ContactBusinessForm
                            id={'venue-contact-form'}
                            business={businessFromVideo(this.state.video.businesses, 'venue')}
                            video_id={this.state.video.id}
                            contactFrom={window.location.pathname}
                            message={
                                `I watched ${coupleNames}'s wedding video on Love Stories TV held at your wedding venue. ` +
                                `I'm impressed and would like to inquire about your services for my ` +
                                `upcoming wedding.`
                            }
                        />
                    </ModalContainer>
                )}


                {(!isMobileOnly || this.props.embedded) && (
                    <InfoContainer
                        {...this.props}
                        embedded={this.props.embedded}
                        embeddedWidth={this.props.embeddedSize ? this.props.embeddedSize.width : 0}
                        mobile={false}
                        loveStoryExists={this.state.video.content.length > 10}
                    >
                        {eventDate}
                        &nbsp;{couple}
                        {!this.props.embedded && this.props.contactCouple && (
                            <React.Fragment>&nbsp;{contactCouple}</React.Fragment>
                        )}
                        &nbsp;{venue}
                        {!this.props.embedded && <React.Fragment>&nbsp;{contactVenue}</React.Fragment>}
                        &nbsp;{venueLocation}
                        &nbsp;{videographer}
                        {!this.props.embedded && <React.Fragment>&nbsp;{contactVideographer}</React.Fragment>}
                        &nbsp;&nbsp;
                        <GenericContainer padding={'0 0 0 0'}>{actionBar}</GenericContainer>
                    </InfoContainer>
                )}

                {!this.props.embedded && (
                    <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                        <InfoContainer mobile={false} loveStoryExists={this.state.video.content.length > 10}>
                            <PostInfoBarDateBadgeContainer>{eventDateMobile}</PostInfoBarDateBadgeContainer>

                            <Flex
                                width={'100%'}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                flexWrap={'nowrap'}
                            >
                                <Flex
                                    fontWeight={LSTVGlobals.FONT_WEIGHT_SEMIBOLD}
                                    lineHeight="1.5rem"
                                    fontSize="1.5rem"
                                    flex={'1'}
                                >
                                    <GenericContainer padding={'0 0 0 60px'}>{coupleMobile}</GenericContainer>
                                </Flex>

                                <Flex justifyContent={'flex-end'} flex={'0  0 40px'}>
                                    {contactCouple}
                                </Flex>
                            </Flex>

                            <FancySeparator margin={'5px 0 5px 0'} />

                            <Flex
                                width={'100%'}
                                alignItems={'center'}
                                padding="0"
                                justifyContent={'space-between'}
                                flexWrap={'nowrap'}
                            >
                                <Flex
                                    display={'inline-flex'}
                                    flexWrap={'wrap'}
                                    lineHeight="1.5rem"
                                    fontSize="1.5rem"
                                    justifyContent={'flex-start'}
                                    flex={'1'}
                                >
                                    <GenericContainer padding={'0 0 0 7px'}>{venueAndLocation}</GenericContainer>
                                </Flex>

                                <Flex justifyContent={'flex-end'} flex={'0  0 40px'}>
                                    {contactVenue}
                                </Flex>
                            </Flex>

                            <FancySeparator margin={'5px 0 5px 0'} />

                            <Flex
                                width={'100%'}
                                alignItems={'center'}
                                padding="0"
                                justifyContent={'space-between'}
                                flexWrap={'nowrap'}
                            >
                                <Flex
                                    display={'inline-flex'}
                                    lineHeight="1.5rem"
                                    fontSize="1.5rem"
                                    justifyContent={'flex-start'}
                                    flex={'1'}
                                >
                                    <GenericContainer padding={'0 0 0 5px'}>{videographer}</GenericContainer>
                                </Flex>

                                <Flex justifyContent={'flex-end'} flex={'0  0 40px'}>
                                    {contactVideographer}
                                </Flex>
                            </Flex>

                            <FancySeparator margin={'5px 0 5px 0'} />

                            <Flex
                                width={'100%'}
                                alignItems={'center'}
                                padding="0"
                                justifyContent={'space-between'}
                                flexWrap={'nowrap'}
                            >
                                <Flex
                                    display={'inline-flex'}
                                    lineHeight="1.5rem"
                                    fontSize="1.5rem"
                                    justifyContent={'center'}
                                    flex={'1'}
                                >
                                    <GenericContainer padding={'0 14px 0 0'}>{actionBar}</GenericContainer>
                                </Flex>
                            </Flex>

                            <FancySeparator margin={'5px 0 5px 0'} />
                        </InfoContainer>
                    </MediaQuery>
                )}
            </EventPostInfoBarContainer>
        );
    }
}

EventPostInfoBar.defaultProps = {
    embedded: false,
    contactCouple: true,
    background: true,
    linkToVideo: false,
    slug: null,
};

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        // 	data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EventPostInfoBar));
