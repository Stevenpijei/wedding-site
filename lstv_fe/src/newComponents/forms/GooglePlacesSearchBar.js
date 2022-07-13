import React from 'react';
import PropTypes from 'prop-types'
import styled, { css, createGlobalStyle } from 'styled-components';
import { useField } from 'formik';
import * as LSTVGlobals from '../../global/globals';
import Autocomplete from 'react-google-autocomplete';
import { InputWrapper, Label, ErrorMessage } from './StyledForm';

const AutocompleteGlobalStyles = createGlobalStyle`
    .pac-container {
        border-radius: 10px;
        margin-top: 10px;
        padding: 20px;

        .pac-item:first-of-type {
            border-top: none;
        }

        box-shadow: none;
        border: 1px solid ${props => props.theme.midGrey};
    }
`;

const AutocompleteStyled = styled(Autocomplete)`
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    border: 1px solid ${(props) => props.theme.midGrey};
    border-radius: 10px;
    background-color: ${(props) => props.theme.lightGrey};
    color: ${(props) => props.theme.black};
    font-size: 0.9375;
    padding: 12px 20px;
    box-sizing: border-box;

    & ~ label {
        /* Stop floating label from preventing clicking on form */
        pointer-events: none;
        position: absolute;
        top: 12.5px;
        left: 16px;
        margin: auto;
        z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
        transition: all 0.3s ease;
    }

    &:focus {
        border-color: ${(props) => props.theme.secondaryPurple};

        & ~ label {
            top: 0;
            color: ${(props) => props.theme.secondaryPurple};
            font-size: 0.8125rem;
        }
    }

    ${(props) =>
        Boolean(props.$hasTextValue) &&
        css`
            & ~ label {
                top: 0;
                color: ${(props) => props.theme.darkGrey};
                font-size: 0.8125rem;
            }
        `}

    ${(props) =>
        props.hasError &&
        props.touched &&
        css`
            border-color: ${props.theme.red};
            & ~ label {
                color: ${(props) => props.theme.red};
            }
        `}
`;

const GooglePlacesSearchBar = (props) => {
    const { identifier, $placeHolder, name, label, defaultValue } = props
    const [, meta, helpers] = useField(props);
    const [textValue, setTextValue] = React.useState('');
    return (
        <InputWrapper>
            <AutocompleteGlobalStyles />
            <Label htmlFor={name}>{label}</Label>
            <AutocompleteStyled
                inputAutocompleteValue='off'
                id={identifier}
                type='string'
                onPlaceSelected={(place) => {
                    setTextValue(place.formatted_address);
                    helpers.setValue(place);
                }}
                types={['(regions)']}
                placeholder={$placeHolder}
                $hasTextValue={Boolean(textValue)}
                onChange={(e) => {
                    setTextValue(e.target.value);
                }}
                defaultValue={defaultValue}
                $inputAutocompleteValue='off'
                {...props}
            />
            {meta.error && meta.touched ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
        </InputWrapper>
    );
};

GooglePlacesSearchBar.propTypes = {
    identifier: PropTypes.string,
    // AK: why is this prefixed with '$' ?
    $placeHolder: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    defaultValue: PropTypes.string,
}

GooglePlacesSearchBar.defaultProps = {
    identifier: 'googlePlaces',
    $placeHolder: null,
};

export default GooglePlacesSearchBar;
