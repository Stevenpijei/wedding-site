import React, { useRef } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import Masonry from 'react-masonry-css';
import { isMobileOnly, isTablet } from 'react-device-detect';
import { InView } from 'react-intersection-observer';
import LSTVCard from '../../newComponents/cards/LSTVCard';
import {VerticalSpacer} from "../../utils/LSTVUtils";

export const BusinessGridItemContainerStyle = styled.div`
    opacity: ${(props) => (props.inView ? '1' : '0;')};
`;

class BusinessRoleGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            businesses: this.props.businesses ? this.props.businesses : null,
            video_id: this.props.video_id,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.videoId !== prevProps.videoId) {
            this.setState({
                businesses: this.props.businesses,
                videoId: this.props.videoId,
            });
        }
    }

    componentDidMount() {}

    calcNumberColumns = (size) => {
        // default is 3
        let rc = 3;

        // a few known fixed columns...
        if (isMobileOnly) rc = 2;
        if (isTablet) rc = 4;

        if (size) {
            // and let's get more precise according to available width...
            if (size.width > 300) rc = 2;
            if (size.width > 480) rc = 3;
            if (size.width > 650) rc = 4;
            if (size.width > 800) rc = 5;
        }

        return rc;
    };

    render() {
        let businessTiles = [];

        let showAlwaysAsInView = !this.props.showOnlyInViewPort;

        if (this.state.businesses) {
            let businessCount = 0;
            businessTiles = this.state.businesses
                .filter((data, index) => {
                    if (this.props.filter === 'love-club' && data.premium) return false;
                    if (this.props.filter === 'non-love-club' && !data.premium) return false;

                    if (this.props.size) {
                        return true;
                    } else return true;
                })
                .map((data, index) => {
                    businessCount++;
                    if (businessCount <= this.props.limit)
                        return (
                            <InView root={this.props.root} rootMargin={'10px 10px 0px 10px'} key={index} threshold={1}>
                                {({ inView, ref, entry }) => {
                                    //console.log(data.name + " inview: " + inView);
                                    return (
                                        <div ref={ref}>
                                            <BusinessGridItemContainerStyle
                                                embedded={this.props.embedded}
                                                embeddedSize={this.props.embeddedSize}
                                                itemMaxWidth={this.props.itemMaxWidth}
                                                inView={showAlwaysAsInView || inView}
                                            >
                                                <LSTVCard
                                                    options={{
                                                        cardType: 'wedding-business',
                                                        orientation: 'portrait',
                                                        containerMode: 'grid',
                                                        bg_color: data.bg_color,
                                                        cardSlug: `/business/${data.slug}`,
                                                    }}
                                                    data={{
                                                        premium: data.premium,
                                                        name: data.name,
                                                        role: {
                                                            name: data.role_name,
                                                            slug: data.business_capacity_type_slug || data.role_slug,
                                                            family_type: data.role_family
                                                        },
                                                    }}
                                                />
                                                <VerticalSpacer space={5}/>

                                            </BusinessGridItemContainerStyle>
                                        </div>
                                    );
                                }}
                            </InView>
                        );
                    else return null;
                });
        }

        return (
            <Masonry
                breakpointCols={this.calcNumberColumns(
                    this.props.embedded ? this.props.embeddedSize.width : this.props.size
                )}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column-8"
            >
                {businessTiles}
            </Masonry>
        );
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

BusinessRoleGrid.defaultProps = {
    withLinks: false,
    itemMaxWidth: null,
    justifyContent: 'left',
    limit: LSTVGlobals.DEFAULT_VIDEO_DATA_POINTS_VENDOR_LIMIT,
    filter: 'all',
    showLoveClubBadge: true,
    videoId: '',
    embedded: false,
    size: null,
    columns: 3,
    olumnsTablet: 3,
    columnsMobile: 2,
    columnsLoveClub: 2,
    showOnlyInViewPort: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(BusinessRoleGrid);
