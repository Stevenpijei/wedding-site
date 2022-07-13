import React, { useEffect, useState } from 'react';
import { Section, SectionTitle } from './LayoutComps';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import LSTVCard from '../../../newComponents/cards/LSTVCard';
import { useVideoService } from '../../../rest-api/hooks/useVideoService';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import { useHistory } from "react-router-dom";
import {  UserDevice } from '../../../global/globals';

const StyledSection = styled(Section)`
    padding: 20px;
    width: unset;
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: flex-start;
`
const CardContainer = styled('div')``;

const CardsContainer = styled('div')`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-gap: 8px;
`;

const  SeeAllButton = styled(OutlinedCTAButton)`
  width: 70%;
  margin: auto;
  max-width: 250px;
  margin-top: 50px;
  @media ${UserDevice.laptop} {
    padding: 5px 30px;
    width: auto;
    margin-left: unset;
  }
`;

const MoreBusinesses = ({location: {place_url, state_province_url, country_url, display_name}}) => {
    const [businesses, setBusinesses] = useState(undefined)
    const { getBusinessesByLocation } = useVideoService()
    const history = useHistory();

    const calcLocation = () => {
        if(place_url) {
          return place_url
        } else if ( state_province_url ) {
          return state_province_url
        } else if ( country_url) {
          return country_url
        }
      }

    useEffect(() => {
        getBusinessesByLocation(0, 4, calcLocation(location)).then((data)=> {
            data.length > 0 && setBusinesses(data)
        })
    }, [location])

    return (
        <StyledSection>
            <SectionTitle >More Businesses Serving <span>{display_name}</span></SectionTitle>
            <CardsContainer>
            {businesses && businesses.map((business) => (
                <CardContainer key={`${business.name}${business.role_name}`}>
                
                    <LSTVCard
                        key={business.name}
                        options={{
                            cardType: 'wedding-business',
                            orientation: 'portrait',
                            containerMode: 'grid',
                            bg_color: business.bg_color,
                            cardSlug: `/business/${business.slug}`,
                        }}
                        data={{
                            premium: business.premium,
                            name: business.name,
                            role_name: business.roles[0].name,
                            role_slug: business.roles[0].slug,
                            role_family: business.roles[0].family.toLowerCase().replace(" & ", "-"),
                        }}
                    />
               
                </CardContainer>
                 ))}
            </CardsContainer>
            <SeeAllButton onClick={() => history.push(`/wedding-vendors?loc=${place_url}`)}>See All</SeeAllButton>
        </StyledSection>
    );
};

MoreBusinesses.propTypes = {
    location: PropTypes.object.isRequired
}

export default MoreBusinesses;
