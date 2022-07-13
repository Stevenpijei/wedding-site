import React from 'react';
import { connect } from 'react-redux';
import styled, { css, keyframes } from 'styled-components';
import LikableHeart from './LikableHeart';
import ShorthandCounterLabel from './ShorthandCounterLabel';
import ContentShareWidget from './ContentShareWidget';
import * as LSTVGlobals from '../../global/globals';
import * as ActionTypes from './../../store/actions';
import { Spacer } from '../../utils/LSTVUtils';

const ContentActionBarStyle = styled.div`
    -webkit-tap-highlight-color: transparent;
    display: inline-flex;
    justify-content: ${(props) => props.justifyContent};
    align-items: ${(props) => props.alignItems};
    flex-direction: row;
    height: ${(props) => props.height};
    background: ${(props) => props.background || 'transparent'};
    padding: 0;
    margin: 0;
`;

const SVGContainer = styled.div`
    width: 22px;

    ${(props) =>
        props.embedded &&
        css`
            width: 2.5vw;
            height: 2.5vw;

            @media ${LSTVGlobals.UserDevice.isMobile} {
                width: 5.2vw;
                height: 5.2vw;
            }
        `};

    ${(props) =>
        props.embeddedWidth &&
        props.embeddedWidth < 300 &&
        css`
            width: 16px;
            height: 16px;
        `};
`;

const StandardContainer = styled.div``;

const SeparatorSVG = styled.svg``;

const Separator = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
`;

class ContentActionBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            likeCount: this.props.likeCount,
            viewCount: this.props.viewCount,
            shareCount: this.props.shareCount,
        };

        this.separatorElement = (
            <SeparatorSVG height="12" width="12">
                <circle
                    cx="6"
                    cy="6"
                    r="1"
                    stroke={this.props.separatorColor}
                    strokeWidth="1"
                    fill={this.props.separatorColor}
                />
            </SeparatorSVG>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props !== prevProps) {
            this.setState({
                likeCount: this.props.likeCount,
                viewCount: this.props.viewCount,
                shareCount: this.props.shareCount,
            });
        }
    }

    onLike = () => {
        this.setState({
            ...this.state,
            likeCount: this.state.likeCount + 1,
        });

        if (this.props.onLike) this.props.onLike();
    };

    onUnlike = () => {
        this.setState({
            ...this.state,
            likeCount: this.state.likeCount - 1,
        });

        if (this.props.onUnlike) this.props.onUnlike();
    };

    render() {
        let showLikeToggle = this.props.showLikeToggle;
        let showLikeCount = this.props.showLikeCount && this.state.likeCount >= this.props.likeShowThreshold;
        let showViews = this.props.showViewCount && this.state.viewCount >= this.props.viewShowThreshold;
        let showShareAction = this.props.showShareAction;
        let showShares = this.props.showShareCount && this.state.shareCount >= this.props.shareShowThreshold;
        let showPostLikeSeparator =
            (this.props.showLikeToggle || this.props.showLikeCount) && (this.props.showShareAction || this.props.showShareCount);
        let showPostViewSeparator =
            this.props.showViewCount && showViews && (this.props.showShareAction || this.props.showShareCount);

        return (
            <ContentActionBarStyle
                className="actionBar"
                {...this.props}
            >
                {showLikeToggle ? (
                    <SVGContainer embeddedWidth={this.props.embeddedWidth} embedded={this.props.embedded}>
                        <LikableHeart
                            ownerType={this.props.ownerType}
                            heartAnimStyle={this.props.likeAnimStyle}
                            textColor={this.props.textColor}
                            heartOutlineColor={this.props.textColor}
                            ownerId={this.props.ownerId}
                            isLiked={this.props.isLiked}
                            onLike={this.onLike}
                            onUnlike={this.onUnlike}
                        />
                    </SVGContainer>
                ) : null}
                {showLikeToggle && showLikeCount ? <Spacer /> : null}
                {showLikeCount ? (
                    <React.Fragment>
                        {this.props.prefixSeparator && <Separator>{this.separatorElement}</Separator>}
                        <StandardContainer>
                            <ShorthandCounterLabel
                                value={this.state.likeCount}
                                fontSize={this.props.fontSize}
                                textColor={this.props.textColor}
                                appendix={this.props.showLikeAppendix ? this.props.likesAppendix : null}
                                shorthand={this.props.useShorthand}
                            />
                        </StandardContainer>
                    </React.Fragment>
                ) : null}
                {showPostLikeSeparator ? <Separator>{this.separatorElement}</Separator> : null}
                {showViews ? (
                    <StandardContainer>
                        <ShorthandCounterLabel
                            value={this.state.viewCount}
                            fontSize={this.props.fontSize}
                            textColor={this.props.textColor}
                            appendix={this.props.showViewsAppendix ? this.props.viewsAppendix : null}
                            shorthand={this.props.useShorthand}
                        />
                    </StandardContainer>
                ) : null}
                {showPostViewSeparator ? <Separator>{this.separatorElement}</Separator> : null}
                {showShareAction ? (
                    <SVGContainer embeddedWidth={this.props.embeddedWidth} embedded={this.props.embedded}>
                        <ContentShareWidget
                            ownerType={this.props.ownerType}
                            ownerId={this.props.ownerId}
                            shareOptions={this.props.shareOptions}
                            shareThumbnailUrl={this.props.shareOptions.shareThumbnailUrl}
                            fontSize={this.props.fontSize}
                            textColor={this.props.textColor}
                        />
                    </SVGContainer>
                ) : null}
                {showShareAction && showShares ? <Spacer /> : null}
                {showShares ? (
                    <StandardContainer>
                        <ShorthandCounterLabel
                            value={this.state.shareCount}
                            fontSize={this.props.fontSize}
                            textColor={this.props.textColor}
                            appendix={this.props.showSharesAppendix ? this.props.sharesAppendix : null}
                            shorthand={this.props.useShorthand}
                        />
                    </StandardContainer>
                ) : null}
            </ContentActionBarStyle>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onShareClicked: () =>
        //     dispatch({
        //         type: ActionTypes.ACTION_SHOW_SHARE_MODAL,
        //         data: { type: this.props.ownerType, id: this.props.ownerId },
        //     }),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

ContentActionBar.defaultProps = {
    /* owner type and id */
    ownerType: null,
    ownerId: null,
    /* general */
    useShorthand: false,
    fontSize: '1rem',
    /* Likes */
    showLikeToggle: false,
    isLiked: false,
    showLikeCount: false,
    likeShowThreshold: LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD,
    likeCount: 0,
    likesAppendix: 'likes',
    showLikeAppendix: true,
    /* views */
    showViewCount: false,
    viewCount: 0,
    viewShowThreshold: LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD,
    viewsAppendix: 'views',
    showViewsAppendix: true,
    /* share */
    showShareAction: false,
    showShareCount: false,
    shareCount: 0,
    shareShowThreshold: LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD,
    sharesAppendix: 'shares',
    showSharesAppendix: true,

    shareOptions: {
        title: `Share this object`,
        shareLinkLabel: 'Share The Object',
        shareEmbedLabel: 'Embed The Object',
        shareObjectType: 'Object',
        shareThumbnailUrl: '',
        html: 'Copy and paste this code into your website, where you wish the object to appear.',
        wordpress:
            'Copy and paste this code into the body of your WordPress post or page while in text mode, as seen in the screenshot below.',
    },
    /* share payload and destination */
    shareUrl: null,
    facebook: false,
    twitter: false,
    pinterest: false,
    /* Favorites */
    showFavoriteToggle: false,
    /* contact */
    showContact: false,
    contactLabel: 'Contact',
    /* positioning */
    alignItems: 'center',
    justifyContent: 'flex-end',
    /* colors */
    textColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    separatorColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
    /* anim styles */
    likeAnimStyle: 'standard',
    /* dimensions */
    height: '100%',
    /* Should we prepend a separator? in case of inline usage of the actionbar */
    prefixSeparator: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentActionBar);
