import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { isMobileOnly } from 'react-device-detect';
import { css } from 'glamor';
import styled from 'styled-components';
import { NumericalBadge } from '../../utils/LSTVUtils';

export const media = (mq) => {
    let rc = '@media ' + mq;
    return rc;
};

export const ButtonGroup = styled.div`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
`;

export const ButtonBaseStyle = {
    fontSize: '1rem',
    cursor: 'pointer',
    outline: 'none',
    overflow: 'visible',
    userSelect: 'none',
    background: LSTVGlobals.PRIMARY_COLOR,
    color: LSTVGlobals.ABSOLUTE_WHITE,
    borderRadius: '20px',
    transition: `border ${LSTVGlobals.SUPER_FAST_LINEAR_OUT_ANIM}, background ${LSTVGlobals.SUPER_FAST_LINEAR_OUT_ANIM}`,
    padding: '5px',
    transform: 'scale(1)',
    boxSizing: 'border-box',

    [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
        '&:hover': {
            background: LSTVGlobals.PRIMARY_COLOR,
            color: LSTVGlobals.WHITE,

            '&:disabled': {
                background: LSTVGlobals.DISABLED_BUTTON_BG,
                color: LSTVGlobals.DISABLED_BUTTON_TEXT_COLOR,
                cursor: 'auto',
            },
        },
    },
    '&:active': {
        transform: 'scale(0.98)',
    },
    '&:disabled': {
        background: LSTVGlobals.DISABLED_BUTTON_BG,
        color: LSTVGlobals.DISABLED_BUTTON_TEXT_COLOR,
    },
};

export const ButtonLinkStyle = {
    ...ButtonBaseStyle,
    background: 'unset',
    transition: 'unset',
    '&:hover': 'unset',
    '&:active': {
        transform: 'unset',
    },
    borderRadius: 'unset',

    [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
        '&:hover': {
            background: 'unset',
        },
    },
    [`${media(LSTVGlobals.UserDevice.isMobileOrTablet)}`]: {
        '&:hover': {
            background: 'unset',
        },
    },
};

export const ButtonRoundStyle = {
    ...ButtonBaseStyle,
    display: 'inline-flex',
    flexFlow: 'row',
    alignItems: 'center',
    borderRadius: '50%',
    padding: '5px',
};

export const ButtonImageRound = {
    ...ButtonRoundStyle,
    display: 'inline-flex',
    flexFlow: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    padding: '5px',
    width: '40px',
    height: '40px',
    minWidth: '40px',
    minHeight: '40px',
};

export const ButtonGlyphStyle = {
    ...ButtonBaseStyle,
    display: 'inline-flex',
    flexFlow: 'row',
    alignItems: 'center',
    padding: '5px',
    background: 'unset',
    [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
        '&:hover': {
            color: LSTVGlobals.PRIMARY_COLOR,

            '&:disabled': {
                color: LSTVGlobals.DISABLED_BUTTON_BG,
                cursor: 'auto',
            },
        },
    },
};


class Button extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // withPreRoll: props.withPreRoll,
            // isAutoPlay: props.isAutoPlay,
            // isMuted: props.isMuted
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly) ReactTooltip.rebuild();
    }

    componentDidMount() {}

    componentWillUnmount() {
        // cleanup...
    }

    render() {
        return (
            <button
                disabled={this.props.isDisabled}
                type={this.props.type}
                onBlur={this.props.onBlur}
                data-place={this.props.tooltipPlace}
                data-offset={this.props.tooltipOffset}
                data-arrow-color={this.props.tooltipArrowColor}
                data-tip={this.props.tooltip}
                data-for="mainTooltip"
                onClick={this.props.onClick}
                {...css(this.props.style)}
            >
                {this.props.children}
                {this.props.badgeText && (
                    <NumericalBadge>
                        <p>{this.props.badgeText}</p>
                    </NumericalBadge>
                )}
            </button>
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

Button.defaultProps = {
    badgeText: null,
    isDisabled: false,
    withFocusRect: false,
    type: null,
    style: ButtonBaseStyle,
    tooltipArrowColor: null,
    tooltipOffset: "{'top': 0, 'left': 0}",
    tooltipPlace: 'top',
    tooltipText: null,
    onBlur: null,
    onClick: () => {},
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Button));
