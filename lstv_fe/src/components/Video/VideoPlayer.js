import React from 'react';
import VideoPlayback from './VideoPlayback';
import {isMobileOnly, isTablet} from 'react-device-detect';
import * as RestAPI from '../../rest-api/Call';
import {LSTV_API_V1} from '../../rest-api/Call';
import {connect} from 'react-redux';
import styled, {css, keyframes} from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import RealTimeService from '../../rest-api/services/realTimeService';
import {BeatLoader, CircleLoader, PulseLoader, RotateLoader} from "react-spinners";


const glimmerAnimation = props => keyframes`
    0%{background-position:0% 48%}
    50%{background-position:100% 53%}
    100%{background-position:0% 48%}
`

const VideoPlayerContainer = styled('div')(({ width, height, style }) => ({
    // background: 'black',
    width: '100%',
    // React-jw-player only supports 16:9
    // paddingTop: `${(height/width)*100}%`,
    paddingTop: `56.25%`,
    position: 'relative',
   
    backgroundImage: 'linear-gradient(273deg, #dfd0ff, #6a25ff)',
    backgroundSize: '400% 400%',
    animation: `${glimmerAnimation} 3s ease infinite`,
    ...style,
}));

// const VideoPlayerContainer = styleddiv`
//     position: relative;
//     background: green;
//     width: 500px;
//     height: 500px;
// `;

const UpNextSlide = styled.div`
    /* background: ; */
    align-items: center;
    text-align: center;
    display: flex;
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: ${LSTVGlobals.Z_INDEX_6_OF_100};
    background: #2f2d2d;
`;

const NextCounter = styled.div`
    padding: 2px 15px 2px 15px;
    color: ${LSTVGlobals.WHITE};
    display: flex;
    align-items: center;
    height: 50px;
    border-right: 1px solid #4c4949;
`;

const NextTitle = styled.div`
    padding: 2px 15px 2px 15px;
    height: 100%;
    color: ${LSTVGlobals.WHITE};
`;

const NextImage = styled.div`
    height: 54px;
      width: 54px;
  background-image: url("${props => props.thumbnailUrl}");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50% 50%;
   
`;

const VideoNotReady = styled.div`
  text-align: center;
  color: white;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 25% 0%;
`;

class VideoPlayer extends React.Component {
    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            ...prevState,
            video: nextProps.video,
            currentVideoIndex: 0,

            countDown:
                nextProps.video.id === prevState.video.id
                    ? prevState.countDown
                    : 0,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            video: props.video,
            videoReady: true,
            countDown: 0
        };
    }

    componentDidMount() {
        RealTimeService.logContentView('video',this.state.video.id);
    }

    onPercentageComplete = (percentage, played, duration) => {
        if (this.props.onPercentageComplete)
            this.props.onPercentageComplete(percentage, played, duration);

        this.setState({
            ...this.state,
            countDown: duration - played,
        });
    };

    render() {
        return (
            <VideoPlayerContainer
                width={this.state.video.width}
                height={this.state.video.height}
            >
                {this.props.upNextSlide && this.props.upNextSlide.active && (
                    <UpNextSlide>
                        <NextCounter>
                            Up next<br/>:{String(this.state.countDown).padStart(2, '0')}
                        </NextCounter>
                        <NextTitle>
                            <span
                                style={{
                                    color: LSTVGlobals.WHITE,
                                    fontWeight: 'bold',
                                }}
                            >
                                {this.props.upNextSlide.title}
                            </span>
                            <br/>
                            {this.props.upNextSlide.location}
                        </NextTitle>
                        <NextImage thumbnailUrl={this.props.upNextSlide.thumbnail_url}>
                        </NextImage>
                    </UpNextSlide>
                )}
                {!this.state.videoReady && <VideoNotReady>
                    The video is still encoding, please allow 10-20 minutes for it to complete.</VideoNotReady>}

                <VideoPlayback
                    id={'videoPlayback'}
                    videoType={
                        this.state.video.type
                    }
                    videoHeight={
                        this.state.video.height
                    }
                    videoWidth={
                        this.state.video.width
                    }
                    mediaID={
                        this.state.video.media_id
                    }
                    thumbnail={
                        this.state.video.thumbnail_url
                    }
                    videoIdentifier={
                        this.state.video.id
                    }
                    isAutoPlay={this.props.isAutoPlay}
                    isMuted={this.props.isMuted}
                    onVideoReady={() => {
                        this.props.onVideoReady && this.props.onVideoReady();
                    }}
                    withPreRoll={this.props.withPreRoll}
                    showLoadingMessage={false}
                    onPercentageComplete={this.onPercentageComplete}
                    onVideoComplete={this.props.onVideoComplete}
                    onError={() => {
                        this.setState({
                            ...this.state,
                            videoReady: false
                        });
                    }}
                />
            </VideoPlayerContainer>

        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state) => {
    return {

    };
};

VideoPlayer.defaultProps = {
    video: null,
    /* user_events */
    onPlaylistStarted: null,
    onVideoPlay: null,
    onVideoComplete: null,
    onPlaylistComplete: null,
    onVideoReady: null,
    /* player setup */
    isMuted: false,
    isAutoPlay: false,
    OnCompletionPercentage: null,
    upNextSlide: null,
    withPreRoll: true,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoPlayer);
