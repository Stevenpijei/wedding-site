import React from "react";
import styled, {css, keyframes} from "styled-components";
import {BeatLoader} from "react-spinners";
import * as LSTVGlobals from "../../global/globals";
import PropTypes from 'prop-types';
import theme from '../../styledComponentsTheme'

const dissolveAnimationVeil = keyframes`
    0% {
       opacity: 1;
    }
    50% {
       opacity: 0.5;
    }
    100% {
       opacity: 0;
    }
`;

const dissolveAnimationIcon = keyframes`
    0% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.0;
    }
    100% {
      opacity: 0;
    }
`;

const PageVeilStyle = styled.div`
    position: fixed;
    top: ${theme.headerHeight};
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: ${LSTVGlobals.Z_INDEX_UBER_MODAL_OR_VEIL};
    background: linear-gradient(to right, #F1F1EA, #dedede);
 
    ${props => props.dissolve && css`
        animation: ${dissolveAnimationVeil} 1s;  
    `}
`;

const LoadSpinnerStyle = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: ${LSTVGlobals.Z_INDEX_UBER_MODAL_OR_VEIL};

    ${props => props.dissolve && css`
        animation: ${dissolveAnimationIcon} 1s;
    `}
`;

class PageVeil extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dissolve: false,
            isLoading: this.props.isLoading
        }

        this.checkUnveilInterval = null;
    }

    componentDidMount() {
        this.checkUnveilInterval = setInterval(() => {
            this.checkUnveilCondition();
        }, 1000);
    }

    componentWillUnmount() {
        if (this.checkUnveilInterval)
            clearInterval(this.checkUnveilInterval);
    }

    checkUnveilCondition = () => {
        if (this.props.onUnveilCheck && this.props.onUnveilCheck()) {
            // clear interval for now
            if (this.checkUnveilInterval)
                clearInterval(this.checkUnveilInterval);

            // begin removing the veil...
            this.setState({
                ...this.state,
                dissolve: true,
            })
        }
    };

    onAnimationEnded = () => {
        this.setState({
            ...this.state,
            isLoading: false
        });
    };

    render() {
        return (
            <>
                {this.state.isLoading &&
                    <PageVeilStyle onAnimationEnd={this.onAnimationEnded}
                                dissolve={this.state.dissolve}>
                        <LoadSpinnerStyle dissolve={this.state.dissolve}>
                            <BeatLoader
                                size={this.props.iconSize}
                                color={this.props.color}
                                loading={this.state.isLoading}
                            />
                        </LoadSpinnerStyle>
                    </PageVeilStyle>
                }
            </>
        );
    }
}

PageVeil.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    onUnveilCheck: PropTypes.func.isRequired,
    color: PropTypes.string,
    iconSize: PropTypes.number
}

PageVeil.defaultProps = {
    isLoading: true,
    onUnveilCheck: null,
    color: LSTVGlobals.LSTV_YELLOW,
    iconSize: 25
};

export default PageVeil;
