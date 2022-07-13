import React from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import { useField } from 'formik';
import * as LSTVGlobals from '../../../global/globals';
import Autocomplete from 'react-google-autocomplete';
import { InputWrapper, Label, ErrorMessage } from './StyledForm';

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
    width: 100%;
    border: 1px solid ${(props) => props.theme.midGrey};
    border-radius: 42px;
    background-color: ${(props) => props.theme.lightGrey};
    color: ${(props) => props.theme.black};
    font-size: 0.9375;
    padding: 19px 16px 5px 16px;
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
        Boolean(props.hasTextValue) &&
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

export const GooglePlacesAutoComplete = props => {
    return (
        <>
            <AutocompleteGlobalStyles />
            <AutocompleteStyled
                apiKey={undefined}
                id={props.identifier}
                type='string'
                types={['(regions)']}
                placeholder={props.placeHolder}
                defaultValue={props.defaultValue}
                onPlaceSelected={(place) => {
                    props.placeSelectionHandler && props.placeSelectionHandler(place);
                }}                                
                onChange={(e) => {
                    props.textChangeHandler && props.textChangeHandler(e.target.value);
                }}                
                onBlur={(e) => {
                    props.blurHandler && props.blurHandler(e);
                }}
            />
        </>
    )    
}

const GooglePlacesSearchBar = (props) => {
    const [, meta] = useField(props);
    
    return (
        <InputWrapper>
            <GooglePlacesAutoComplete {...props} />            
            <Label htmlFor={props.name}>{props.label}</Label>
            {meta.error && meta.touched ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
        </InputWrapper>
    );
};

GooglePlacesSearchBar.defaultProps = {
    placeSelectionHandler: null,
    identifier: 'googlePlaces',
    textChangeHandler: null,
    blurHandler: null,
    defaultValue: '',
    placeHolder: null,
};

export default GooglePlacesSearchBar;
