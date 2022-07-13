
import React from "react";
import styled, { css, keyframes } from "styled-components";
import ImageLoader from "./ImageLoader";
import * as LSTVGlobals from "../../global/globals";

const imgFadeIn = keyframes`
	0% {
		opacity: 0.2;
	}
	100% {
		opacity: 1;
	}
`;

const Thumbnail = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: top;
	visibility: ${ props => props.isVisible ? "visible" : "hidden" };
	
	${props => props.isVisible && css`
		animation: ${imgFadeIn} ${ LSTVGlobals.CARD_LOADING_IMG_FADEIN_SPEED };
	`};
	 
	
`;

const ImageWithLoaderStyle = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
	
	background: ${ LSTVGlobals.CARD_BACKGROUND }
	
	${props => props.applyMinHeight && css`

		min-height: 99.88;

		@media ${LSTVGlobals.UserDevice.tablet} {	
			min-height: 200px;
		}

		@media ${LSTVGlobals.UserDevice.laptop} {
			min-height: 231px;
		}

	`};
`;

class ImageWithLoader extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ready: false,
			applyMinHeight: this.props.applyMinHeight
		};
	}

	componentDidMount() {
	}

	onLoad = () => {
		// //console.log("image has been loaded: " + this.props.url);
		this.setState( {
			...this.state,
			ready: true,
			applyMinHeight: false
		});
	};

	render(){
		////console.log("applyminHeight: " + this.state.applyMinHeight);
		return (
			<ImageWithLoaderStyle applyMinHeight={this.state.applyMinHeight}>
				<ImageLoader isVisible={ !this.state.ready }/>
				{this.props.url &&
					<Thumbnail onLoad={ this.onLoad } isVisible={ this.state.ready } src={ this.props.url } alt={ this.props.altTag }/>}
			</ImageWithLoaderStyle>
		);
	}
}

ImageWithLoader.defaultProps = {
	isVisible: true,
	applyMinHeight: false
};

export default ImageWithLoader;

