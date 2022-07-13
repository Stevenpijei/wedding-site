import React from 'react';
import Header from '../components/Header';
import V3PageContent from './layout/V3PageContent';
import V3MainContent from './layout/V3MainContent';
import Footer from '../components/Utility/Footer';

const DefaultPageLayout = (props) => (
  <>
    <Header/>
    <V3PageContent>
      <V3MainContent>
        {props.children}
      </V3MainContent>

      <Footer/>
    </V3PageContent>
  </>
)
export default DefaultPageLayout;
