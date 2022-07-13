import React from 'react'
import LSTVCard, { CARD_TYPE_SHOPPING_ITEM } from '../../../newComponents/cards/LSTVCard';
import styled from 'styled-components';
import {  UserDevice  } from '../../../global/globals';
import { Section, SectionTitle, SimpleCardGrid } from "./LayoutComps";


const data = {
    "success": true,
    "timestamp": 1604951258,
    "result": [
        {
            "id": "5092ec92-82e0-4594-a506-bbddb21702edf",
            "name": "Adele",
            "shop_url": "https://www.maggiesottero.com/maggie-sottero/adele/16873",
            "thumbnail_url": "https://ms-cdn2.maggiesottero.com/106645/High/Maggie-Sottero-Adele-21MW424-Alt2-IV.jpg?w=550&dpr=2",
            "price_cents": 159999,
            "old_price_cents": null,
            "discount_label": null,
            "currency_symbol": "$"
        },
        {
            "id": "5092ec92-82e0-4594-a506-bbdb21702edf",
            "name": "Adele",
            "shop_url": "https://www.maggiesottero.com/maggie-sottero/adele/16873",
            "thumbnail_url": "https://ms-cdn2.maggiesottero.com/106645/High/Maggie-Sottero-Adele-21MW424-Alt2-IV.jpg?w=550&dpr=2",
            "price_cents": 159999,
            "old_price_cents": null,
            "discount_label": null,
            "currency_symbol": "$"
        },
        {
            "id": "5092ec92-82e0-4594-a506-bbdbff21702edf",
            "name": "Adele",
            "shop_url": "https://www.maggiesottero.com/maggie-sottero/adele/16873",
            "thumbnail_url": "https://www.kleinfeldbridal.com/wp-content/uploads/2019/08/2174_Essense-of-Australia_Front-1351x1800.jpg",
            "price_cents": 159999,
            "old_price_cents": null,
            "discount_label": null,
            "currency_symbol": "$"
        },
    ]
}

const ShopSection = styled(Section)`
    padding: 0px 20px;
    margin-bottom: 80px;
`

const StyledGrid = styled(SimpleCardGrid)`
    @media ${UserDevice.tablet} {
        flex-wrap: nowrap;
        width: unset;
        overflow-x: scroll;
    }
`;

const CardContainer = styled.div`
   padding-right: 35px;
   min-width: 65vw;
   
   @media ${UserDevice.mobileL} {
        min-width: 260px;
        max-width: 260px;
        width: unset;
    }
`

const Shop = ({shopping}) => {
    return (
        shopping.length > 0 &&
        <ShopSection >
        <SectionTitle>Shop</SectionTitle>
        <StyledGrid>
            {shopping.map(item => (
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
                            // soldBy: 'PRETTYGARDEN',
                            price: item.price,
                        }}
                    />
                </CardContainer>
              ))}  
        </StyledGrid>
    </ShopSection>
    )
}

export default Shop

