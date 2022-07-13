import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { isMobileOnly } from 'react-device-detect';
import styled, { css } from 'styled-components';
import URLShareBar from './URLShareBar';
import { FancySeparator, Flex } from '../../utils/LSTVUtils';
import { FormLabel } from '../Forms/FormStyle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Button, { ButtonBaseStyle, media } from './Button';
import ReactIframeResizer from 'react-iframe-resizer-super';
import MediaQuery from 'react-responsive/src/Component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/pro-light-svg-icons';
import {
    faWix,
    faSquarespace,
    faInstagram,
    faWordpressSimple,
} from '@fortawesome/free-brands-svg-icons';
import WordPressEmbedExample from '../../images/embed_example_wordpress.png';
import WixEmbedExample from '../../images/embed_example_wix.png';
import SquarespaceEmbedExample from '../../images/embed_example_squarespace.png';
import SocialMediaButtonsBar from './SocialMediaButtonsBar';

const ShareContentStyle = styled.div`

    border-radius: 0 0 10px 10px;
    padding: 10px;
    text-align: center;
    /* background: ${props => props.background}; */
    //outline: none;
    
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        /* padding-top: 70px; */
         border-radius: 0;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        //min-height: 880px;
        max-height: 90vh;
        overflow-y: overlay;
        overflow-x: hinherit;
    }
`;

const EmbedCodeFieldStyle = styled.div`
    height: auto;
    background: ${LSTVGlobals.DEFAULT_FORM_FIELD_BG};
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    width: 100%;
    height: 5rem;
    border-radius: 10px 0 0 10px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        height: 6rem;
    }
`;

const SmallLabel = styled.div`
    font-size: 0.8rem;
    margin: ${(props) => props.margin || '0'};
`;

const EmbedCode = styled.p`
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    font-size: 1rem;
    padding: 5px;
    word-break: break-all;
    font-family: 'Courier New', Courier, monospace;
    text-align: left;
`;

const EmbedControlGrid = styled.div`
    display: grid;
    grid-gap: 5px;
    grid-template-columns: 1fr 1fr;
    width: 100%;

    @media ${LSTVGlobals.UserDevice.tablet} {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        padding-right: 5px;
        padding-left: 5px;
    }
`;

const EmbedControlGridItem = styled.div`
    text-align: left;
    margin-bottom: 10px;
`;

const EmbedPreviewContainer = styled.div`
    width: 60%;
    margin: 0 auto;

    @media ${LSTVGlobals.UserDevice.laptop} {
        width: 50%;
    }
`;

const tabKeywords = ['none', 'html', 'wix', 'squarespace', 'wordpress'];

class ShareContentForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            baseUrl: window.location.href,
            url: window.location.href,
            embedUniqueId:
                'lstv-embed-' +
                [...Array(7)]
                    .map((i) => (~~(Math.random() * 36)).toString(36))
                    .join(''),
            embedCode: '',
            embedCopied: false,
            embedEventInformation: true,
            embedEventBusinesses: false,
            embedAutoPlay: true,
            embedLoveStory: false,
            embedMuteOnStart: false,
            embedTargetSelected: 1,
            showEmbedCode: false,
        };

        this.innerRef = React.createRef();
    }

    handleKeyDown = (event) => {
        //console.log('esc!!');
        if (event.keyCode === 27) {
            this.props.doneHandler(true);
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.props.shareInfo &&
            this.props.shareInfo.id &&
            (!prevProps.shareInfo ||
                prevProps.shareInfo.id != this.props.shareInfo.id)
        ) {
            this.setEmbedCode();
            this.innerRef.current.focus();
        }

        if (!isMobileOnly) ReactTooltip.rebuild();
    }

    componentDidMount() {
        //console.log(this.props);
        this.setEmbedCode();
    }

    componentWillUnmount() {
        // cleanup...
    }

    onToggleShortUrl = (url) => {
        this.setState({
            ...this.state,
            url: url,
        });
    };

    onCopy = (text, success) => {
        this.setState(
            {
                ...this.state,
                embedCopied: true,
            },
            () => {
                setTimeout(() => {
                    this.setState({
                        ...this.state,
                        embedCopied: false,
                    });
                }, 1000);
            }
        );
    };

    onAutoPlayToggle = () => {
        this.setState(
            {
                ...this.state,
                embedAutoPlay: !this.state.embedAutoPlay,
            },
            () => {
                this.setEmbedCode();
            }
        );
    };

    onLoveStoryToggle = () => {
        this.setState(
            {
                ...this.state,
                embedLoveStory: !this.state.embedLoveStory,
            },
            () => {
                this.setEmbedCode();
            }
        );
    };

    onMuteOnStartToggle = () => {
        this.setState(
            {
                ...this.state,
                embedMuteOnStart: !this.state.embedMuteOnStart,
            },
            () => {
                this.setEmbedCode();
            }
        );
    };

    onEventInformationToggle = () => {
        this.setState(
            {
                ...this.state,
                embedEventInformation: !this.state.embedEventInformation,
            },
            () => {
                this.setEmbedCode();
            }
        );
    };

    onEventBusinessesToggle = () => {
        this.setState(
            {
                ...this.state,
                embedEventBusinesses: !this.state.embedEventBusinesses,
            },
            () => {
                this.setEmbedCode();
            }
        );
    };

    buildIframeUrl = () => {
        return (
            `${window.location.origin}/embed/video/${
                this.props.shareInfo.id
            }?businesses=${this.state.embedEventBusinesses ? '1' : '0'}` +
            `&infobar=${this.state.embedEventInformation ? '1' : '0'}` +
            `&autoplay=${this.state.embedAutoPlay ? '1' : '0'}` +
            `&lovestory=${this.state.embedLoveStory ? '1' : '0'}` +
            `&muteonstart=${this.state.embedMuteOnStart ? '1' : '0'}`
        );
    };

    builEmbedCode = (props) => {
        if (
            tabKeywords[this.state.embedTargetSelected] === 'html' ||
            tabKeywords[this.state.embedTargetSelected] === 'wordpress' ||
            tabKeywords[this.state.embedTargetSelected] === 'squarespace'

        ) {
            return `<script videoid="${this.props.shareInfo.id}" businesses="${
                this.state.embedEventBusinesses ? '1' : '0'
            }" infobar="${
                this.state.embedEventInformation ? '1' : '0'
            }" autoplay="${
                this.state.embedAutoPlay ? '1' : '0'
            }" lovestory="${
                this.state.embedLoveStory ? '1' : '0'
            }" muteonstart="${
                this.state.embedMuteOnStart ? '1' : '0'
            }" width="100%" src="${
                window.location.origin
            }/script/lstvembedv.js"></script>`;
        }
        else {
            return `<iframe frameborder="0" src="${this.buildIframeUrl()}" allow="autoplay" width="100%" scrolling="no" style="border: none;width:100%;height:100%"></iframe>`;
        }
    };

    setEmbedCode = () => {
        this.setState({
            ...this.state,
            embedCode: this.builEmbedCode(),
        });
    };

    render() {
        let src = this.buildIframeUrl();

        const iframeResizerOptions = { checkOrigin: false };

        let embedCode = (
            <Flex
                margin={'0'}
                justifyContent={'flex-start'}
                alignItems={'center'}
                flexWrap={'nowrap'}
                background={this.props.background}
            >
                <Flex
                    justifyContent={'flex-start'}
                    flexWrap={'nowrap'}
                    flex={'1'}
                >
                    <EmbedCodeFieldStyle>
                        <Flex
                            id={'embedCode'}
                            height={'100%'}
                            alignItems={'flex-start'}
                            justifyContent={'flex-start'}
                            flexWrap={'nowrap'}
                            flex={'1 0'}
                        >
                            <EmbedCode>{this.state.embedCode}</EmbedCode>
                        </Flex>
                    </EmbedCodeFieldStyle>
                </Flex>
                <Flex
                    justifyContent={'flex-end'}
                    flexWrap={'nowrap'}
                    width={'70px'}
                >
                    <CopyToClipboard
                        onCopy={this.onCopy}
                        text={this.state.embedCode}
                    >
                        <Button
                            style={{
                                ...ButtonBaseStyle,
                                height: isMobileOnly ? '6rem' : '5rem',
                                width: '80px',
                                borderRadius: '0 10px 10px 0',
                                background: this.state.embedCopied
                                    ? LSTVGlobals.LSTV_GREEN
                                    : LSTVGlobals.LSTV_YELLOW,
                                color: this.state.embedCopied
                                    ? LSTVGlobals.WHITE
                                    : LSTVGlobals.TEXT_AND_SVG_BLACK,
                                '&:active': {
                                    transform: 'scale(1)',
                                },
                                [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
                                    '&:hover': {
                                        background: this.state.embedCopied
                                            ? LSTVGlobals.LSTV_GREEN
                                            : LSTVGlobals.PRIMARY_COLOR,
                                        color: LSTVGlobals.WHITE,

                                        '&:disabled': {
                                            background:
                                                LSTVGlobals.DISABLED_BUTTON_BG,
                                            color:
                                                LSTVGlobals.DISABLED_BUTTON_TEXT_COLOR,
                                            cursor: 'auto',
                                        },
                                    },
                                },
                            }}
                        >
                            {this.state.embedCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </CopyToClipboard>
                </Flex>
            </Flex>
        );

        let embedCodeForVideo = (
            <React.Fragment>
                <Flex
                    margin={'30px 0 10px 0'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                >
                    <span
                        style={{
                            color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                            fontSize: '1.3rem',
                        }}
                    >
                        &#10104;&nbsp;
                    </span>
                    <span
                        style={{
                            color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                            fontSize: '1rem',
                        }}
                    >
                        {
                            this.props.shareInfo.shareOptions[
                                tabKeywords[this.state.embedTargetSelected]
                            ]
                        }
                    </span>
                </Flex>

                {tabKeywords[this.state.embedTargetSelected] === 'squarespace' && (
                    <React.Fragment>
                        <Flex
                            margin={'0 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10105;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.squarespace2}
                            </span>
                        </Flex>

                        {embedCode}

                        <Flex
                            margin={'20px 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10106;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.squarespace3}
                            </span>
                        </Flex>
                        <Flex
                            margin={'20px 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.HEART_RED,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10107;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.HEART_RED,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.squarespace4}
                            </span>
                        </Flex>
                    </React.Fragment>)}



                        {tabKeywords[this.state.embedTargetSelected] === 'wix' && (
                    <React.Fragment>
                        <Flex
                            margin={'0 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10105;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.wix2}
                            </span>
                        </Flex>

                        <Flex
                            margin={'0 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10106;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.wix3}
                            </span>
                        </Flex>

                        <Flex
                            margin={'0 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10107;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.wix4}
                            </span>
                        </Flex>

                        {embedCode}

                        <Flex
                            margin={'20px 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10108;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.wix5}
                            </span>
                        </Flex>

                        <Flex
                            margin={'0 0 10px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1.3rem',
                                }}
                            >
                                &#10109;&nbsp;
                            </span>
                            <span
                                style={{
                                    color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                    fontSize: '1rem',
                                }}
                            >
                                {this.props.shareInfo.shareOptions.wix6}
                            </span>
                        </Flex>
                    </React.Fragment>
                )}

                {(tabKeywords[this.state.embedTargetSelected] === 'html' ||
                    tabKeywords[this.state.embedTargetSelected] ===
                        'wordpress') &&
                    embedCode}
            </React.Fragment>
        );

        let customizeVideo = (
            <React.Fragment>
                <Flex
                    margin={'5px 0 17px 0'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                >
                    <span
                        style={{
                            color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                            fontSize: '1.3rem',
                        }}
                    >
                        &#10103;&nbsp;
                    </span>
                    <span
                        style={{
                            color: LSTVGlobals.FORM_INSTRUCTION_COLOR,
                            fontSize: '1rem',
                        }}
                    >
                        Customize your embedded video
                    </span>
                </Flex>

                <EmbedControlGrid>
                    <EmbedControlGridItem>
                        {/*<SmallLabel margin={'0 0 5px 0'}>*/}
                        {/*    Video Information Bar*/}
                        {/*</SmallLabel>*/}

                        <input
                            type="checkbox"
                            id="showInfo"
                            checked={this.state.embedEventInformation}
                            onChange={this.onEventInformationToggle}
                        />
                        <label htmlFor="showInfo">Show Info Bar</label>
                    </EmbedControlGridItem>
                    <EmbedControlGridItem>
                        <input
                            type="checkbox"
                            id="showBusinesses"
                            onChange={this.onEventBusinessesToggle}
                            checked={this.state.embedEventBusinesses}
                        />
                        <label htmlFor="showBusinesses">Show Businesses</label>
                    </EmbedControlGridItem>
                    <EmbedControlGridItem>
                        <input
                            type="checkbox"
                            id="autoPlay"
                            onChange={this.onAutoPlayToggle}
                            checked={this.state.embedAutoPlay}
                        />
                        <label htmlFor="autoPlay">Autoplay Video</label>
                    </EmbedControlGridItem>
                    <EmbedControlGridItem>
                        <input
                            type="checkbox"
                            id="startMute"
                            onChange={this.onMuteOnStartToggle}
                            checked={this.state.embedMuteOnStart}
                        />
                        <label htmlFor="startMute">Mute On Start</label>
                    </EmbedControlGridItem>
                    <EmbedControlGridItem>
                        <input
                            type="checkbox"
                            id="loveStory"
                            onChange={this.onLoveStoryToggle}
                            checked={this.state.embedLoveStory}
                        />
                        <label htmlFor="loveStory">Love Story Ticker</label>
                    </EmbedControlGridItem>
                </EmbedControlGrid>
            </React.Fragment>
        );

        let preview = (
            <React.Fragment>
                <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                    <FancySeparator margin={'15px 0 15px 0'} />
                    <Flex
                        margin={'0 0 5px 0'}
                        justifyContent={'flex-start'}
                        alignItems={'center'}
                        flexWrap={'nowrap'}
                        flex={'1'}
                    >
                        <FormLabel>Embed Preview (not to scale)</FormLabel>
                    </Flex>

                    <EmbedPreviewContainer>
                        <ReactIframeResizer
                            iframeResizerOptions={iframeResizerOptions}
                            src={src}
                        ></ReactIframeResizer>
                    </EmbedPreviewContainer>
                </MediaQuery>
            </React.Fragment>
        );

        if (this.props.shareInfo)
            return (
                <ShareContentStyle ref={this.innerRef} tabIndex={1} onKeyDown={this.handleKeyDown} background={this.props.background}>
                    <URLShareBar
                        fullUrl={window.location.href} 
                    />
                    <SocialMediaButtonsBar 
                        fullUrl={window.location.href}
                        onShowHTML={() => (this.setState({...this.state, showEmbedCode: !this.state.showEmbedCode}))}
                    />
                    {/* <EmbedCode>{this.state.embedCode}</EmbedCode> */}
                    {this.state.showEmbedCode && 
                        <>
                        <p>Embed Code:</p>
                        <URLShareBar fullUrl={this.state.embedCode}/>
                        </>
                    }
                    {/* {this.props.shareInfo.shareOptions.embed && <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                        <FancySeparator margin={'15px 0 15px 0'} />

                        <Flex
                            margin={'0 0 5px 0'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                            flexWrap={'nowrap'}
                            flex={'1'}
                        >
                            <FormLabel>
                                {
                                    this.props.shareInfo.shareOptions
                                        .shareEmbedLabel
                                }
                            </FormLabel>
                        </Flex>
                        <Flex
                            flexWrap={'nowrap'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                        >
                            <Flex
                                margin={'10px 0 10px 0'}
                                justifyContent={'flex-start'}
                                alignItems={'center'}
                            >
                                <span
                                    style={{
                                        color:
                                            LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                        fontSize: '1.3rem',
                                    }}
                                >
                                    &#10102;&nbsp;
                                </span>
                                <span
                                    style={{
                                        color:
                                            LSTVGlobals.FORM_INSTRUCTION_COLOR,
                                        fontSize: '1rem',
                                        marginRight: '20px',
                                    }}
                                >
                                    Select your embed target
                                </span>
                            </Flex>
                        </Flex>
                        <Flex
                            flexWrap={'wrap'}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                            width={'100%'}
                        >
                            <Tabs
                                onSelect={(index) => {
                                    console.log(`select: ${index}`);
                                    this.setState({
                                        ...this.state,
                                        embedTargetSelected: index,
                                    }, () => {
                                        this.setEmbedCode();
                                    });
                                }}
                                style={{
                                    border: 'none',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                <TabList
                                    style={{
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-evenly',
                                    }}
                                >
                                    <Tab>None</Tab>
                                    <Tab>
                                        <FontAwesomeIcon
                                            className="fa-fw"
                                            style={{ fontSize: '1.3rem' }}
                                            icon={faCode}
                                        />
                                        Plain HTML
                                    </Tab>
                                    <Tab>
                                        <FontAwesomeIcon
                                            className="fa-fw"
                                            style={{ fontSize: '1.5rem' }}
                                            icon={faWix}
                                        />
                                    </Tab>
                                    <Tab>
                                        <FontAwesomeIcon
                                            className="fa-fw"
                                            style={{ fontSize: '1.3rem' }}
                                            icon={faSquarespace}
                                        />
                                        Squarespace
                                    </Tab>
                                    <Tab>
                                        <FontAwesomeIcon
                                            className="fa-fw"
                                            style={{ fontSize: '1.3rem' }}
                                            icon={faWordpressSimple}
                                        />
                                        WordPress
                                    </Tab>
                                </TabList>
                                <TabPanel
                                    style={{ overflow: 'hidden' }}
                                ></TabPanel>
                                <TabPanel style={{ overflow: 'hidden' }}>
                                    {customizeVideo}
                                    {embedCodeForVideo}
                                    {preview}
                                </TabPanel>
                                <TabPanel style={{ overflow: 'hidden' }}>
                                    {customizeVideo}
                                    {embedCodeForVideo}
                                    <div
                                        style={{
                                            marginTop: '10px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <img
                                            style={{ width: '95%' }}
                                            src={WixEmbedExample}
                                        />
                                    </div>
                                    {preview}
                                </TabPanel>
                                <TabPanel style={{ overflow: 'hidden' }}>
                                    {customizeVideo}
                                    {embedCodeForVideo}
                                    <div
                                        style={{
                                            marginTop: '10px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <img
                                            style={{ width: '80%' }}
                                            src={SquarespaceEmbedExample}
                                        />
                                    </div>
                                    {preview}
                                </TabPanel>
                                <TabPanel style={{ overflow: 'hidden' }}>
                                    {customizeVideo}
                                    {embedCodeForVideo}
                                    <div
                                        style={{
                                            marginTop: '10px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <img
                                            style={{ width: '80%' }}
                                            src={WordPressEmbedExample}
                                        />
                                    </div>
                                    {preview}
                                </TabPanel>
                            </Tabs>
                        </Flex>
                    </MediaQuery>} */}
                </ShareContentStyle>
            );
        else return null;

       
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        //    data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

ShareContentForm.defaultProps = {
    shareInfo: null,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(ShareContentForm));
