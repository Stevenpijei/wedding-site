import React from 'react'
import { Section, SectionTitle } from "./LayoutComps";
import {  
  UserDevice, 
  CONTENT_GRID_CONTENT_TYPE_VIDEO,
  CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY,
  CUSTOM_CONTENT_GRID_CONTEXT_VIDEO_PAGE_MORE_FROM_FILMMAKER,
  VENDOR_ROLE_VIDEOGRAPHER, 
  CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY, 
  CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM, 
  CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT,
  CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM 
 } from '../../../global/globals';
import ContentGrid from '../../Content/ContentGrid';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import { CARD_CONSTRAINTS_NO_VIDEOGRAPHER } from '../../../newComponents/cards/LSTVCard';


const SectionContainer = styled(Section)`
  padding: 20px;
  width: unset;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  @media ${UserDevice.laptopL} {
    width: 100%;
  }
`
const GridContainer = styled.div`
  padding: 20px 0px;
`
const  SeeAllButton = styled(OutlinedCTAButton)`
  
  width: 70%;
  margin: auto;
  max-width: 250px;
  @media ${UserDevice.laptop} {
    padding: 5px 30px;
    width: auto;
    margin-left: unset;
  }
`;


export const MoreFromVideographer = ({businesses, data, isMobile}) => {
  const history = useHistory();
  const videoGrapher = businesses.find((business)=> business.role_slug === VENDOR_ROLE_VIDEOGRAPHER);

    return (
      <SectionContainer>  
        <SectionTitle>More From <span>{videoGrapher.name}</span></SectionTitle>
        <GridContainer>
          <ContentGrid
              // onDataReady={handleReady}
              contentType={CONTENT_GRID_CONTENT_TYPE_VIDEO}
              contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_VENDOR_TO_EVENT_STORY}
              searchItems={videoGrapher.slug}
              contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM}
              excludeItems={data.slug}
              offset={0}
              size={4}
              verbosity={CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM}
              context={
                  CUSTOM_CONTENT_GRID_CONTEXT_VIDEO_PAGE_MORE_FROM_FILMMAKER +
                  '-exclude-' +
                  data.slug
              }
              options={{
                orientation: isMobile ? 'portrait': 'landscape',
                constraints: CARD_CONSTRAINTS_NO_VIDEOGRAPHER,
              }}
              containerMode={isMobile ?  'h-scroll': 'grid'}
              gridTemplateColumns={isMobile ? null: '1fr'}
          /> 
          </GridContainer>
          <SeeAllButton onClick={() => history.push(`/business/${videoGrapher.slug}`)}>See All</SeeAllButton>
      </SectionContainer>
    )
}
export const MoreFromLocation = ({location: {place_url, state_province_url, country_url, display_name}, data, isMobile, isLast}) => {
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
    return (
      <SectionContainer isLast={isLast}>
        <SectionTitle>More Videos From <span>{display_name}</span></SectionTitle>
        <GridContainer>
          <ContentGrid
              // onDataReady={handleReady}
              contentType={CONTENT_GRID_CONTENT_TYPE_VIDEO}
              contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_LOCATION_TO_EVENT_STORY}
              searchItems={calcLocation().replace('/location/', '')}
              contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
              excludeItems={data.slug}
              offset={0}
              size={10}
              verbosity={CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM}
              context={
                  CUSTOM_CONTENT_GRID_CONTEXT_VIDEO_PAGE_MORE_FROM_FILMMAKER +
                  '-exclude-' +
                  data.slug
              }
              options={{
                orientation: isMobile ? 'portrait': 'landscape',
                constraints: CARD_CONSTRAINTS_NO_VIDEOGRAPHER,
              }}
              containerMode={isMobile ?  'h-scroll': 'grid'}
              gridTemplateColumns={isMobile ? null: '1fr'}
          /> 
          </GridContainer>
          <SeeAllButton onClick={() => history.push(place_url)}>See All</SeeAllButton>
      </SectionContainer>
    )
}




const propSet = {
    "numCards": 4,
    "content": [
      {
        "slug": "victoria-jeffrey-wedding-video-september-2020"
      },
      {
        "slug": "emily-edward-wedding-video-november-2019"
      },
      {
        "slug": "brenna-aedan-wedding-video-august-2020"
      },
      {
        "slug": "danielle-marc-wedding-video-august-2020"
      },
      {
        "slug": "katie-jim-wedding-video-july-2020"
      },
      {
        "slug": "maggie-mike-wedding-video-july-2020"
      },
      {
        "slug": "emily-dakota-wedding-video-august-2020"
      },
      {
        "slug": "aj-allie-wedding-video-june-2018"
      }
    ],
    "cardType": "business",
    "even": true,
    "name": "Most Recent Videos",
    "verbosity": 5,
    "options": null,
    "containerMode": "h-scroll"
  }


          