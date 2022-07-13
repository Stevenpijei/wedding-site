import React from "react";
import {connect} from "react-redux";
import styled, {css, keyframes} from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import {append} from "ramda";
import {shortHandValue} from "../../utils/LSTVUtils";

const CounterContainer = styled.div`
	width: 100%;
	height: 100%;
	font-size: ${ props => props.fontSize };
	text-align: left;
	color: ${ props => props.textColor };	
`;

class ShorthandCounterLabel extends React.Component {

    constructor(props) {
        super(props);
    }

    shorthandValue = (value, appendix, shorthand) => {
        if (shorthand) {
           return shortHandValue(value, appendix)
        }
        else {
            return Number(value).toLocaleString('EN-us') + " " + appendix;
        }
    };

    render() {
        // //console.log(this.props.value);
        return (
            <CounterContainer textColor={this.props.textColor} fontSize={this.props.fontSize}>
                { this.shorthandValue(this.props.value, this.props.appendix, this.props.shorthand) }
            </CounterContainer>
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

ShorthandCounterLabel.defaultProps = {
    value: 0,
    appendix: null,
    fontSize: "1rem",
    textColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    shorthand: false
};


export default connect(mapStateToProps, mapDispatchToProps)(ShorthandCounterLabel);

