import { IGetSearchRequest, IGetSearchResponse } from 'interface';
import { getRequest, API_URL } from '.';

export const getSearch = (params: IGetSearchRequest) => getRequest<IGetSearchResponse>(`${API_URL.SEARCH}`, params);
