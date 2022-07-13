import React from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import { useField } from 'formik';
import * as LSTVGlobals from '../../../global/globals';
import Autocomplete from 'react-google-autocomplete';

import { InputWrapper, Label, ErrorMessage } from '../../../newComponents/forms/StyledForm';

const AutocompleteGlobalStyles = createGlobalStyle`
    .pac-container {
        border-radius: 30px;
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
        props.$hasTextValue &&
        css`
            & ~ label {
                top: 0;
                color: ${(props) => props.theme.darkGrey};
                font-size: 0.8125rem;
            }
        `}

    ${(props) =>
        props.$hasError &&
        css`
            border-color: ${props.theme.red};
            & ~ label {
                color: ${(props) => props.theme.red};
            }
        `}
`;

const GooglePlacesSearchBar = (props) => {
    const [, meta, helpers] = useField(props);
    const [textValue, setTextValue] = React.useState('');
    const hasError = meta.error && meta.touched
    
    return (
        <InputWrapper>
            <AutocompleteGlobalStyles />
            <Label htmlFor={props.name}>{props.label}</Label>
            <AutocompleteStyled
                id={props.identifier}
                type={'string'}
                onPlaceSelected={(place) => {
                    console.log('place selected handler called');
                    setTextValue(place.formatted_address);
                    helpers.setValue(place);
                    props.onSelected && props.onSelected(place)
                }}
                types={['(regions)']}
                placeholder={props.$placeHolder}
                $hasTextValue={Boolean(textValue)}
                $hasError={hasError}
                onChange={(e) => {
                    console.log('change called', e.target.value);
                    setTextValue(e.target.value);
                    props.onSelected && props.onSelected(null)
                }}
                defaultValue={props.defaultValue}
                onBlur={(e) => {
                    () => {
                        console.log(e);
                    };
                }}                
            />            
            {hasError ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
        </InputWrapper>
    );
};

GooglePlacesSearchBar.defaultProps = {
    $placeSelectionHandler: null,
    identifier: 'googlePlaces',
    $textChangeHandler: null,
    $blurHandler: null,
    defaultValue: '',
    $placeHolder: null,
};

export default GooglePlacesSearchBar;
