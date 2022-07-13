import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { ArrowRight } from '../../../components/Utility/LSTVSVG';
import theme from '../../../styledComponentsTheme';
import { useSearch } from '../use-search';

const CardLink = styled(Link)`
    text-decoration: none;
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 120px;
    padding: 16px;
    background-color: ${(props) => props.color};
    border-radius: 10px;
    cursor: pointer;
`;

const Title = styled.p`
    font-family: Calibre;
    font-style: normal;
    font-weight: 600;
    color: white;
    font-size: 18px;
    line-height: 130.7%;
`;

const Count = styled.p`
    color: white;
    font-family: Calibre;
    font-weight: 600;
    font-size: 0.825rem;
`;

const Container = styled.div`
    display: grid;
    justify-content: flex-start;
    grid-gap: 20px;
    padding: 24px;

    @media ${theme.breakpoints.laptop} {
        grid-template-columns: repeat(3, 1fr);
    }

    @media ${theme.breakpoints.laptopL} {
        grid-template-columns: repeat(4, 1fr);
    }

    @media ${theme.breakpoints.isMobileOrTablet} {
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 16px;
    }
`;

const CardFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ArrowContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 2px solid white;
    border-radius: 50%;

    svg {
        height: 12px;
        width: 12px;
    }
`;

const SuggestedCard = ({ card, onClick }) => {
    const { name, weight, bg_color } = card;

    return (
        <CardContainer color={bg_color || theme.primaryPurple} onClick={onClick}>
            <Title>{name}</Title>
            <CardFooter>
                <Count>{weight} Businesses</Count>
            </CardFooter>
        </CardContainer>
    );
};

const SugesstedCards = () => {
    const { directories, handleSelectFreeText } = useSearch();

    return directories?.length ? (
        <Container>
            {directories?.map((dir) => (
                <SuggestedCard key={dir.name} card={dir} onClick={() => handleSelectFreeText(dir)} />
            ))}
        </Container>
    ) : null;
};

export default SugesstedCards;
