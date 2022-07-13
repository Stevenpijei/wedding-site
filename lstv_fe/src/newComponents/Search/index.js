import React from 'react';

import { useSearch, searchSources } from './use-search';

import SearchPanel from './SearchPanel'

const Search = ({ expendable, source }) => {
    const { openSearchModal } = useSearch();

    return <SearchPanel onOpen={openSearchModal} expendable={expendable} source={source} />;
};



export {
    searchSources
}
export default Search;
