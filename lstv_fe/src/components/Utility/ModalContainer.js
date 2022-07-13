import React, { Children, isValidElement, cloneElement } from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import Button, { ButtonImageRound } from '../Utility/Button';
import { isMobile, isMobileOnly } from 'react-device-detect';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/pro-light-svg-icons';
import * as ActionTypes from '../../store/actions';
import ReactDOM from 'react-dom';

const ModalContainerFrame = styled.div`
    position: fixed;
    display: inline-block;
    outline: none;
    background: transparent;
    transition: all 0.3s;
    z-index: ${LSTVGlobals.Z_INDEX_UBER_MODAL_OR_VEIL}; 
    height: ${(props) => props.height};
    width: ${(props) => props.width};
    bottom: ${(props) => props.hiddenBottom};
    left: ${(props) => props.hiddenLeft};
    border-radius: ${(props) => props.borderRadius};
    max-height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;

    ${(props) =>
        props.open === true &&
        css`
            bottom: ${(props) => props.bottom};
            left: ${(props) => props.left};
            display: inline-block;
        `}
    
  
    @media ${LSTVGlobals.UserDevice.isTablet} {
         //box-shadow: 0px 1px 20px 5px rgba(140, 139, 140, 0.75);
         height: ${(props) => props.tabletHeight};
         width: ${(props) => props.tabletWidth};
         border-radius: ${(props) => props.tabletBorderRadius};
         
         ${(props) =>
             props.open === true &&
             css`
                 bottom: ${(props) => props.bottom};
                 left: ${(props) => props.left};
                 display: inline-block;
             `}
    }
    
    
    @media ${LSTVGlobals.UserDevice.laptop} {
         pointer-events: none;
         //box-shadow: 0px 1px 20px 5px rgba(140, 139, 140, 0.75);
         position: fixed;
         display: none;
         bottom: 50vh;
         left: 50vw;
         transform: translateX(-50%) translateY(+50%);
         border-radius: ${(props) => props.desktopBorderRadius};
         max-width: ${(props) => props.maxDesktopWidth};
         ${(props) =>
             props.open === true &&
             css`
                 pointer-events: auto;
                 display: inline-block;
             `}
    }
    
`;

const ModalContainerContent = styled.div`
    background: ${(props) => props.background};
   
`;

const ModalContainerHeader = styled.div`
    position: relative;
    border-radius: ${(props) => props.borderRadius};
    background: ${(props) => props.backgroundHeader};
    display: flex;
    padding: 10px 0 10px 0;
    align-items: center;

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        position: fixed;
        width: 100vw;
        height: 40px;
        z-index: 100;
    }

    @media ${LSTVGlobals.UserDevice.tablet} {
        border-radius: ${(props) => props.tabletBorderRadius};
    }
`;

const CloseButtonContainer = styled.div`
    flex: 0 0 50px;
`;

class ModalContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            working: false,
            showCloseButton: true,
            // success: false,
            open: this.props.open,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly) ReactTooltip.rebuild();
        if (prevProps.open !== this.props.open && !prevProps.open) {
            this.setState({
                ...this.state,
                working: false,
                showCloseButton: true,
                //success: false,
                open: this.props.open,
            });

            if (this.props.open) {
                document.body.style.height = '100vh';
                document.body.style.overflowY = 'hidden';
            }

            this.props.overlayOn();
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, true);

        setTimeout(() => {
            this.props.children[0] && this.props.children[0].focus();
        }, 1);
    }

    componentWillUnmount() {
        // cleanup...
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClickOutside = (event) => {
        if (this.state.open) {
            const domNode = ReactDOM.findDOMNode(this);
            if (!domNode || !domNode.contains(event.target)) {
                this.onCloseClicked();
            }
        }
    };

    onActionHandlerDone = (success) => {
        this.setState(
            {
                ...this.state,
                working: false,
                showCloseButton: true,
                //success: true,
            },
            () => {
                this.onCloseClicked();
            }
        );
    };

    onCloseClicked = () => {
        this.setState({
            ...this.state,
            open: false,
        });

        document.body.style.height = 'auto';
        document.body.style.overflowY = 'scroll';
        //document.body.style.paddingRight = '0px';


        this.props.overlayOff();
        this.props.closeHandler();
    };

    handleKeyDown = (event) => {
        //console.log('esc');
        if (event.keyCode === 27) {
            this.onCloseClicked();
        }
    };

    render() {
        const updateChildrenWithProps = React.Children.map(this.props.children, (child, i) => {
            return React.cloneElement(child, {
                doneHandler: this.onActionHandlerDone,
                background: this.props.background
            });
        });

        return (
            <ModalContainerFrame {...this.props} success={this.state.success} onKeyDown={this.handleKeyDown} tabIndex={0}>
                <ModalContainerHeader {...this.props} success={this.state.success} id={this.props.id + '-header'}>
                    <CloseButtonContainer success={this.state.success}>
                        <Button
                            isDisabled={!this.state.showCloseButton}
                            onClick={this.onCloseClicked}
                            style={{
                                ...ButtonImageRound,
                                background: LSTVGlobals.MODAL_HEADER_BG,
                                color: 'white',
                                marginRight: isMobile ? '0' : '10px',
                                marginLeft: '10px'

                            }}
                        >
                            <FontAwesomeIcon
                                className="fa-fw"
                                icon={this.state.success ? faCheck : faTimes}
                                size="lg"
                            />
                        </Button>
                    </CloseButtonContainer>
                    <div
                        style={{
                            flex: '1',
                            fontSize: this.props.titleFontSize,
                            fontWeight: this.props.titleFontWeight,
                            textAlign: 'center',
                            paddingRight: '50px',
                            color: LSTVGlobals.MODAL_HEADER_TITLE_COLOR,
                        }}
                    >
                        {this.props.modalTitle}
                    </div>
                </ModalContainerHeader>
                <ModalContainerContent>
                    {updateChildrenWithProps}
                </ModalContainerContent>
            </ModalContainerFrame>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        overlayOn: () => dispatch({ type: ActionTypes.ACTION_OVERLAY_ON, data: null }),
        overlayOff: () => dispatch({ type: ActionTypes.ACTION_OVERLAY_OFF, data: null }),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

ModalContainer.defaultProps = {
    /* Mobile & tablet */

    bottom: 0,
    left: 0,
    hiddenLeft: 0,
    hiddenBottom: '-100vh',
    /* Mobile */
    height: 'auto',
    width: '100vw',
    borderRadius: '10px 10px 0 0',
    /* Tablet */
    tabletHeight: 'auto',
    tabletWidth: '100vw',
    tabletBorderRadius: '10px 10px 0 0',
    /* desktop */
    maxDesktopWidth: '60vw',
    desktopBorderRadius: '10px 10px 10px 10px',
    /* Content */
    modalTitle: 'Placeholder For Title',
    titleFontSize: '1.2rem',
    titleFontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
    background: LSTVGlobals.DEFAULT_MODAL_BACKGROUND,
    backgroundHeader: LSTVGlobals.MODAL_HEADER_BG,
    open: false,
    /* Handler funcs */
    closeHandler: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ModalContainer));
