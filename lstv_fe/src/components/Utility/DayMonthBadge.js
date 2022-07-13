import React from "react";
import styled, {css, keyframes} from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import {Flex} from "../../utils/LSTVUtils";



const BadgeContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	height: ${props => props.height};
	width: ${props => props.width};
	background: ${props => props.backgroundColor};
	z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
	
	 @media ${LSTVGlobals.UserDevice.isMobile} {
		top: 0px;
		left: 0px;
	}
	border-radius: 0 0 10px 0;
`;

const Day = styled.div`
	position: relative;
	color: ${props => props.textColor};
	font-size: ${props => props.fontSize};
	font-weight: ${props => props.fontWeight};
	text-align: center;
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

const Month = styled.div`
    position: relative;
	color: ${props => props.textColor};
	background: ${props => props.backgroundColor};
	font-size: ${props => props.fontSize};
	font-weight: ${props => props.fontWeight};
	text-align: center;
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 0 0 10px 0;
`;


const DateContainer = styled.div`
	width: 100%;
	height: 100%;
`;

const months = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
};

class DayMonthBadge extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <BadgeContainer className="dayMonthBadge" backgroundColor={this.props.backgroundColor}
                               width={this.props.width} height={this.props.height}>
            <DateContainer>
                <Flex  background={LSTVGlobals.WHITE} alignItems={"center"} flexWrap={"wrap"} flexDirection={"column"} height={"100%"}>
                    <Day textColor={this.props.dayTextColor}
                         fontWeight={this.props.dayFontWeight}
                         fontSize={this.props.dayFontSize}>
                        {this.props.day}
                    </Day>
                    <Month textColor={this.props.monthTextColor}
                           fontWeight={this.props.monthFontWeight}
                           fontSize={this.props.monthFontSize}
                           backgroundColor={this.props.monthBackgroundColor}>

                        {months[this.props.month].toUpperCase()}

                    </Month>
                    {/*<Year textColor={this.props.yearTextColor}*/}
                    {/*		 fontWeight={this.props.yearFontWeight}*/}
                    {/*		 fontSize={this.props.yearFontSize}>*/}
                    {/*	{this.props.year}*/}
                    {/*</Year>*/}
                </Flex>
            </DateContainer>
        </BadgeContainer>;
    }
}

DayMonthBadge.defaultProps = {
    backgroundColor: LSTVGlobals.BLOG_STORY_CARD_DATE_BADGE_BG_COLOR,
    monthBackgroundColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    dayTextColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    dayFontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
    dayFontSize: LSTVGlobals.LINK_FONT_SIZE,
    monthTextColor: LSTVGlobals.WHITE,
    monthFontWeight: LSTVGlobals.FONT_WEIGHT_BLACK,
    monthFontSize: LSTVGlobals.LINK_FONT_SIZE,
    // yearTextColor: LSTVGlobals.WHITE,
    // yearFontWeight: LSTVGlobals.FONT_WEIGHT_NORMAL,
    // yearFontSize: LSTVGlobals.LINK_FONT_SIZE,
    width: LSTVGlobals.DEFAULT_DAY_MONTH_BADGE_WIDTH,
    height: LSTVGlobals.DEFAULT_DAY_MONTH_BADGE_HEIGHT,

};

export default DayMonthBadge;

