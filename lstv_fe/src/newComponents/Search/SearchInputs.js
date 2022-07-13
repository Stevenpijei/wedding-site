import { CloseIcon, SearchIcon } from '../../components/Utility/LSTVSVG';
import React, { useEffect, useRef, useState } from 'react';
import { useMediaReady } from '../../utils/LSTVUtils';
import theme from '../../styledComponentsTheme';
import BaseCtaButton from '../buttons/BaseCtaButton';
import LocationInput from './LocationInput';
import { ButtonContainer, ClearIconContainer, Container, FreeTextContainer, IconContainer, TextInput } from './styledComponents';
import { useSearch } from './use-search';

const FreeTextInput = ({ onFocus, onChange, autoFocus, shouldFocus }) => {
    const ref = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const { query } = useSearch()
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(query)
    }, [query])
    
    useEffect(() => {
        if (shouldFocus) {
            ref?.current?.focus();
        }
    }, [shouldFocus]);

    const handleFocus = () => {
        setIsFocused(true);
        onFocus();
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChange = (event) => {
        setValue(event?.target?.value);
        onChange(event?.target?.value);
    };

    const handleClear = (event) => {
        event.preventDefault();
        handleChange({ target: { value: '' } });
    };

    return (
        <FreeTextContainer className="free-text-container">
            <IconContainer>
                <SearchIcon fill={isFocused ? 'black' : '#9b9b9b'} />
            </IconContainer>
            <TextInput
                ref={ref}
                autoFocus={autoFocus}
                value={value}
                placeholder="Search For"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                ref={ref}
            />
            <ClearIconContainer visible={isFocused} onClick={handleClear} onMouseDown={handleClear}>
                <CloseIcon />
            </ClearIconContainer>
        </FreeTextContainer>
    );
};

const SearchInputs = ({
    expendMode,
    autoFocus,
    onFreeTextChange,
    onLocationChange,
    onFreeTextFocus,
    onLocationFocus,
}) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);
    const [expended, setExpended] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const {
        handleSearchButtonClick,
        currentSearchSource,
        shouldFocusLocation,
        currentFocusedField,
        locationQuery,
        isResultsOpen,
        selectedLocation,
    } = useSearch();

    useEffect(() => {
        if (expendMode && expended) {
            setExpended(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (selectedLocation || !locationQuery) {
            setIsButtonDisabled(false)
        } else {
            setIsButtonDisabled(true)
        }
    }, [selectedLocation, locationQuery])

    useEffect(() => {
        if (!isResultsOpen && expendMode && expended && !currentFocusedField) {
            setExpended(false);
        }
    }, [isResultsOpen, currentFocusedField]);

    const handleFreeTextFocus = () => {
        setExpended(true);
        onFreeTextFocus();
    };

    const handleFreeTextChange = (value) => {
        onFreeTextChange(value);
    };

    const handleLocationChange = (value) => {
        onLocationChange(value);
    };

    const onSearch = () => {
        // if (!selectedLocation) {
        //     return    
        // }

        handleSearchButtonClick();
    }

    return ready ? (
        <Container>
            <FreeTextInput
                autoFocus={autoFocus || isMobile}
                onChange={handleFreeTextChange}
                onFocus={handleFreeTextFocus}
            />
            <LocationInput
                hidden={expendMode && !expended}
                onChange={handleLocationChange}
                onFocus={onLocationFocus}
                selectedLocation={selectedLocation}
                shouldFocus={shouldFocusLocation}
                padIcon={!isMobile}
            />
            <ButtonContainer onClick={onSearch}>
                <BaseCtaButton title="Search" hideIcon center size="medium" disabled={isButtonDisabled} />
            </ButtonContainer>
        </Container>
    ) : null;
};

export default SearchInputs;
