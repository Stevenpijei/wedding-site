import {connect} from "react-redux";
import * as LSTVGlobals from "../../global/globals";
import {withRouter} from "react-router";
import styled, {css} from "styled-components";
import React from "react";
import MediaQuery from "react-responsive";
import MainContent from "../Pages/PageSupport/MainContent";
import {isMobileOnly} from "react-device-detect";
import ContentActionBar from "../Utility/ContentActionBar";
import {generateWeddingDateJSX} from "../../utils/LSTVUtils";
import ReactHtmlParser, {processNodes, convertNodeToElement, htmlparser2} from 'react-html-parser';
import InlineLabelAndContentStyle from "../Utility/InlineLabelAndContent"
import LSTVButton from "../Utility/LSTVButton";
import Button, {ButtonImageRound, ButtonRoundStyle} from "../Utility/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDoubleDown, faChevronDoubleUp} from "@fortawesome/pro-light-svg-icons";
import AnimateHeight from 'react-animate-height';

export const LoveStoryContainer = styled.div`
    margin-top: 15px;
    position: relative;
    width: 100%;
    text-align: justify;
    
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        margin-top: 0px;
    }
    
    @media ${LSTVGlobals.UserDevice.isTablet} {
        //margin: 10px 5px 15px 5px;
    }
    
    margin-right: ${props => props.marginRight};
    
`;

const LoveStoryText = styled.div`
    margin-right: 2px;
    overflow: hidden;
    column-count: unset;
    position: relative;
   
    @media ${LSTVGlobals.UserDevice.tablet} {
       
        ${props => props.textLength > 500 && css`
            column-count: 0;
            
            @media ${LSTVGlobals.UserDevice.isTablet} {
              column-count: 2;
            }
            
            @media ${LSTVGlobals.UserDevice.laptop} {
              column-count: 3;
            }
            
            column-gap: 27px;
            column-rule: 1px dotted ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
       
            
            & ul {
              list-style-type: circle;
              padding-left: 20px;
             }
            
        `};
    }

    font-size: 1rem;
    line-height: 1.2rem;

    
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        padding-left: 4px;
        padding-right: 4px;
        mask-image: unset;
             
        ${props => props.collapsed && css`
            @media ${LSTVGlobals.UserDevice.isMobile} {
              
                //text-align: left;
                //mask-image: linear-gradient(to bottom, black -5px, transparent 35px);
                // display: -webkit-box;
                // -webkit-line-clamp: 2;
                // -webkit-box-orient: vertical;  
                font-size: 1rem;
                line-height: 1.2rem;
            }
        `};
    }
`;

const MoreLessFog = styled.div`
    text-align: center;
    
    
     @media ${LSTVGlobals.UserDevice.isMobile} {
        ${props => props.collapsed && css`
            //margin-top: -20px;
            padding-bottom: 4px;
        `};
         ${props => !props.collapsed && css`
            padding-bottom: 4px;
        `};
     }
    
     @media ${LSTVGlobals.UserDevice.isTablet} {
        ${props => props.collapsed && css`
            margin-top: -20px;
            padding-bottom: 10px;
        `};
         ${props => !props.collapsed && css`
            margin-top: 6px;
            padding-bottom: 10px;
        `};
     }
`;


class LoveStory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentDidMount() {
    }

    toggleCollapsed = () => {

        const isCollapsed = this.state.collapsed;

        this.setState({
            ...this.state,
            collapsed: !this.state.collapsed
        })

        if (!isCollapsed)
            window.scrollTo({top: this.loveStorySection.offsetTop, left: 0, behavior: 'smooth'});


    };

    onClick = () => {

    };


    render() {

        const FlipButtonStyle = {
            ...ButtonImageRound,
            transition: 'all 0.3s linear',
            transitionDelay: '0.3s',
            transform: this.state.collapsed ? 'rotate(-0deg)' : 'rotate(+180deg)'
        };

        let eventDate = generateWeddingDateJSX(
            this.props.postProperties['wedding_date'], LSTVGlobals.FONT_WEIGHT_NORMAL,
            "1em");

        return <LoveStoryContainer marginRight={this.props.marginRight}>
            <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                <LoveStoryText
                    collapsed={this.state.collapsed}
                    textLength={this.props.loveStoryText.length}>
                        {ReactHtmlParser(this.props.loveStoryText)}
                </LoveStoryText>
            </MediaQuery>

            <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                <AnimateHeight
                    duration={250}
                    style={{flexShrink: 0}}
                    height={this.state.collapsed ? 40 :  'auto'}
                    onClick={this.toggleCollapsed}>
                    <LoveStoryText
                        ref={(section) => { this.loveStorySection = section; }}
                        collapsed={this.state.collapsed}
                        textLength={this.props.loveStoryText.length}>
                        <div>
                            {/*<MediaQuery query={LSTVGlobals.UserDevice.isMobile}>*/}
                            {/*    <InlineLabelAndContentStyle float={"left"}*/}
                            {/*                                rightMargin>Love Story</InlineLabelAndContentStyle>*/}
                            {/*</MediaQuery>*/}
                            {ReactHtmlParser(this.props.loveStoryText)}
                        </div>
                    </LoveStoryText>
                </AnimateHeight>

                <MoreLessFog collapsed={this.state.collapsed}>
                    <Button onClick={this.toggleCollapsed} style={FlipButtonStyle} collapsed={this.state.collapsed}>
                        <FontAwesomeIcon className="fa-fw"
                                         icon={faChevronDoubleDown}/>
                    </Button>
                </MoreLessFog>
            </MediaQuery>
        </LoveStoryContainer>;
    }

}

const mapDispatchToProps = dispatch => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        // 	data: data}),
    };
};

const mapStateToProps = state => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};


LoveStory.defaultProps = {
    loveStoryText: "This is a default love story..... you should get your own.",
    marginRight: "0"
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoveStory));

