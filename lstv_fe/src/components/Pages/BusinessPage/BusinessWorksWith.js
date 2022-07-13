import React from 'react'
import { CARD_SECTION_BUSINESS } from '../../../global/globals';
import CardGrid from '../../Content/Cards/CardGrid';

const WorksWith = ({ businesses, isMobile }) => {
    return (
        <CardGrid
            numCards={businesses?.length}
            content={businesses}
            cardType={CARD_SECTION_BUSINESS}
            containerMode={isMobile ? 'h-scroll' : 'grid'}
        />
    );
};

export default WorksWith