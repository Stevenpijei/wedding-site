
import React from "react";
import {connect} from "react-redux";
import * as LSTVGlobals from "../../../global/globals";
import {withRouter} from "react-router";
import BusinessTile from "../components/Content/BusinessTile";
import ReactTooltip from "react-tooltip";
import {isMobileOnly} from "react-device-detect";
import styled, {css} from "styled-components";
import {Flex, PageSectionTitle} from "../utils/LSTVUtils";

class MyComponent extends React.Component {


	constructor(props) {
		super(props);

		this.state = {
			// withPreRoll: props.withPreRoll,
			// isAutoPlay: props.isAutoPlay,
			// isMuted: props.isMuted
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (!isMobileOnly)
			ReactTooltip.rebuild();

	}

	componentDidMount() {

	}

	componentWillUnmount() {
		// cleanup...
	}

	render(){
		return (
			<div>

			</div>
		);
	}
}

const mapDispatchToProps = dispatch => {
	return {
		// onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
		// 	data: data}),
	};
};

const mapStateToProps = state => {
	return {
		// mainVideoData: state.user.mainVideoData
	};
};

MyComponent.defaultProps = {
	isItTrue: true
};



export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MyComponent));

