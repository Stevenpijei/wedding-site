import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components';
import theme from '../../../styledComponentsTheme'
import {
  CONTENT_GRID_CONTENT_TYPE_BUSINESS,
  CONTENT_GRID_CONTENT_TYPE_VIDEO,
  CONTENT_GRID_CONTENT_TYPE_VIBE,
  CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_BUSINESS,
  CONTENT_GRID_CONTENT_SORT_METHOD_IMPORTANCE,
  CONTENT_GRID_CONTENT_TYPE_ARTICLE,
  CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT,
  CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
  CONTENT_CARD_VERBOSITY_LEVEL_SLUG,
  UserDevice
} from '../../../global/globals';
import ContentGrid from '../../Content/ContentGrid';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import LSTVCard from '../../../newComponents/cards/LSTVCard';


const Container = styled.div`
   
`;
const TempContainer = styled.div`
    position: relative;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 1fr;
    @media ${UserDevice.tablet} {
        grid-template-columns: ${(props) => props.gridCol || '1fr 1fr 1fr 1fr 1fr'};
    }

    ${(props) =>
        props.small &&
        css`
            grid-template-columns: ${(props) => props.gridColSmall || '1fr 1fr 1fr 1fr 1fr 1fr'};
        `};
`;

const LoadMoreContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding-top: 50px;
`;

export const Styles = ({style, onData, isMobile}) => {
    const [offset, setOffset] = useState(0);
    const [size, setSize] = useState(20);

    const loadMore = () => {
        setSize(size + 20);
        setOffset(offset + 20);
    };

    return (
        <Container>
            {/* /v1/contentSearch?content_type=tag&content_sort_method=importance&offset=0&size=40&verbosity=card */}

            <ContentGrid
                onDataReady={onData}
                contentType={CONTENT_GRID_CONTENT_TYPE_VIBE}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT}
                offset={offset}
                size={size}
                verboisty={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr 1fr 1fr'}
                containerMode="grid"
            />

            <LoadMoreContainer>
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>
        </Container>

    )
}
Styles.propTypes = {
    style: PropTypes.string,
    isMobile: PropTypes.bool,
}


export const VendorsByLocation = ({ location, onData,  role_types, role_capacity_types, isMobile}) => {
    const [offset, setOffset] = useState(0);
    const [size, setSize] = useState(20);

    const loadMore = () => {
        setSize(size + 20);
        setOffset(offset + 20);
    };

    return (
        <Container>
             <ContentGrid
                onDataReady={onData}
                contentType={CONTENT_GRID_CONTENT_TYPE_BUSINESS}
                limitToBusinessRoles={(role_capacity_types && role_types.length > 0) ? role_types.join(",") : null}
                limitToBusinessRoleCapacity={(role_capacity_types && role_capacity_types.length > 0) ?  role_capacity_types.join(","): null}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr 1fr 1fr'}
                containerMode="grid"
                offset={offset}
                size={size}
                verboisty={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}
                limitToLocations={location? location : null}
            />
            <LoadMoreContainer>
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>
        </Container>
    )
}
VendorsByLocation.propTypes = {
    role_types: PropTypes.array,
    role_capacity_types: PropTypes.array,
    location: PropTypes.string,
    isMobile: PropTypes.bool,
}

export const VideosByLocation = ({ location, onData, isMobile}) => {
    const [offset, setOffset] = useState(0);
    const [size, setSize] = useState(20);

    const loadMore = () => {
        setSize(size + 20);
        setOffset(offset + 20);
    };

    return (
        <Container>
            <ContentGrid
                onDataReady={onData}
                contentType={CONTENT_GRID_CONTENT_TYPE_VIDEO}
                // contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_BUSINESS}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr 1fr 1fr'}
                containerMode="grid"
                offset={offset}
                size={size}
                verbosity={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}

                // only for location
                contentSearchType={location && "location_to_video"}
                searchItems={location && location}
            />

            <LoadMoreContainer>
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>
        </Container>
    )
}
VideosByLocation.propTypes = {
    location: PropTypes.string,
    isMobile: PropTypes.bool,
}

export const Articles = ({ onData, isMobile}) => {
    const [offset, setOffset] = useState(0);
    const [size, setSize] = useState(20);

    const loadMore = () => {
        setSize(size + 20);
        setOffset(offset + 20);
    };
    const renderDummies = () => {
        const dummies = []
        for(let i=0; i< 15; i++ ){
            dummies.push(<LSTVCard
                options={{
                    cardType: 'article',
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
            />)
        }
        return dummies
    }

    return (
       <Container>
            <ContentGrid
                onDataReady={onData}
                contentType={CONTENT_GRID_CONTENT_TYPE_ARTICLE}
                // contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_BUSINESS}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr 1fr 1fr'}
                containerMode="grid"
                offset={offset}
                size={size}
                verbosity={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}
            />

            <LoadMoreContainer>
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>
        </Container>
    )
}
Articles.propTypes = {
    isMobile: PropTypes.bool,
}

export const GRIDTYPES = {style: "Styles", vendors: "VendorsByLocation", videos: "VideosByLocation", articles: "Articles"}

         