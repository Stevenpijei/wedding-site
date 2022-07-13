import React from 'react';
import Header from '../Header';
import PageContent from '../Pages/PageContent';
import { connect } from 'react-redux';
import { Router, withRouter } from 'react-router';
import MainContent from '../Pages/PageSupport/MainContent';
import { Helmet } from 'react-helmet';
import * as LSTVGlobals from '../../global/globals';
import MediaQuery from 'react-responsive';
import styled, { css } from 'styled-components';
import Ticker from 'react-ticker';
import VideoPlayer from '../Video/VideoPlayer';
import BusinessRoleGrid from './BusinessRoleGrid';
import {
    FancySeparator,
    GenericContainer,
    generateBusinessRoleJSX,
    getFilmmakerFromBusinesses,
    coupleDisplayNamesFromVideo,
    generateLocationJSX,
    MobilePageContent,
    businessFromVideo,
    VerticalSpacer,
    GetVideoShareOptions,
    Flex,
    Spacer,
    FancySeparatorVertical, getDeviceImageUrl,
} from '../../utils/LSTVUtils';
import GoogleAd from '../Pages/PageSupport/GoogleAd';
import EventPostInfoBar, { ContactAction } from './EventPostInfoBar';
import { SVGIcon } from '../Utility/SVGIcons';
import TagCloud, { TAG_CLOUD_MODE_BADGE, TAG_CLOUD_MODE_TICKET } from '../Utility/TagCloud';
import slugify from 'slugify';
import ContentGrid from './ContentGrid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEnvelope, faSquareFull } from '@fortawesome/pro-light-svg-icons';
import LoveStory, { LoveStoryContainer } from './LoveStory';
import { isMobileOnly, isMobile, isTablet } from 'react-device-detect';
import InlineLabelAndContent from '../Utility/InlineLabelAndContent';
import ReactTooltip from 'react-tooltip';
import Button, { ButtonBaseStyle, ButtonImageRound } from '../Utility/Button';
import Overlay from '../Pages/PageSupport/Overlay';
import ContactBusinessForm from '../Forms/ContactBusinessForm';
import * as RestAPI from '../../rest-api/Call';
import {
    SectionHeader,
    HighriseAdContainer,
    LoveClubIconContainer,
    Content,
    ContentLeft,
    ContentRight,
    ContentRightInner,
} from '../Utility/PageUtils';
import LSTVVideoInfoBar from './LSTVVideoInfoBar';
import { ContactBusinessButton } from '../Forms/LSTVInlineContactButtons';
import InfoBar, { InfoNumWithAppendix } from '../Utility/InfoBar';
import ContentActionBar from '../Utility/ContentActionBar';
import { faCircle, faSquare } from '@fortawesome/pro-solid-svg-icons';
import VideoInfoGrid from './VideoInfoGrid';
import DateBadge from '../Utility/DateBadge';
import Footer from '../Utility/Footer';
import eventNames from "@u-wave/react-vimeo/src/eventNames";

const StoryTicker = styled.div`
    font-size: 2rem !important;
    text-transform: uppercase;
    padding: 10px;
    width: 100%;
    text-align: center;
    font-size: 1.2rem;
    height: 20px;
    line-height: 20px;
    color: white;
    padding-right: 200px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1rem !important;
    }
`;

const VideoPageBottomSection = styled.div`
    display: ${(props) => props.display || 'flex'};
    justify-content: ${(props) => props.justifyContent || 'space-between'};
    width: 100%;
    @media ${LSTVGlobals.UserDevice.notTablet} {
        margin-top: 15px;
    }
    font-size: 1.2rem;
    line-height: 1.4rem;
`;

const LoveClubContainer = styled.div`
    background: ${LSTVGlobals.VIDEO_POST_LC_VENDORS_BG};
    position: relative;
    margin: 15px 0 0 0;
    border-radius: 20px;
    padding-top: 10px;
    width: 100%;
    margin: 0 auto 10px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        border-radius: 0px;
    }
`;

const ContentGridContainer = styled.div`
    margin-top: 20px;
`;

const TeamVibeBinder = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    //border-top: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
    padding-bottom: 5px;
`;

const TeamVibeBinderTeam = styled.div`
    flex: 1 0 100%;
    display: block;
    border-right: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
    padding-right: 5px;
    padding-left: 5px;
    border-bottom: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
    padding-bottom: 5px;
`;

class VideoPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            postId: props.data.post.id,
            postTitle: props.data.post.title,
            postType: props.data.post.type,
            numVideos: props.data.post.videos.length,
            videos: props.data.post.videos,
            postProperties: props.data.post.properties,
            location: props.data.post.locations,
            currentVideo: 0,
            upNextSlide: null,
            upNextLoaded: false,
            videoAlmostDone: false,
            loveStoryTickerActive: false,
            moreFromFilmmakerReady: false,
            contactPhotographerOpen: false,
            vibes: props.data.post.videos[0].vibes.filter((data) => {
                return slugify(data.type) !== 'LSTV-Editorial' && slugify(data.type) !== 'Awards';
            }),
            awards: props.data.post.videos[0].vibes.filter((data) => {
                return slugify(data.type) === 'LSTV-Editorial' || slugify(data.type) === 'Awards';
            }),
        };

        // mockup

        let t1 = {
            name: '10k Views (Awarded March 2019)',
            weight: 50,
            slug: '10k-views',
            type: 'Awards',
        };

        let t2 = {
            name: '2019 Most Liked Video',
            weight: 50,
            slug: 'most-liked-video-2019',
            type: 'Awards',
        };

        let t3 = {
            name: '2018 Wedding Film Awards Winner, Film Of The Year',
            weight: 50,
            slug: '2018-wedding-film-awards-winner-film-of-the-year',
            type: 'Awards',
        };

        let t4 = {
            name: '2019 Wedding Film Awards Nominee, Filmmaker Of The Year',
            weight: 50,
            slug: '2019-wedding-film-awards-nominee-filmmaker-of-the-year',
            type: 'Awards',
        };

        let t5 = {
            name: 'Home Page Featured (2019)',
            weight: 50,
            slug: 'home-page-featured-2019',
            type: 'Awards',
        };

        this.state.awards.push(t1);
        this.state.awards.push(t2);
        this.state.awards.push(t3);
        this.state.awards.push(t4);
        this.state.awards.push(t5);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.data.post.id !== prevProps.data.post.id) {
            this.setState({
                postId: this.props.data.post.id,
                postTitle: this.props.data.post.title,
                postType: this.props.data.post.type,
                numVideos: this.props.data.post.videos.length,
                videos: this.props.data.post.videos,
                postProperties: this.props.data.post.properties,
                location: this.props.data.post.locations,
                upNextSlide: null,
                upNextLoaded: false,
                currentVideo: 0,
                videoAlmostDone: false,
                loveStoryTickerActive: false,

                vibes: this.props.data.post.videos[0].vibes.filter((data) => {
                    return slugify(data.type) !== 'LSTV-Editorial' && slugify(data.type) !== 'Awards';
                }),
                awards: this.props.data.post.videos[0].vibes.filter((data) => {
                    return slugify(data.type) === 'LSTV-Editorial' || slugify(data.type) === 'Awards';
                }),
            });
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }

        if (!isMobileOnly) ReactTooltip.rebuild();
    }

    componentDidMount() {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }


    onVideoPlay = () => {
        this.setState({
            ...this.state,
            loveStoryTickerActive: true,
        });
    };

    onMoreFilmmakerDataReady = (data) => {
        ////console.log("onMoreFilmmakerDataReady: " + data.length);

        if (data?.length > 0)
            this.setState({
                ...this.state,
                moreFromFilmmakerReady: true,
            });
    };

    onVideoComplete = () => {
        if (this.state.upNextSlide && this.state.upNextLoaded && this.state.upNextSlide.post_slug) {
            this.props.history.push(this.state.upNextSlide.post_slug);
        }
    };

    onPercentageComplete = (percentage, played, duration) => {
        ////console.log(`completed ${percentage}% of the video (played ${played}/${duration} seconds)`);

        if (percentage > 50 && !this.state.upNextLoaded) {
            // load up the next video

            this.setState(
                {
                    ...this.state,
                    upNextLoaded: true,
                },
                () => {
                    RestAPI.call(
                        'get',
                        null,
                        RestAPI.LSTV_API_V1.GET_EVENT_STORY,
                        (data) => {
                            if (data.result) {
                                this.setState({
                                    ...this.state,
                                    upNextLoaded: true,
                                    upNextSlide: {
                                        active: false,
                                        title: coupleDisplayNamesFromVideo(data.result.post_properties),
                                        location: generateLocationJSX(
                                            data.result.location,
                                            LSTVGlobals.FONT_WEIGHT_NORMAL,
                                            '1rem',
                                            null,
                                            'inline-block',
                                            null,
                                            false,
                                            true
                                        ),
                                        post_slug: data.result.post_slug,
                                        thumbnail_url: data.result.videos[0].thumbnail_url,
                                    },
                                });
                            }
                        },
                        (error) => {},
                        (attempt_num) => {},
                        { auto_select: 'random' },
                        '',
                        false
                    ).then((cancelToken) => {
                        this._cancelToken = cancelToken;
                    });
                }
            );
        }

        this.setState({
            ...this.state,
            upNextSlide: {
                ...this.state.upNextSlide,
                active: played >= duration - 10,
            },
        });
    };

    render() {
        // TODO: support a case where zero event stories exist, or an event story without active videos...

        let video = this.state.videos[this.state.currentVideo];

        const numLCBusinesses = video.businesses.filter((data) => data.premium).length;

        const filmmaker = getFilmmakerFromBusinesses(video.businesses);

        const videoPlayer = (
            <VideoPlayer
                isAutoPlay={true}
                onPercentageComplete={this.onPercentageComplete}
                onVideoComplete={this.onVideoComplete}
                video={video}
                upNextSlide={this.state.upNextSlide}
            />
        );


        const infoBar2 = (
            <React.Fragment>
                <Flex background={isMobile ? LSTVGlobals.ABSOLUTE_WHITE : 'none'} padding={'10px 10px 0 10px'}>
                    <Flex width={'100%'} flex={'1'} justifyContent={'flex-start'}>
                        <DateBadge
                            width={isMobileOnly ? '40px' : '60px'}
                            height={isMobileOnly ? '40px' : '60px'}
                            monthFontSize={isMobileOnly ? '0.9rem' : '1.2rem'}
                            yearFontSize={isMobileOnly ? '0.9rem' : '1.4rem'}
                            dateStr={video.event_date}
                        />
                        <Spacer width={'10px'} />
                        <GenericContainer width={'100%'}>
                            <VideoInfoGrid
                                contactCouple={true}
                                contactBusinesses={true}
                                embedded={this.props.emedded}
                                video={video}
                                postProperties={this.state.postProperties}
                            />
                        </GenericContainer>
                    </Flex>
                </Flex>
            </React.Fragment>
        );

        const loveStory =
            video.content.length > 10 ? (
                <React.Fragment>
                    <LoveStory
                        marginRight={isMobile ? '0' : '8px'}
                        containerStyle={{
                            ...LoveStoryContainer,
                            marginRight: '20px',
                        }}
                        postProperties={video.properties}
                        loveStoryText={video.content}
                    />
                </React.Fragment>
            ) : null;

        const photographerContactButton = businessFromVideo(video.businesses, 'photographer') ? (
            <ContactBusinessButton
                id={'photographer-contact'}
                business={businessFromVideo(video.businesses, 'photographer')}
                videoId={video.id}
                tooltip={'Contact This Photographer'}
                title={'Contact ' + businessFromVideo(video.businesses, 'photographer').name}
                message={
                    `I watched ${
                        this.state.postProperties['spouse_1'] + ' & ' + this.state.postProperties['spouse_2']
                    }'s wedding video on Love Stories TV in which you are tagged as ` +
                    `the photographer. I'm impressed and would like to inquire about your services for my ` +
                    `upcoming wedding.`
                }
            />
        ) : null;



        video.photos = video.photos.map( d => {
           d.url = getDeviceImageUrl(d.url);
           return d;
        });

        const photos =
            video.photos.length > 0 ? (
                <React.Fragment>
                    <VideoPageBottomSection>
                        <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                            <div>
                                Photography by &nbsp;
                                {generateBusinessRoleJSX(
                                    video.businesses,
                                    'photographer',
                                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                                    '1em'
                                )}
                            </div>
                            {photographerContactButton}
                        </MediaQuery>

                        <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                            <SectionHeader marginBottom={'0'}>
                                Photography by&nbsp;
                                {generateBusinessRoleJSX(
                                    video.businesses,
                                    'photographer',
                                    LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                                    '0.8em'
                                )}
                                <br />
                                {photographerContactButton}
                            </SectionHeader>
                        </MediaQuery>
                    </VideoPageBottomSection>
                    <ContentGridContainer>
                        <ContentGrid
                            title={
                                this.state.postProperties['spouse_1'] +
                                ' & ' +
                                this.state.postProperties['spouse_2'] +
                                ' Photos'
                            }
                            payload={video.businesses}
                            contentType={LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO}
                            fixedItems={video.photos}
                            size={8}
                        />
                    </ContentGridContainer>
                </React.Fragment>
            ) : null;

        const moreFromFilmmaker =
            filmmaker && filmmaker.slug ? (
                <React.Fragment>
                    {this.state.moreFromFilmmakerReady && (
                        <React.Fragment>
                            <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                <VerticalSpacer space={'10'} />
                                <GenericContainer fontSize={'1.2rem'}>
                                    More from&nbsp;
                                    {generateBusinessRoleJSX(
                                        video.businesses,
                                        'videographer',
                                        LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                                        '1.2rem'
                                    )}
                                </GenericContainer>
                            </MediaQuery>
                            <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                                <SectionHeader marginBottom={'0'}>
                                    More from&nbsp;
                                    {generateBusinessRoleJSX(
                                        video.businesses,
                                        'videographer',
                                        LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                                        '0.8em'
                                    )}
                                </SectionHeader>
                            </MediaQuery>
                        </React.Fragment>
                    )}

                    <ContentGridContainer key={1}>
                        <ContentGrid
                            onDataReady={this.onMoreFilmmakerDataReady}
                            contentType={LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_VIDEO}
                            contentSearchType={LSTVGlobals.CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY}
                            searchItems={filmmaker.slug}
                            contentSortMethod={LSTVGlobals.CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM}
                            excludeItems={this.props.data.post.slug}
                            offset={0}
                            size={4}
                            verbosity={LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM}
                            context={
                                LSTVGlobals.CUSTOM_CONTENT_GRID_CONTEXT_VIDEO_PAGE_MORE_FROM_FILMMAKER +
                                '-exclude-' +
                                this.props.data.post.slug
                            }
                        />
                    </ContentGridContainer>
                </React.Fragment>
            ) : null;

        const weddingTeam = (
            <React.Fragment>
                <SectionHeader marginBottom={'10px'}>Wedding Team</SectionHeader>

                <GenericContainer width={'100%'} padding={!isMobile ? '0 5px 0 0' : '0'}>
                    <BusinessRoleGrid   
                        justifyContent={
                            isTablet ? (video.businesses.length > 2 ? 'flex-start' : 'center') : 'flex-start'
                        }
                        videoId={video.id}
                        businesses={video.businesses}
                    />
                </GenericContainer>
            </React.Fragment>
        );

        const vibe = (
            <React.Fragment>
                <SectionHeader marginBottom={'10px'}>Vibe</SectionHeader>
                <TagCloud
                    margin={'0 5px 0 0'}
                    slugPrefix="/style/"
                    tags={this.state.vibes}
                    fontSize={LSTVGlobals.CARD_TAG_FONT_SIZE}
                    showEditorial={'hide'}
                    fontWeight={LSTVGlobals.FONT_WEIGHT_SEMIBOLD}
                    justifyContent={'center'}
                    backgroundColor={LSTVGlobals.TAG_BG}
                    color={LSTVGlobals.RIGHT_CONTENT_TAG_TEXT_COLOR}
                    holeBackgroundColor={LSTVGlobals.HOLE_BG_COLOR}
                    mode={TAG_CLOUD_MODE_TICKET}
                />
            </React.Fragment>
        );

        const awards =
            this.state.awards.length > 0 ? (
                <React.Fragment>
                    <SectionHeader marginBottom={'0'}>Awards & Recognition</SectionHeader>
                    <VerticalSpacer space={'10'} />
                    <TagCloud
                        tags={this.state.awards}
                        slugPrefix={'/awards/'}
                        fontSize={LSTVGlobals.CARD_TAG_FONT_SIZE}
                        mode={TAG_CLOUD_MODE_BADGE}
                        fontWeight={LSTVGlobals.FONT_WEIGHT_BOLD}
                        justifyContent={'center'}
                    />
                </React.Fragment>
            ) : null;

        const highriseAd = (
            <HighriseAdContainer>
                <GoogleAd width={300} height={600} adUnitPath={'164808479/300x600'} />
            </HighriseAdContainer>
        );

        return (
            <div>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title> {video.title} </title>
                </Helmet>
                <PageContent>
                    <Overlay />
                    <MainContent leftRightMargin={'0'}>
                        <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                            <Content>
                                <ContentLeft>
                                    {videoPlayer}
                                    {infoBar2}
                                    <GenericContainer padding={'5px 10px 10px 10px'}>
                                        <FancySeparator noMargin />
                                        {loveStory}
                                        {photos && <FancySeparator />}
                                        {photos}
                                        <VerticalSpacer space={'10'} />
                                        {moreFromFilmmaker}
                                    </GenericContainer>
                                </ContentLeft>
                                <ContentRight>
                                    <Flex alignItems={'stretch'} height={'100%'}>
                                        <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                            <Flex flexDirection={'column'} width={'21px'}>
                                                <FancySeparatorVertical />
                                            </Flex>
                                        </MediaQuery>

                                        <Flex
                                            flexDirection={'column'}
                                            width={isMobileOnly ? 'calc(100vw - 20px)' : null}
                                            justifyContent={'flex-start'}
                                            flex={'1 1'}
                                        >
                                            {weddingTeam}
                                            <FancySeparator margin={'15px 0 10px 0'} />
                                            {vibe}
                                            <FancySeparator margin={'15px 0 10px 0'} />
                                            {awards}
                                            {highriseAd}
                                        </Flex>
                                    </Flex>
                                </ContentRight>
                            </Content>
                        </MediaQuery>
                        <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                            {videoPlayer}
                            {infoBar2}
                            <GenericContainer
                                backgroundImage={LSTVGlobals.CONTENT_LEFT_BG_COLOR}
                                padding={'2px 10px 10px 10px'}
                            >
                                <FancySeparator margin={'5px 0 10px 0'} />
                                {loveStory}
                                {video.content.length > 10 && <FancySeparator margin={'10px 0 10px 0'} />}
                                {weddingTeam}
                                <FancySeparator margin={'10px 0 10px 0'} />
                                {vibe}
                                {photos && <FancySeparator margin={'10px 0 10px 0'} />}
                                {photos}
                                <FancySeparator margin={'10px 0 10px 0'} />
                                {awards}
                                <FancySeparator margin={'10px 0 10px 0'} />
                                {moreFromFilmmaker}
                            </GenericContainer>
                        </MediaQuery>
                        <MediaQuery query={LSTVGlobals.UserDevice.isTablet}>
                            {videoPlayer}
                            {infoBar2}
                            <GenericContainer backgroundImage={LSTVGlobals.CONTENT_LEFT_BG_COLOR} padding={'10px'}>
                                <FancySeparator margin={'0 0 10px 0'} />
                                {loveStory}
                                {video.content.length > 10 && <FancySeparator margin={'15px 0 10px 0'} />}
                                {weddingTeam}
                                <FancySeparator margin={'15px 0 10px 0'} />
                                {vibe}
                                {photos && <FancySeparator margin={'15px 0 10px 0'} />}
                                {photos}
                                <FancySeparator margin={'15px 0 10px 0'} />
                                {awards}
                                <FancySeparator margin={'15px 0 10px 0'} />
                                {moreFromFilmmaker}
                            </GenericContainer>
                        </MediaQuery>
                    </MainContent>
                </PageContent>
            </div>
        );
    }
}

export default withRouter(VideoPage);
