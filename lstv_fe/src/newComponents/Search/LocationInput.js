import { CloseIcon, LocationIcon } from '../../components/Utility/LSTVSVG';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import { ClearIconContainer, IconContainer, InputContainer, TextInput } from './styledComponents';

const LocationContainer = styled(InputContainer)`
    position: relative;
    display: ${(props) => (props.hidden ? 'none' : 'flex')};
    width: 100%;

    @media ${theme.breakpoints.isMobileOrTablet} {
        border-top: none;
        border-radius: 0 0 10px 10px;
    }

    @media ${theme.breakpoints.laptop} {
        border-radius: 80px;

        &:before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 55%;
            width: 1px;
            background: black;
            transition: all 0.2ms ease-in;
        }
    }

    &:focus-within {
        color: ${theme.black};
        border-left: 1px solid ${theme.midGrey};
    }
`;

const StyledLocationInput = styled(TextInput)`
    @media ${theme.breakpoints.laptop} {
        padding: 0 128px 0 8px;
    }
`;

const LocationInput = ({ hidden, shouldFocus, onChange, onFocus, selectedLocation, padIcon }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState();
  const ref = useRef(null)

  useEffect(() => {
      setValue(selectedLocation?.formatted_address);
  }, [selectedLocation]);

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
      <LocationContainer className="location-input-container" hidden={hidden}>
          <IconContainer>
              <LocationIcon fillColor={isFocused ? 'black' : undefined} />
          </IconContainer>
          <StyledLocationInput
              value={value}
              onChange={handleChange}
              placeholder="City, State or Zipcode"
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={ref}
          />
          <ClearIconContainer absolute={padIcon} visible={isFocused} onClick={handleClear} onMouseDown={handleClear}>
              <CloseIcon />
          </ClearIconContainer>
      </LocationContainer>
  );
};

export default LocationInput