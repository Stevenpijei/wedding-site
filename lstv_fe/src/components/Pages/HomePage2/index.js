import React from 'react'; 
import styled from 'styled-components';
import useMedia from 'use-media';
import NewVideoCard from '../../../newComponents/cards/NewCard';
import ContentGrid from '../../Content/ContentGrid';
import {
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
} from '../../../global/globals';
import theme from '../../../styledComponentsTheme';
import Search from '../../../newComponents/Search'
import SearchStickyPanel from './SearchStickyPanel';


// import { postMock } from './../BusinessPage/mock.js';

const Section = styled('div')`
    border-top: 1px solid ${(props) => props.theme.midGrey};
    margin: 16px 0;
    padding: 16px 0;
`;
const SectionTitle = styled('h2')`
    font-weight: 800;
    font-size: 2rem;
    padding-bottom: 20px
`;
const ContainerDiv = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    padding-top: 100px;
    column-gap: 20px;
    padding-left: 10px;
    padding-right: 10px;
    margin-left: 20px;
    margin-right: 20px;
`
const Container = styled('main')`
    padding: 40px;
    @media ${theme.breakpoints.isMobileOrTablet} {
        display: block;
        padding: 0;
    }
`

const options = {
    "options": {
        "cardType": "event-story",
        "orientation": "portrait",
        "containerMode": "grid",
        "cardSlug": "slug"
    },
    "data": {
        "cardSlug": "https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017",
        "thumbnailUrl": "https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png",
        "thumbnailAlt": "test",
        "premium": true,
        "coupleNames": "Jack & Jill",
        "videographer": "NST Pictures",
        "venueName": "The Plaza Hotel",
        "location": "New York, NY",
        "views": 31223,
        "likes": 423,
        "vibes": [
            "Cool",
            "Fun",
            "Nutty"
        ],
        "duration": 234
    }
}
const style = {
    container: {
        padding: 0,
    },
}

const HomePage = ({isOpen}) => {
    const isDesktop = true
    return (
   
            <Container>
                <SearchStickyPanel isOpen={isOpen}>
                    <Search/>
                </SearchStickyPanel>
            </Container>
    )
   
        
}

export default HomePage;
