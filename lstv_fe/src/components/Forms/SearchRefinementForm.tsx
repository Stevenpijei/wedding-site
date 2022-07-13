import isEqual from 'lodash.isequal';
import { convertGoogleLocation } from '/utils/LSTVUtils';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import BusinessTypeSelect from '/newComponents/BusinessTypeSelect';
import BaseCTAButton, { Ripple } from '/newComponents/buttons/BaseCtaButton';
import { useSearch } from '/newComponents/Search/use-search';
import { SearchIcon } from '/components/Utility/LSTVSVG'
import LocationSelect from '/newComponents/LocationSelect';
import theme from '../../styledComponentsTheme';
import { useMediaReady } from '/utils/LSTVUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  @media ${theme.breakpoints.tablet} {
    flex-direction: row;
  }
`

const LocationContainer = styled.div`
  margin-top: 14px;
  margin-bottom: 14px;

  @media ${theme.breakpoints.tablet} {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 30px;
  }
`

const ButtonContainer = styled.div`
  /* because this is a non-standard button size */
  button {
    width: 100%;
    height: 54px;
    padding-left: 35px;

    @media ${theme.breakpoints.tablet} {
      width: 168px;
      margin-left: 30px;
    }

    span {
      font-size: 18px;
    }
  }
`

type Props = {
  /**
   * role_types array, for ex.
   */
  defaultTypeValue?: string[],
}

const SearchRefinementForm = ({ defaultTypeValue }: Props) => {
  const { roleDirectories, handleSelectLocation, handleSelectFreeText, selectedLocation } = useSearch()
  const history = useHistory()
  const [tablet] = useMediaReady(theme.breakpoints.tablet, false)
  const [laptop] = useMediaReady(theme.breakpoints.laptop, false)

  const [type, setType] = useState<any>() // TSFIXME Directory
  const [location, setLocation] = useState<{
    text?: string,
    place?: any // TSFIXME Google Place Location
  }>({ text: '', place: null })

  useEffect(() => {
    if(defaultTypeValue?.length) {
      const initType = roleDirectories.find(dir => isEqual(dir.role_types, defaultTypeValue))
      if(initType) {
        onTypeChange(initType)
      }
    }
  }, [defaultTypeValue, roleDirectories])

  useEffect(() => {
    if(selectedLocation?.place_id) {
      setLocation({ ...location, place: selectedLocation })
    }
  }, [selectedLocation])

  const buttonDisabled = !type

  const onTypeChange = type => {
    setType(type)
  }

  const onLocationTextChange = text => {
    if(text === '') {
      setLocation({ place: null, text })
    } else {
      setLocation({ ...location, text })
    }
  }

  const onLocationPlaceChange = place => {
    setLocation({ ...location, place })
  }

  const onClickSearch = () => {
    // basically, simplified functionality from useSearch::handleSearchButtonClick but also
    // decoupled from the primary search components.
    let path = `/results?q=${type.slug}`

    handleSelectFreeText(type)

    if(location?.place?.place_id) {
      path += `&loc=${convertGoogleLocation(location.place)}`
      // this sets the global location. the results page needs this
      // to be set to funciton correctly.
      handleSelectLocation(location.place)

    } else {
      handleSelectLocation(null)
    }

    history.push(path)
  }

  return (
    <Container>
      <BusinessTypeSelect
        value={type}
        onChange={onTypeChange}
      />
      <LocationContainer>
        <LocationSelect
          placeholder={laptop ? 'Where are you getting married?' : 'Location'}
          defaultValue={selectedLocation?.place_id ? selectedLocation.formatted_address : null}
          onLocationTextChange={onLocationTextChange}
          onLocationPlaceChange={onLocationPlaceChange}
        />
      </LocationContainer>
      <ButtonContainer>
        { tablet ?
          <div
            onClick={!buttonDisabled && onClickSearch}
            style={{
              cursor: !buttonDisabled && 'pointer',
              opacity: buttonDisabled ? 0.4 : 1
            }}
          >
            <Ripple size='iconOnly' style={{ width: 55, height: 55, marginLeft: 30 }}>
              <div style={{ width: 21, height: 22 }}>
                <SearchIcon fill='white' />
              </div>
            </Ripple>
          </div> :
          <BaseCTAButton
            onClick={onClickSearch}
            icon={<SearchIcon fill='white' />}
            title='Search'
            disabled={buttonDisabled}
          />
        }
      </ButtonContainer>
    </Container>
  )
}

export default SearchRefinementForm
