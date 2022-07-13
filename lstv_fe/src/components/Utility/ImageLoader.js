
import React from "react";
import styled, {css, keyframes} from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import LoadSpinner from "./LoadSpinner";


const ImageLoaderStyle = styled.div`
	position: absolute;
    top: 0;
    left: 0;
	height: 100%;
	width: 100%;
	visibility: ${ props => props.isVisible ? "visible" : "hidden" };
	background: ${ LSTVGlobals.CARD_BACKGROUND }
	
`;

class ImageLoader extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){

		return (
			<ImageLoaderStyle isStatic= { this.props.static } isVisible={ this.props.isVisible }>
				{ !this.props.static && <LoadSpinner color={ LSTVGlobals.CARD_LOADING_SPINNER_COLOR } isVisible={ this.props.isVisible }/> }
			</ImageLoaderStyle>
		);
	}
}

ImageLoader.defaultProps = {
	isVisible: true,
	static: false
};

export default ImageLoader;

