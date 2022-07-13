import React from "react";
import {connect} from "react-redux";
import styled, {css, keyframes} from "styled-components";
import * as LSTVGlobals from "../../../global/globals";
import {SVGIcon} from "../../Utility/SVGIcons";
import {LSTV_API_V1} from "../../../rest-api/Call";
import MediaQuery from "react-responsive";
import {isMobile, isBrowser, isMobileOnly} from 'react-device-detect';
import {Flex, PageSectionTitle} from "../../../utils/LSTVUtils";
import {Link} from "react-router-dom";

const boastBarItemAnimation = keyframes`
    0% {
        opacity: 0.20;
        transform: scale(0.8);
    }
    50% {
        opacity: 0.50;
        transform: scale(1.05);
    }
    100% {
        opacity: 1;
        transform: scale(1.0);
    }
`;

const BoastBarStyle = styled.div`
    position: relative;
    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        background: linear-gradient(to top, ${LSTVGlobals.BOAST_BAR_GRADIENT_COLOR_1} 0%, 
            ${LSTVGlobals.BOAST_BAR_GRADIENT_COLOR_2} 100%);
        
    }
    padding: 5px;
`;

const BoastBarSection = styled.div`
  
    padding: 0 8px 0 8px;
    animation: ${boastBarItemAnimation} 0.4s;
    
    @media ${LSTVGlobals.UserDevice.laptop} {
        margin: 10px;
        border-radius: 10px;
        &:hover {
            cursor: pointer;
        }
    }
    
    @media ${LSTVGlobals.UserDevice.isMobile} {
        padding: 5px;
    }
`;

const BoastBarSectionIcon = styled.div`
    text-align: center;
    margin-bottom: 10px;
    
    svg {
        width: 30px;
        height: 30px;
    }
    
    @media ${LSTVGlobals.UserDevice.laptop} {
         margin-bottom: 20px;
    }
`;

const BoastBarSectionTitle = styled.div`
    text-align: center;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
    margin-bottom: 5px;
    
`;

const BoastBarSectionText = styled.div`
    display: inline-block;
    text-align: center;
    
    @media ${LSTVGlobals.UserDevice.isTablet} {
        font-size: 0.8rem;
    }
    
     @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 0.8rem;
    }
`;


class BoastBar extends React.Component {

    constructor(props) {
        super(props);

        this.intervalID = null;

        this.state = {
            currentSlide: 0
        };
    }


    componentDidMount() {
        // start a switching interval
        if (isMobileOnly)
            this.intervalID = setInterval(this.switchSlide, 3000);
    }

    componentWillUnmount() {

        // clear interval
        if (isMobileOnly)
            clearInterval(this.intervalID);
    }


    switchSlide = () => {
        if (this.props.frontEndSettings && this.props.frontEndSettings.boastbar) {
            let currentSlide = this.state.currentSlide;
            currentSlide++;
            if (currentSlide > this.props.frontEndSettings.boastbar.sections.length - 1)
                currentSlide = 0;

            this.setState({
                ...this.state,
                currentSlide: currentSlide
            })
        }
    };


    render() {

        if (this.props.frontEndSettings && this.props.frontEndSettings.boastbar) {
            let boastBar = this.props.frontEndSettings.boastbar;

            let title = <PageSectionTitle>
                {boastBar.title}
            </PageSectionTitle>;

            let boastBarSections = boastBar.sections.map((data, index) => {
                return <Flex key={index} className={"BoastElementFlexContainer"} flexDirection={"column"} flex={"1"}>
                    <Link to={"/" + data.slug} style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <BoastBarSection className={"BoastBarSection"}>
                            <BoastBarSectionIcon>
                                <SVGIcon icon={data.icon}/>
                            </BoastBarSectionIcon>
                            <BoastBarSectionTitle>
                                {data.title}
                            </BoastBarSectionTitle>
                            <BoastBarSectionText>
                                {data.text}
                            </BoastBarSectionText>
                        </BoastBarSection>
                    </Link>
                </Flex>;
            });

            if (isMobileOnly) {
                boastBarSections.unshift(<Flex key={999} className={"BoastElementFlexContainer"} flexDirection={"column"} flex={"1"}>
                    <Link to={"/search"} style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <BoastBarSection className={"BoastBarSection"}>
                            <BoastBarSectionIcon>
                                <SVGIcon icon={"wedding"}/>
                            </BoastBarSectionIcon>
                            <BoastBarSectionTitle>
                                {boastBar.title}
                            </BoastBarSectionTitle>
                            <BoastBarSectionText>
                                {boastBar.title_text}
                            </BoastBarSectionText>
                        </BoastBarSection>
                    </Link>
                </Flex>);
            }


            return <BoastBarStyle>

                <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                    {title}
                </MediaQuery>
                <Flex margin={isBrowser ? "0 auto" : null} maxWidth={isBrowser ? "80%" : null}
                      lassName={"BoastBarFlexContainer"} display={"flex"} flexWrap={"nowrap"}
                      flexDirection={"row"}>
                    <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                        {boastBarSections}
                    </MediaQuery>
                    <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                        {boastBarSections[this.state.currentSlide]}
                    </MediaQuery>
                </Flex>
            </BoastBarStyle>
        } else return null;
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // onBoastBarDataReady: (data, cacheAt, cacheKey) => dispatch({
        //     type: ActionTypes.ACTION_BOAST_BAR_DATA_READY,
        //     data: data,
        //     cacheAt: cacheAt,
        //     cacheKey: cacheKey
        // })
    };
};

const mapStateToProps = state => {
    return {

    };
};


export default connect(mapStateToProps, mapDispatchToProps)(BoastBar);

