import { IAdminStatsGetRequest, IAdminStatsResponse } from 'interface/dashboard';
import { API_URL, getRequest } from '.';

export const getAdminStats = (params: IAdminStatsGetRequest) =>
    getRequest<IAdminStatsResponse>(`${API_URL.ROOT}/admin_stats`, params);
