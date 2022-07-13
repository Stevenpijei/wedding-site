import * as LSTVGlobals from "../../global/globals";
import RealTimeService from '../../rest-api/services/realTimeService';

export default class VideoAdPlaybackTimeReporter {

	constructor(props) {

		this.videoPlaybackContexts = {};
		this.activeContext = null;
		this.timeBinLogInterval = null;
		this.lastStartTimestamp = null;

	}

	deactivate = () => {
		this.stopTimeBinLogInterval();
	};

	playIntervalFunc = () => {
		this.stopTimeBinLogInterval();
		this.startTimeBinLogInterval();
	};

	getCurrentPlaybackIndex = () => {
		if (this.activeContext in this.videoPlaybackContexts)
			if ("time_watched" in this.videoPlaybackContexts[this.activeContext].data) {
				let timeInterval = new Date() / LSTVGlobals.MS_IN_SECOND - this.lastStartTimestamp;
				return timeInterval + this.videoPlaybackContexts[this.activeContext].data.time_watched
			} else {
				return new Date() / LSTVGlobals.MS_IN_SECOND - this.lastStartTimestamp;
			}

		else
			return null;
	};

	postPlaybackStats = () => {
		if (this.activeContext === 'video')
			RealTimeService.logVideoPlayback({
				time_watched: this.videoPlaybackContexts[this.activeContext].data.time_watched,
				duration: this.videoPlaybackContexts[this.activeContext].data.duration,
				id: this.videoPlaybackContexts[this.activeContext].data.play_uuid,
				video_identifier: this.videoPlaybackContexts[this.activeContext].data.video_identifier
			})
		else
			RealTimeService.logAdPlayback({ad_time_watched: this.videoPlaybackContexts[this.activeContext].data.time_watched,
				ad_duration: this.videoPlaybackContexts[this.activeContext].data.ad_duration,
				id: this.videoPlaybackContexts[this.activeContext].data.play_uuid,
				ad_title: this.videoPlaybackContexts[this.activeContext].data.ad_title,
				video_identifier: this.videoPlaybackContexts[this.activeContext].data.video_identifier
			});

	};

	startTimeBinLogInterval = () => {
		if (this.timeBinLogInterval === null) {

			this.lastStartTimestamp = new Date() / LSTVGlobals.MS_IN_SECOND;

			this.timeBinLogInterval = setInterval(() => {
				this.playIntervalFunc()
			}, LSTVGlobals.VIDEO_PLAYBACK_TIME_MEASURE_BIN);

		}
	};


	stopTimeBinLogInterval = () => {

		if (this.timeBinLogInterval !== null) {

			let timeInterval = new Date() / LSTVGlobals.MS_IN_SECOND - this.lastStartTimestamp;
			if ("time_watched" in this.videoPlaybackContexts[this.activeContext].data) {

				this.videoPlaybackContexts[this.activeContext].data.time_watched += timeInterval;
				//table(this.videoPlaybackContexts[this.activeContext].data);
			} else {
				this.videoPlaybackContexts[this.activeContext].data.time_watched = timeInterval;
				//console.table(this.videoPlaybackContexts[this.activeContext].data);
			}

			// report
			this.postPlaybackStats();

			clearInterval(this.timeBinLogInterval);
			this.timeBinLogInterval = null;
		}
	};

	addVideoPlaybackContext = (context, data) => {
		this.videoPlaybackContexts[context] = {
			data: {
				...data,
				type: context
			}
		};


		//console.log(this.videoPlaybackContexts);
	};

	/* user triggered and automated Ad and VideoPost events */

	finished = (context) => {
		// //console.log("TIME REPORTER: Finished: " + context + "  Active Context: " + this.activeContext);

		this.stopTimeBinLogInterval();
	};

	started = (context) => {
		this.activeContext = context;
		// //console.log("TIME REPORTER: started " + context + "  Active Context: " + this.activeContext);
		this.startTimeBinLogInterval();

	};

	paused = (context) => {
		// //console.log("TIME REPORTER: paused " + context + "  Active Context: " + this.activeContext);
		this.stopTimeBinLogInterval();
	};

	resumed = (context) => {
		// //console.log("TIME REPORTER: resumed " + context + "  Active Context: " + this.activeContext);
		this.startTimeBinLogInterval();
	};

	skipped = (context) => {
		// //console.log("TIME REPORTER: skipped " + context + "  Active Context: " + this.activeContext);
		this.stopTimeBinLogInterval();
	};

}


