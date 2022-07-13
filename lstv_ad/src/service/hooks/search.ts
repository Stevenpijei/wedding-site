import { useQuery, UseQueryOptions } from 'react-query';

import { getSearch } from 'service/api/search';

import { IGetSearchRequest, IGetSearchResponse, IError } from 'interface';

export const SearchQueryKeys = {
    GET_SEARCH_RESULT: 'GET_SEARCH_RESULT',
};

export const useSearch = (params: IGetSearchRequest, config?: UseQueryOptions<IGetSearchResponse, IError>) =>
    useQuery<IGetSearchResponse, IError>([SearchQueryKeys.GET_SEARCH_RESULT, params], () => getSearch(params), config);
