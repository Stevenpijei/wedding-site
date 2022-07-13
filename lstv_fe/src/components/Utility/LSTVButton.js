

import React from "react";
import * as LSTVGlobals from "../../global/globals";
import styled, {css, keyframes} from 'styled-components';
import { zoomIn } from 'react-animations';

const buttonAnimation = keyframes`${zoomIn}`;

const LSTVButtonStyle = styled.button`
        color: ${ props => props.color };
        margin: ${ props => props.topBottomMargins } ${ props => props.sideMargins } ${ props => props.topBottomMargins } ${ props => props.sideMargins };
        padding: ${ props => props.topBottomPadding } ${ props => props.sidePadding } ${ props => props.topBottomPadding } ${ props => props.sidePadding };
        width: ${ props => props.width };
        max-width: ${ props => props.maxWidth };
        height: ${ props => props.height };
        min-height: ${ props => props.minHeight };
        text-align: center;
        position: relative;
        background: ${ props => props.showBackground ? props => props.backgroundColor : "transparent"  };  
        border-width: 0;    
        border-radius: ${ props => props.borderRadius };
        cursor: pointer;
        display: ${ props => props.display };
        outline: none;
        overflow: hidden;
        transition: background-color ${LSTVGlobals.SUPER_FAST_EASE_OUT_ANIM};
        
        
         ${props => props.centerVertically && css`
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			background: darkorange;
        `};

        ${props => props.animated && css`
			animation: ${ LSTVGlobals.FAST_ANIM_SPEED } ${buttonAnimation};
        `};
       
        &:before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            display: block;
            width: 0;
            padding-top: 0;
            border-radius: 200%;
            background-color: ${ props => props.buttonDownBackgroundColor };
            transform: translate(-50%, -50%);
          
        }
        
        &:after {
            content: "";
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: 3px;
            left: 0;
            background: ${props => props.hoverBackgroundColor};
            visibility: hidden;
            transform: scaleX(0);
            transition: ${LSTVGlobals.FAST_EASE_OUT_ANIM};
        }
      
        ${props => props.showHoverBackground && props.hoverEffect === 'background' && css`
              &:hover {
                background: ${props => props.hoverBackgroundColor};
                color: ${props => props.hoverColor};
              } 
         `}; 
        
        ${props => props.showHoverBackground && props.hoverEffect === 'underline' && css`
            &:hover:after {
               visibility: visible;
               transform: scaleX(1);
            }    
         `}; 
           
        ${props => props.clickable && css`
            &:active:before {
                width: 150%;
                padding-top: 220%;
                transition: width ${LSTVGlobals.FAST_EASE_OUT_ANIM}, padding-top ${LSTVGlobals.FAST_EASE_OUT_ANIM}, opacity ${LSTVGlobals.FAST_EASE_OUT_ANIM};
            }
            &:active:after {
                transform: scaleX(0);
            }
            
            &:active {
              color: ${props => props.buttonDownColor}
            }
        `};
`;

const LabelSpan = styled.span`
  position: relative;
  display: block;
  color: inherit;
  font-weight: ${props => props.labelFontWeight};
  text-align: center;
`;

const Image = styled.img`
  position: relative;
  display: block;
  margin: 0 auto;
  width: 40%;
`;

class LSTVButton extends React.Component {

    constructor(props) {
        super(props);

        // state with defaults.

        this.state = {
            color: this.props.color,
            hoverColor: this.props.hoverColor,
            buttonDownColor: this.props.buttonDownColor,
            showBackground : this.props.showBackground,
            backgroundColor: this.props.backgroundColor,
            showHoverBackground: this.props.showHoverBackground,
            hoverBackgroundColor: this.props.hoverBackgroundColor,
            buttonDownBackgroundColor: this.props.buttonDownBackgroundColor,
            sideMargins: this.props.sideMargins,
            sidePadding: this.props.sidePadding,
            width: this.props.width,
            height: this.props.height,
			minHeight: this.props.minHeight,
            image: this.props.image,
            clickable: this.props.clickable,
            animated: this.props.animated,
            labelFontWeight: this.props.labelFontWeight,
            hoverEffect: this.props.hoverEffect,
            animationEnded: !this.props.animated || false,
			borderRadius: this.props.borderRadius,
			topBottomMargins: this.props.topBottomMargins,
			topBottomPadding: this.props.topBottomPadding,
			display: this.props.display,
			centerVertically: this.props.centerVertically,
			maxWidth: this.props.maxWidth
        };
    }

    OnAnimationEnded = () => {
        this.setState({
            ...this.state,
            animationEnded: true
        });
    };
    
    
    render () {
        
        return (
            <LSTVButtonStyle
                onAnimationEnd={ this.OnAnimationEnded }
                showBackground={ this.state.showBackground }
                color={ this.state.color }
                hoverColor={ this.state.hoverColor }
                hoverEffect = { this.state.hoverEffect }
                buttonDownColor={ this.state.buttonDownColor }
                backgroundColor={ this.state.backgroundColor }
                showHoverBackground={ this.state.showHoverBackground }
                hoverBackgroundColor={ this.state.hoverBackgroundColor }
                buttonDownBackgroundColor={ this.state.buttonDownBackgroundColor }
                sideMargins={ this.state.sideMargins }
                sidePadding={ this.state.sidePadding }
				topBottomMargins={ this.state.topBottomMargins }
				topBottomPadding={ this.state.topBottomPadding }
                width={ this.state.width }
				maxWidth={ this.state.maxWidth }
                height={ this.state.height }
				minHeight={ this.state.minHeight }
				borderRadius = {  this.state.borderRadius }
                clickable={ this.state.clickable }
                animated={ this.state.animated }
                onClick={ this.state.clickable ? this.props.clickHandler : null }>
                { this.state.image ?
                    this.state.animationEnded ? <Image src={ this.state.image }/> : null
                    :
                    <LabelSpan labelFontWeight={ this.state.labelFontWeight }>{ this.props.label }</LabelSpan>
                }
            </LSTVButtonStyle>
        );
    }
}

LSTVButton.defaultProps = {
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    hoverColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    buttonDownColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    showBackground: true,
    showHoverBackground: true,
    backgroundColor: LSTVGlobals.LSTV_YELLOW,
    hoverBackgroundColor: LSTVGlobals.DEFAULT_BUTTON_HOVER_BG_COLOR,
    buttonDownBackgroundColor: LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE,
    sideMargins: "10px",
    sidePadding: "25px",
	topBottomMargins: "5px",
	topBottomPadding: "5px",
    width: "auto",
    height: LSTVGlobals.DEFAULT_BUTTON_HEIGHT,
	minHeight: LSTVGlobals.DEFAULT_BUTTON_HEIGHT,
    clickable: true,
    image: null,
    animated: false,
    labelFontWeight: "normal",
    hoverEffect: "background",
	borderRadius: LSTVGlobals.STANDARD_RADIUS,
	display: "block",
	centerVertically: false,
	maxWidth: "100%"
};

export default LSTVButton;