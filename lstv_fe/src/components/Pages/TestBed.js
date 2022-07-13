import React, { useLayoutEffect, useState } from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import * as ActionTypes from '../../store/actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { LSTV_API_V1 } from '../../rest-api/Call';
import { Helmet } from 'react-helmet';
import PageContent from './PageContent';
import { GenericContainer, getLocationFullName, getVibesForCard, VerticalSpacer } from '../../utils/LSTVUtils';
import LSTVCard, {
    CARD_CONSTRAINTS_NO_LOCATION,
    CARD_CONSTRAINTS_NO_VIDEOGRAPHER,
    CARD_TYPE_ARTICLE,
    CARD_TYPE_CALENDAR_ITEM,
    CARD_TYPE_VIDEO,
    CARD_TYPE_FOLDER,
    CARD_TYPE_MINI_ROUND_IMAGE,
    CARD_TYPE_PROMO_VIDEO,
    CARD_TYPE_SHOPPING_ITEM,
    CARD_TYPE_TEAM_MEMBER,
    CARD_TYPE_BUSINESS,
    CARD_TYPE_VENDOR_GENERIC,
    CARD_TYPE_VIBE,
    CARD_TYPE_WEDDING_VENDOR,
} from '../../newComponents/cards/LSTVCard';
import Footer from '../Utility/Footer';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import theme from '../../styledComponentsTheme';
import BaseCTAButton from '../../newComponents/buttons/BaseCtaButton';
import { CloseIcon } from '../Utility/LSTVSVG';
import { userLoginSuccess } from '../../store/actions';
import { adaptResponseToUser } from '../../rest-api/hooks/useAuthService';
import { useReviewsService } from '../../rest-api/hooks/useReviewsService';
import { useBusinessService } from '../../rest-api/hooks/useBusinessService';

const PageStyle = styled.div`
    padding: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='stripes' patternUnits='userSpaceOnUse' width='7' height='6' patternTransform='rotate(45)'%3E%3Cline x1='1' y='0' x2='1' y2='7' stroke='%23eeeeee66' stroke-width='1.0' /%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23fffeea00' /%3E%3Crect width='100%25' height='100%25' fill='url(%23stripes)' /%3E%3C/svg%3E");
`;

const CardContainer = styled.div`
    position: relative;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 1fr;

    @media ${LSTVGlobals.UserDevice.tablet} {
        grid-template-columns: ${(props) => props.gridCol || '1fr 1fr 1fr 1fr 1fr'};
    }

    ${(props) =>
        props.small &&
        css`
            grid-template-columns: ${(props) => props.gridColSmall || '1fr 1fr 1fr 1fr 1fr 1fr'};
        `};
`;

const CardContainerSmall = styled(CardContainer)`
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
`;

const CardContainerbig = styled(CardContainer)`
    grid-template-columns: 1fr 1fr 1fr;
`;

const TestComp = (props) => {
    const [data, setData] = useState('initial data');
    const { getBusiness, createBusiness } = useBusinessService();

    const init = async () => {
        let get = await getBusiness('nst-picturez');
        let post = await createBusiness('A', true, ['videographer'], 'a4b3e793-c168-4602-b53b-239af78aff70');
    };

    React.useEffect(() => {
        init();
    }, [data]);

    return (
        <>
            <div>{data}</div>
        </>
    );
};

class TestBed extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ready: false, bool1: false };
    }

    onFolderClicked = (folderID) => {
        alert(`folder card  clicked: ${folderID}`);
    };

    onPromoCardClicked = (CardID) => {
        alert(`promo video card  clicked: ${CardID}`);
    };

    render() {


        return (
            <React.Fragment>
                <Helmet>
                    <title>
                        {' '}
                        LSTV TESTBED - {process.env.APP_VERSION} - {React.version}
                    </title>
                </Helmet>
                <PageContent>
                    <TestComp />
                    {/*

                      _____                 _     ____  _
                     | ____|_   _____ _ __ | |_  / ___|| |_ ___  _ __ _   _
                     |  _| \ \ / / _ \ '_ \| __| \___ \| __/ _ \| '__| | | |
                     | |___ \ V /  __/ | | | |_   ___) | || (_) | |  | |_| |
                     |_____| \_/ \___|_| |_|\__| |____/ \__\___/|_|   \__, |
                                                                      |___/

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Event Story: Standard</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIDEO,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'slug',
                                }}
                                data={{
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    coupleNames: 'Jack & Jill',
                                    videographer: 'NST Pictures',
                                    venueName: 'The Plaza Hotel',
                                    location: 'New York, NY',
                                    views: 31223,
                                    likes: 423,
                                    vibes: ['Cool', 'Fun', 'Nutty'],
                                    duration: 234,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Event Story: Promo Video (Not linked to event story)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer gridCol={'1fr 1fr 1fr 1fr'}>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_PROMO_VIDEO,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardId: 'some-promo',
                                    clickHandler: this.onPromoCardClicked,
                                }}
                                data={{
                                    title: 'A Cool Promo Video',
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    duration: 234,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Event Story: Promo SideBar Video (Not linked to event story)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer gridCol={'1fr 1fr'}>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_PROMO_VIDEO,
                                    orientation: 'landscape',
                                    containerMode: 'grid',
                                    cardId: 'some-promo',
                                    clickHandler: this.onPromoCardClicked,
                                }}
                                data={{
                                    title: 'A Cool Promo Video For Your SideBar',
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    duration: 234,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Event Story: Landscape (Sidebar example: More From NST Pictures)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainerbig>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIDEO,
                                    orientation: 'landscape',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                    constraints: CARD_CONSTRAINTS_NO_VIDEOGRAPHER,
                                }}
                                data={{
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    coupleNames: 'Jack & Jill',
                                    videographer: 'NST Pictures',
                                    venueName: 'The Plaza Hotel',
                                    location: 'New York, NY',
                                    views: 31223,
                                    likes: 423,
                                    vibes: ['cool', 'fun', 'fast'],
                                    duration: 234,
                                }}
                            />
                        </CardContainerbig>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Event Story: Landscape (Sidebar example: More From Detroit)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainerbig>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIDEO,
                                    orientation: 'landscape',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                    constraints: CARD_CONSTRAINTS_NO_LOCATION,
                                }}
                                data={{
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    coupleNames: 'Jack & Jill',
                                    videographer: 'NST Pictures',
                                    venueName: 'The Plaza Hotel',
                                    location: 'New York, NY',
                                    views: 31223,
                                    likes: 423,
                                    vibes: ['cool', 'fun', 'fast'],
                                    duration: 234,
                                }}
                            />
                        </CardContainerbig>
                    </GenericContainer>

                    {/*

                      __     __             _
                      \ \   / /__ _ __   __| | ___  _ __
                       \ \ / / _ \ '_ \ / _` |/ _ \| '__|
                        \ V /  __/ | | | (_| | (_) | |
                         \_/ \___|_| |_|\__,_|\___/|_|

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Business Cards: Wedding Team</h4>
                        <VerticalSpacer space={20} />
                        <CardContainerSmall>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_WEDDING_VENDOR,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                }}
                                data={{
                                    premium: true,
                                    name: 'Beautini',
                                    role: {
                                        name: 'Videographer',
                                        slug: 'videographer',
                                        family: 'video-photo',
                                    },
                                }}
                            />
                        </CardContainerSmall>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Business Cards</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_BUSINESS,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                }}
                                data={{
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    name: 'Beautini',
                                    roles: [
                                        {
                                            name: 'Videographer',
                                            slug: 'videographer',
                                            family_type: 'video-photo',
                                        },
                                        {
                                            name: 'Florist',
                                            slug: 'florist',
                                            family_type: 'florals',
                                        },
                                    ],
                                    location: {
                                        country: 'United States',
                                        country_url: '/location/?country=united-states',
                                        state_province: 'New York',
                                        state_province_url: '/location/?country=united-states&state_province=new-york',
                                        place: 'New York',
                                        place_url:
                                            '/location/?country=united-states&state_province=new-york&place=new-york',
                                    },
                                    likes: 5234,
                                    videos: 633,
                                    videoViews: 2347,
                                    subscribers: 623,
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_BUSINESS,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                }}
                                data={{
                                    thumbnailUrl:
                                        'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    name: 'Beautini',
                                    roles: [
                                        {
                                            name: 'Videographer',
                                            slug: 'videographer',
                                            family: 'video-photo',
                                        },
                                    ],
                                    location: {
                                        country: 'United States',
                                        country_url: '/location/?country=united-states',
                                        state_province: 'New York',
                                        state_province_url: '/location/?country=united-states&state_province=new-york',
                                        place: 'New York',
                                        place_url:
                                            '/location/?country=united-states&state_province=new-york&place=new-york',
                                    },
                                    likes: 2052,
                                    videos: 34,
                                    videoViews: 4234,
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_BUSINESS,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
                                }}
                                data={{
                                    thumbnailUrl:
                                        'https://i.pinimg.com/originals/b7/f2/e5/b7f2e55680f435fba60e92541236fdc5.jpg',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    name: "Mushnik's Flower Shop",
                                    roles: [
                                        {
                                            name: 'Florist',
                                            slug: 'Florist',
                                            family_type: 'florals',
                                        },
                                    ],
                                    location: {
                                        country: 'United States',
                                        country_url: '/location/?country=united-states',
                                        state_province: 'New York',
                                        state_province_url: '/location/?country=united-states&state_province=new-york',
                                        place: 'New York',
                                        place_url:
                                            '/location/?country=united-states&state_province=new-york&place=new-york',
                                    },
                                    subscribers: 342,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*

                      ____  _
                     | __ )| | ___   __ _
                     |  _ \| |/ _ \ / _` |
                     | |_) | | (_) | (_| |
                     |____/|_|\___/ \__, |
                                    |___/

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Blog Story Cards</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_ARTICLE,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: 'how-to-match-your-wedding-invitations-to-your-wedding-style',
                                }}
                                data={{
                                    title: 'How to Match Your Wedding Invitations to Your Wedding Styl',
                                    thumbnailUrl:
                                        'https://d3g1ohya32imgb.cloudfront.net/images/site/content/12399fd0af6cf174c73761fc082de99c6563e0d8-orig.JPEG',
                                    thumbnailAlt: 'test',
                                    premium: true,
                                    views: 2342,
                                    likes: 34,
                                    tags: ['BlogTag1', 'BlogTag2'],
                                    contentPreview:
                                        'So you’re engaged, congratulations! Now comes\\nthe fun, but' +
                                        ' slightly daunting task of hiring your wedding businesses. Between\\nchoosing' +
                                        ' the right venue and finding your perfect dress, finding th....',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*

                     __     ___ _
                     \ \   / (_) |__   ___
                      \ \ / /| | '_ \ / _ \
                       \ V / | | |_) |  __/
                        \_/  |_|_.__/ \___|

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Vibe/Location: Standard</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIBE,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: `/style/jewish`,
                                }}
                                data={{
                                    thumbnailUrl: 'https://content.jwplatform.com/thumbs/q7V2LNo1-1920.jpg',
                                    thumbnailAlt: 'vibe',
                                    colorBar: LSTVGlobals.CARD_LABEL_COLOR_VIBE,
                                    imageOnly: false,
                                    name: 'Jewish Weddings',
                                    videos: 342,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Vibe/Location: Condensed</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIBE,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: `/style/jewish`,
                                    imageOnly: true,
                                }}
                                data={{
                                    name: 'Jewish Weddings',
                                    videos: 342,
                                    thumbnailUrl: 'https://content.jwplatform.com/thumbs/q7V2LNo1-1920.jpg',
                                    thumbnailAlt: 'vibe',
                                    colorBar: LSTVGlobals.CARD_LABEL_COLOR_VIBE,
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Vibe/Location: Small</h4>
                        <VerticalSpacer space={20} />
                        <CardContainerSmall>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VIBE,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: `/style/jewish`,
                                    imageOnly: false,
                                    small: true,
                                }}
                                data={{
                                    name: 'Jewish Weddings',
                                    videos: 342,
                                    thumbnailUrl: 'https://content.jwplatform.com/thumbs/q7V2LNo1-1920.jpg',
                                    thumbnailAlt: 'vibe',
                                    colorBar: LSTVGlobals.CARD_LABEL_COLOR_VIBE,
                                }}
                            />
                        </CardContainerSmall>
                    </GenericContainer>

                    {/*

                      ____  _                       _
                     / ___|| |__   ___  _ __  _ __ (_)_ __   __ _
                     \___ \| '_ \ / _ \| '_ \| '_ \| | '_ \ / _` |
                      ___) | | | | (_) | |_) | |_) | | | | | (_| |
                     |____/|_| |_|\___/| .__/| .__/|_|_| |_|\__, |
                                       |_|   |_|            |___/

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Shopping Card</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_SHOPPING_ITEM,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: `https://www.amazon.com/PRETTYGARDEN-Womens-Elegant-Lantern-Crewneck/dp/B07FRC3Y3Z/ref=sr_1_8?dchild=1&keywords=dress&qid=1602787607&sr=8-8`,
                                }}
                                data={{
                                    thumbnailUrl: 'https://i.imgur.com/LeaNWsw.png',
                                    thumbnailAlt: 'A Dress For Sale',
                                    name: 'Women’s Elegant Dress',
                                    soldBy: 'PRETTYGARDEN',
                                    price: '$199.99',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Shopping Card: with Optional Discount + Custom discount label)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_SHOPPING_ITEM,
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    cardSlug: `https://www.amazon.com/PRETTYGARDEN-Womens-Elegant-Lantern-Crewneck/dp/B07FRC3Y3Z/ref=sr_1_8?dchild=1&keywords=dress&qid=1602787607&sr=8-8`,
                                }}
                                data={{
                                    thumbnailUrl: 'https://i.imgur.com/LeaNWsw.png',
                                    thumbnailAlt: 'A Dress For Sale',
                                    name:
                                        'Women’s Elegant Long Sleeve Short Dress Crewneck Tie Waist Knit Cocktail Dress',
                                    soldBy: 'PRETTYGARDEN',
                                    price: '$199.99',
                                    priceWas: '$249.99',
                                    discountLabel: 'List Price',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*

                      _____     _     _              ____              _
                     |  ___|__ | | __| | ___ _ __   / ___|__ _ _ __ __| |
                     | |_ / _ \| |/ _` |/ _ \ '__| | |   / _` | '__/ _` |
                     |  _| (_) | | (_| |  __/ |    | |__| (_| | | | (_| |
                     |_|  \___/|_|\__,_|\___|_|     \____\__,_|_|  \__,_|

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Folder Card (with and without the + sign)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_FOLDER,
                                    folderId: 'test-folder',
                                    containerMode: 'grid',
                                    imageOnly: true,
                                    showPlusSign: false,
                                    clickHandler: this.onFolderClicked,
                                }}
                                data={{
                                    name: 'Spring Wedding',
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'spring-weddings',
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_FOLDER,
                                    cardId: 'test-folder-with-plus',
                                    containerMode: 'grid',
                                    imageOnly: true,
                                    showPlusSign: true,
                                    clickHandler: this.onFolderClicked,
                                }}
                                data={{
                                    name: 'More Spring Weddings Folders',
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'spring-weddings',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*
                        ____      _                _               ____              _
                      / ___|__ _| | ___ _ __   __| | __ _ _ __   / ___|__ _ _ __ __| |
                     | |   / _` | |/ _ \ '_ \ / _` |/ _` | '__| | |   / _` | '__/ _` |
                     | |__| (_| | |  __/ | | | (_| | (_| | |    | |__| (_| | | | (_| |
                      \____\__,_|_|\___|_| |_|\__,_|\__,_|_|     \____\__,_|_|  \__,_|

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Calendar Card</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_CALENDAR_ITEM,
                                    containerMode: 'grid',
                                    cardSlug: `https://www.amazon.com/PRETTYGARDEN-Womens-Elegant-Lantern-Crewneck/dp/B07FRC3Y3Z/ref=sr_1_8?dchild=1&keywords=dress&qid=1602787607&sr=8-8`,
                                }}
                                data={{
                                    date: '2020-10-28',
                                    place: 'Great Bridal Expo Miami',
                                    location: 'Detroit, Michigan',
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'spring-weddings',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*

                      ____                       _   ___                                      _____         _      ____              _
                     |  _ \ ___  _   _ _ __   __| | |_ _|_ __ ___   __ _  __ _  ___     _    |_   _|____  _| |_   / ___|__ _ _ __ __| |
                     | |_) / _ \| | | | '_ \ / _` |  | || '_ ` _ \ / _` |/ _` |/ _ \  _| |_    | |/ _ \ \/ / __| | |   / _` | '__/ _` |
                     |  _ < (_) | |_| | | | | (_| |  | || | | | | | (_| | (_| |  __/ |_   _|   | |  __/>  <| |_  | |__| (_| | | | (_| |
                     |_| \_\___/ \__,_|_| |_|\__,_| |___|_| |_| |_|\__,_|\__, |\___|   |_|     |_|\___/_/\_\\__|  \____\__,_|_|  \__,_|
                                                         |___/
                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>
                            Rounded Image + Text Cards (to be used in Discover sidebar) with custom labels, or
                            &quot;counters&quot;
                        </h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_MINI_ROUND_IMAGE,
                                    containerMode: 'grid',
                                    orientation: 'landscape',
                                    cardSlug: `https://www.amazon.com/PRETTYGARDEN-Womens-Elegant-Lantern-Crewneck/dp/B07FRC3Y3Z/ref=sr_1_8?dchild=1&keywords=dress&qid=1602787607&sr=8-8`,
                                }}
                                data={{
                                    title: 'Trending Wedding Videos',
                                    subtitle: 'With a custom label!',
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'trending-videos',
                                }}
                            />
                        </CardContainer>
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_MINI_ROUND_IMAGE,
                                    containerMode: 'grid',
                                    orientation: 'landscape',
                                    cardSlug: `https://www.amazon.com/PRETTYGARDEN-Womens-Elegant-Lantern-Crewneck/dp/B07FRC3Y3Z/ref=sr_1_8?dchild=1&keywords=dress&qid=1602787607&sr=8-8`,
                                }}
                                data={{
                                    title: 'Bohemian Weddings',
                                    count: 1235,
                                    countLabel: 'Videos',
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'trending-videos',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*
                                          _                                            _
                     __   _____ _ __   __| | ___  _ __       __ _  ___ _ __   ___ _ __(_) ___
                     \ \ / / _ \ '_ \ / _` |/ _ \| '__|____ / _` |/ _ \ '_ \ / _ \ '__| |/ __|
                      \ V /  __/ | | | (_| | (_) | | |_____| (_| |  __/ | | |  __/ |  | | (__
                       \_/ \___|_| |_|\__,_|\___/|_|        \__, |\___|_| |_|\___|_|  |_|\___|

                                       AKA...

                          ____        _     _         _   _
                         / ___|  ___ | | __| |       / \ | |_
                         \___ \ / _ \| |/ _` |_____ / _ \| __|
                          ___) | (_) | | (_| |_____/ ___ \ |_
                         |____/ \___/|_|\__,_|    /_/   \_\__|

                         Can be used for all not just Bridal Salons...... and not just for "sold At"...

                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>
                            Business-Generic card (custom labels) - to be used as "Sold At" on fashion pages and other
                            places in the future..
                        </h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_VENDOR_GENERIC,
                                    containerMode: 'grid',
                                    orientation: 'portrait',
                                    cardSlug: `/business/kleinfeld-bridal`,
                                }}
                                data={{
                                    name: 'Kleinfeld Bridal',
                                    subTitle: 'Shipping to all 50 states',
                                    roles: [
                                        {
                                            name: 'Bridal Shop',
                                            slug: 'bridal-shop',
                                            family_type: 'fashion',
                                        },
                                    ],
                                    thumbnailUrl:
                                        'https://cdn.pixabay.com/photo/2018/05/10/04/56/springtime-3386834_960_720.jpg',
                                    thumbnailAlt: 'kleinfeld-bridal',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    {/*
                          _____                      __  __                _
                         |_   _|__  __ _ _ __ ___   |  \/  | ___ _ __ ___ | |__   ___ _ __
                           | |/ _ \/ _` | '_ ` _ \  | |\/| |/ _ \ '_ ` _ \| '_ \ / _ \ '__|
                           | |  __/ (_| | | | | | | | |  | |  __/ | | | | | |_) |  __/ |
                           |_|\___|\__,_|_| |_| |_| |_|  |_|\___|_| |_| |_|_.__/ \___|_|
                    */}

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>
                            Team Member Card (for premium business pages Meet the team and our own /team headshots/bio
                        </h4>
                        <VerticalSpacer space={20} />
                        <CardContainer>
                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_TEAM_MEMBER,
                                    containerMode: 'grid',
                                    orientation: 'portrait',
                                    clickHandler: () => {},
                                }}
                                data={{
                                    name: 'Ronen Magid',
                                    title: 'CTO',
                                    description:
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                                        ' Pellentesque purus ex, dignissim ut lectus non, dictum auctor neque.',
                                    thumbnailUrl: 'https://s3.amazonaws.com/f6s-public/profiles/1341785_original.jpg',
                                    thumbnailAlt: 'ronen magid',
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_TEAM_MEMBER,
                                    containerMode: 'grid',
                                    orientation: 'portrait',
                                    clickHandler: () => {},
                                }}
                                data={{
                                    name: 'Thom Lamb',
                                    title: 'FE Team Lead',
                                    description:
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                                        ' Pellentesque purus ex, dignissim ut lectus non, dictum auctor neque.',
                                    thumbnailUrl: 'https://ca.slack-edge.com/T0HMGUL6P-U01C2EMLZ1Q-00f0f4e7741a-512',
                                    thumbnailAlt: 'thom lamb',
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_TEAM_MEMBER,
                                    containerMode: 'grid',
                                    orientation: 'portrait',
                                    clickHandler: () => {},
                                }}
                                data={{
                                    name: 'Brandon Veth',
                                    title: 'FE Developer',
                                    description:
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                                        ' Pellentesque purus ex, dignissim ut lectus non, dictum auctor neque.',
                                    thumbnailUrl: 'https://ca.slack-edge.com/T0HMGUL6P-U01CF3R8LUR-e2bdc0ee550e-512',
                                    thumbnailAlt: 'brandon veth',
                                }}
                            />

                            <LSTVCard
                                options={{
                                    cardType: CARD_TYPE_TEAM_MEMBER,
                                    containerMode: 'grid',
                                    orientation: 'portrait',
                                    clickHandler: () => {},
                                }}
                                data={{
                                    name: 'Eyal Cohen',
                                    title: 'FE Developer',
                                    description:
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                                        ' Pellentesque purus ex, dignissim ut lectus non, dictum auctor neque.',
                                    thumbnailUrl: 'https://ca.slack-edge.com/T0HMGUL6P-U01C2EMNVCJ-1ec675bad378-512',
                                    thumbnailAlt: 'eyal cohen',
                                }}
                            />
                        </CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Team Member Card (for premium business pages: Meet the team)</h4>
                        <VerticalSpacer space={20} />
                        <CardContainer></CardContainer>

                        <CardContainer></CardContainer>
                    </GenericContainer>

                    <GenericContainer margin={'20px'}>
                        <hr />
                        <h4>Team Member Card (Generic, for our team page and future uses)</h4>
                        <VerticalSpacer space={20} />
                    </GenericContainer>
                </PageContent>
            </React.Fragment>
        );
    }
}

export default withRouter(TestBed);
