import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import { isMobileOnly } from 'react-device-detect';
import styled, { css } from 'styled-components';
import { Flex, PageSectionTitle } from '../../utils/LSTVUtils';
import parse from 'html-react-parser';
import VideoPlayer from '../Video/VideoPlayer';
import VideoPlayback from '../Video/VideoPlayback';

const CompositeVideoPlayerContainer = styled.div`
    width: 80%;
    margin: 20px auto 20px auto;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        width: 100%;
    }

    @media ${LSTVGlobals.UserDevice.isTablet} {
        width: 100%;
    }
`;

class CompositeContent extends React.Component {
    constructor(props) {
        super(props);

        let content = this.buildContent(props.source);
        this.state = {
            content: content,
        };
    }

    buildContent = (content) => {
        return content.map((data, index) => {
            switch (data.type) {
                case LSTVGlobals.COMPOSITE_CONTENT_LEGACY_HTML:
                    return parse(
                        data.content
                            .replace('>\r', '><br/><br/>')
                            .replace('!\r', '!<br/><br/>')
                            .replace('.\r', '.<br/><br/>')
                    );

                case LSTVGlobals.COMPOSITE_CONTENT_VIDEO:
                    return (
                        <CompositeVideoPlayerContainer key={index}>
                            <VideoPlayback
                                uniqueId={'blogVideoPlayer' + index}
                                videoType={'jwplayer'}
                                videoWidth={'100%'}
                                mediaID={data.media_id}
                                videoIdentifier={data.media_id}
                                isAutoPlay={data.auto_play}
                                isMuted={false}
                                withPreRoll={true}
                                showLoadingMessage={false}
                            />
                        </CompositeVideoPlayerContainer>
                    );
            }
        });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isMobileOnly) ReactTooltip.rebuild();

        if (this.props.slug !== prevProps.slug) {
            let content = this.buildContent(this.props.source);
            this.setState({
                ...this.state,
                content: content,
            });
        }
    }

    componentDidMount() {}

    componentWillUnmount() {
        // cleanup...
    }

    render() {
        return <div>{this.state.content}</div>;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        // 	data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

CompositeContent.defaultProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CompositeContent));
