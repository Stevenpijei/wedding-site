import React from 'react';
import * as LSTVGlobals from '../../global/globals';
import lostImage from '../../images/404.png';
import Overlay from './PageSupport/Overlay';
import styled from 'styled-components';
import PageContent from './PageContent';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

const ImageContainer = styled.div`
    position: relative;
    text-align: center;
    margin-top: 40px;
    transform: rotate(5deg);

    img {
        width: 80%;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        img {
            width: 30%;
        }
    }
`;

const style = {
    width: '90%',
    margin: '30px auto',
    textAlign: 'center',
    fontSize: '2rem',
    font: LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
    lineHeight: '2rem',
};

const paragraphStyle = {
    color: LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE,
    marginBottom: '10px',
};

const paragraphStyleTwo = {
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    fontSize: '1.5rem',
};

const hrefStyle = {
    color: LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE,
};

const MiddleDisplay = styled.div`
    width: 100%;

    @media ${LSTVGlobals.UserDevice.laptop} {
        margin-top: 80px;    
    }
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        position: relative;
        top: 50%;
        width: 95%;
    }
`;

class NotFound extends React.Component {
    render() {
        return (
            <PageContent>
                <Overlay />
                <MiddleDisplay>
                    <ImageContainer>
                        <img src={lostImage} alt={"Someone's lost. Either you or us."} />
                    </ImageContainer>
                    <div style={style}>
                        <p style={paragraphStyle}>Lost? So are we. We can't find this page.</p>
                        <p style={paragraphStyleTwo}>
                            A good place to start would be our{' '}
                            <a style={hrefStyle} href="/">
                                home page
                            </a>
                        </p>
                    </div>
                </MiddleDisplay>
            </PageContent>

        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // sideBarOff: () => dispatch({type: ActionTypes.ACTION_HIDE_SIDEBAR, data: null}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NotFound));
