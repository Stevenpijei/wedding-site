import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const useQueryParams = () => {
    const query = useQuery();
    const RouterLocation = useLocation();
    const history = useHistory();

    const [searchTermState, setSearchTermState] = useState(query.get("q"));
    const [locationState, setLocationState] = useState(query.get("loc"));
    
    useEffect(() => {
        // Fired when url changes
        setLocationState(query.get("loc"))
        setSearchTermState(query.get('q'))
    }, [RouterLocation])

    const setParams = (searchTerm, location) => {
        if(location && searchTerm){
            history.replace({...RouterLocation, search: `?q=${searchTerm}&loc=${encodeURI(location)}`});
            setSearchTermState(searchTerm)
            setLocationState(location)
        } else if (location && !searchTerm) {
            history.replace({...RouterLocation, search: `?q=${''}&loc=${encodeURI(location)}`});
            setLocationState(location)
        } else if(searchTerm) {
            history.replace({...RouterLocation, search: `?q=${searchTerm}&loc=${''}`});
            setSearchTermState(searchTerm)
        } else {
            history.replace({...RouterLocation, search: `` });
            setSearchTermState('')
            setLocationState('')
        }
    }
    
    return [searchTermState, locationState, setParams];
}