import React  from 'react';
import { connect } from 'react-redux';
import {TEXT_AND_SVG_BLACK} from '../../global/globals';
import * as ActionTypes from '../../store/actions';
import {  ShareIcon } from '../Utility/LSTVSVG' ;
import { Stat, IconContainer } from "../../components/Pages/VideoPage/LayoutComps";



const ContentShareWidget = (props) =>  (
    <Stat style={{cursor: 'pointer'}} 
        onClick={() =>
            props.onShareClicked(
                props.ownerType,
                props.ownerId,
                props.shareOptions,
                props.shareOptions.shareThumbnailUrl,
            )
        }
    >
        <IconContainer>
            <ShareIcon fillColor={props.fillColor} strokeWidth={'0'} />
        </IconContainer>
        {props.showText && <strong>Share</strong>}
    </Stat>
);

const mapDispatchToProps = (dispatch) => {
    return {
        onShareClicked: (
            ownerType,
            ownerId,
            shareOptions,
            shareThumbnailUrl,

        ) =>
            dispatch({
                type: ActionTypes.ACTION_SHOW_SHARE_MODAL,
                data: {
                    type: ownerType,
                    id: ownerId,
                    shareOptions: shareOptions,
                    shareThumbnailUrl: shareThumbnailUrl,
                },
            }),
    };
};

const mapStateToProps = () => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

ContentShareWidget.defaultProps = {
    ownerType: null,
    ownerId: null,
    textColor: TEXT_AND_SVG_BLACK
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentShareWidget);
