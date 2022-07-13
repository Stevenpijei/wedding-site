import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import debounce from 'lodash.debounce';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router';
import PublicContentService from '../../rest-api/services/publicContentService';
import { convertGoogleLocation } from '../../utils/LSTVUtils';
import { useQueryParams } from './useQueryParams';

const RESULTS_PAGE_PATHNAME = '/results';

export const searchSources = {
    header: 'header',
    page: 'page',
};

const LOCATION = 'location';
const FREETEXT = 'freetext';
const LOCATION_RESULTS = 'location-results';
const FREETEXT_RESULTS = 'freetext-results';
const NO_INPUT = 'no-input';
const NO_RESULTS = 'no-results';
// these refer to the new simpler free-text search input in the header (except on the homepage)
const SIMPLE_SEARCH = 'simplesearch'
const SIMPLE_SEARCH_RESULTS = 'simplesearch-results'

const resultsTypes = {
    LOCATION_RESULTS,
    FREETEXT_RESULTS,
    SIMPLE_SEARCH_RESULTS,
    NO_INPUT,
    NO_RESULTS,
};

export const fields = {
    LOCATION,
    FREETEXT,
    SIMPLE_SEARCH
};

const SearchContext = createContext({
    isSearchModalOpen: false,
    shouldRenderSearchPanel: true,
    isLoading: false,
    shouldFocusLocation: false,
    results: null,
    currentSearchSource: '',
    locationQuery: '',
    selectedLocation: null,
    selectedDirectory: null,
    query: '',
    directories: [],
    fields,
    resultsTypes,
    openContactBusinessModal: () => {},
    closeContactBusinessModal: () => {},
    openSearchModal: () => {},
    closeSearchModal: () => {},
    handleFieldFocus: () => {},
    handleSelectLocation: () => {},
    handleClickOutside: () => {},
    handleSelectFreeText: () => {},
    handleSearchButtonClick: () => {},
    hideSearchPanel: () => {},
    showSearchPanel: () => {},
    handleSearch: () => {},
});

const useSearch = () => {
    return useContext(SearchContext);
};

const useProvideSearch = () => {
    const [results, setResults] = useState({
        type: resultsTypes.NO_INPUT,
        data: [],
    });
    
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    
    const [, urlLocation, setParams] = useQueryParams();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [shouldRenderSearchPanel, setShouldRenderSearchPanel] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState();
    const [selectedDirectory, setSelectedDirectory] = useState(null);
    const [currentFocusedField, setCurrentFocusedField] = useState(null);
    const [currentSearchSource, setCurrentSearchSource] = useState('');
    const [shouldFocusLocation, setShouldFocusLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [directories, setDirectories] = useState([]);
    const [roleDirectories, setRoleDirectories] = useState([]);
    const [query, setQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const history = useHistory();
    const location = useLocation();
    const getAddressPredictions = useAddressPredictions();

    useEffect(() => {
        fetchDirectories();
    }, []);

    useEffect(() => {
        if (selectedDirectory || query) {
            handleSearchButtonClick()
        }
    }, [selectedLocation])

    useEffect(() => {
        if (location.pathname !== RESULTS_PAGE_PATHNAME) {
            setQuery('');
            setSelectedDirectory(null);
            // setSelectedLocation(null);
        }

        if (isResultsOpen) {
            setIsResultsOpen(false);
        }

        setResults({
            type: NO_INPUT,
            data: [],
        });
        setCurrentFocusedField(null);
        setCurrentSearchSource('');
    }, [location.pathname]);

    const fetchDirectories = async () => {
        const [dirs, roleDirs] = await Promise.all([
            PublicContentService.getSearchDirectories(),
            PublicContentService.getSearchRoleDirectories(),
        ])
        setDirectories(dirs);
        setRoleDirectories(roleDirs)
    };

    const handleClickOutside = () => {
        // want to preserve results upon blurring simple search
        if(currentFocusedField !== fields.SIMPLE_SEARCH) {
            setQuery('');
            setResults({
                type: NO_INPUT,
                data: [],
            });
            setCurrentFocusedField(null);
        }
        
        setCurrentSearchSource('');
        setIsResultsOpen(false);
    };

    const handleFieldFocus = (source, field) => {
        if (!Object.values(fields).includes(field)) {
            throw new Error('[use-search.handleFieldFocus] Field Not Found');
        }

        setCurrentSearchSource(source);
        setCurrentFocusedField(field);

        if (field === fields.LOCATION) {            
            setResults({
                type: resultsTypes.LOCATION_RESULTS,
                data: [],
            });
            setIsResultsOpen(false);

        } else if (field === fields.FREETEXT) {
            setResults({
                type: resultsTypes.NO_INPUT,
                data: [],
            });
            setIsResultsOpen(true)

        } else if(field === fields.SIMPLE_SEARCH) {
            setIsResultsOpen(true)
        }
    };

    const searchFreeText = async (value) => {
        if (query !== value) {
            setQuery(value)
        }

        setIsLoading(true);
        let locationUrl;

        if (selectedLocation) {
            locationUrl = convertGoogleLocation(selectedLocation);
        }
        const request = await PublicContentService.search(value, locationUrl || '');

        if (!request.found?.directories && !request?.found?.businesses) {
            setIsLoading(false);
            return setResults({
                type: resultsTypes.NO_RESULTS,
                data: [],
            });
        }

        const data = [...request.directories, ...request.businesses];

        setResults({
            type: resultsTypes.FREETEXT_RESULTS,
            data: data,
        });
        setIsLoading(false);
    };

    const handleSearch = async (field, value) => {
        if (!value && field !== fields.LOCATION) {
            setQuery(value);
            return setResults({
                type: resultsTypes.NO_INPUT,
                data: [],
            });
        }

        if (field === fields.FREETEXT || field === fields.SIMPLE_SEARCH) {
            setQuery(value);
            await searchFreeText(value);
            
        } else if (field === fields.LOCATION) {
            if (!value) {
                setSelectedLocation(null)
                setLocationQuery('')
                return;
            }
            
            setLocationQuery(query)
            const data = await getAddressPredictions(value);

            if (!isResultsOpen) {
                setIsResultsOpen(true);
            }

            return setResults({
                type: resultsTypes.LOCATION_RESULTS,
                data,
            });
        }
    };

    const handleSelectLocation = (location) => {
        if(!location) {
            setSelectedLocation(null)
            return
        }

        const div = document.createElement('div');
        const places = new window.google.maps.places.PlacesService(div);
        places.getDetails(
            {
                placeId: location.place_id,
                fields: ['address_components', 'geometry.location', 'place_id', 'formatted_address'],
            },
            (place, status) => {
                setResults({
                    type: resultsTypes.NO_INPUT,
                    data: [],
                });
                setIsResultsOpen(false);

                if (status === 'OK') {
                    setSelectedLocation(place);
                } else {
                    setSelectedLocation(location);
                }
            }
        );
    };

    const handleSelectFreeText = (item) => {
        if (item?.content_type === 'business') {
            setQuery(item.name);
            setSelectedDirectory(item);
            setShouldFocusLocation(true);
            setIsResultsOpen(false);
            setParams(item.slug, selectedLocation ? convertGoogleLocation(selectedLocation) : urlLocation)
            return;
        }

        if (item?.type === 'business') {
            history.push(`/business/${item?.slug}`);
            setIsSearchModalOpen(false);
        }

        closeAll();
    };

    
    const handleSearchButtonClick = async () => {
        let path = `/results?q=`;

        if (selectedDirectory && query !== selectedDirectory?.name) {
            setSelectedDirectory(null);
            path += `${query}`;
        } else if (selectedDirectory?.name) {
            path += `${selectedDirectory?.slug || ''}`;
        } else {
            path += `${query}`;
        }

        if (selectedLocation?.place_id) {
            const pathLocation = convertGoogleLocation(selectedLocation);
            path += `&loc=${pathLocation}`;
        } else {
            setSelectedLocation(null)
        }

        history.push(path);
        closeAll();
    };

    const closeAll = () => {
        setIsSearchModalOpen(false);
        setIsResultsOpen(false);
    };

    return {
        fields,
        resultsTypes,
        currentFocusedField,
        currentSearchSource,
        isSearchModalOpen,
        isResultsOpen,
        isLoading,
        shouldRenderSearchPanel,
        shouldFocusLocation,
        directories,
        roleDirectories,
        results,
        query,
        selectedLocation,
        selectedDirectory,
        handleClickOutside,
        handleFieldFocus,
        handleSelectLocation,
        handleSelectFreeText,
        handleSearchButtonClick,
        locationQuery,
        handleSearch: debounce(handleSearch, 650),
        openSearchModal: () => setIsSearchModalOpen(true),
        closeSearchModal: () => setIsSearchModalOpen(false),
        hideSearchPanel: () => setShouldRenderSearchPanel(false),
        showSearchPanel: () => setShouldRenderSearchPanel(true),
        openResults: () => setIsResultsOpen(true),
        closeResults: () => setIsResultsOpen(false),
    };
};

const useAddressPredictions = () => {
    const autocomplete = useRef();

    if (!autocomplete.current) {
        autocomplete.current = new window.google.maps.places.AutocompleteService(null, {
            fields: ['address_components', 'geometry.location', 'place_id', 'formatted_address'],
        });
    }

    function getPlacePredictions(input) {
        return new Promise((resolve) => {
            autocomplete.current.getPlacePredictions(
                {
                    input,
                    types: ['(regions)']
                    
                },
                (predictions) => {
                    resolve(predictions);
                }
            );
        });
    }

    return getPlacePredictions;
};

function SearchProvider({ children }) {
    const search = useProvideSearch();

    return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
}

export { useSearch, useAddressPredictions, SearchProvider };
