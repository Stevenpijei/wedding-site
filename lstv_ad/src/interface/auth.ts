import { IGenericResponse } from './general';

export interface IUser {
    email: string;
    first_name: string;
    last_name: string;
    profile_thumbnail_url: string;
    uid: string;
    user_type: 'admin' | string;
}

export type ILoginResponse = IGenericResponse<IUser>;
