import { IGetHomeCardSectionsRequest, IGetHomeCardSectionsResponse, IUpdateHomeCardSectionsRequest } from 'interface';
import { getRequest, API_URL, postRequest } from '.';

export const getHomeCardSections = (params: IGetHomeCardSectionsRequest) =>
    getRequest<IGetHomeCardSectionsResponse>(`${API_URL.HOME_CARD_SECTION}`, params);

export const updateHomeCardSections = (payload: IUpdateHomeCardSectionsRequest) =>
    postRequest(`${API_URL.HOME_CARD_SECTION}`, payload);
