import React, { useRef } from 'react';
import styled from 'styled-components';
import { useOnClickOutside } from '../../global/use-on-click-outside';
import theme from '../../styledComponentsTheme';
import { useMediaReady } from '../../utils/LSTVUtils';
import SearchInputs from './SearchInputs';
import SearchResults from './SearchResults/SearchResults';
import { useSearch } from './use-search';

const Container = styled.div`
    position: relative;

    * {
        box-sizing: border-box;
    }
`;

const SearchContent = ({ autoFocus, expendable, source }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);
    const {
        isResultsOpen,
        handleFieldFocus,
        currentSearchSource,
        handleSearch,
        fields,
        handleClickOutside,
    } = useSearch();
    const ref = useRef(null);
    const resultsRef = useRef(null);

    useOnClickOutside(ref, resultsRef, () => {
        if (source === currentSearchSource) {
            handleClickOutside();
        }
    });

    const handleFreeTextFocus = () => {
        handleFieldFocus(source, fields.FREETEXT);
    };

    const handleLocationFocus = () => {
        handleFieldFocus(source, fields.LOCATION);
    };

    const handleFreeTextChange = (value) => {
        handleSearch(fields.FREETEXT, value);
    };

    const handleLocationInputChange = (value) => {
        handleSearch(fields.LOCATION, value);
    };

    return ready ? (
        <div ref={ref}>
            <Container>
                <SearchInputs
                    source={source}
                    expendMode={expendable}
                    autoFocus={autoFocus}
                    onFreeTextChange={handleFreeTextChange}
                    onLocationChange={handleLocationInputChange}
                    onFreeTextFocus={handleFreeTextFocus}
                    onLocationFocus={handleLocationFocus}
                />
                <div ref={resultsRef}>
                    {isMobile || (isResultsOpen && currentSearchSource === source) ? <SearchResults /> : null}
                </div>
            </Container>
        </div>
    ) : null;
};

export default SearchContent;
