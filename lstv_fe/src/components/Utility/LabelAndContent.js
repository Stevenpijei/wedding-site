
import React from "react";
import {connect} from "react-redux";
import styled, { css } from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import LSTVButton from "./LSTVButton";
import {Link} from "react-router-dom";


const LabelAndTextStyle = styled.div`
 	${props => props.verticallyCentered && css`
		position: absolute;
		${LSTVGlobals.STYLE_V_CENTER};
	`};
`;

const LabelStyle = styled.div`
	font-size: ${props => props.fontSize};
	padding: ${props => props.padding};
	font-style: italic;
	color: ${props => props.color};
	
	${props => props.labelBold && css`
		font-weight: ${LSTVGlobals.FONT_WEIGHT_BOLD};
	`};
	
	${props => !props.enabled && css`
		color: ${LSTVGlobals.CARD_DISABLED_COLOR};
	`};
`;


class LabelAndContent extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){
		if (this.props.children) {
			if (this.props.labelFirst)
				return (
					<LabelAndTextStyle  verticallyCentered={ this.props.verticallyCentered }>
						{this.props.label ? <LabelStyle padding={this.props.padding} color={this.props.color} fontSize={ this.props.fontSize } enabled={this.props.enabled} labelBold={this.props.labelBold}>
							{ this.props.label }
						</LabelStyle> : null }
						{ this.props.children }
					</LabelAndTextStyle>
				);
			else return (
				<LabelAndTextStyle verticallyCentered={ this.props.verticallyCentered }>
					{ this.props.children }
					{ this.props.label ? <LabelStyle padding={this.props.padding} color={this.props.color} fontSize={ this.props.fontSize } enabled={this.props.enabled} labelBold={this.props.labelBold}>
						{ this.props.label }
					</LabelStyle> : null }
				</LabelAndTextStyle>);
		} else return null;
	}
}

LabelAndContent.defaultProps = {
	verticallyCentered: false,
	inline: false,
	labelFirst: true,
	labelBold: false,
	enabled: true,
	fontSize: "0.8rem",
	color: LSTVGlobals.TEXT_AND_SVG_BLACK,
	padding: "0 0 2px 0"
};


export default LabelAndContent;



