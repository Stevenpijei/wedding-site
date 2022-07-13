import { IGenericResponse, IPaginatedRequest, IPaginatedResponse } from './general';

export type ITagScope = 'active' | 'deleted' | 'suspended_dmz';

export type ITagTab = { id: number; name: ITagScope };

export interface ITagCounts {
    active_count: number;
    deleted_count: number;
    suggested_count: number;
}

export interface ITag {
    created_at: string;
    deleted_at?: string;
    importance: string;
    name: string;
    slug: string;
    subscribers: number;
    thumbnail: string;
    type: string;
    type_group: string;
    type_slug: string;
    weight: number;
    weight_articles: number;
    weight_businesses: number;
    weight_photos: number;
    weight_videos: number;
}

export interface ITagType {
    slug: string;
    name: string;
    tag_group: string;
}

export interface ITagListRequest extends IPaginatedRequest {
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    scope?: string;
    tag?: string;
    type?: string;
    verbosity?: string;
}

export interface IUpdateTagRequest {
    slug: string;
    name?: string;
    type_slug?: string;
    thumbnail?: string;
}

export type ITagCountResponse = IGenericResponse<ITagCounts>;

export type ITagListResponse = IPaginatedResponse<ITag[]>;

export type ITagTypesResponse = IGenericResponse<ITagType[]>;

export type ITagResponse = IGenericResponse<ITag>;

export type IUpdateTagResponse = IGenericResponse<ITag>;
