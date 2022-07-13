import React from 'react';
import { connect } from 'react-redux';
import styled, { keyframes, css } from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';
import { fadeIn, fadeOut } from 'react-animations';
import { isBackdropFilterSupported } from '../../../utils/LSTVUtils';

const OverlayStyle = styled.div`
    position: fixed;
    cursor: default;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    z-index: ${LSTVGlobals.Z_INDEX_9_OF_100_HEADER_OVERLAY};
    background: rgba(0, 0, 0, 0);
    pointer-events: ${(props) => (props.show ? 'auto' : 'none')};
    transition: all 0.5s;

    // showing the overlay...
    ${(props) =>
        props.show &&
        css`
            background: rgba(0, 0, 0, 0.3);
        `};
`;

class Overlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
        };
    }

    onAnimEnd = () => {
        this.setState({
            ...this.state,
            visible: this.props.showOverlay,
        });

        // if (isBrowser) {
        // 	if (this.props.showOverlay)
        // 		document.body.classList.add('body-fixed');
        // 	else
        // 		document.body.classList.remove('body-fixed');
        // }
    };

    render() {
        return (
            <OverlayStyle
                isBackDropSupported={isBackdropFilterSupported()}
                onAnimationEnd={() => {
                    this.onAnimEnd();
                }}
                visible={this.state.visible}
                show={this.props.showOverlay}
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        showOverlay: state.volatile.showOverlay,
    };
};

export default connect(mapStateToProps)(Overlay);
