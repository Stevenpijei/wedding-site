import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import {
    FancySeparator,
    Flex,
    GenericContainer,
    Spacer,
    VerticalSpacer,
} from '../../utils/LSTVUtils';
import { withRouter } from 'react-router';
import { isMobile, isMobileOnly, isTablet } from 'react-device-detect';
import LSTVCloudTag from '../Utility/Tags/LSTVCloudTag';
import LSTVTicketTag from '../Utility/Tags/LSTVTicketTag';
import VideoInfoGrid from '../Content/VideoInfoGrid';
import DateBadge from '../Utility/DateBadge';
import MediaQuery from 'react-responsive/src/Component';
import BusinessRoleGrid from '../Content/BusinessRoleGrid';
import { SizeMe } from 'react-sizeme';

class VideoDataPoints extends React.Component {
    constructor(props) {
        super(props);

        this.businessViewPortRef = React.createRef();
    }

    render() {
        let video = this.props.mainVideoData.post.videos[0];

        let dataPoints = (
            <Flex flexDirection={'row'} width={'100%'} justifyContent={'flex-start'}>
                <DateBadge
                    width={isMobileOnly ? '40px' : '60px'}
                    height={isMobileOnly ? '40px' : '60px'}
                    monthFontSize={isMobileOnly ? '0.9rem' : '1.3rem'}
                    yearFontSize={isMobileOnly ? '0.9rem' : '1.4rem'}
                    dateStr={video.event_date}
                />
                <Spacer width={'10px'} />
                <VideoInfoGrid
                    contactCouple={true}
                    contactBusinesses={true}
                    embedded={this.props.emedded}
                    video={video}
                    postProperties={this.props.mainVideoData.post.properties}
                    directLink={`/${this.props.mainVideoData.post.slug}`}
                    withWatchLink={true}
                />
            </Flex>
        );

        return (
            <SizeMe monitorHeight={true}>
                {({ size }) => {
                    //console.log(size.height * 0.4);
                    return (
                        <React.Fragment>
                            <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                                <GenericContainer>
                                    <GenericContainer  padding={'10px'}>
                                        {dataPoints}
                                        <FancySeparator margin={"5px 0 10px 0"}/>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                padding: '5px 0 5px 0',
                                                width: '100%',
                                            }}
                                        >
                                            Wedding Team
                                        </div>
                                        <VerticalSpacer space={10} />
                                        <BusinessRoleGrid
                                            showLoveClubBadge={false}
                                            justifyContent={
                                                isTablet
                                                    ? video.businesses.length > 2
                                                    ? 'flex-start'
                                                    : 'center'
                                                    : 'flex-start'
                                            }
                                            videoId={video.id}
                                            businesses={video.businesses.slice(0, this.props.businessLimit)}
                                            size={size}
                                        />

                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                padding: '5px 0 5px 0',
                                                width: '100%',
                                            }}
                                        >
                                            Vibe
                                        </div>
                                        <VerticalSpacer space={10} />
                                        <LSTVCloudTag
                                            fontSize={LSTVGlobals.CARD_TAG_FONT_SIZE}
                                            fontWeight={LSTVGlobals.FONT_WEIGHT_NORMAL}
                                            justifyContent={'center'}
                                            alignContent={'center'}
                                        >
                                            {video.vibes
                                                .slice(0, this.props.vibeLimit)
                                                .map((data, index) => {
                                                    return (
                                                        <LSTVTicketTag
                                                            key={index}
                                                            name={data.name}
                                                            tooltip={data.type}
                                                            link={`/style/${data.slug}`}
                                                            margin={'0 7px 5px 0'}
                                                        />
                                                    );
                                                })}
                                        </LSTVCloudTag>

                                    </GenericContainer>
                                </GenericContainer>
                            </MediaQuery>




                            <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                <Flex
                                    borderRadius={'0 0 10px 10px'}
                                    flexDirection={'column'}
                                    width={'100%'}
                                    height={'100%'}
                                    justifyContent={'space-evenly'}
                                >
                                    <Flex flexDirection={'row'} width={'100%'} justifyContent={'flex-start'}>
                                        <GenericContainer width={'100%'} height={'100%'} padding={'10px 10px 0 10px'}>

                                                {dataPoints}

                                        </GenericContainer>
                                    </Flex>

                                    <FancySeparator margin={'10px 0 5px 0'} />


                                    <Flex
                                        flexDirection={'row'}
                                        width={'100%'}
                                        height={'100%'}
                                        maxHeight={isMobile ? 'none' : `${size.height * 0.4}px`}
                                        overflow={'hidden'}
                                        ref={this.businessViewPortRef}
                                    >
                                        <GenericContainer width={'100%'} margin={'10px'} height={'100%'}>
                                            <Flex flexDirection={'row'} width={'100%'}>
                                                <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                                    <BusinessRoleGrid
                                                        justifyContent={
                                                            isTablet
                                                                ? video.businesses.length > 2
                                                                    ? 'flex-start'
                                                                    : 'center'
                                                                : 'flex-start'
                                                        }
                                                        videoId={video.id}
                                                        businesses={video.businesses.slice(0, this.props.businessLimit)}
                                                        size={size}
                                                        showOnlyInViewPort={true}
                                                        root={this.businessViewPortRef.current}
                                                    />
                                                </MediaQuery>

                                            </Flex>
                                        </GenericContainer>
                                    </Flex>

                                    {size.height * 0.4 >= 128.8806 && (
                                        <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                            <FancySeparator margin={'10px 0 10px 0'} />
                                        </MediaQuery>
                                    )}


                                    {/*<Flex flexDirection={'row'} width={'100%'}>*/}
                                    {/*    <GenericContainer width={'100%'} padding={'10px 10px 10px 10px'}>*/}
                                    {/*        <Flex flexDirection={'row'} width={'100%'}>*/}
                                    {/*            <LSTVCloudTag*/}
                                    {/*                fontSize={LSTVGlobals.CARD_TAG_FONT_SIZE}*/}
                                    {/*                fontWeight={LSTVGlobals.FONT_WEIGHT_NORMAL}*/}
                                    {/*                justifyContent={'center'}*/}
                                    {/*                alignContent={'center'}*/}
                                    {/*                trackVisibility={true}*/}
                                    {/*            >*/}
                                    {/*                {video.vibes*/}
                                    {/*                    .slice(0, this.props.vibeLimit)*/}
                                    {/*                    .map((data, index) => {*/}
                                    {/*                        return (*/}
                                    {/*                            <LSTVTicketTag*/}
                                    {/*                                key={index}*/}
                                    {/*                                name={data.name}*/}
                                    {/*                                tooltip={data.type}*/}
                                    {/*                                link={`/vibe/${data.slug}`}*/}
                                    {/*                                margin={'0 7px 5px 0'}*/}
                                    {/*                            />*/}
                                    {/*                        );*/}
                                    {/*                    })}*/}
                                    {/*            </LSTVCloudTag>*/}
                                    {/*        </Flex>*/}
                                    {/*    </GenericContainer>*/}
                                    {/*</Flex>*/}

                                </Flex>
                            </MediaQuery>
                        </React.Fragment>
                    );
                }}
            </SizeMe>
        );
    }
}

VideoDataPoints.defaultProps = {
    businessLimit: LSTVGlobals.DEFAULT_VIDEO_DATA_POINTS_VENDOR_LIMIT,
    vibeLimit: LSTVGlobals.DEFAULT_VIDEO_DATA_POINTS_VIBE_LIMIT,
};

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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VideoDataPoints));
