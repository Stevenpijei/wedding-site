import React, {PureComponent} from "react";
import Carousel, {Modal, ModalGateway} from "react-images";
import Hammer from "hammerjs";
import * as LSTVGlobals from "../../global/globals";
import {isMobileOnly, isBrowser, isChrome, isTablet, isSafari} from 'react-device-detect';
import {generateBusinessRoleJSX} from "../../utils/LSTVUtils";
import {SVGButton} from "./PhotoGallery";
import styled from "styled-components";
import Button, {ButtonGroup, ButtonRoundStyle} from "../Utility/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes, faExpand, faCompress} from "@fortawesome/pro-regular-svg-icons";
import MediaQuery from "react-responsive/src/Component";
import ReactTooltip from "react-tooltip";

const CLASS_PREFIX = "react-images";

function getSource(source) {
    if (typeof source === "string") return source;
    return source;
}

function className(name, state) {
    const arr = Array.isArray(name) ? name : [name];

    // loop through state object, remove falsey values and combine with name
    if (state && typeof name === "string") {
        for (let key in state) {
            if (state.hasOwnProperty(key) && state[key]) {
                arr.push(`${name}--${key}`);
            }
        }
    }

    // prefix everything and return a string
    return arr.map(cn => `${CLASS_PREFIX}__${cn}`).join(" ");
}

const HeaderButtonStyle = {
    alignItems: 'center',
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex ',
    fontSize: 'inherit',
    height: "40px",
    justifyContent: 'center',
    outline: 0,
    transition: 'background-color 200ms',
    width: "40px",
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
    },
    background: 'rgba(255, 255, 255, 0.5)',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.18)',
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    '&:hover, &:active': {
        backgroundColor: 'white',
        color: LSTVGlobals.PRIMARY_COLOR,
        opacity: 1,
    },
    '&:active': {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.14)',
        transform: 'scale(0.96)',
    },
    '&:focus': {
        outline: 'none',
    },
    ['@media (max-width: 769px)']: {
        width: '40px',
        height: '40px',
        '&:hover, &:active': {
            background: 'rgba(255, 255, 255, 0.5)',
            color: LSTVGlobals.TEXT_AND_SVG_BLACK,
            opacity: 1,
        },
    }
};


const navButtonStyles = base => ({
    ...base,
    //backgroundColor: 'white',
    background: 'rgba(255,255,255,0.5)',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.18)',
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    width: '40px',
    height: '40px',
    opacity: '1 !important',

    '& svg': {
        width: '28px',
        height: '28px'
    },


    '&:hover, &:active': {
        backgroundColor: 'white',
        color: LSTVGlobals.PRIMARY_COLOR,
        opacity: '1',
    },
    '&:active': {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.14)',
        transform: 'scale(0.96)',
    },
    '&:focus': {
        outline: 'none',
    },
    ['@media (max-width: 769px)']: {
        width: '40px',
        height: '40px',
        marginTop: -(50 / 2),
        opacity: '1',

        '& svg': {
            width: '28px',
            height: '28px'
        },

        '&:hover, &:active': {
            background: 'rgba(255, 255, 255, 0.5)',
            color: LSTVGlobals.TEXT_AND_SVG_BLACK,
            opacity: 1,
        },

    }
});

const View = props => {
    const {data, formatters, getStyles, index, isFullscreen, isModal} = props;
    const innerProps = {
        alt: formatters.getAltText({data, index}),
        src: getSource(data.src),
        draggable: "false"
    };

    return (
        <div
            style={getStyles("view", props)}
            className={className("view", {isFullscreen, isModal})}

        >
            <img
                ref={el => props.innerRef(el)}
                {...innerProps}
                className={className("view-image", {isFullscreen, isModal})}
                style={{
                    height: "auto",
                    maxHeight: "calc(100vh - 120px)",
                    maxWidth: "100%",
                    zIndex: 100,
                    marginTop: isBrowser || isTablet ? "-60px" : 0
                }}
            />
            {/*<div*/}
            {/*    style={{*/}
            {/*        position: "fixed",*/}
            {/*        height: "120vh",*/}
            {/*        width: "100vw",*/}
            {/*        backgroundImage: "#ff0000"*/}
            {/*    }}*/}
            {/*/>*/}

        </div>
    );
};

function getAltText({data, index}) {
    if (data.caption) return data.caption;

    return `Image ${index + 1}`;
}


export default class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.zoom = 1;
        this.posX = 0;
        this.posY = 0;
        this.scale = 1;
        this.last_scale = 1;
        this.last_posX = 0;
        this.last_posY = 0;
        this.max_pos_x = 0;
        this.max_pos_y = 0;
        this.transform = "";
        this.elem = null;
        this.enteredWithFullScreen = false;

        if (!isSafari && isBrowser && isChrome) {
            this.enteredWithFullScreen = document.fullscreenElement;
        }
    }

    action(ev) {
        this.transform = "";

        if (ev.type == "doubletap") {
            this.transform = `translate3d(0, 0, 0) ` + "scale3d(2, 2, 1) ";
            this.scale = 2;
            this.last_scale = 2;
            try {
                const val = window
                    .getComputedStyle(this.elem, null)
                    .getPropertyValue("-webkit-transform")
                    .toString();
                if (val != "matrix(1, 0, 0, 1, 0, 0)" && val !== "none") {
                    this.transform = "translate3d(0, 0, 0) " + "scale3d(1, 1, 1) ";
                    this.scale = 1;
                    this.last_scale = 1;
                }
            } catch (err) {
            }

            if (!this.transition) {
                this.transition = true;
                this.elem.style.transition = "transform 0.25s linear";
            }

            this.elem.style.transform = this.transform;
            this.transform = "";
        }

        if (ev.type == "pan") {
            if (this.transition) {
                this.transition = false;
                this.elem.style.transition = "unset";
            }
        }

        //pan
        if (this.scale != 1) {
            this.posX = this.last_posX + ev.deltaX;
            this.posY = this.last_posY + ev.deltaY;
            this.max_pos_x = Math.ceil(
                ((this.scale - 1) * this.elem.clientWidth) / 2
            );
            this.max_pos_y = Math.ceil(
                ((this.scale - 1) * this.elem.clientHeight) / 2
            );
            if (this.posX > this.max_pos_x) {
                this.posX = this.max_pos_x;
            }
            if (this.posX < -this.max_pos_x) {
                this.posX = -this.max_pos_x;
            }
            if (this.posY > this.max_pos_y) {
                this.posY = this.max_pos_y;
            }
            if (this.posY < -this.max_pos_y) {
                this.posY = -this.max_pos_y;
            }
        }

        //pinch
        if (ev.type == "pinch") {
            this.scale = Math.max(0.999, Math.min(this.last_scale * ev.scale, 4));

            if (this.transition) {
                this.transition = false;
                this.elem.style.transition = "unset";
            }
        }
        if (ev.type == "pinchend") {
            this.last_scale = this.scale;

            if (this.transition) {
                this.transition = false;
                this.elem.style.transition = "unset";
            }
        }

        //panend
        if (ev.type == "panend") {
            this.last_posX = this.posX < this.max_pos_x ? this.posX : this.max_pos_x;
            this.last_posY = this.posY < this.max_pos_y ? this.posY : this.max_pos_y;

            if (this.transition) {
                this.transition = false;
                this.elem.style.transition = "unset";
            }
        }

        if (this.scale != 1) {
            this.transform =
                "translate3d(" +
                this.posX +
                "px," +
                this.posY +
                "px, 0) " +
                "scale3d(" +
                this.scale +
                ", " +
                this.scale +
                ", 1)";
        }

        //zoom
        if (ev.type == "zoom") {
            this.scale = Math.max(0.999, Math.min(ev.scale, 4));
            this.last_scale = this.scale;

            if (this.scale == 1) {
                this.posX = 0;
                this.posY = 0;
            }

            if (this.scale) {
                this.transform =
                    "translate3d(" +
                    this.posX +
                    "px," +
                    this.posY +
                    "px, 0) " +
                    "scale3d(" +
                    this.scale +
                    ", " +
                    this.scale +
                    ", 1)";
            }

            if (!this.transition) {
                this.transition = true;
                this.elem.style.transition = "transform 0.25s linear";
            }
        }

        if (this.transform) {
            this.elem.style.transform = this.transform;
        }

        // if (this.scale != 1 && this.state.swipe) {
        //     this.setState({ swipe: false });
        // }
        // else if (this.scale == 1 && !this.state.swipe) {
        //     this.setState({ swipe: true });
        // }
    }


    handleChangeZoom = (type = -1) => {
        let zoom;
        zoom = this.zoom + type;

        if (zoom >= 1 && zoom <= 4) this.zoom = zoom;

        this.action({
            type: "zoom",
            deltaX: 0,
            deltaY: 0,
            scale: this.zoom
        });
    };

    onSwipeStart = (view) => {
        this.handleChangeZoom(-this.zoom);
    };

    setHammerListener(ref) {
        if (this.hammer) {
            this.hammer.destroy();
        }
        // Set default view of image
        if (this.elem) {
            this.elem.style.transform = "translate3d(0, 0, 0) " + "scale3d(1, 1, 1) ";
        }
        if (ref) {
            this.elem = ref;
            this.hammer = new Hammer(ref);
            this.hammer.get("pinch").set({enable: true});
            this.hammer.on("doubletap pan panend pinch pinchend", event =>
                this.action(event)
            );
        }
    }

    render() {


        const props = this.props;

        const HeaderClose = () => {
            return (
                <button
                    className="imageViewerHeaderButton"
                    onClick={() => props.handleClose()}
                >
                    {/*<CloseIcon style={{ width: "32px", height: "32px" }} color="#fff" />*/}
                </button>
            );
        };

        const HeaderDelete = innerProps => {
            return (
                <button
                    className="imageViewerHeaderButton"
                    onClick={() => props.handleDelete(innerProps.index)}
                >
                    {/*<DeleteIcon style={{ width: "32px", height: "32px" }} color="#fff" />*/}
                </button>
            );
        };

        const HeaderEdit = innerProps => {
            return (
                <button
                    className="imageViewerHeaderButton"
                    onClick={() => props.handleEdit(innerProps.index)}
                >
                    {/*<EditIcon style={{ width: "32px", height: "32px" }} color="#fff" />*/}
                </button>
            );
        };

        const HeaderZoomIn = props => {
            return (
                <button
                    className={`imageViewerHeaderButton ${props.className}`}
                    onClick={() => this.handleChangeZoom(1)}
                >
                    {/*<ZoomInIcon style={{ width: "32px", height: "32px" }} color="#fff" />*/}
                </button>
            );
        };

        const HeaderZoomOut = props => {
            return (
                <button
                    className={`imageViewerHeaderButton ${props.className}`}
                    onClick={() => this.handleChangeZoom(-1)}
                >
                    {/*<ZoomOutIcon style={{ width: "32px", height: "32px" }} color="#fff" />*/}
                </button>
            );
        };


        const PhotoGalleryHeader = styled.div`
            width: 100vw;
            height: 60px;
            background: ${isChrome && isBrowser ? "transparent" : "rgba(0,0,0,0.9)"};
            border-bottom: ${isChrome && isBrowser ? "1px dashed rgba(255,255,255,0.09)" : "none"};
            position: fixed;
            top:0;
            left:0;
            z-index: ${LSTVGlobals.Z_INDEX_TOPMOST_IF_NONE_MODAL};

             @media ${LSTVGlobals.UserDevice.isMobile} {
                height: 50px;
             }
        `;

        const Content = styled.div`
            display: flex;
            padding: 0 10px 0 10px;
            justify-content: space-between;
            align-items: center;
            align-content: start;
            flex-direction: row;
            height: 100%;

        `;

        const Title = styled.div`
            color: ${LSTVGlobals.OFFWHITE};
            font-size: 1.3rem;

            @media ${LSTVGlobals.UserDevice.isMobile} {
                font-size: 1rem;
                padding-right: 5px;
                line-height: 1rem;
            }

            a {
                color: ${LSTVGlobals.WHITE};
            }
        `;

        const getFullScreenElement = () => document.fullscreenElement;
        const isFullscreenEnabled = () => document.fullscreenEnabled;

        const launchIntoFullscreen = (element) => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        };

        const leaveFullscreen = (fsDocument) => {
            document.exitFullscreen();
        };

        const toggleFullScreenMode = () => {
            if (!getFullScreenElement())
                launchIntoFullscreen(document.documentElement);
            else
                leaveFullscreen(getFullScreenElement());
        };

        const Header = ({currentView, modalProps}) => {
            ////console.log(modalProps);
            const {onClose, toggleFullScreen, isFullscreen} = modalProps;
            return (
                <PhotoGalleryHeader>
                    <Content>
                        <Title>
                            {currentView.title}{isMobileOnly ? <br/> : null} by {generateBusinessRoleJSX(
                            currentView.businesses,
                            'photographer',
                            LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                            "1em")}
                        </Title>

                        <ButtonGroup>
                            { !isSafari &&
                            <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                <Button  tooltip={document.fullscreenElement ? "Exit Full Screen": "Activate Full Screen"}
                                         tooltipPlace={"bottom"}
                                         tooltipArrowColor={"transparent"}
                                         tooltipOffset={"{'top': 0, 'left': 20}"}
                                         onClick={toggleFullScreenMode}
                                        style={{
                                            ...HeaderButtonStyle,
                                            marginRight: '10px'
                                        }}>
                                    <FontAwesomeIcon icon={document.fullscreenElement ? faCompress : faExpand } size="lg"/>
                                </Button>
                            </MediaQuery>}
                            <Button tooltip={"Press ESC to Close"}
                                    tooltipPlace={"bottom"}
                                    tooltipOffset={"{'top': 0, 'left': 50}"}
                                    tooltipArrowColor={"transparent"}
                                    onClick={ ()=> {
                                        if (!isSafari && isBrowser && isChrome) {
                                            if (!this.enteredWithFullScreen && document.fullscreenElement)
                                                leaveFullscreen();
                                        }

                                        onClose();
                                    }}
                                    style={HeaderButtonStyle}>
                                <FontAwesomeIcon icon={faTimes} size="lg"/>
                            </Button>
                        </ButtonGroup>
                    </Content>
                </PhotoGalleryHeader>
            );
        };

        const FooterRejectionMessage = props => {
            const {currentView} = props;
            const {rejection_comment} = currentView;

            if (!rejection_comment) return null;

            return (
                <div
                    style={{
                        display: "flex",
                        border: `1px solid grey`,
                        borderRadius: "5px",
                        margin: "0px 5%",
                        width: "90%",
                        backgroundColor: "white",
                        alignItems: "center",
                        padding: "8px"
                    }}
                >
                    <InfoIcon color="#FF9800" style={{marginRight: "10px"}}/>
                    <div style={{wordBreak: "break-all"}}>{rejection_comment}</div>
                </div>
            );
        };

        const FooterCaption = props => {
            const {currentView, interactionIsIdle} = props;
            const {caption} = currentView;

            if (interactionIsIdle || !caption) {
                return null;
            }
            return (
                <div
                    style={{
                        color: "#ffffffe6",
                        backgroundColor: "rgb(0, 0, 0, 0.45)",
                        padding: "10px 5%"
                    }}
                >
                </div>
            );
        };

        const Footer = props => {
            if (!props.currentView) return null;

            return (
                <div
                    className="imageViewerFooter"
                    style={{zIndex: 1103}}
                    ref={el => {
                        this.footer = el;
                    }}
                >
                    <FooterRejectionMessage {...props} />
                    <div style={{marginTop: "10px"}}>
                        <FooterCaption {...props} />
                    </div>
                </div>
            );
        };

        const ViewObj = innerProps => {
            const {index, currentIndex} = innerProps;

            return (
                <View
                    innerRef={el => {
                        if (currentIndex === index && this.currentIndex !== currentIndex) {
                            if (typeof props.onIndexChange === "function") {
                                props.onIndexChange(currentIndex);
                            }

                            this.currentIndex = currentIndex;
                            this.setHammerListener(el);
                        }
                    }}
                    {...innerProps}
                />
            );
        };

        return (
            <ModalGateway>
                <Modal

                    styles={{
                        blanket: base => ({
                            ...base,
                            backgroundColor: 'rgba(0,0,0,1)',
                            zIndex: 500,
                        }),
                        positioner: base => ({
                            ...base,
                            display: 'block',
                        }),
                    }}
                    closeOnBackdropClick={false}
                    onClose={() => props.handleClose()}

                >
                    <Carousel
                        showNavigationOnTouchDevice={true}
                        allowFullscreen={true}
                        styles={{
                            view: (base, state) => ({
                                ...base,
                                marginTop: isMobileOnly ? '50px' : '40px',
                                overflow: 'hidden',
                                position: 'relative',
                                alignItems: 'center',
                                display: 'flex ',
                                height: isMobileOnly ? 'calc(100vh - 100px)' : 'calc(100vh)',
                                justifyContent: 'center',


                                '& > img': {
                                    position: 'relative',
                                },
                            }),
                            footer: (base, state) => ({
                                ...base,
                                position: 'absolute',
                                background: 'transparent',
                                left: 0,
                                bottom: 0,
                                width: '100vw',
                                minHeight: '40px',
                                height: '40px',
                                fontSize: isMobileOnly ? '1rem' : '1.5rem',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0 10px 0 10px',
                                transform: 'none !important',
                                opacity: '1 !important',
                                borderTop: isChrome && isBrowser ? "1px dashed rgba(255,255,255,0.2)" : "none",
                            }),
                            footerCaption: (base, state) => ({
                              display: "none"
                            }),
                            footerCount: (base, state) => ({
                                ...base,
                                fontSize: isBrowser || isTablet ? '1.3rem !important' : '1rem',
                                textAlign: "right",
                                paddingRight: "30px",
                                width: "100%"
                            }),

                            navigationPrev: navButtonStyles,
                            navigationNext: navButtonStyles,

                        }}
                        components={{Header: Header, View: ViewObj}}
                        currentIndex={props.currentIndex || 0}
                        formatters={{getAltText}}
                        // frameProps={{ autoSize: 'height' }}
                        views={props.images}
                        trackProps={{
                            swipe: props.images.length === 1 ? false : "touch",
                            onSwipeStart: this.onSwipeStart
                        }}
                        hideControlsWhenIdle={3000}
                    />
                </Modal>
            </ModalGateway>
        );
    }


    componentWillUnmount() {
        // remove any open tooltip
        ReactTooltip.hide();

        window.removeEventListener('keydown', this.handleKeyboardInput);
        if (this.hammer) {
            this.hammer.destroy();
        }
    }
}
