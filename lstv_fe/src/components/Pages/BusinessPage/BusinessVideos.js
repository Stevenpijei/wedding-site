import React, {useState} from 'react';
import styled from 'styled-components'
import theme from '../../../styledComponentsTheme'
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';

import ContentGrid from '../../Content/ContentGrid';
import {
    CONTENT_GRID_CONTENT_TYPE_VIDEO,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY,
    CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
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

const BusinessVideos = ({ slug, size: defaultSize, onData, isMobile }) => {
    const [anyVideoExists, setAnyVideoExists] = useState(false);
    const [offset, setOffset] = useState(0);
    const [size, setSize] = useState(defaultSize || 8);

    const loadMore = () => {
        setSize(size + 8);
        setOffset(offset + 8);
    };

    const preProcessData = (data) => {
        setAnyVideoExists(data?.result?.length > 0);
        onData(data);
    };

    return (
        <Container>
            <ContentGrid
                onDataReady={preProcessData}
                contentType={CONTENT_GRID_CONTENT_TYPE_VIDEO}
                contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY}
                contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
                gridTemplateColumns={isMobile ? '1fr' : '1fr 1fr'}
                containerMode="grid"
                searchItems={slug}
                offset={offset}
                size={8}
            />
            {anyVideoExists && <LoadMoreContainer >
                <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
            </LoadMoreContainer>}
        </Container>
    );
};

export default BusinessVideos;
