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
    // AK: why are these grid styles not all defined mobile first?
    grid-gap: 5px;
    grid-template-columns: 1fr 1fr;

    @media ${LSTVGlobals.UserDevice.tablet} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr 1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.laptopL} {
        grid-template-columns: ${(props) => props.gridTemplateColumns || '1fr 1fr 1fr 1fr'};
        grid-gap: 15px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        grid-template-columns: 1fr;
        grid-gap: 15px;
        // AK: why is this here? presently it's clipping box-shadows on the cards.
        overflow-y: hidden;
        overflow-x: scroll;
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
                    if (this.props.cardType === 'vibe') return `/vibe/${data.slug}`;

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
                    if (this.props.onNewData) {
                        this.props.onNewData(data.result)
                    }
                },
                (error) => {
                    if (this.props.onNewData) {
                        this.props.onNewData()
                    }
                },
                (attempt_num) => {},
                { slug: slugs, context: 'card', verbosity: 'card' },
                '',
                false
            ).then((cancelToken) => {
                this._cancelToken = cancelToken;
                ///console.log(cancelToken);

            });
        }
    }

    componentDidUpdate(prevProps) {
        console.log(this.props.forceChangeCards)
        const previous = prevProps.content.map(({ slug }) => slug).join(',')
        const current = this.props.content.map(({ slug }) => slug).join(',')

        if (prevProps.content?.length !== this.props.content?.length || previous !== current) {
            const currentSlugs = this.state.data?.map(({ slug }) => slug);
            const newContentWithoutCurrent = this.props.content.filter(({ slug }) => !currentSlugs?.includes(slug))
            const items = this.props.forceChangeCards ? this.props.content : newContentWithoutCurrent
            console.log(items)
            let slugs = items
                .map((data) => {
                    if (this.props.cardType === 'video' || this.props.cardType === 'article') return data.slug;
                    if (this.props.cardType === 'business') return '/business/' + data.slug;
                    if (this.props.cardType === 'vibe') return `/vibe/${data.slug}`;
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
                    this.setState((previousState) => ({
                        ...this.state,
                        ready: true,
                        data:
                            previousState.data && !this.props.forceChangeCards
                                ? [...previousState.data, ...data.result]
                                : data.result,
                    }));
                    if (this.props.onNewData) {
                        this.props.onNewData(data?.result)
                    }
                },
                (error) => {},
                (attempt_num) => {},
                { slug: slugs, context: 'card',verbosity: 'card'  },
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

                            let coupleNames = coupleDisplayNamesFromVideo(data.post_properties);
                            let videographer = businessFromVideo(data.businesses, 'videographer');

                            let venue = businessFromVideo(data.businesses, 'reception-venue');

                            recordNonRealTimeUserEvent(
                                LSTVGlobals.USER_NRT_REPORT_CARD_IMPRESSION,
                                LSTVGlobals.USER_NRT_REPORT_BUFFER_SCOPE_DAY,
                                {

                                    slug: data.slug,
                                    type: this.props.cardType
                                }
                            );
                                const TempData = {
                                    previewGIFUrl: data.videosSources[0]?.preview_gif_url,
                                    thumbnailUrl: data.videosSources[0]?.thumbnail_url,
                                    thumbnailAlt: `${coupleNames} Wedding  Video`,
                                    premium: videographer?.premium,
                                    coupleNames: coupleNames,
                                    videographer: videographer ? videographer.name : '',
                                    venueName: venue ? venue.name : '',
                                    location: getLocationFullName(data.location),
                                    views: data.views,
                                    likes: data.likes,
                                    vibes: getVibesForCard(data.vibes, 2),
                                    duration: data.videosSources[0]?.duration,
                                }
                                const Options = {
                                    cardType: CARD_TYPE_VIDEO,
                                    orientation: this.props.orientation,
                                    containerMode: this.props.containerMode,

                                    cardSlug: data.slug,
                                    constraints: this.props.constraints
                                }
                                // console.log(TempData)
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
                                        cardSlug: `style/${data.slug}`
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
                                    key={data.slug}
                                    options={{
                                        cardType: CARD_TYPE_BUSINESS,
                                        orientation: this.props.orientation,
                                        containerMode: this.props.containerMode,
                                        bg_color: data.bg_color,
                                        cardSlug: `business/${data.slug}`
                                    }}
                                    data={{
                                        name: data.name,
                                        thumbnailUrl: data.card_thumbnail_url,
                                        thumbnailAlt: `Wedding Business: ${data.name}`,
                                        premium: data.premium,
                                        location: data.business_locations[0],
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
                                    slug: data.slug,
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
                                        cardSlug: `${data.slug}`
                                    }}
                                    data={{
                                        title: data.title,
                                        thumbnailUrl: data.thumbnail_url,
                                        thumbnailAlt: data.title,
                                        premium: data.premium,
                                        views: data.views,
                                        likes: data.likes,
                                        tags: getVibesForCard(data.tags, 2),
                                        // contentPreview: "Meow this is just a placeholder while we talk about content"
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
                                        {this.props.containerMode === 'grid' ? (
                                            <CardGridStyle gridTemplateColumns={this.props.gridTemplateColumns}>
                                                {cards}
                                            </CardGridStyle>
                                        ) : (
                                            <HorizontalScroll
                                                itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_SMALL}
                                                items={cards}
                                            />
                                        )}
                                    </MediaQuery>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileM}>
                                        {this.props.containerMode === 'grid' ? (
                                            <CardGridStyle gridTemplateColumns={this.props.gridTemplateColumns}>
                                                {cards}
                                            </CardGridStyle>
                                        ) : (
                                            <HorizontalScroll
                                                itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_MEDIUM}
                                                items={cards}
                                            />
                                        )}
                                    </MediaQuery>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileL}>
                                        {this.props.containerMode === 'grid' ? (
                                            <CardGridStyle gridTemplateColumns={this.props.gridTemplateColumns}>
                                                {cards}
                                            </CardGridStyle>
                                        ) : (
                                            <HorizontalScroll
                                                itemWidth={LSTVGlobals.HSCROLL_CARD_SIZES_MOBILE_LARGE}
                                                items={cards}
                                            />
                                        )}
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
    constraints: PropTypes.string,
    forceChangeCards: PropTypes.bool,
};

CardGrid.defaultProps = {
    verbosity: LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM,
    carouselForMobile: true,
    name: null,
    options: {},
    containerMode: 'grid',
    imageOnly: true,
    orientation: 'portrait',
    forceChangeCards: false,
};

export default CardGrid;
