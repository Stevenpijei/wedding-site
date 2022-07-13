import { IGenericResponse } from './general';

export interface IAdminStatsGetRequest {
    from_date: string;
    to_date: string;
    compare_from_date?: string;
    compare_to_date?: string;
    metric: string;
    granularity: string;
}

export interface IStat {
    label: string;
    count: number;
}

export interface IAdminStats {
    compare_set: IStat[] | null;
    compare_set_day_count: number | null;
    main_set: IStat[] | null;
    main_set_day_count: number | null;
}

export type IAdminStatsResponse = IGenericResponse<IAdminStats>;
