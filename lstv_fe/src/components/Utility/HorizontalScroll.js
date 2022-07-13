import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { isBrowser, isChrome, isMobileOnly, isSafari } from 'react-device-detect';
import styled, { css } from 'styled-components';
import useScrollInfo from 'react-element-scroll-hook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/pro-regular-svg-icons';
import Button from './Button';

export const HorizontalScrollStyle = styled.div`
    overflow-y: hidden;
    position: relative;
    width: 100vw;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        /* margin: 0px 5px 0 5px; */
    }
`;

export const ListWrapperStyle = styled.ul`
    display: grid;
    grid-template-columns: 0px repeat(${(props) => props.numItems}, ${(props) => props.itemWidth + 15 +"px"  || '80%'}) 0px;
    height: 100%;
    overflow-x: scroll;
    padding-bottom: 20px;

    ${(props) =>
        props.scrollRequired &&
        css`
            margin: 0px;
            @media ${LSTVGlobals.UserDevice.isMobile} {
                margin: 0px;
            }
        `}

    &:before,
    &:after {
        content: '';
    }

    overflow-y: hidden;
    list-style: none;
    @media ${LSTVGlobals.UserDevice.isMobile} {
        grid-template-columns: 0px repeat(100%) 0px;
    }
`;

export const Item = styled.li`
    height: 100%;
    scroll-snap-align: center;
    margin-right: 15px;
    height: 100%;
    display: flex;
    flex-direction: row;
    //justify-content: stretch;
    align-content: stretch;
    align-items: stretch;
`;

const HeaderButtonStyle = {
    position: 'absolute',
    top: 'calc(50% - 40px)',
    right: '0px',
    zIndex: LSTVGlobals.Z_INDEX_8_OF_100,
    alignItems: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid #ffffff',
    display: 'flex ',
    fontSize: 'inherit',
    height: '40px',
    justifyContent: 'center',
    outline: 0,
    transition: 'background-color 200ms, opacity 0.2s',
    width: '40px',

    background: LSTVGlobals.TEXT_AND_SVG_BLACK,
    color: LSTVGlobals.ABSOLUTE_WHITE,
    ['@media (min-width: 1025px)']: {
        '&:hover, &:active': {
            backgroundColor: LSTVGlobals.PRIMARY_COLOR,
            color: LSTVGlobals.ABSOLUTE_WHITE,
        },
        '&:active': {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.14)',
            transform: 'scale(0.96)',
        },
        '&:focus': {
            outline: 'none',
        },
    },
};

const AbyssMargin = styled.div`
    position: absolute;
    top: 0;

    width: 10px;
    background: ${LSTVGlobals.SHOWCASE_SECTIONS_BG_COLOR};
    height: calc(100% - 20px);
    z-index: ${LSTVGlobals.Z_INDEX_8_OF_100};
    //mask-image: linear-gradient(to right, black 0%, transparent 10px);

    ${(props) =>
        props.left &&
        css`
            left: 20px;
            mask-image: linear-gradient(to right, black 0%, transparent 10px);
            @media ${LSTVGlobals.UserDevice.isMobile} {
                left: 10px;
            }
        `}

    ${(props) =>
        props.right &&
        css`
            right: 20px;
            mask-image: linear-gradient(to right, transparent 0%, black 10px);
            @media ${LSTVGlobals.UserDevice.isMobile} {
                right: 10px;
            }
        `}
`;

const ListWrapper = (props) => {
    // Initialize the hook
    const [scrollInfo, setRef, ref] = useScrollInfo();

    let scrollRequired = true;
    let rightButtonOpacity = scrollInfo.x.percentage !== 1 ? 1 : 0.02;
    let leftButtonOpacity = scrollInfo.x.percentage !== 0 ? 1 : 0.02;
    if (scrollInfo.x.percentage === null) scrollRequired = false;

    return (
        <ListWrapperStyle
            scrollRequired={scrollRequired}
            id="hScroll"
            numItems={props.numItems}
            itemWidth={props.itemWidth}
            ref={setRef}
        >
            {/* {scrollRequired && scrollInfo.x.percentage !== 1 && props.numItems > 1 && <AbyssMargin right />}
            {scrollRequired && scrollInfo.x.percentage !== 0 && props.numItems > 1 && <AbyssMargin left />} */}

            {/* {scrollRequired && (
                <Button
                    onClick={() => {
                        [1, 2, 3, 4].forEach(function (i) {
                            setTimeout((i) => {
                                //console.log(props);
                                ref.current.scrollLeft += props.itemWidth / 4;
                            }, 60 * i);
                        });
                    }}
                    style={{
                        ...HeaderButtonStyle,
                        right: isMobileOnly ? '-2px' : '0',
                        opacity: rightButtonOpacity,
                        boxShadow: '-4px 0 12px 2px #ffffff',
                    }}
                >
                    <FontAwesomeIcon icon={faChevronRight} size="lg" />
                </Button>
            )} */}

            {/* {scrollRequired && (
                <Button
                    onClick={() => {
                        [1, 2, 3, 4].forEach(function (i) {
                            setTimeout((i) => {
                                //console.log(props);
                                ref.current.scrollLeft -= props.itemWidth / 4;
                            }, 60 * i);
                        });
                    }}
                    style={{
                        ...HeaderButtonStyle,
                        left: isMobileOnly ? '-2px' : '0',
                        opacity: leftButtonOpacity,
                        boxShadow: '4px 0 12px 2px #ffffff',
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} size="lg" />
                </Button>
            )} */}

            {props.children}
            <li style={{width: '25px'}}></li>
        </ListWrapperStyle>
    );
};

class HorizontalScroll extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showRightAbyss: false,
            showLeftAbyss: false,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly) ReactTooltip.rebuild();
    }

    componentDidMount() {}

    componentWillUnmount() {
        // cleanup...
    }

    onScrollReport = (percent) => {
        this.setState({
            ...this.state,
            showRightAbyss: percent !== 0,
            showLeftAbyss: percent !== 1,
        });
    };

    render() {
        return (
            <HorizontalScrollStyle>
                <ListWrapper
                    onScrollReport={this.onScrollReport}
                    numItems={this.props.items.length}
                    itemWidth={this.props.itemWidth}
                >
                    {this.props.items.map((data, index) => {
                        return (
                            <Item key={index} className="item">
                                {data}
                            </Item>
                        );
                    })}
                </ListWrapper>
            </HorizontalScrollStyle>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        // 	data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

HorizontalScroll.defaultProps = {
    numItems: 8,
    items: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HorizontalScroll));
