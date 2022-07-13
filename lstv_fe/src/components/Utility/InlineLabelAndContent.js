
import React from "react";
import styled, { css } from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import LSTVButton from "./LSTVButton";


const InlineLabelAndContentStyle = styled.div`
  display: inline;
  flex-direction: row;
  align-items: center;
  position: relative;
  top: 0;
  left: 0;
  color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
  
  background: ${LSTVGlobals.INLINE_LABEL_AND_CONTENT};
  border-left: 4px solid ${LSTVGlobals.PRIMARY_COLOR};
  border-radius: 10px;
  padding: 2px 5px 2px 5px;
  margin-top: ${props => props.marginTop}; 
  font-size: ${props => props.fontSize};
  line-height: ${props => props.lineHeight};
  width: fit-content;

 
  ${props => props.float && css`
  	float: ${props => props.float};
  `};
  
   
  ${props => props.rightMargin && css`
  	 margin-right: 20px;
  	 
  	  @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
  	  	 margin-right: 10px;
  	  	
  	  };
  `};

 
  
  ${props => props.embedded && css`
  	  border-left: none;
  	  border-radius: 0;
  	  padding: 2px 5px 2px 5px;
  	  transform: skew(-10deg);
  	  background: ${LSTVGlobals.LSTV_YELLOW};
  `};
  
`;

class InlineLabelAndContent extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){
		return (
			<InlineLabelAndContentStyle {...this.props}>
				{this.props.children}
			</InlineLabelAndContentStyle>
		);
	}
}

InlineLabelAndContent.defaultProps = {
	rightMargin: null,
	marginTop: "0",
	float: null,
	lineHeight: "inherit",
	fontSize: "inherit"

};

export default withRouter(InlineLabelAndContent);

