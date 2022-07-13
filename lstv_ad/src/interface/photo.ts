import { IGenericResponse, IPaginatedRequest, IPaginatedResponse } from './general';

export type IPhotoScope = 'active_review' | 'suspended_review' | 'suspended' | 'deleted';

export interface IWeddingPhoto {
    credit: string;
    description: string;
    height: number;
    id: string;
    in_video_slug: string;
    order: number;
    owner_business: string;
    owner_business_slug: string;
    scope: string;
    url: string;
    video_id: string;
    video_thumbnail: string;
    video_title: string;
    width: number;
}

export interface IPhotoCounts {
    active_count: number;
    active_review_count: number;
    suspended_review_count: number;
    suspended_count: number;
    deleted_count: number;
}

export interface IGetAllPhotosRequest extends IPaginatedRequest {
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    content_sort_method?: string;
    scope?: string;
    title?: string;
    business?: string;
    location?: string;
    verbosity: string;
}

export interface IUploadWeddingPhotosRequest {
    video_id: string;
    business_slug: string;
    photos: string[];
}

export type IPhotoCountResponse = IGenericResponse<IPhotoCounts>;

export type IPhotoListResponse = IPaginatedResponse<IWeddingPhoto[]>;

export type IPhotoResponse = IGenericResponse<IWeddingPhoto>;

export type IUploadWeddingPhotosResponse = IGenericResponse<IWeddingPhoto>;
