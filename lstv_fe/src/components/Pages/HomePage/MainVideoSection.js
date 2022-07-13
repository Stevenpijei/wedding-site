import React from 'react';
import * as LSTVGlobals from '../../../global/globals';
import styled, { css } from 'styled-components';
import VideoDataPoints from '../../Video/VideoDataPoints';
import ReactResizeDetector from 'react-resize-detector';
import { isMobileOnly, isTablet, isMobile } from 'react-device-detect';
import MediaQuery from 'react-responsive';
import VideoPlayer from '../../Video/VideoPlayer';
import { Flex, GenericContainer } from '../../../utils/LSTVUtils';

const MainVideoSectionStyle = styled.div`
    position: relative;
    display: flex;

    flex-direction: row;
    overflow: hidden;
    justify-content: center;
    flex-wrap: wrap;

    @media ${LSTVGlobals.UserDevice.tablet} {
        margin: 0;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        flex-wrap: nowrap;
        background: white;
        border-radius: 20px;
        margin-top: 10px;
    }

    @media ${LSTVGlobals.UserDevice.desktop} {
        margin: 10px auto 20px auto;
    }

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        border-radius: 0 0 20px 20px;
    }
`;

const VideoPlaybackStyle = styled.div`
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        width: 100%;
        height: auto;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        width: ${(props) => props.width}px;
        height: ${(props) => props.height}px;
    }
`;

const DataPointsStyle = styled.div`
    width: ${(props) => props.width}px;
    //background-image: ${LSTVGlobals.DIAGONAL_BACKGROUND};
    height: ${(props) => props.height}px;
`;

const MobileOrTabletDataPointsStyle = styled.div`
    //background-image: ${LSTVGlobals.DIAGONAL_BACKGROUND};
    background-color: ${LSTVGlobals.ABSOLUTE_WHITE};
    width: 100%;
`;

class MainVideoSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            withPreRoll: props.withPreRoll,
            isAutoPlay: props.isAutoPlay,
            isMuted: props.isMuted,
            videoWidth: 0,
            videoHeight: 0,
        };

        this.containerRef = React.createRef();
    }

    setSizeState = (width) => {
        let videoScreenShare = isMobileOnly || isTablet ? 1 : 0.5;

        this.setState({
            ...this.state,
            videoWidth: width * videoScreenShare,
            videoHeight: width * videoScreenShare * 0.5624967658,
        });
    };

    componentDidMount() {
        this.setSizeState(this.containerRef.current.offsetWidth);
    }

    onResize = () => {
        this.setSizeState(this.containerRef.current.offsetWidth);
    };

    render() {
        return (
            <React.Fragment>
                <div style={{ marginTop: isMobile ? '0' : '15px' }} ref={this.containerRef}>
                    {this.props.mainVideoData && this.props.mainVideoData.post !== undefined ? (
                        <MainVideoSectionStyle id="mainVideoSectionStyle">
                            <VideoPlaybackStyle
                                height={this.state.videoHeight}
                                width={this.state.videoWidth}
                                id="videoPlaybackStyle"
                            >
                                <VideoPlayer
                                    video={this.props.mainVideoData.post.videos[0]}
                                    onVideoReady={() => {
                                        this.props.onVideoReady && this.props.onVideoReady();
                                    }}
                                />
                            </VideoPlaybackStyle>

                            <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                                <MobileOrTabletDataPointsStyle>
                                    <VideoDataPoints
                                        businessLimit={4}
                                        vibeLimit={4}
                                        mainVideoData={this.props.mainVideoData}
                                    />
                                </MobileOrTabletDataPointsStyle>
                            </MediaQuery>

                            <MediaQuery query={LSTVGlobals.UserDevice.isTablet}>
                                <MobileOrTabletDataPointsStyle>
                                    <VideoDataPoints
                                        businessLimit={8}
                                        vibeLimit={8}
                                        mainVideoData={this.props.mainVideoData}
                                    />
                                </MobileOrTabletDataPointsStyle>
                            </MediaQuery>

                            <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                <DataPointsStyle height={this.state.videoHeight} width={this.state.videoWidth}>
                                    <VideoDataPoints
                                        businessLimit={50}
                                        vibeLimit={50}
                                        mainVideoData={this.props.mainVideoData}
                                    />
                                </DataPointsStyle>
                            </MediaQuery>

                            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
                        </MainVideoSectionStyle>
                    ) : null}
                </div>
            </React.Fragment>
        );
    }
}

MainVideoSection.defaultProps = {
    activeLinks: false,
    onVideoReady: null,
};

export default MainVideoSection;
