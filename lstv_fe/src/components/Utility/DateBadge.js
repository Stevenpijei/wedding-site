import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import { FancySeparatorVertical, Flex, ordinalSuffixOf } from '../../utils/LSTVUtils';

const BadgeContainer = styled.div`
    position: relative;
    text-align: center;
    border-radius: 5px;
    height: ${(props) => props.height || '100%'};
    width: ${(props) => props.width || '100%'};
    z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    background: ${LSTVGlobals.TAG_BG};

    ${(props) =>
        !props.noShadow &&
        css`
            box-shadow: 0 0 3px 2px #e6e6e6;
        `};
`;

const Month = styled.div`
    width: 100%;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    font-size: ${(props) => props.monthFontSize || '1.2rem'};
    font-weight: 600;
    line-height: 100%;
    padding: 6px 0 4px 0;
    background: rgb(215, 45, 66);
    font-family: 'Heldane Display', sans-serif;
`;

const Year = styled.div`
    width: 100%;
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    font-size: ${(props) => props.yearFontSize || props.dayFontSize  || '1.4rem'};
    font-weight: ${LSTVGlobals.FONT_WEIGHT_BLACK};
    line-height: 100%;
    font-family: 'Heldane Display', sans-serif;
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

const Bar = styled.div`
    position: absolute;
    width: calc(${(props) => props.width} / 10);
    height: calc(${(props) => props.height} / 4);
    background: linear-gradient(to bottom, #eaeaea, 40%, #947f7f, 60%, #947f7f, 90%, #eaeaea);
    top: calc(0px - calc(${(props) => props.height} / 6));
    left: ${(props) => props.left};
    border-radius: 2px;
    z-index: ${LSTVGlobals.Z_INDEX_7_OF_100};

    @media ${LSTVGlobals.UserDevice.isMobile} {
        width: 3px;
        top: -6px;
    }
`;

class DateBadge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let year = null;
        let month = null;
        let day = null;

        if (this.props.dateStr) {
            let wdate = new Date(this.props.dateStr);
            if (wdate instanceof Date && !isNaN(wdate.getTime())) {
                month = wdate.getUTCMonth() + 1;
                year = wdate.getUTCFullYear();
                day = wdate.getUTCDate();
            }
        }

        return (
            <BadgeContainer className="dayMonthBadge" {...this.props}>
                <Bar left={'20%'} {...this.props} />
                <Bar left={'70%'} {...this.props} />
                <Flex height={'100%'} overflow={'hidden'} flexDirection={'column'}>
                    {this.props.mode === 'month' && (
                        <React.Fragment>
                            <Flex width={'100%'} alignItems={'center'} flex={'1'}>
                                <Month {...this.props}>
                                    {month ? months[month].toUpperCase() : months[this.props.month].toUpperCase()}
                                </Month>
                            </Flex>

                            <Flex alignItems={'center'} width={'100%'} flex={'1'}>
                                <Year {...this.props}>{year ? year : this.props.year}</Year>
                            </Flex>
                        </React.Fragment>
                    )}


                    {this.props.mode === 'day' && (
                        <React.Fragment>
                            <Flex width={'100%'} alignItems={'center'} flex={'1'}>
                                <Month {...this.props}>
                                    {month ? months[month].toUpperCase() : months[this.props.month].toUpperCase()}
                                </Month>
                            </Flex>

                            <Flex alignItems={'center'} width={'100%'} flex={'1'}>
                                <Year {...this.props}>  {day ? day : this.props.day} </Year>
                            </Flex>
                        </React.Fragment>
                    )}
                </Flex>
            </BadgeContainer>
        );
    }
}

DateBadge.defaultProps = {
    mode: 'month'
};

export default DateBadge;
