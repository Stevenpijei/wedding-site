import React from 'react';
import { fadeIn } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import theme from '../../../styledComponentsTheme';
import { suggestedSearch } from '../mock';
import { useSearch } from '../use-search';
import FreeTextResults from './FreeTextResults';
import LocationResults from './LocationResults';
import SuggestedCards from './SuggestedCards';

const fadeAnimation = keyframes(fadeIn)

// simple search results are diff't enough from standard
// that it's worth creating it's own container even if we're duplicating a bit.
const SimpleContainer = styled.div`
    position: absolute;
    z-index: ${theme.zIndex.searchContent};
    background: white;
    top: 80px;
    right: 0;
    width: calc(100vw - 40px);
    max-height: 400px;
    overflow-y: auto;
    border-radius: 10px;
    box-shadow: 0px 0px 6px rgba(186, 186, 186, 5);
    animation: 0.3s ${fadeAnimation} ease-in;

    @media ${theme.breakpoints.tablet} {
        width: 282px;
    }

    @media ${theme.breakpoints.laptop} {
        width: 505px;
        top: 70px;
    }
`

const Container = styled.div`
    @media ${theme.breakpoints.isMobileOrTablet} {
        margin: 24px 0 0;
    }

    @media ${theme.breakpoints.laptop} {
        position: absolute;
        background: white;
        top: 70px;
        right: 0;
        z-index: ${theme.zIndex.searchContent};
        overflow-y: auto;
        width: ${props => props.halfWidth ? '50%' : '100%'};
        border-radius: 10px;
        box-shadow: 0px 0px 6px rgba(186, 186, 186, 5);
        animation: 0.3s ${fadeAnimation} ease-in;
        transition: width 0.2s ease-in-out;
    }
`;

const Results = () => {
    const {
        resultsTypes,
        query,
        results,
        fields,
        currentFocusedField,
        handleSelectLocation,
        isLoading
    } = useSearch();
    const { type, data } = results || {}

    // simple search won't show cards or need to worry about a state where
    // it's showing location results.
    if (currentFocusedField === fields.SIMPLE_SEARCH) {
        return (
            <FreeTextResults
                data={data}
                query={query}
                isLoading={isLoading}
                noResults={type === resultsTypes.NO_RESULTS}
            />
        )
    }

    const componentByType = {
        [resultsTypes.NO_INPUT]: <SuggestedCards cards={suggestedSearch} />,
        [resultsTypes.FREETEXT_RESULTS]: (
            <FreeTextResults
                data={data}
                query={query}
                isLoading={isLoading}
                noResults={type === resultsTypes.NO_RESULTS}
            />
        ),
        [resultsTypes.LOCATION_RESULTS]: <LocationResults data={data} onSelect={handleSelectLocation} />,
    };
    
    return componentByType[type] || null;
};

const SearchResults = () => {
    const { fields, currentFocusedField } = useSearch();
    const isLocation = currentFocusedField === fields.LOCATION
    const isSimple = currentFocusedField === fields.SIMPLE_SEARCH

    if(isSimple) {
        return (
            <SimpleContainer>
                <Results />
            </SimpleContainer>
        )
    }

    return (
        <Container halfWidth={isLocation}>
            <Results />
        </Container>
    );
};

export default SearchResults;
