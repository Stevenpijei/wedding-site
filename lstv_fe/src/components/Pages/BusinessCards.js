import React, { useCallback, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import LSTVCard, { CARD_TYPE_WEDDING_VENDOR } from '../../newComponents/cards/LSTVCard';
import ScrollController from './HomePage/SecondaryHeroSection/ScrollController';

const GridContainer = styled('div')`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(178px, 1fr));
    grid-gap: 12px;
    margin: 24px 0 0 0;
    flex: 5;
    grid-auto-flow: column;
    overflow-x: ${isMobile ? 'auto' : 'hidden'};
    scroll-behavior: smooth;

    ::-webkit-scrollbar {
        width: 0px;
        background: transparent; 
    }
`;

const CardContainer = styled('div')`
    min-width: 178px;
`;

const BusinessCards = ({ hideScrollController, businesses, styles }) => {
    const gridContainerRef = useRef(null);

    const scrollRight = useCallback(() => {
        if (!gridContainerRef || !gridContainerRef.current) return;

        // gridContainerRef.current.scrollLeft += gridContainerRef.current.getBoundingClientRect().width;
        gridContainerRef.current.scrollLeft += 178;
    }, [gridContainerRef]);

    const scrollLeft = useCallback(() => {
        if (!gridContainerRef || !gridContainerRef.current) return;

        gridContainerRef.current.scrollLeft -= gridContainerRef.current.getBoundingClientRect().width;
    }, [gridContainerRef]);

    return businesses && businesses?.length ? (
        <VendorsContainer hideScroll={hideScrollController}>
            <GridContainer ref={gridContainerRef}>
                {businesses?.map((business) => (
                    <CardContainer key={business?.slug}>
                        <LSTVCard
                            options={{
                                cardType: CARD_TYPE_WEDDING_VENDOR,
                                orientation: 'portrait',
                                bg_color: business.bg_color,
                                containerMode: 'grid',
                                cardSlug: `business/${business.slug}`,
                            }}
                            data={business}
                        />
                    </CardContainer>
                ))}
            </GridContainer>
            {hideScrollController || <StyledScrollController onScrollRight={scrollRight} onScrollLeft={scrollLeft} />}
        </VendorsContainer>
    ) : null;
};

const VendorsContainer = styled.div`
    position: relative;
    padding-bottom: ${props => props.hideScroll ? '0' : '50px'};
`;

const StyledScrollController = styled(ScrollController)`
    position: absolute;
    bottom: 0;
`;

export default BusinessCards;
