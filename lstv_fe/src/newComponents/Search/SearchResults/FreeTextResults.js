import React from 'react';
import { Link } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';
import { shorthandValue } from '../../../utils/LSTVUtils';
import NoResults from './NoResults';
import { VendorsIcon } from '../../../components/Utility/LSTVSVG';
import useHover from '../../../hooks/useHover';

const Loading = styled.div`
    height: 200px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const List = styled.ul`
    @media ${theme.breakpoints.laptop} {
        max-height: 300px;
    }
`;

const Item = styled.li`
    border-bottom: 0.5px solid rgba(186, 186, 186, 0.25);
    padding: 13px 0;
    position: relative;
    color: ${theme.black};
    display: flex;
    justify-content: space-between;
    align-items: center;

    // color bar on the left
    :before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        height: 100%;
        width: 12px;
        background: ${(props) => props.background};
    }

    :hover {
        background: ${(props) => props.background || theme.lightGrey};
    }
`;

const Icon = styled.div`
    width: 28px;
    height: 26px;
    margin-left: 24px;
    // so that items w icons come to the ~same height as items without
    margin-top: -3px;
    margin-bottom: -4px;
`

const ItemLink = styled(Link)`
    height: 100%;
    width: 100%;    
    text-decoration: none;
    
    :hover {
        color: inherit;
    }
`;

const ItemText = styled.p`
    flex: 1;
    font-size: 1.125rem;
    font-family: Calibre;    
    font-weight: 500;
    color: ${props => props.color};
    margin-left: ${props => props.isDirectory ? '10px' : '30px'};
`;

const ItemLocation = styled.p`
    font-weight: 600;
    font-family: Calibre;
    color: ${props => props.color};
    padding: 0 16px 0 0;
    max-width: 40%;
    text-align: right;
`;

const ResultItem = ({ item }) => {    
    const { name, display_location, content_type, weight, slug, bg_color } = item
    const isDirectory = content_type === 'business';
    const [ref, hovered] = useHover()

    return (
        <ItemLink to={isDirectory ? `/${slug}` : `/business/${slug}`}>
            <Item
                key={name}
                ref={ref}
                // all items *should* have a bg_color but JIC
                background={bg_color || theme.business_role_family_color.default_purple}                
            >                        
                { isDirectory &&
                    <Icon>
                        <VendorsIcon fillColor={hovered ? theme.white : theme.darkerGrey} />
                    </Icon>
                }
                <ItemText isDirectory={isDirectory} color={hovered ? theme.white : theme.black}>
                    { name }
                </ItemText>
                { (display_location && display_location.toLowerCase() !== 'none') &&
                    <ItemLocation color={hovered ? theme.white : theme.darkGrey}>
                        { display_location }
                    </ItemLocation>
                }
                { (content_type === 'business' && weight > 0) &&
                    <ItemLocation color={hovered ? theme.white : theme.darkGrey}>
                        { shorthandValue(weight) }
                    </ItemLocation>
                }
            </Item>
        </ItemLink>
    );
};

const FreeTextResults = ({ data, noResults, isLoading }) => {
    if (isLoading) {
        return (
            <Loading>
                <BeatLoader size={24} color={theme.primaryYellow} loading />
            </Loading>
        );
    }

    if (data?.length) {
        return (
            <List>
                {data.map((item) => (
                    <ResultItem key={item.name} item={item} />
                ))}
            </List>
        );
    }

    if (noResults) return <NoResults />
    
    return null
};

export default FreeTextResults;
