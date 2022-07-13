import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';

const CenterPieceStyle = styled.div`
    max-width: ${LSTVGlobals.MAX_DESKTOP_CONTENT_WIDTH};
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;
    border-radius: 20px 20px 0 0;

    @media ${LSTVGlobals.UserDevice.laptop} {
        margin-top: 10px;
        margin-left: ${(props) => props.leftRightMargin};
        margin-right: ${(props) => props.leftRightMargin};
    }

    @media ${LSTVGlobals.UserDevice.desktop} {
        margin: 10px auto;
    }

    background: ${LSTVGlobals.MAIN_CONTENT_BG_COLOR};
`;

class MainContent extends React.Component {
    render() {
        return (
            <CenterPieceStyle id={'MainContent'} leftRightMargin={this.props.leftRightMargin}>
                {this.props.children}
            </CenterPieceStyle>
        );
    }
}

MainContent.defaultProps = {
    leftRightMargin: '20px',
};

export default MainContent;
