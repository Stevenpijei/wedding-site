export interface IError {
    message: string;
}

export interface ISlugWithName {
    slug: string;
    name: string;
}

export interface ILocation {
    address: string;
    classification: string;
    country: string;
    country_id: string;
    country_slug: string;
    country_url: string;
    display_name: string;
    lat: number;
    location_description: boolean;
    location_id: string;
    location_type: string;
    long: number;
    place: string;
    place_id: string;
    place_slug: string;
    place_url: string;
    state_province: string;
    state_province_id: string;
    state_province_slug: string;
    state_province_url: string;
    weight_articles: number;
    weight_businesses_based_at: number;
    weight_businesses_worked_at: number;
    weight_photos: number;
    weight_videos: number;
}

export interface IPhoto {
    credit: string;
    description: string;
    height: number;
    id: string;
    order: number;
    scope: string;
    title: string;
    url: string;
    width: string;
}

export interface IPaginatedRequest {
    offset: number;
    size: number;
}

export interface IGenericResponse<T> {
    success: boolean;
    timestamp: number;
    result: T;
}

export interface IPaginatedResponse<T> {
    success: boolean;
    scope: {
        offset: number;
        request_size: number;
        response_size: number;
        total: number;
    };
    result: T;
}

export type IUploadResponse = IGenericResponse<{
    upload_url: string;
    key: string;
    download_url: string;
}>;
