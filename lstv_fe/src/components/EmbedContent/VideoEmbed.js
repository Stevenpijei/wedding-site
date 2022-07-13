import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { isMobile, isMobileOnly, isTablet } from 'react-device-detect';
import styled, { css } from 'styled-components';
import * as RestAPI from '../../rest-api/Call';
import VideoPlayer from '../Video/VideoPlayer';
import BusinessRoleGrid from '../Content/BusinessRoleGrid';
import { FancySeparator, Flex, GenericContainer, Spacer, VerticalSpacer } from '../../utils/LSTVUtils';
import { SizeMe } from 'react-sizeme';
import Ticker from 'react-ticker';
import DateBadge from '../Utility/DateBadge';
import VideoInfoGrid from '../Content/VideoInfoGrid';
import { LSTVLogo } from '../Utility/LSTVLogo';

const StoryTicker = styled.div`
    display: flex;
    align-items: center;
    text-transform: uppercase;
    padding: 10px;
    width: 100%;
    text-align: center;
    font-size: 3.1vw;
    height: 3.2vw;
    line-height: 2vw;
    color: white;
    padding-right: 200px;
    background: transparent;
`;

const TickerContainer = styled.div`
    background: black;
`;

const VideoContainer = styled.div`
  border-left: 1px solid ${LSTVGlobals.EMBED_BORDER_COLOR};
  border-right: 1px solid ${LSTVGlobals.EMBED_BORDER_COLOR};
  border-radius: 10px 10px 0 0;
`;

const VideoEmbedStyle = styled.div`
    margin: 0 auto;
    border-radius: 10px;
    overflow: hidden;
`;

const Content = styled.div`
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    width: 100%;
    height: 100%;
    border-radius: 10px;
`;

const InfoContainer = styled.div`
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    padding-bottom: 5px;
`;

const LSTVSignature = styled.div`
    background: ${LSTVGlobals.ABSOLUTE_WHITE};
    padding-right: 15px;
    text-align: right;
    font-size: 0.7rem;
    margin-bottom: 8px;
`;

const LogoStyle = styled.img`
    width: 79px;
`;

const SupplementalContent = styled.div`
    border-bottom: 1px solid ${LSTVGlobals.EMBED_BORDER_COLOR};
    border-left: 1px solid ${LSTVGlobals.EMBED_BORDER_COLOR};
    border-right: 1px solid ${LSTVGlobals.EMBED_BORDER_COLOR};
    border-radius: 0 0 10px 10px;
    padding-bottom: 5px;
`;

class VideoEmbed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorObj: null,
            data: null,
        };

        this._cancelToken = null;
    }

    loadVideo = (id) => {
        if (id) {
            RestAPI.call(
                'get',
                null,
                RestAPI.LSTV_API_V1.GET_EVENT_STORY,
                (data) => {
                    this.setState({
                        data: data.result,
                    });
                },
                (error) => {
                    this.setState({
                        errorObj: error,
                    });
                },
                (attempt_num) => {},
                { id: id },
                'obtain the requested video',
                false
            ).then((cancelToken) => {
                this._cancelToken = cancelToken;
            });
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly) ReactTooltip.rebuild();

        if (this.props.id !== prevProps.id && this.props.id) {
            this.loadVideo(this.props.match.params.id);
        }
    }

    componentDidMount() {
        this.loadVideo(this.props.match.params.id);

        // because we can...  :-)
        document.body.style.background = "transparent";
    }

    componentWillUnmount() {
        // cleanup...
        if (this._cancelToken) {
            ////console.log("*** Cancelling API request as the component is unmounting!");
            this._cancelToken.cancel();
        }
    }

    onRecordSize = (frameId, size) => {
        window.parent.postMessage({ frameId: frameId, frameHeight: size.height }, '*');
    };

    render() {
        let params = new URLSearchParams(location.search);
        let withBusinesses = params.get('businesses') === '1';
        let withInfoBar = params.get('infobar') === '1';
        let autoStart = params.get('autoplay') === '1';
        let muteOnStart = params.get('muteonstart') === '1';
        let withLoveStory = params.get('lovestory') === '1';
        let frameId = params.get('frameid');
        let businessLimit = params.get('businesslimit') ? params.get('businesslimit') : 999;

        if (!this.state.data) return null;

        return (
            <SizeMe monitorWidth={true} monitorHeight={true}>
                {({ size }) => {
                    this.onRecordSize(frameId, size);
                    return (
                        <Content>
                            <VideoContainer>
                                <VideoEmbedStyle>
                                    <VideoPlayer
                                        video={this.state.data}
                                        isAutoPlay={autoStart}
                                        isMuted={muteOnStart}
                                    />
                                </VideoEmbedStyle>
                            </VideoContainer>
                            <SupplementalContent>
                                {withInfoBar && (
                                    <InfoContainer>
                                        <React.Fragment>
                                            <Flex background={LSTVGlobals.ABSOLUTE_WHITE} padding={'13px 10px 0 10px'}>
                                                <Flex width={'100%'} flex={'1'} justifyContent={'flex-start'}>
                                                    <DateBadge
                                                        width={isMobileOnly ? '40px' : '50px'}
                                                        height={isMobileOnly ? '40px' : '50px'}
                                                        monthFontSize={isMobileOnly ? '0.9rem' : '1.2rem'}
                                                        yearFontSize={isMobileOnly ? '0.9rem' : '1.3rem'}
                                                        dateStr={this.state.data.event_date}
                                                    />
                                                    <Spacer width={'10px'} />
                                                    <GenericContainer width={'100%'}>
                                                        <VideoInfoGrid
                                                            contactCouple={true}
                                                            contactBusinesses={true}
                                                            embedded={true}
                                                            video={this.state.data}
                                                            postProperties={this.state.data.post_properties}
                                                        />
                                                    </GenericContainer>
                                                </Flex>
                                            </Flex>
                                        </React.Fragment>
                                    </InfoContainer>
                                )}

                                {withLoveStory && this.state.data.content.length > 100 && (
                                    <TickerContainer>
                                        <Ticker speed={4} direction="toLeft">
                                            {({ index }) => <StoryTicker> {this.state.data.content}</StoryTicker>}
                                        </Ticker>
                                    </TickerContainer>
                                )}

                                {/*{withBusinesses && <FancySeparator noMargin/>}*/}
                                {withBusinesses && (
                                    <GenericContainer
                                        background={LSTVGlobals.ABSOLUTE_WHITE}
                                        borderTop={
                                            withLoveStory && this.state.data.content.length > 100
                                                ? 'none'
                                                : `1px solid ${LSTVGlobals.EMBED_BORDER_COLOR}`
                                        }
                                        margin={'5px 0 0 0'}
                                        padding={'12px 10px 0 10px'}
                                    >
                                        <BusinessRoleGrid
                                            limit={businessLimit}
                                            withLinks={true}
                                            embeddedSize={size}
                                            embedded={true}
                                            businesses={this.state.data.businesses}
                                        />
                                    </GenericContainer>
                                )}

                                {!withBusinesses && <VerticalSpacer space={'18'} />}
                                <LSTVSignature>
                                    <Flex
                                        background={LSTVGlobals.ABSOLUTE_WHITE}
                                        justifyContent={'flex-end'}
                                        alignItems={'center'}
                                    >
                                        powered by&nbsp;
                                        <a href={'https://lovestoriestv.com'}>
                                            <LSTVLogo
                                                color={LSTVGlobals.BLACK}
                                                background={LSTVGlobals.LSTV_YELLOW}
                                                height={'15px'}
                                            />
                                        </a>
                                    </Flex>
                                </LSTVSignature>
                            </SupplementalContent>
                        </Content>
                    );
                }}
            </SizeMe>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        //    data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VideoEmbed));
