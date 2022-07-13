import React, { useRef } from 'react';
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import SearchResults from './SearchResults/SearchResults';
import { useSearch } from './use-search';
import { SearchIcon } from '../../components/Utility/LSTVSVG';
import { useOnClickOutside } from '../../global/use-on-click-outside';

const Container = styled.div`
    position: relative;
`

const IconContainer = styled.div`
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
  background: ${theme.primaryPurple};
  border-radius: 50%;

  svg {
    height: 20px;
    width: 20px;
  }
`;

const InputContainer = styled.div`
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
  height: 55px;
  width: 100%;
  padding: 0 0 0 24px;
  border: 1px solid ${theme.midGrey};
  border-radius: 30px;
  font-weight: 500;
  transition: border-color 200ms ease, background-color 200ms ease;

  &::placeholder,
  &::-moz-placeholder {
    color: ${theme.darkerGrey};
    opacity: 1;
    font-weight: 500;
    font-family: Calibre;
    font-size: 1.175em;
  }

  :hover, :focus {
    border-color: ${theme.darkerGrey};
    background-color: ${theme.lightGrey};

    &::placeholder,
    &::-moz-placeholder {
      color: ${theme.black};
    }
  }
`;

const SimpleSearch = ({ source }: { source: string }) => {
  const { handleSearch, handleFieldFocus, handleClickOutside, fields, isResultsOpen } = useSearch()

  const containerRef = useRef()
  const resultsRef = useRef()

  useOnClickOutside(containerRef, resultsRef, () => {
    handleClickOutside()
  })

  const onFocus = () => {
    handleFieldFocus(source, fields.SIMPLE_SEARCH)
  }

  const onChange = (e) => {
    handleSearch(fields.SIMPLE_SEARCH, e.target.value)
  }

  return (
    <Container ref={containerRef}>
      <InputContainer>
        <SearchInput placeholder="Search" onChange={onChange} onFocus={onFocus} />
        <IconContainer>
          <SearchIcon fill="white" />
        </IconContainer>
      </InputContainer>
      <div ref={resultsRef}>
        {isResultsOpen && <SearchResults />}
      </div>
    </Container>
  )
}

export default SimpleSearch