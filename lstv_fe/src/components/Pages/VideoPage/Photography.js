/* eslint-disable react/prop-types */
import React from 'react'

import styled from 'styled-components';
import {  VENDOR_ROLE_PHOTOGRAPHER, UserDevice  } from '../../../global/globals';
import { Section, SectionTitle } from "./LayoutComps";
import {  couplesNamesFromProperties, useMediaReady } from "../../../utils/LSTVUtils";
import { ContactBusinessButton }  from '../../../components/Forms/LSTVInlineContactButtons';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import PhotoGallery from "../../../newComponents/PhotoGallery"

const WeddingDateContainer = styled.div`
    margin: 20px 20px 60px 20px;
    position: relative;
    h3 {
        font-family: Calibre;
        font-weight: 400;
        font-size: 1.25rem;
        line-height: 1.5rem;
        margin: 10px 0px;
    }
`;
const ButtonContainer = styled.div`
    @media ${UserDevice.laptopL} {
        position: absolute;
        top: 0px;
        right: 0px;
    }  
`

const Photography = ({data, videoIndex=0}) => {
    const { id } = data.videosSources[videoIndex];
    const { businesses, photos} = data;
    const photographer = businesses.find((business)=> business.role_slug === VENDOR_ROLE_PHOTOGRAPHER);
    const coupleNames = couplesNamesFromProperties(data.post_properties)
    const [isMobile, ready] = useMediaReady(UserDevice.isWithinLaptop, false)

    const DesktopContactCTA = () => (
        <OutlinedCTAButton style={{padding: '5px'}}>Contact Photographer</OutlinedCTAButton>
    )

    return (ready && photos?.length > 0) && (
        <>
        <Section>
            <WeddingDateContainer>
                <SectionTitle>Photography</SectionTitle>
                { photographer && <h3>{photographer.name}</h3> } 
                <PhotoGallery photos={photos} photoCredit={photographer?.name}/>
                <ButtonContainer>
                <ContactBusinessButton
                    id={'photographer-contact'}
                    business={photographer}
                    videoId={id}
                    tooltip={'Contact The Photographer'}
                    title={'Contact Photographer'}
                    message={
                        `I saw ${coupleNames}'s wedding photography on Love Stories TV, in which you are tagged as ` +
                        `the photographer. I'm impressed and would like to inquire about your services for my ` +
                        `upcoming wedding.`
                    }
                    CustomButtonComp={!isMobile && DesktopContactCTA}
                />
                </ButtonContainer>
             </WeddingDateContainer>
         </Section>
         </>
    )
}

export default Photography
