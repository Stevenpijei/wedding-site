import React from 'react'
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import { UserDevice, VENDOR_ROLE_RECEPTION_VENUE } from '../../../global/globals';
import styled from 'styled-components';
import { Section, SectionTitle } from "./LayoutComps";
import Map from "../../../newComponents/map/Map";
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import { getLocationCoords } from "../../../utils/LSTVUtils";


const LocationSection = styled(Section)`
    display: flex;
    flex-direction: column;
`;

const MapContainer = styled.div`
    min-height: 300px;
    margin: 20px;

    div {
        border-radius: 8px;
    }
`;

const MoreButton = styled(OutlinedCTAButton)`
    width: 70%;
    margin: 20px auto 20px auto;
    @media ${UserDevice.tablet} {
        position: absolute;
        top: 0;
        right: 20px;
        width: 200px;
        padding: 5px;
        margin: 0px;
    }
`;

const Subtitle = styled.h3`
    font-family: Calibre;
    font-weight: normal;
    font-size: 1.25rem;
    line-height: 1.5rem;
    margin-left: 20px;
`;


const Location = (props) => {
    const { location, businesses, isMobile } = props;
    let zoomLevel = 12;
    if (location?.classification === 'county')
        zoomLevel = 8;
    if (location?.classification === 'state_province')
        zoomLevel = 5;
    if (location?.classification === 'country')
        zoomLevel = 2;

    let history = useHistory();
    const venue = businesses.find((business)=> business.business_capacity_type_slug === VENDOR_ROLE_RECEPTION_VENUE);

    return (
        <LocationSection {...props}>
            <SectionTitle style={{marginLeft: '20px'}}>Location</SectionTitle>
            {venue && !isMobile && <Subtitle>at {venue.name}</Subtitle>}
            {location && !isMobile && <Subtitle>in {location.display_name}</Subtitle>}
            <MapContainer>
                <Map
                    defaultCenter={getLocationCoords(location)}
                    defaultZoom={zoomLevel}
                    markers={[getLocationCoords(location)]}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `400px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />
            </MapContainer>
            <MoreButton onClick={() => history.push(location.place_url)}>More from this Location</MoreButton>
        </LocationSection>
    )
}

Location.propTypes = {
    location: PropTypes.object,
    businesses: PropTypes.array,
    isMobile: PropTypes.bool,
}

export default Location;
