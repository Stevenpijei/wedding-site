import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { GooglePlacesAutoComplete } from '/components/Pages/forms/GooglePlacesSearchBar';
import { LocationIcon } from '/components/Utility/LSTVSVG';
import theme from '../styledComponentsTheme'

const GooglePlacesAutoCompleteStyles = createGlobalStyle`
    .pac-container {
        padding: 0px !important;
        border-radius: 10px;
        box-shadow: 0px 0px 14px rgba(0, 0, 0, 0.25);
    }

    .pac-item {
      padding: 10px 29px;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: ${theme.midGrey};
      }
    }

    .pac-icon {
      width: 20px;
      height: 26px;
      background-image: url('/images/icon-map-location.svg') !important;
      background-repeat: no-repeat;
      background-size: 20px 26px;
      background-position: center;
      margin-top: 4px;
    }

    /* probably breaking google's terms here ... */
    .pac-logo::after { display: none; }

    .pac-matched {
      color: ${theme.black};
      font-weight: 500;
      font-size: 18px;
    }

    .pac-item-query {
      color: ${theme.darkerGrey};
      font-weight: 500;
      font-size: 18px;
    }
`;

const Container = styled.div`
  position: relative;

  input {
    padding: 0 60px;
    height: 55px;    
    min-width: 284px;
    font-size: 18px;
    font-weight: 500;
    color: ${theme.black};
    background-color: ${theme.lightGrey};
    border-color: ${theme.midGrey};
    transition: all 0.1s ease;
    -webkit-appearance: none;

    @media ${theme.breakpoints.laptop} {
      min-width: 365px;
    }

    &:hover,
    &:focus {
      border-color: ${theme.darkGrey};
    }

    &::placeholder {
      color: ${theme.black};
      opacity: 1;
    }
    &::-moz-placeholder {
      color: ${theme.black};
      opacity: 1;
    }
  }
`

const IconContainer = styled.div`
  position: absolute;
  width: 21px;
  height: 27px;
  top: 14px;
  left: 30px;
`

type Props = {
  placeholder?: string,
  defaultValue?: string,
  onLocationTextChange: (text: string) => void,
  onLocationPlaceChange: (place: any) => void
}

/**
 * Uses Google Places AutoComplete for selecting a Location
 */
const LocationSelect = ({
  placeholder,
  defaultValue,
  onLocationPlaceChange,
  onLocationTextChange
}: Props) => {
  return (
    <Container>
      <IconContainer style={{ pointerEvents: 'none' }}>
          <LocationIcon fillColor={theme.black} />
      </IconContainer>
      <GooglePlacesAutoComplete 
        placeHolder={placeholder ?? 'Location'}
        defaultValue={defaultValue}
        placeSelectionHandler={onLocationPlaceChange}
        textChangeHandler={onLocationTextChange}
      />
      {/* important to come after component so we can override global styles within */}
      <GooglePlacesAutoCompleteStyles />
    </Container>
  )
}

export default LocationSelect