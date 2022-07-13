import { SearchIcon } from '../../components/Utility/LSTVSVG';
import React from 'react';
import styled from 'styled-components';
import { useMediaReady } from '../../utils/LSTVUtils';
import theme from '../../styledComponentsTheme';
import SearchContent from './SearchContent';

const IconContainer = styled('div')`
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    background-color: inherit;
    background: ${(props) => props.theme.primaryPurple};
    border-radius: 50%;
    svg {
        height: 20px;
        width: 20px;
    }
`;

const Container = styled.div`
    position: relative;
    transition: all 0.3s ease;
    * {
        box-sizing: border-box;
    }
    @media ${theme.breakpoints.isMobileOrTablet} {
        position: relative;
        display: flex;
    }
`;

const SearchInput = styled.input`
    box-sizing: border-box;
    -webkit-appearance: none;
    height: 56px;
    width: 100%;
    padding: 0 0 0 24px;
    border: 1px solid #ececec;
    border-radius: 30px;
    &::placeholder {
        font-weight: 500;
        font-family: Calibre;
        font-size: 1.175em;
        color: black;
    }
`;

const SearchTriggerInput = ({ onClick }) => {
    return (
        <Container>
            <SearchInput placeholder="Search For" onClick={onClick} />
            <IconContainer>
                <SearchIcon fill="white" />
            </IconContainer>
        </Container>
    )
}

const SearchPanel = ({ expendable, onOpen, source }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);

    if (!ready) {
        return null;
    }

    const handleInputClick = (event) => {
        event.preventDefault()
        event.target.blur()

        onOpen()
    }

    return ready ? (
        isMobile ? (
            <SearchTriggerInput onClick={handleInputClick} />
        ) : (
            <Container>
                <SearchContent expendable={expendable} source={source} />
            </Container>
        )
    ) : null;
};


export default SearchPanel;