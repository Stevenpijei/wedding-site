import React from 'react';
import LSTVCard from '../cards/LSTVCard';
import * as LSTVGlobals from '../../global/globals';

const DummyCard = () => (
  <LSTVCard
    options={{
        cardType: 'vibe',
        orientation: 'portrait',
        containerMode: 'grid',
        cardSlug: `/style/jewish`,
        imageOnly: false,
        small: true,
    }}
    data={{
        name: 'Jewish Weddings',
        videos: 342,
        thumbnailUrl: 'https://content.jwplatform.com/thumbs/q7V2LNo1-1920.jpg',
        thumbnailAlt: 'vibe',
        colorBar: LSTVGlobals.CARD_LABEL_COLOR_VIBE,
    }}
  />

)
export default DummyCard; 
