import React from 'react';
import styled from 'styled-components';
import StaticPageLayout from '../StaticPageLayout';
import ContactCard from './ContactCard';
import { contactPoints } from './content';
import * as LSTVGlobals from '../../../../global/globals';

const CardsGrid = styled.div`
  display: grid;
  width: 100%;
  justify-content: center;
  justify-items: center;
  grid-template-columns: repeat(auto-fill, 294px);

  @media ${LSTVGlobals.UserDevice.isMobile} {
    margin-top: 14px;
  }
`;

const ContactPage = () => {
  return (
    <StaticPageLayout headerText="We're Here to Help" wideContent headerImageX>
      <CardsGrid>
        {contactPoints.map((contactPoint, index) => (
          <ContactCard key={index} contactPoint={contactPoint} />
        ))}
      </CardsGrid>
    </StaticPageLayout>
  );
};

export default ContactPage;
