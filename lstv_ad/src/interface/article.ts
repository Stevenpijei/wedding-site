import { IGenericResponse, ILocation, IPaginatedResponse } from './general';

export type IArticleScope = 'active' | 'active_review' | 'suspended_review' | 'suspended' | 'deleted';

export type IArticleTab = { id: number; name: IArticleScope };
export interface IGetAllArticlesRequest {
    verbosity: string;
    offset: number;
    size: number;
    scope?: IArticleScope;
}

export interface IArticle {
    author_email: string;
    author_id: string;
    author_name: string;
    author_thumbnail_url: string;
    businesses: {
        slug: string;
    }[];
    created_at: string;
    id: string;
    likes: number;
    location: ILocation[];
    post_id: string;
    properties: any;
    slug: string;
    tags: any[];
    thumbnail_url: string;
    title: string;
    updated_at: string;
    deleted_at: string;
    views: number;
}

export interface IArticleCount {
    active_count: number;
    active_review: number;
    suspended_review: number;
    suspended: number;
    deleted: number;
}

export type IArticlesResponse = IPaginatedResponse<IArticle[]>;

export type IArticleCountResponse = IGenericResponse<IArticleCount>;
