import { IGenericResponse, ILocation, IPaginatedRequest, IPaginatedResponse, IPhoto } from './general';

export type IVideoScope = 'active' | 'active_review' | 'suspended_review' | 'suspended' | 'deleted';

export type IVisibility = 'unlisted' | 'public';

export type IVideoTab = { id: number; name: IVideoScope };

export interface IVideoCounts {
    active_count: number;
    active_review_count: number;
    suspended_review_count: number;
    suspended_count: number;
    deleted_count: number;
}

export interface IVideoAdmin {
    created_at: string;
    event_date: string;
    id: string;
    likes: number;
    location: string;
    num_photos: number;
    num_q_and_a: number;
    owner: string;
    slug: string;
    tags: string;
    thumbnail_url: string;
    title: string;
    views: number;
    issue?: string;
}

export interface IVideoSource {
    duration: string;
    height: string;
    id: string;
    media_id: string;
    order: number;
    thumbnail_url: string;
    type: string;
    width: string;
}

export interface IVideoWeddingTeam {
    name: string;
    bg_color: string;
    plural: string;
    premium: boolean;
    role_family: string;
    role_name: string;
    role_slug: string;
    business_capacity_type_name?: string;
    business_capacity_type_slug?: string;
    singular: string;
    subscription_level: string;
    slug: string;
    weight: number;
}

export interface IVideo {
    businesses: IVideoWeddingTeam[];
    content: string;
    created_at: string;
    draft: boolean;
    event_date: string;
    id: string;
    likes: number;
    location: ILocation;
    obj_type: string;
    photos: IPhoto[];
    post_properties: { [key: string]: string };
    premium: boolean;
    properties: { [key: string]: string };
    q_and_a: any[];
    shares: number;
    shopping: any[];
    short_url_token: string;
    slug: string;
    tags: IVideoTag[];
    thumbnail: string;
    title: string;
    type: string;
    vibes: any[];
    videosSources: IVideoSource[];
    views: number;
    visibility: IVisibility;
}

export interface IGetAllVideoRequest extends IPaginatedRequest {
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    content_sort_method?: string;
    scope?: string;
    title?: string;
    location?: string;
    verbosity: string;
}

export interface IVideoGeneralInfoRequest {
    content?: string;
    draft?: boolean;
    event_date?: string;
    event_location?: string;
    event_location_google?: any;
    name_spouse_1?: string;
    name_spouse_2?: string;
    thumbnail_url?: string;
    videoId?: string;
    visibility?: IVisibility;
}

export interface IVideoWeddingTeamPatchRequest {
    slug: string;
    role_slug: string;
    role_capacity_slug?: string;
}

export interface IVideoTag {
    importance: string;
    name: string;
    slug: string;
    subscribers: number;
    type: string;
    type_group: string;
    weight: number;
    weight_articles: number;
    weight_businesses: number;
    weight_photos: number;
    weight_videos: number;
}

export type IVideoAdminListResponse = IPaginatedResponse<IVideoAdmin[]>;

export type IVideoCountResponse = IGenericResponse<IVideoCounts>;

export type IVideoResponse = IGenericResponse<IVideo>;

export type IWeddingTeamResponse = IGenericResponse<IVideoWeddingTeam[]>;

export type IVideoTagResponse = IGenericResponse<IVideoTag[]>;
