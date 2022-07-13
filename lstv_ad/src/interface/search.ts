import { IBusiness } from './business';
import { IGenericResponse } from './general';

export interface ISearchTag {
    name: string;
    slug: string;
    type_name?: string;
}

export interface ISearchResult {
    found: {
        [key: string]: number;
    };
    tags: ISearchTag[];
    businesses: IBusiness[];
}

export interface IGetSearchRequest {
    term: string;
    type: 'tag' | 'video' | 'business';
}

export type IGetSearchResponse = IGenericResponse<ISearchResult>;
