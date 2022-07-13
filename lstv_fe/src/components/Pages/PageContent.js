import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import ReactTooltip from 'react-tooltip';
import LabelAndContent from '../Utility/LabelAndContent';
import MediaQuery from 'react-responsive';
import ModalContainer from '../Utility/ModalContainer';
import reduxStore from '../../store/store';
import ShareContentForm from '../Utility/ShareContentForm';
import { Router } from 'react-router';
import * as ActionTypes from '../../store/actions';
import { isMobile } from 'react-device-detect';
import lstvIcon from '../../images/lstv-video-badge.png'

const PageContentOuterStyle = styled.div`
    overflow: hidden;
    transition: all ${LSTVGlobals.PAGE_CONTENT_SLIDE_SPEED};
    left: 0;
    position: relative;
    filter: none;
    background: ${LSTVGlobals.PAGE_CONTENT_BG_COLOR};
`;

class PageContent extends React.Component {
    constructor(props) {
        super(props);

        this.toolTipHideInterval = null;
    }

    hideTooltip = () => {
        ReactTooltip.hide();
        clearInterval(this.toolTipHideInterval);
    };

    afterTooltipShow = (evt) => {
        ////console.log("111 showing");
        this.toolTipHideInterval = setInterval(this.hideTooltip, 1500);
    };

    afterTooltipHide = (evt) => {
        ////console.log("111 hiding");
        clearInterval(this.toolTipHideInterval);
    };

    onShareClosed = () => {
        reduxStore.dispatch({
            type: ActionTypes.ACTION_HIDE_SHARE_MODAL,
            data: {},
        });
    };

    render() {
        return (
            <PageContentOuterStyle id={'PageContent'} sideBarShown={this.props.sideBarShown}>
                {/* <Favicon url={lstvIcon} /> */}
                {this.props.children}
                <ModalContainer
                    id={'lstv-share-modal'}
                    tabletBorderRadius={'0'}
                    open={this.props.showShareModal}
                    closeHandler={() => {
                        this.onShareClosed()
                    }}

                    modalTitle={`${this.props.shareInfo.shareOptions.title}`}
                >
                    <ShareContentForm shareInfo={reduxStore.getState().volatile.shareInfo} />
                </ModalContainer>
                <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                    <ReactTooltip
                        id="mainTooltip"
                        place={'top'}
                        effect="solid"
                        className={'lstv-tooltip'}
                        delayShow={LSTVGlobals.TOOLTIP_SHOW_DELAY}
                        afterHide={this.afterTooltipHide}
                        afterShow={this.afterTooltipShow}
                    />
                </MediaQuery>
            </PageContentOuterStyle>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state) => {
    return {
        showShareModal: state.volatile.showShareModal,
        shareInfo: state.volatile.shareInfo,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PageContent);
