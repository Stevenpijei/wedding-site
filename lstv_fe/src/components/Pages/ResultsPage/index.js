import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useSearch } from '/newComponents/Search/use-search';
import { useQueryParams } from '/newComponents/Search/useQueryParams';
import { usePublicContentService } from '/rest-api/hooks/usePublicContentService';
import { useTagService } from '/rest-api/hooks/useTagService';
import FreeSearchResults from './FreeSearchResults';
import { VendorsByLocation } from './Grids';

const ResultsPage = () => {
    const {
        roleDirectories,
        directories,
        selectedDirectory,
        handleSelectFreeText,
        query,
        selectedLocation
    } = useSearch();
    const [urlQuery, urlLocation] = useQueryParams();
    const { search: searchFreeText } = usePublicContentService(null);
    const { getLocation } = useTagService();

    const [locationUrl, setLocationUrl] = useState('');
    const [totalResults, setTotalResults] = useState(null);
    const [isDirectory, setIsDirectory] = useState(false);
    const [freeTextResults, setFreeTextResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // that's a location we get from the LSTV server in case we dont have it in selectLocaiton of
    // useSearch, since it comes from a query param slug (e.g /new-york/new-jersey)
    const [lstvLocation, setLstvLocation] = useState(null);

    useEffect(() => {
        setLstvLocation(null);
        init();
    }, [urlQuery, urlLocation, directories, roleDirectories]);

    const init = async () => {
        // if query came from global nav cards
        let directoryFromUrl = directories?.find(({ slug }) => slug === urlQuery);
        if(!directoryFromUrl) {
            // if query came from search filter control
            directoryFromUrl = roleDirectories?.find(({ slug }) => slug === urlQuery)
        }

        const isDirectory = selectedDirectory?.name === query || directoryFromUrl;

        if (isDirectory) {
            setIsDirectory(true)
            setLocationUrl(urlLocation);

            if (!selectedDirectory && directoryFromUrl) {
                handleSelectFreeText(directoryFromUrl);
            }

            setFreeTextResults(null)

        } else {
            setIsDirectory(false);
            fetchFreeTextSearch(query || urlQuery, urlLocation);
        }

        if (!selectedLocation && urlLocation) {
            const locationData = await getLocation(urlLocation, false);
            setLstvLocation(locationData);
        }
    };

    const fetchFreeTextSearch = async (text, location) => {
        setIsLoading(true);

        const request = await searchFreeText(text, location);
        setFreeTextResults(request?.businesses);
        setTotalResults(request?.found?.businesses);

        setIsLoading(false);
    };

    const locationName =
        selectedLocation?.display_name || selectedLocation?.formatted_address || lstvLocation?.display_name;

    return (
        <div>
            {freeTextResults && !isDirectory ? (
                <FreeSearchResults
                    query={query || urlQuery}
                    content={freeTextResults}
                    locationName={locationName}
                    total={totalResults}
                    isLoading={isLoading}
                />
            ) : (
                <VendorsByLocation
                    name={selectedDirectory?.subtitle_name_plural || selectedDirectory?.name}
                    locationName={locationName}
                    locationUrl={locationUrl}
                    role_types={selectedDirectory?.role_types}
                    role_capacity_types={selectedDirectory?.role_capacity_types}
                />
            )}
        </div>
    );
};

export default connect(null, null)(ResultsPage);
