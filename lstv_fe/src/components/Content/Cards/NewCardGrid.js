import React from 'react';
import PropTypes from 'prop-types';
import * as LSTVGlobals from '../../../global/globals';
import styled from 'styled-components';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import PhotoGallery from '../PhotoGallery';
import MediaQuery from 'react-responsive';
import Observer from 'react-intersection-observer';
import HorizontalScroll from '../../Utility/HorizontalScroll';
import Masonry from 'react-masonry-css';
import { isTablet } from 'react-device-detect';
import * as RestAPI from '../../../rest-api/Call';
import {
    coupleDisplayNamesFromVideo,
    getLocationFullName,
    getVibesForCard,
    businessFromVideo,
} from '../../../utils/LSTVUtils';
import { recordNonRealTimeUserEvent } from '../../../store/localStorage';
import LSTVCard, {
    CARD_TYPE_ARTICLE,
    CARD_TYPE_VIDEO,
    CARD_TYPE_BUSINESS,
    CARD_TYPE_VIBE
} from "../../../newComponents/cards/LSTVCard";

const CardGridStyle = styled.div`
    width: 100%;
    display: grid;
    grid-gap: 5px;
    grid-template-columns: 1fr 1fr;

    @media ${LSTVGlobals.UserDevice.tablet} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.laptopL} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr 1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        display: block;
        overflow-y: hidden;
        overflow-x: scroll;
        margin: 0 7px 0 5px;
    }

    height: auto;
`;

class CardGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            everInViewport: false,
            ready: false,
        };
    }

    componentDidMount() {
        if (this.props.content) {
            let slugs = this.props.content
                .map((data) => {
                    if (this.props.cardType === 'video' || this.props.cardType === 'article') return data.slug;
                    if (this.props.cardType === 'business') return '/business/' + data.slug;
                    if (this.props.cardType === 'vibe') return '/style/' + data.slug;
                })
                .join(',');

            RestAPI.call(
                'get',
                null,
                RestAPI.LSTV_API_V1.GET_SLUG_CONTENT,
                (data) => {
                    if (!Array.isArray(data.result)) {
                        data.result = [data.result];
                    }
                    this.setState({
                        ...this.state,
                        ready: true,
                        data: data.result,
                    });
                },
                (error) => {},
                (attempt_num) => {},
                { slug: slugs, context: 'card' },
                '',
                false
            ).then((cancelToken) => {
                this._cancelToken = cancelToken;
                ///console.log(cancelToken);

            });
        }
    }


    onIntersectionChange = (inViewPort, rects) => {
        if (inViewPort && !this.state.everInViewport) {
            setTimeout(() => {
                this.setState({
                    ...this.state,
                    everInViewport: true,
                });
            }, 100);
        }
    };

    render() {
        if (
            (this.props.content && this.state.ready) ||
            this.props.cardType === LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO
        ) {
            let cards = null;

            if (this.props.content) {

                cards = this.state.data
                    .map((data, index) => {
                        if (this.props.cardType === LSTVGlobals.CARD_SECTION_VIDEO) {
                            let coupleNames = coupleDisplayNamesFromVideo(data.post.properties);
                            let videographer = businessFromVideo(data.post.videos[0].businesses, 'videographer');
                            let venue = businessFromVideo(data.post.videos[0].businesses, 'reception-venue');
                            let premium = (videographer && videographer.premium) || (venue && venue.premium);

                            recordNonRealTimeUserEvent(
                                LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                                LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                                {
                                    slug: data.post.slug,
                                    type: this.props.cardType
                                }
                            );  
                                const TempData = {
                                    previewGIFUrl: data.post.videos[0].videos[0].preview_gif_url,
                                    thumbnailUrl: data.post.videos[0].videos[0].thumbnail_url,
                                    thumbnailAlt: `${coupleNames} Wedding  Video`,
                                    premium: true,
                                    coupleNames: coupleNames,
                                    videographer: videographer ? videographer.name : '',
                                    venueName: venue ? venue.name : '',
                                    location: getLocationFullName(data.post.videos[0].location),
                                    views: data.post.videos[0].views,
                                    likes: data.post.videos[0].likes,
                                    vibes: getVibesForCard(data.post.videos[0].vibes, 2),
                                    duration: data.post.videos[0].videos[0].duration,
                                }
                                const Options = {
                                    cardType: CARD_TYPE_VIDEO,
                                    orientation: this.props.orientation,
                                    containerMode: this.props.containerMode,
                                    cardSlug: data.post.slug,
                                    constraints: this.props.constraints
                                }

                                // console.log(Options)
                            return (
                                <LSTVCard
                                    key={index}
                                    options={Options}
                                    data={TempData}
                                />


                            );
                        } else if (this.props.cardType === LSTVGlobals.CARD_SECTION_VIBE) {


                            recordNonRealTimeUserEvent(
                                LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                                LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                                {
                                    slug: data.slug,
                                    type: this.props.cardType
                                }
                            );

                            return (
                                <LSTVCard
                                    key={index}
                                    options={{
                                        cardType: CARD_TYPE_VIBE,
                                        orientation: this.props.orientation,
                                        containerMode: this.props.containerMode,
                                        cardSlug: `business/${data.slug}`
                                    }}
                                    data={{
                                        name: data.name,
                                        thumbnailUrl: data.thumbnail_url,
                                        thumbnailAlt: `Wedding Business: ${data.name}`,
                                        colorBar: LSTVGlobals.CARD_LABEL_COLOR_VIBE,
                                        imageOnly: false,
                                        videos: data.weight,
                                    }}
                                />
                            );
                        } else if (this.props.cardType === LSTVGlobals.CARD_SECTION_BUSINESS) {


                            recordNonRealTimeUserEvent(
                                LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                                LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                                {
                                    slug: data.slug,
                                    type: this.props.cardType
                                }
                            );

                            return (

                                <LSTVCard
                                    key={index}
                                    options={{
                                        cardType: CARD_TYPE_BUSINESS,
                                        orientation: this.props.orientation,
                                        containerMode: this.props.containerMode,
                                        cardSlug: `business/${data.slug}`
                                    }}
                                    data={{
                                        name: data.name,
                                        thumbnailUrl: data.thumbnail_url,
                                        thumbnailAlt: `Wedding Business: ${data.name}`,
                                        premium: data.premium,
                                        location: data.business_location,
                                        videoViews: data.video_views,
                                        roles: data.roles,
                                        views: data.views,
                                        likes: data.likes
                                    }}
                                />

                            );
                        } else if (this.props.cardType === LSTVGlobals.CARD_SECTION_ARTICLE) {


                            recordNonRealTimeUserEvent(
                                LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                                LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                                {
                                    slug: data.post.slug,
                                    type: this.props.cardType
                                }
                            );

                            return (

                                <LSTVCard
                                    key={index}
                                    options={{
                                        cardType: CARD_TYPE_ARTICLE,
                                        orientation: this.props.orientation,
                                        containerMode: this.props.containerMode,
                                        cardSlug: `${data.post.slug}`
                                    }}
                                    data={{
                                        title: data.post.title,
                                        thumbnailUrl: data.post.article.thumbnail_url,
                                        thumbnailAlt: data.post.title,
                                        premium: data.premium,
                                        views: data.post.article.views,
                                        likes: data.post.article.likes,
                                        tags: getVibesForCard(data.post.article.tags, 2),
                                        contentPreview: data.post.article.content,
                                    }}
                                />
                            );
                        } else return <div key={index}> {this.props.cardType} </div>;
                    })
                    .filter((data, index) => {
                        return index < this.props.numCards;
                    });
            }

            if (this.props.cardType !== LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO) {

                //console.log(this.props.name + ' --- ' + this.props.containerMode);
                if (this.props.containerMode === 'grid' || this.props.containerMode === 'h-scroll') {
                    return (
                        <Observer onChange={this.onIntersectionChange}>
                            {
                                <React.Fragment>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileS}>
                                        <HorizontalScroll
                                            itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_SMALL}
                                            items={cards}
                                        />
                                    </MediaQuery>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileM}>
                                        <HorizontalScroll
                                            itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_MEDIUM}
                                            items={cards}
                                        />
                                    </MediaQuery>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileL}>
                                        <HorizontalScroll
                                            itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_LARGE}
                                            items={cards}
                                        />
                                    </MediaQuery>

                                    <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                                        {this.props.containerMode === 'grid' && (
                                            <CardGridStyle gridTemplateColumns={this.props.gridTemplateColumns}>
                                                {cards}
                                            </CardGridStyle>
                                        )}

                                        {this.props.containerMode === 'h-scroll' && (
                                            <HorizontalScroll
                                                itemWidth={
                                                    isTablet
                                                        ? LSTVGlobals.HSCROLL_CARD_SIZES_TABLET
                                                        : LSTVGlobals.HSCROLL_CARD_SIZES_LAPTOP
                                                }
                                                items={cards}
                                            />
                                        )}
                                    </MediaQuery>
                                </React.Fragment>
                            }
                        </Observer>
                    );
                } else {
                    return (
                        <Observer onChange={this.onIntersectionChange}>
                            <Masonry
                                breakpointCols={this.props.numMasonryColumns || (isTablet ? '2' : '4')}
                                className="my-masonry-grid-left-align"
                                columnClassName="my-masonry-grid_column"
                                options={{
                                    gutter: 10,
                                }}
                            >
                                {cards}
                            </Masonry>
                        </Observer>
                    );
                }
            } else {

                this.props.fixedItems.forEach( d => {
                    recordNonRealTimeUserEvent(
                        LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                        LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                        {
                            slug: d.id,
                            type: this.props.cardType
                        }
                    );
                });


                return (
                    <PhotoGallery
                        payload={this.props.payload}
                        title={this.props.title}
                        images={this.props.fixedItems}
                        content={this.props.content}
                        numCards={this.props.numCards}
                    />
                );
            }
        } else return null;
    }
}


CardGrid.propTypes = {
    content: PropTypes.array,
    cardType: PropTypes.string,
    imageOnly: PropTypes.bool,
    numCards: PropTypes.number,
    name: PropTypes.string,
    title: PropTypes.string,
    fixedItems: PropTypes.array,
    numMasonryColumns: PropTypes.number,
    gridTemplateColumns: PropTypes.string,
    payload: PropTypes.array,
    orientation: PropTypes.oneOf(['portrait', 'landscape']),
    containerMode: PropTypes.oneOf(['grid', 'masonry', 'h-scroll']),
    constraints: PropTypes.string
}

CardGrid.defaultProps = {
    verbosity: LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM,
    carouselForMobile: true,
    name: null,
    options: {},
    containerMode: 'grid',
    imageOnly: true,
    orientation: 'portrait'
};

export default CardGrid;
