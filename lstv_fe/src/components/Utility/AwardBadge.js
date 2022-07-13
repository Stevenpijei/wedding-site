
import React from "react";
import styled, {css, keyframes} from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import {withRouter} from "react-router";


const NonImageAwardBadgeStyle = styled.div`

	background: ${props => props.backgroundColor};  
	width: 4em;
	height: 4em;
	line-height: ${props => props.fontSize};
	text-align: center;
	color: ${props => props.color};
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color ${LSTVGlobals.SUPER_FAST_EASE_OUT_ANIM};
	
	&:hover {
		background:  ${LSTVGlobals.PRIMARY_COLOR};
	}
	
	margin: 2em 2em 2em 2em;

	top: 50%;  
	left: 75%;
	transform: rotate(-45deg);

	&:before,
	&:after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: inherit;
		z-index: -1;
		transform: rotate(30deg);
	}
	
	&:after {
		transform: rotate(-30deg);
	}

	span {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: inherit;
		transform: rotate(45deg);
		font-size: ${props => props.fontSize};
		font-weight: ${props => props.fontWeight};
		
		&:hover {
			color: ${LSTVGlobals.WHITE};
			
		}
		
		&:before,
		&:after {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: inherit;
			z-index: -1;
			transform: rotate(30deg);
		}
		
		&:after {
  			transform: rotate(30deg);
		}
		
		&:before {
  			transform: rotate(-30deg);
		}
	}
}
`;

const AwardBadgeStyle = styled.div`
	width: 75px;
	height: 75px;
	transition: all ${LSTVGlobals.SUPER_FAST_EASE_OUT_ANIM};
	border-radius: 75px;
	margin: 5px;
	
	  &:hover {
	  	transform: scale(1.1) rotate(-5deg);
	  	box-shadow: 0px 0px 0px 3px ${LSTVGlobals.PRIMARY_COLOR};
	}	
`;

class AwardBadge extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){
		// return <AwardBadgeStyle {...this.props}>
		// 	<span> { this.props.text }</span>
		// </AwardBadgeStyle>

		return <AwardBadgeStyle>
			<img src={"/awards/" + this.props.slug + ".svg"}
				 alt={this.props.text}
				 data-for="mainTooltip"
				 data-tip={this.props.text}/>
		</AwardBadgeStyle>

	}
}

AwardBadge.defaultProps = {
	isVisible: true,
	static: false,
	text: "Replace Me",
	color: "#333",
	backgroundColor: LSTVGlobals.LSTV_YELLOW,
	fontSize: "1rem",
	fontWeight: LSTVGlobals.FONT_WEIGHT_NORMAL
};

export default withRouter(AwardBadge);

