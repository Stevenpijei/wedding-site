import React from 'react';
import styled from 'styled-components';
import theme from '../styledComponentsTheme';
import LSTVCard, { CARD_TYPE_SHOPPING_ITEM } from './cards/LSTVCard';

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 0.5fr);
    max-width: 100%;
    grid-gap: 16px;
    justify-content: space-between;

    @media ${theme.breakpoints.desktop} {
        grid-template-columns: repeat(2fr, 0.3fr);
    }

    @media ${theme.breakpoints.isMobileOrTablet} {
        display: flex;
        flex-wrap: nowrap;
        margin: 0px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-left: -5px;
        padding: 5px;

        &::-webkit-scrollbar {
            display: none;
        }
    }
`;

const CardContainer = styled.div`
    margin: 24px 0;
    min-width: 72vw;
    padding: 0 30px 0 0;

    // stepping min-width helps w content overflow on smaller phones
    @media (min-width: 375px) {
        min-width: 68vw;
    }

    @media (min-width: 414px) {
        min-width: 65vw;
    }
    
    @media ${theme.breakpoints.laptop} {
        width: auto;
        min-width: unset;
    }
`;

const ShopItems = ({ name, items, style }) => {
    console.log(items);
    return (
        <Container style={style}>
            {items?.map((item) => (
                <CardContainer key={item.id}>
                    <LSTVCard
                        options={{
                            cardType: CARD_TYPE_SHOPPING_ITEM,
                            orientation: 'portrait',
                            containerMode: 'grid',
                            cardSlug: item.shop_url,
                        }}
                        data={{
                            thumbnailUrl: item.thumbnail_url,
                            thumbnailAlt: item.name,
                            name: item.name,
                            soldBy: item.sold_by || name,
                            price: item.price,
                            description: item.description
                        }}
                    />
                </CardContainer>
            ))}
        </Container>
    );
};

export default ShopItems;
