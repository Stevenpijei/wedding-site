import React from "react";
import {connect} from "react-redux";
import * as LSTVGlobals from "../../global/globals";
import {withRouter} from "react-router";
import ReactTooltip from "react-tooltip";
import {isMobileOnly} from "react-device-detect";
import Autocomplete from 'react-google-autocomplete';
import {css} from 'glamor'

export const defaultGooglePlacesSearchBarStyle = {
    width: '100%',
    display: 'block',
    outline: 'none',
    border: 'none',
    height: '2rem',
    lineHeight: '2rem',
    fontSize: '1rem',
    padding: '2px 5px 2px 5px',
    background: LSTVGlobals.DEFAULT_FORM_FIELD_BG,

    '::placeholder': {
        color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    },

    '&:focus': {
        boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 1px ${LSTVGlobals.CARD_BACKGROUND_DARKEST}`,
    },
};

class GooglePlacesSearchBar extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            focus: true
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly)
            ReactTooltip.rebuild();

    }

    componentDidMount() {

    }

    componentWillUnmount() {
        // cleanup...
    }

    render() {
        return <Autocomplete
            id={this.props.identifier}
            type={"string"}
            {...css(this.props.style)}
            onPlaceSelected={place => {
                if (this.props.placeSelectionHandler) this.props.placeSelectionHandler(place)
            }}
            types={['(regions)']}
            placeholder={this.props.placeHolder}
            onChange={(e) => { if (this.props.textChangeHandler) this.props.textChangeHandler(e.target.value)}}
            defaultValue={this.props.defaultValue}
            onBlur={(e)=> {if (this.props.blurHandler) this.props.blurHandler(e)}}
        />;
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

GooglePlacesSearchBar.defaultProps = {
    placeSelectionHandler: null,
    identifier: "googlePlaces",
    textChangeHandler: null,
    blurHandler: null,
    defaultValue: "",
    placeHolder: null,
    style: defaultGooglePlacesSearchBarStyle

};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(GooglePlacesSearchBar));

