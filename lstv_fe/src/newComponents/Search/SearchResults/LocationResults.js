import React from 'react';
import styled from 'styled-components';

import theme from '../../../styledComponentsTheme';
import { MapIcon, LocationIcon } from '../../../components/Utility/LSTVSVG';

const List = styled.ul``;
const Item = styled.li`
    display: flex;
    padding: 16px;
    box-shadow: ${props => props.noBorder ? 'none' : '0px 1px 0px rgba(186, 186, 186, 0.25)'};
    
    align-items: center;
    
    &:hover {
        background: ${theme.lightGrey};
    }
`;

const IconContainer = styled.div`
    height: 24px;
    width: 24px;
    margin-right: 8px;
`;


const ItemText = styled.p`
    flex: 1;
    font-size: 1.125rem;
    font-family: Calibre;
    color: ${props => props.color || 'black'};
`;

const ItemLocation = styled.p`
    font-size: 0.875em;
    font-weight: 500;
    font-family: Calibre;
    color: ${theme.darkGrey};
`;

const LocationResults = ({ data, onSelect }) => {
    return (
        <List>
            {data?.map((item) => (
                <Item key={item.description} onClick={() => onSelect(item)}>
                    <ItemText>{item.description}</ItemText>
                    {item?.location ? (
                        <ItemLocation>{item?.count ? `${item.count} in ${item.location}` : item.location}</ItemLocation>
                    ) : null}
                </Item>
            ))}
        </List>
    );
};

export default LocationResults;
