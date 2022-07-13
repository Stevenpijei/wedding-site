import React from "react";
import Header from "../Header";
import PageContent from "./PageContent";
import * as RestAPI from "../../rest-api/Call";
import * as ActionTypes from "../../store/actions";
import {connect} from "react-redux";
import {Router, withRouter} from "react-router";
import {Helmet} from "react-helmet";
import * as LSTVGlobals from "../../global/globals";
import PageVeil from "../Utility/PageVeil";
import styled from "styled-components";
import {LSTV_API_V1t} from "../../rest-api/Call";
import MainContent from "./PageSupport/MainContent";
import LSTVHeaderBar from "../Header/LSTVHeaderBar";

const SVGContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 600px;
`;


const SVGCurve = styled.svg`
    height: 500px;
`;

class LSTVHomePage extends React.Component {

    constructor(props) {
        super(props);
        this._cancelToken = null;

        this.state = {
            pageReady: false
        }
    }

    componentDidMount() {

        RestAPI.call(
            "get",
            null,
            RestAPI.LSTV_API_V1.GET_MAIN_VIDEO_INFO,
            (data) => {

                this.props.onMainVideoDataReady(
                    data.result,
                    LSTV_API_V1.GET_MAIN_VIDEO_INFO.cacheAt,
                    LSTV_API_V1.GET_MAIN_VIDEO_INFO.url);
            },
            (error) => {
            },
            (error) => {
            },
            null).then(cancelToken => {
            this._cancelToken = cancelToken;
        });

        // load time must be before 1.5 seconds.. or we force it.

        setTimeout(() => {this.setState({...this.state,pageReady: true})},
            1500);
    }


    componentWillUnmount() {
        if (this._cancelToken) {
            ////console.log("*** Cancelling API request as the component is unmounting!");
            this._cancelToken.cancel();
        }
    }

    onUnveilCheck = () => {
        return this.state.pageReady;
    };

    render() {
        return <React.Fragment>
            <PageVeil isLoading={true} onUnveilCheck={this.onUnveilCheck}/>
            <Helmet>
                <meta charSet="utf-8"/>
                <title> {this.props.frontEndSettings && this.props.frontEndSettings.homePageTitle ?
                    this.props.frontEndSettings.homePageTitle : LSTVGlobals.FRONT_END_SETTINGS_HOME_PAGE_TITLE}</title>
            </Helmet>

            <PageContent>
                <MainContent>


                </MainContent>
            </PageContent>
        </React.Fragment>;
    }
}

const mapDispatchToProps = dispatch => {

};

const mapStateToProps = state => {

};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LSTVHomePage));

