import { IGenericResponse, IPaginatedRequest, IPaginatedResponse } from './general';
import { IVideoScope, IVideoCounts } from './video';

export type IUserType = 'admin' | 'business_team_member' | 'consumer';

export type IUserScope = IVideoScope;

export type IUserCounts = IVideoCounts;

export type IUserTab = { id: number; name: IUserScope };

export interface IUser {
    business_name: string;
    business_slug: string;
    email: string;
    id: string;
    joined: string;
    last_login: string;
    location: string;
    name: string;
    phone: string;
    thumbnail_url: string;
    user_type: IUserType;
    issue?: string;
    deleted_at?: string;
}

export interface IGetUserRequest extends IPaginatedRequest {
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    scope?: IUserScope;
    user_type?: string;
    search?: string;
}

export type IUserCountResponse = IGenericResponse<IUserCounts>;

export type IUserListResponse = IPaginatedResponse<IUser[]>;
