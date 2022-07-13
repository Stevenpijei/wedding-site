
import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import * as LSTVGlobals from "../../global/globals";
import {v4} from 'uuid'
import {connect} from "react-redux";
import VideoAdPlaybackTimeReporter from "./videoAdPlaybackTimeReporter"
import styled, {css, keyframes} from 'styled-components';
import { SVGIcon } from "../Utility/SVGIcons";
import * as RestAPI from "../../rest-api/Call";
import { BeatLoader } from "react-spinners";
import { isMobile } from 'react-device-detect';
import ReactPlayer from "react-player";
import {V1_USER_EVENTS} from "../../rest-api/Call";
import RealTimeService from '../../rest-api/services/realTimeService';

const PlayerContainer = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  @media ${LSTVGlobals.UserDevice.isMobile} {
 	 height: auto;
 	 background: black;
  }
 
`;

const kenBurnsAnim = keyframes`
	from {
		transform: scale(1.3) rotate(5deg);
	}
	to {
		transform: scale(1) rotate(0deg);;
	}
`;

const PlayerThumbnail = styled.div`
	img {
		width: 100%;
		transition: all 5s;
		
		${props => props.isAutoPlay && css`
			animation: 90s ${kenBurnsAnim};	
		`};
	}
	display: ${ props => props.loading ? "block" : "none" };
	position: relative;
	overflow: hidden;
`;

const PlayerThumbnailControls = styled.div`
	position: absolute;
	top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    
    svg {
		fill: ${LSTVGlobals.WHITE};
		stroke: ${LSTVGlobals.WHITE};
		stroke-width: 1px;
		opacity: 0.8;
		transition: all ${ LSTVGlobals.FAST_ANIM_SPEED };
		cursor: inherit;
		
		
		&:hover {
			fill: ${LSTVGlobals.PRIMARY_COLOR};
			stroke: ${LSTVGlobals.WHITE};
			opacity: 1;
			cursor: pointer;
		}
		
	 	&:active {
  			transform: scale(0.8);
		}
    }
`;


const PlayerThumbnailLoadingMessageSpinner = styled.div`
	position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: ${LSTVGlobals.Z_INDEX_DEFAULT}
`;

const PlayerVideo = styled.div`
	width: 100%;
	height: 100%;
	display: ${ props => props.loading ? "none": "block" };
`;

const ActiveError = styled.div`
	z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
	position: absolute;
	left:0;
	right:0;
	background: #ff000099;
	color: white;
	padding: 30px;
	font-size: 1.2rem;
`;

const ReactPlayerWrapper = styled.div`
	position: relative;
	padding-top: 56.25%;
	
	${props => props.aspectRatio > 0 && css`
		padding-top: ${props => props.aspectRatio * 100}%;
	`};
`;

class VideoPlayback extends React.Component {

	static getDerivedStateFromProps(nextProps, prevState) {
		return ({
			...prevState,
			withPreRoll: nextProps.withPreRoll,
			isAutoPlay: nextProps.isAutoPlay,
			isMuted: nextProps.isMuted,
			mediaID: nextProps.mediaID,
			videoIdentifier: nextProps.videoIdentifier,
			reportStats: nextProps.reportStats,
			secondsPlayed: nextProps.mediaID === prevState.mediaID ? prevState.secondsPlayed : 0
		});
	}

	constructor(props) {
		super(props);

		// setting up video playback reporter
		this.videoPlaybackReporter = new VideoAdPlaybackTimeReporter();

		this.state = {
			loading: (props.videoType === 'jwplayer' && props.thumbnail),
			withPreRoll: props.withPreRoll,
			isAutoPlay: props.isAutoPlay,
			isMuted: props.isMuted,
			mediaID: props.mediaID,
			reportStats: props.reportStats,
			videoIdentifier: props.videoIdentifier,
			play_uuid: null,
			showLoadingMessage: props.showLoadingMessage,
			secondsPlayed: 0
		};
	}

	setLoading = (loading) => {

		if (loading !== this.state.loading) {
			this.setState({
				...this.state,
				loading: loading,
				activeError: null,
			});

			// if (!loading)
			// 	window.jwplayer().play();
		}
	};

	/* PREROLL ADS */

	onAdPlay = (event) => {

		let duration = 0;
		let title = null;

		if ("ima" in event &&
			"ad" in event.ima &&
			"g" in event.ima.ad &&
			"duration" in event.ima.ad.g &&
			"title" in event.ima.ad.g) {
			duration = event.ima.ad.g.duration;
			title = event.ima.ad.g.title;
		}
		this.videoPlaybackReporter.addVideoPlaybackContext(
			"ad",
			{
				ad_duration: duration,
				ad_title: title,
				play_uuid: this.state.play_uuid,
				video_identifier: this.state.videoIdentifier,
			});

		if (this.props.onVideoAdStart)
			this.props.onVideoAdStart();

		this.videoPlaybackReporter.started("ad");
		this.setLoading(false);

		// interact with JW player to get the missing adClicked event hooked up
		window.jwplayer(this.props.uniqueId).on("adClick", ()=> {
			this.onAdClicked();
		});
	};

	onAdPause = (event) => {
		this.videoPlaybackReporter.paused("ad");

		if (this.props.onVideoAdPause)
			this.props.onVideoAdPause();
	};

	onAdResume = (event) => {
		this.videoPlaybackReporter.resumed("ad");

		if (this.props.onVideoAdResume)
			this.props.onVideoAdResume();
	};

	onAdSkipped = (event) => {
		this.videoPlaybackReporter.skipped("ad");

		if (this.props.onVideoAdSkipped)
			this.props.onVideoAdSkipped();
	};

	onAdComplete = (event) => {
		this.videoPlaybackReporter.finished("ad");

		if (this.props.onVideoAdComplete)
			this.props.onVideoAdComplete();
	};

	onAdClicked = () => {

		RealTimeService.logAdPlaybackClick({
			id: this.state.play_uuid,
			ad_clicked_time_index: this.videoPlaybackReporter.getCurrentPlaybackIndex(),
		});

		if (this.props.onVideoAdClicked)
			this.props.onVideoAdClicked();
	};

	onFirstFrame = () => {
		this.setLoading(false);
	};

	/* VIDEO */

	onReady = (event) => {
		this.props.onVideoReady && this.props.onVideoReady();

		if (this.props.videoType === 'jwplayer') {
			/* window.jwplayer(this.props.uniqueId).addButton(
				'https://d2ef41pp6js8z8.cloudfront.net/downloads/lstv-video-badge.png',
				this.props.logoToolTip,
				() => {
					if (this.props.onLogoClicked)
						this.props.onLogoClicked();
					window.open("https://lovestoriestv.com", '_blank');

				},
				''); */
			let btnBar = document.querySelector('.jw-button-container');
			/* btnBar.childNodes[15].parentNode.insertBefore(btnBar.childNodes[11], btnBar.childNodes[16].nextSibling); */
		}
	};

	onAutoStart = (event) => {
		////console.log("---onAutoStart ");

		if (this.props.onVideoPlay)
			this.props.onVideoPlay();

		this.videoPlaybackReporter.started("video");
	};

	onError = (event) => {
		//alert("error");
	};

	onPause = (event) => {

		////console.log("---onPause ");
		this.setLoading(false);

		if (this.props.onVideoPause)
			this.props.onVideoPause();

		this.videoPlaybackReporter.paused("video");

	};

	onPlay = (event) => {
		////console.log("---onPlay ");

		if (this.props.onVideoPlay)
			this.props.onVideoPlay();

		this.videoPlaybackReporter.started("video");
	};

	onResume = (event) => {
		////console.log("---onResume ");

		if (this.props.onVideoResume)
			this.props.onVideoResume();

		this.videoPlaybackReporter.resumed("video");
	};

	onVideoLoad = (event) => {
		////console.log("---onVideoReady ");
		this.setLoading(false);

		// create new play UUID

		this.setState({
			...this.state,
			play_uuid: v4()
		}, () => {

			this.videoPlaybackReporter.addVideoPlaybackContext(
				"video",
				{
					video_identifier: this.state.videoIdentifier,
					duration: event.item.duration,
					play_uuid: this.state.play_uuid,
				}
			);


		});

		// interact with JW player to get the first frame event, indicating when the player is is ACTUALLY playing
		// as opposed to "buffering", or "loading"

		window.jwplayer(this.props.uniqueId).on("firstFrame", ()=> {
			this.onFirstFrame();
		});

		// if mobile, and autoplay, start playing at this point (do not wait for first frame)
		if (isMobile && this.state.isAutoPlay)
			window.jwplayer(this.props.uniqueId).play();
	};

	onVideoFinished = (event) => {
		////console.log("video finished");

		if (this.props.onVideoComplete)
			this.props.onVideoComplete();

		this.videoPlaybackReporter.finished("video");
	};

	onUnload = (event) => { // the method that will be used for both add and remove event
		this.videoPlaybackReporter.deactivate();
	};

	onBuffer = (event) => {
		////console.log("video onBuffer");
	};

	onBufferEnd = (event) => {
		//console.log("video onBufferEnd");
	};

	onSetupError = (event) => {

		if (this.props.onError)
			this.props.onError();
	};

	onYouTubeVimeoDuration = (event) => {
		//console.log("video onYouTubeVimeoDuration");
		//console.log(event);

		this.setState({
			...this.state,
			play_uuid: v4()
		}, () => {

			this.videoPlaybackReporter.addVideoPlaybackContext(
				"video",
				{
					video_identifier: this.state.videoIdentifier,
					duration: event,
					play_uuid: this.state.play_uuid,
				}
			);
		});
	};

	onTime = (event) => {
		if (this.props.onPercentageComplete) {
			let percentagePlayed = Math.floor((event.position / event.duration) * 100);

			if (Math.ceil(event.position) != Math.ceil(this.state.secondsPlayed)) {
				this.props.onPercentageComplete(percentagePlayed, Math.ceil(event.position), Math.ceil(event.duration));
				this.setState({
					...this.state,
					secondsPlayed: event.position
				})
			}
		}
	};

	onProgress = (played) => {
		if (this.props.onPercentageComplete) {
			let duration = (played.loadedSeconds / played.loaded);
			let percentagePlayed = Math.floor((played.playedSeconds / duration) * 100);
			this.props.onPercentageComplete(percentagePlayed, Math.ceil(played.playedSeconds), Math.ceil(duration));
		}
	};

	onYouTubeVimeoVideoLoad = (event) => {
		//console.log("video onYouTubeVimeoVideoLoad");
	};

	componentDidMount() {
		window.addEventListener("beforeunload", this.onUnload);
	}

	componentWillUnmount() {

		window.removeEventListener("beforeunload", this.onUnload);
		this.videoPlaybackReporter.deactivate();
	}

	render(){

		let aspectRatio = 0;

		if (this.props.videoHeight && this.props.videoWidth) {
			aspectRatio = this.props.videoHeight / this.props.videoWidth;
		}

		let playerID = this.state.withPreRoll ? LSTVGlobals.JW_PLAYER_ID_PREROLL : LSTVGlobals.JW_PLAYER_ID_NO_PREROLL;
		return (
			<PlayerContainer  id={this.props.uniqueId || "videoPlayContainer"}>
				{ this.state.activeError ? <ActiveError>
					{ this.state.activeError }
				</ActiveError> : null }
				<PlayerVideo loading={ this.state.loading ? 1: 0}>
					{(this.props.videoType === 'jwplayer') ? <ReactJWPlayer
						id={this.props.uniqueId}
						playerId= { this.props.uniqueId }
						playerScript= { 'https://cdn.jwplayer.com/libraries/' +  playerID + '.js' }
						playlist={ 'https://content.jwplatform.com/feeds/' + this.state.mediaID + '.json'}
						isAutoPlay={ this.state.isAutoPlay}
						isMuted={ this.state.isMuted }
						width={ this.props.width }
						height={ this.props.height }
						customProps={{ skin: { name: 'alaska' } }}
						/* events */

						onAdPlay={ this.onAdPlay }
						onAdPause={ this.onAdPause }
						onAdResume={ this.onAdResume }
						onAdSkipped={ this.onAdSkipped }
						onAdComplete={ this.onAdComplete }
						onAutoStart={ this.onAutoStart }
						onError={ this.onError }
						onSetupError={ this.onSetupError }
						onPause={ this.onPause }
						onPlay={ this.onPlay }
						onReady={ this.onReady }
						onResume={ this.onResume }
						onVideoLoad={ this.onVideoLoad }
						onOneHundredPercent={ this.onVideoFinished }
						onTime={ this.onTime }>
					</ReactJWPlayer> : null }


					{(this.props.videoType === 'youtube' || this.props.videoType === 'vimeo' ) ?
						<ReactPlayerWrapper aspectRatio={aspectRatio}>
							<ReactPlayer
								style={{position: "absolute", top: 0, left: 0, aspectRatio: "`calc(100vw * ${aspectRatio})`" ,width: '100%'}}
								url={ this.props.videoType === 'youtube' ?
									`https://youtube.com/watch?v=${this.state.mediaID }` : `https://vimeo.com/${this.state.mediaID }`}
								className={"player"}
								playing={ this.state.isAutoPlay }
								muted={ this.state.isMuted }
								controls={true}
								onReady={ this.onYouTubeVimeoVideoLoad }
								onDuration={ this.onYouTubeVimeoDuration }
								onStart={ this.onAutoStart }
								onPlay={ this.onPlay }
								onPause={ this.onPause }
								onBuffer={ this.onBuffer }
								onBufferEnd={ this.onBufferEnd }
								onEnded={ this.onVideoFinished }
								onError={ this.onError }
								width={'100%'}
								playsinline={true}
								onProgress={ this.onProgress }
								height={'100%'}/></ReactPlayerWrapper> : null }

				</PlayerVideo>
			</PlayerContainer>

		);
	}
}

VideoPlayback.defaultProps = {
	uniqueId: "1",
	reportStats: true,
	isAutoPlay: true,
	isMuted: false,
	mediaID: 'zLt723fg', // default video we have -- showing a "you have to  choose a real video" slide...
	showLoadingMessage: false,
	showLogo: false,
	logoURL: null,
	thumbnail: null,
	withPreRoll: true,
	/* user_events */
	onVideoReady: null,
	onError: null,
	onVideoAdStart: null,
	onVideoAdPause: null,
	onVideoAdResume: null,
	onVideoAdSkipped: null,
	onVideoAdClicked: null,
	onVideoAdComplete: null,
	onVideoPlay: null,
	onVideoPause: null,
	onVideoResume: null,
	onVideoComplete: null,
	onPercentageComplete: null,
	onLogoClicked: null
};

const mapDispatchToProps = dispatch => {
	return {};
};

const mapStateToProps = state => {
	return {
		uniqueGuestUUID: state.user.uniqueGuestUUID
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoPlayback);
