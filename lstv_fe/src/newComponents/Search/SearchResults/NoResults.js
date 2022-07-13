import React from 'react'
import styled from 'styled-components'

import theme from '../../../styledComponentsTheme';
import searchBirds from '../../../images/search-birds.svg';
import { SearchIcon } from '../../../components/Utility/LSTVSVG';

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;

    @media ${theme.breakpoints.laptop} {
        padding-top: 32px;
        padding-bottom: 32px;
    }
`;

const Title = styled.h3`
    font-family: 'Heldane Display', sans-serif;
    font-weight: 800;
    font-size: 2rem;
`;

const Subtitle = styled.p`
    font-family: Calibre;
    font-weight: 400;
`;

const IconContainer = styled.div`
    height: 50px;
    width: 50px;
`;

const NoResultsBirds = styled.img`
    margin: 32px 0 0 0;

    @media ${theme.breakpoints.laptop} {
        display: none;
    }
`;

const NoResults = ({ hideBirds }) => {
    return (
        <Container>
            <IconContainer>
                <SearchIcon fill={theme.primaryPurple} storkeWidth="3" />
            </IconContainer>
            <Title>No Results</Title>
            <Subtitle>We couldn't find anything for your search term<br/></Subtitle>
            {!hideBirds ? <NoResultsBirds src={searchBirds} /> : null}
        </Container>
    );
};

export default NoResults