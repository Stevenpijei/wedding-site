
import React from "react";
import styled, { css } from "styled-components";
import { BeatLoader } from "react-spinners";
import * as LSTVGlobals from "../../global/globals";


const LoadSpinnerStyle = styled.div`
	position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: ${LSTVGlobals.Z_INDEX_TOPMOST_IF_NONE_MODAL};
    visibility: ${ props => props.isVisible ? "visible" : "hidden" };
   
`;

class LoadSpinner extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){
		return (
			<LoadSpinnerStyle isVisible={ this.props.isVisible }>
				<BeatLoader
					size={ this.props.size }
					color={ this.props.color }
					loading={ this.props.isVisible }
				/>
			</LoadSpinnerStyle>
		);
	}
}

LoadSpinner.defaultProps = {
	isVisible: true,
	color: LSTVGlobals.LSTV_YELLOW,
	size: 10
};

export default LoadSpinner;

