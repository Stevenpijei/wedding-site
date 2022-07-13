import { useQuery, UseQueryOptions, useMutation } from 'react-query';

import { getHomeCardSections, updateHomeCardSections } from 'service/api/homeCardSections';

import {
    IGetHomeCardSectionsRequest,
    IGetHomeCardSectionsResponse,
    IError,
    IUpdateHomeCardSectionsRequest,
} from 'interface';

export const VideoQueryKeys = {
    GET_HOME_CARD_SECTIONS: 'GET_HOME_CARD_SECTIONS',
};

export const useListHomeCardSections = (
    params: IGetHomeCardSectionsRequest,
    config?: UseQueryOptions<IGetHomeCardSectionsResponse, IError>
) =>
    useQuery<IGetHomeCardSectionsResponse, IError>(
        [VideoQueryKeys.GET_HOME_CARD_SECTIONS, params],
        () => getHomeCardSections(params),
        config
    );

export const useUpdateHomeCardSections = () =>
    useMutation<undefined, IError, IUpdateHomeCardSectionsRequest>(updateHomeCardSections);
