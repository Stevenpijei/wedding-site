import React from 'react';
import Header from '../Header';
import PageContent from '../Pages/PageContent';
import { connect } from 'react-redux';
import { Router, withRouter } from 'react-router';
import MainContent from '../Pages/PageSupport/MainContent';
import { Helmet } from 'react-helmet';
import * as LSTVGlobals from '../../global/globals';
import MediaQuery from 'react-responsive';
import styled, { css } from 'styled-components';
import {
    GenericContainer,
    VerticalSpacer,
    getDeviceFontSize,
    FancySeparatorVertical,
    FancySeparator,
} from '../../utils/LSTVUtils';
import GoogleAd from '../Pages/PageSupport/GoogleAd';
import TagCloud, { TAG_CLOUD_MODE_BADGE, TAG_CLOUD_MODE_TICKET } from '../Utility/TagCloud';
import slugify from 'slugify';
import ContentGrid from './ContentGrid';
import { dateStringToHumanDate } from '../../utils/LSTVUtils';
import { isMobileOnly, isMobile, isTablet, isBrowser } from 'react-device-detect';
import ReactTooltip from 'react-tooltip';
import Overlay from '../Pages/PageSupport/Overlay';
import CompositeContent from './CompositeContent';
import { SectionHeader, HighriseAdContainer, Content, ContentLeft, ContentRight } from '../Utility/PageUtils';
import Avatar from 'react-avatar';
import { Flex, PageSectionTitle, buildFixedContentItemsFromSlugArray } from '../../utils/LSTVUtils';
import ContentActionBar from '../Utility/ContentActionBar';
import LSTVLink from '../Utility/LSTVLink';
import Footer from '../Utility/Footer';
import lstvSocialLogo from '../../images/lstv-social-logo.png';

const BlogPostHeader = styled.div`
    position: relative;
`;

const StoryHeader = styled.div`
    position: relative;
    z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
    background: linear-gradient(90deg, #ffffff 0%, #ffffffc9 72%, #ffffff7d 90%, #ffffff00 100%);
    width: 45%;
    display: flex;
    align-items: center;
    color: ${LSTVGlobals.BLACK};

    h1 {
        color: ${LSTVGlobals.BLACK};
        font-size: 1.6rem;
        line-height: 1;
        text-transform: uppercase;
        font-family: 'Heldane Display', serif;
        text-shadow: 3px 0px 3px ${LSTVGlobals.WHITE};
        font-weight: ${LSTVGlobals.FONT_WEIGHT_BLACK};
    }

    @media ${LSTVGlobals.UserDevice.isTablet} {
        width: 60%;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        width: 100%;
    }
`;

const ImageContainer = styled.div`
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
    background-image: url(${(props) => props.imageUrl});
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: calc(50% / 2);

    @media ${LSTVGlobals.UserDevice.laptop} {
        margin-top: -10px;
        margin-left: -10px;
        width: calc(100% + 20px);
        margin-bottom: 20px;
    }
`;

const BlogPostContent = styled.div`
    line-height: 1.5;

    b,
    h3,
    h4 {
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 1.5rem;
        color: ${LSTVGlobals.PRIMARY_COLOR};
    }

    ul {
        display: block;
        list-style-type: disc;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 40px;
    }

    .lstv-post-img-div {
        margin-top: 10px;
        text-align: center;
        text-justify: left;
        width: 100%;
        img {
            box-shadow: 0 4px 10px -2px ${LSTVGlobals.CARD_DROP_SHADOW_COLOR};
            border-radius: 5px 5px 5px 5px;
            width: 50%;
            margin-right: 25%;
            margin-left: 25%;

            @media ${LSTVGlobals.UserDevice.isMobile} {
                width: 90%;
                margin-right: 5%;
                margin-left: 5%;
            }
        }
    }
`;

const AuthorBlock = styled.div`
    display: block;
    strong {
        font-weight: ${LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
    }
`;

const BlogIdentity = styled.div`
    text-align: center;
    padding: 3px 8px 3px 8px;
    background: ${LSTVGlobals.LSTV_YELLOW};
    transform: skew(-10deg);
    text-shadow: 3px 0px 3px ${LSTVGlobals.WHITE};
    font-size: 1.3rem;
    padding: 3px 8px 3px 8px;
    background: #fff072;
    transform: skew(-10deg);
    text-shadow: 3px 0px 3px #eeeeee;
    line-height: 1.6rem;
    font-weight: 600;
`;

const StoryHeaderContent = styled.div`
    padding: 40px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        padding: 10px;
    }
`;

class BlogStoryPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.data.post.id !== prevProps.data.post.id) {
            this.setState({
                tags: this.props.data.post.article.tags.filter((data) => {
                    return slugify(data.type) !== 'Awards';
                }),
                awards: this.props.data.post.article.tags.filter((data) => {
                    return slugify(data.type) === 'Awards';
                }),
            });
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }

        if (!isMobileOnly) ReactTooltip.rebuild();
    }

    componentDidMount() {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    render() {
        // TODO: support a case where zero event stories exist, or an event story without active videos...

        let blogName = this.props.data.post.article.blog_name;

        //console.log(this.props.data);

        const tagCloud = (
            <TagCloud
                tags={this.props.data.post.article.tags}
                fontSize={LSTVGlobals.CARD_SECONDARY_DETAIL_FONT_SIZE}
                showEditorial={'hide'}
                fontWeight={LSTVGlobals.FONT_WEIGHT_SEMIBOLD}
                justifyContent={isBrowser ? 'center' : 'flex-start'}
                backgroundColor={isBrowser ? LSTVGlobals.TAG_BG : LSTVGlobals.LSTV_YELLOW}
                holeBackgroundColor={LSTVGlobals.HOLE_BG_COLOR}
                color={LSTVGlobals.RIGHT_CONTENT_TAG_TEXT_COLOR}
                mode={TAG_CLOUD_MODE_TICKET}
            />
        );

        const tags = (
            <React.Fragment>
                <SectionHeader>Tags</SectionHeader>
                {tagCloud}
                <VerticalSpacer space={'20'} />
            </React.Fragment>
        );

        const highriseAd = (
            <HighriseAdContainer>
                <GoogleAd width={300} height={600} adUnitPath={'164808479/300x600'} />
            </HighriseAdContainer>
        );

        let content = (
            <CompositeContent source={this.props.data.post.article.content} slug={this.props.data.post.slug} />
        );

        let businesses = (
            <React.Fragment>
                <SectionHeader> Featured Wedding Businesses</SectionHeader>
                <ContentGrid
                    gridTemplateColumns={'1fr'}
                    contentType={LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_BUSINESS}
                    contentSearchType={LSTVGlobals.CONTENT_GRID_CONTENT_SEARCH_TYPE_FIXED_VENDOR_LIST}
                    fixedContentItems={buildFixedContentItemsFromSlugArray(this.props.data.post.article.businesses)}
                    contentSortMethod={LSTVGlobals.CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM}
                    offset={0}
                    size={4}
                    verbosity={LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM}
                    context={LSTVGlobals.CUSTOM_CONTENT_GRID_CONTEXT_BLOG_VENDOR_CARD}
                    options={{
                        showRoles: true,
                    }}
                />
                <VerticalSpacer space={'10'} />
                {/*<MediaQuery query={LSTVGlobals.UserDevice.notTablet}>*/}
                {/*    <FancySeparator />*/}
                {/*</MediaQuery>*/}
            </React.Fragment>
        );

        let moreFromBlog = (
            <React.Fragment>
                <SectionHeader>Recently On {blogName}</SectionHeader>
                <ContentGrid
                    gridTemplateColumns={'1fr'}
                    contentType={LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_ARTICLE}
                    contentSearchType={LSTVGlobals.CONTENT_GRID_CONTENT_SEARCH_TYPE_NONE}
                    searchItems={'the-highlight-reel'}
                    contentSortMethod={LSTVGlobals.CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
                    excludeItems={this.props.data.post.slug}
                    offset={0}
                    size={4}
                    verbosity={LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM}
                    context={
                        LSTVGlobals.CUSTOM_CONTENT_GRID_CONTEXT_MORE_FROM_BLOG + '-exclude-' + this.props.data.post.slug
                    }
                />
                {/*<MediaQuery query={LSTVGlobals.UserDevice.notTablet}>*/}
                {/*    <FancySeparator />*/}
                {/*</MediaQuery>*/}
            </React.Fragment>
        );

        let author = (
            <LSTVLink to={'/message/' + this.props.data.post.author_id}>
                {this.props.data.post.author ? this.props.data.post.author : 'LSTV Staff'}
            </LSTVLink>
        );

        let actionBar = (
            <ContentActionBar
                ownerType={LSTVGlobals.ACTION_BAR_OWNER_TYPE_ARTICLE}
                ownerId={this.props.data.post.article.id}
                useShorthand={true}
                showLikeToggle={true}
                likeAnimStyle={isMobileOnly ? 'mobile-card-heart' : 'standard'}
                textColor={LSTVGlobals.CARD_MOBILE_ACTION_BAR_ELEMENT_COLOR}
                separatorColor={LSTVGlobals.CARD_MOBILE_ACTION_BAR_ELEMENT_COLOR}
                iconWidth={isMobileOnly ? LSTVGlobals.CARD_SECONDARY_DETAIL_FONT_SIZE : '1rem'}
                isLiked={false}
                likeShowThreshold={LSTVGlobals.ACTION_BAR_LIKES_DISPLAY_THRESHOLD}
                likeCount={this.props.data.post.article.likes}
                showLikeCount={true}
                showLikeAppendix={false}
                showViewCount={true}
                viewCount={this.props.data.post.article.views}
                viewShowThreshold={LSTVGlobals.ACTION_BAR_VIEWS_DISPLAY_THRESHOLD}
                showViewsAppendix={true}
                showShareAction={!this.props.embedded}
                shareLinkLabel={`Share The Blog Post`}
                shareOptions={{
                    shortUrlToken: this.props.data.post.article.short_url_token,
                    title: `Share: ${this.props.data.post.title}`,
                    shareLinkLabel: 'Direct Link',
                    embed: false,
                    shareThumbnailUrl: this.props.data.post.thumbnail_url,
                }}
                shareCount={this.props.data.post.article.shares}
                showShareCount={false}
                showSharesAppendix={false}
                shareShowThreshold={LSTVGlobals.ACTION_BAR_SHARE_DISPLAY_THRESHOLD}
            />
        );

        let blogPostHeader = (
            <BlogPostHeader>
                <ImageContainer imageUrl={this.props.data.post.article.thumbnail_url}>
                    <StoryHeader>
                        <StoryHeaderContent>
                            <Flex
                                margin="0 0 25px 0"
                                width={'100%'}
                                alignItems={'center'}
                                justifyContent={'flex-start'}
                            >
                                <BlogIdentity>{blogName}</BlogIdentity>
                            </Flex>

                            <h1>{this.props.data.post.title}</h1>

                            <Flex flexDirection={'column'}>
                                <Flex alignItems={'center'} justifyContent={'flex-start'} margin={'20px 0 0 0'}>
                                    <Flex alignItems={'center'} width="50px">
                                        <Avatar
                                            size={50}
                                            round="25px"
                                            name={this.props.data.post.author || 'LSTV Staff'}
                                            src={this.props.data.post.author_thumbnail_url || lstvSocialLogo}
                                        />
                                    </Flex>
                                    <Flex alignItems={'center'} margin={'0 0 0 10px'}>
                                        <AuthorBlock>
                                            by {author}
                                            <br />
                                            {dateStringToHumanDate(this.props.data.post.publish_date)}
                                        </AuthorBlock>
                                    </Flex>
                                </Flex>
                                <Flex alignItems={'center'} justifyContent={'flex-start'} margin={'20px 0 0 0'}>
                                    {actionBar}
                                </Flex>

                                <Flex alignItems={'center'} justifyContent={'flex-start'} margin={'20px 0 0 0'}>
                                    <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                                        {this.props.data.post.article.tags.length > 0 && tagCloud}
                                    </MediaQuery>
                                </Flex>
                            </Flex>
                        </StoryHeaderContent>
                    </StoryHeader>
                </ImageContainer>
            </BlogPostHeader>
        );

        return (

            <>

                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{this.props.data.post.title}</title>
                </Helmet>
                <PageContent>
                    <Overlay />
                    <MainContent leftRightMargin={'0'}>
                        <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>{blogPostHeader}</MediaQuery>

                        <Content>
                            <ContentLeft>
                                <GenericContainer padding={'10px'}>
                                    <MediaQuery query={LSTVGlobals.UserDevice.laptop}>{blogPostHeader}</MediaQuery>
                                    <BlogPostContent className="lstv-blog-post">{content}</BlogPostContent>
                                </GenericContainer>
                            </ContentLeft>
                            <ContentRight background={isMobile ? 'transparent' : null} flexLaptop={'0 0 350px'}>
                                <Flex alignItems={'stretch'} height={'100%'}>
                                    <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                        <Flex flexDirection={'column'} width={'21px'}>
                                            <FancySeparatorVertical />
                                        </Flex>
                                    </MediaQuery>

                                    <Flex
                                        flexDirection={'column'}
                                        width={isMobileOnly ? 'calc(100vw - 20px)' : null}
                                        justifyContent={'flex-start'}
                                        flex={'1 1'}
                                    >
                                        <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                                            <FancySeparator margin={'15px 0 15px 0'} />
                                        </MediaQuery>

                                        <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                                            {this.props.data.post.article.businesses.length > 0 && businesses}
                                            {moreFromBlog}
                                            {highriseAd}
                                        </MediaQuery>

                                        <MediaQuery query={LSTVGlobals.UserDevice.isTablet}>
                                            <Flex>
                                                <Flex width={'50%'} flexDirection={'column'}>
                                                    {this.props.data.post.article.businesses.length > 0 && businesses}
                                                    {moreFromBlog}
                                                </Flex>
                                                <Flex width={'50%'} flexDirection={'column'}>
                                                    {highriseAd}
                                                </Flex>
                                            </Flex>
                                        </MediaQuery>

                                        <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                                            {this.props.data.post.article.tags.length > 0 && tags}
                                            {this.props.data.post.article.businesses.length > 0 && businesses}
                                            {moreFromBlog}
                                            {highriseAd}
                                        </MediaQuery>
                                    </Flex>
                                </Flex>
                            </ContentRight>
                        </Content>
                    </MainContent>
                </PageContent>
            </>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        //    data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData,
        // frontEndSettings: state.user.frontEndSettings
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BlogStoryPage);
