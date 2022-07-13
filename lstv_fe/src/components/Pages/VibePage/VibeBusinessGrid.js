import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components'
import theme from '../../../styledComponentsTheme'
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';

import ContentGrid from '../../Content/ContentGrid';
import {
    CONTENT_GRID_CONTENT_TYPE_BUSINESS,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_BUSINESS,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_BUSINESS,
    CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT,
    CONTENT_CARD_VERBOSITY_LEVEL_SLUG,
    CONTENT_GRID_CONTENT_LIMIT_ROLE,
    CONTENT_GRID_LOCATION_SCOPE
} from '../../../global/globals';

const Container = styled.div`
    @media ${theme.breakpoints.isMobileOrTablet} {
        .lstvLinkNoStyle {
            display: block;
            margin: 16px 0;
        }
    }
`;

const LoadMoreContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding-top: 50px;
`;

const VibeBusinessGrid = ({ slug, isLocation, onlyShowVenues, offset: defaultOffset, size: defaultSize, onData, isMobile }) => {
      const [offset, setOffset] = useState(defaultOffset);
      const [size, setSize] = useState(defaultSize || 4);

      const loadMore = () => {
          setSize(size + 8);
          setOffset(offset + 8);
      };


    return (
        <Container>
            <ContentGrid
                onDataReady={onData}
                contentType={CONTENT_GRID_CONTENT_TYPE_BUSINESS}
                // contentSearchType={isLocation ? CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_BUSINESS : CONTENT_GRID_CONTENT_SEARCH_TYPE_VIBE_TO_BUSINESS}
                businessLocationScope={isLocation && CONTENT_GRID_LOCATION_SCOPE}
                limitToBusinessRoles={onlyShowVenues && CONTENT_GRID_CONTENT_LIMIT_ROLE}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr'}
                containerMode="grid"
                searchItems={slug}
                offset={offset}
                size={size}
                verboisty={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}
            />
            <LoadMoreContainer>
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>
        </Container>
    );
}
VibeBusinessGrid.propTypes = {
    vibe: PropTypes.string.isRequired,
    // If true it will only show venues
    onlyShowVenues: PropTypes.bool.isRequired,
    offset: PropTypes.number,
    size: PropTypes.number,
    onData: PropTypes.func,
    isMobile: PropTypes.bool
}

VibeBusinessGrid.defaultProps = {
    size: 4,
    offset: 0
}

export default VibeBusinessGrid;