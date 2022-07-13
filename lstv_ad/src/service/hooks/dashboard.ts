import { useQuery, UseQueryOptions } from 'react-query';

import { IError } from 'interface';
import { IAdminStatsGetRequest, IAdminStatsResponse } from 'interface/dashboard';
import { getAdminStats } from 'service/api/dashboard';

export const DashboardQueryKeys = {
    GET_ADMIN_STATS: 'GET_ADMIN_STATS',
};

export const useAdminStats = (params: IAdminStatsGetRequest, config?: UseQueryOptions<IAdminStatsResponse, IError>) =>
    useQuery<IAdminStatsResponse, IError>(
        [DashboardQueryKeys.GET_ADMIN_STATS, params],
        () => getAdminStats(params),
        config
    );
