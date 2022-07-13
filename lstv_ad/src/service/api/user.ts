import { IGetUserRequest } from 'interface';
import { getRequest, API_URL } from '.';

export const getUserCounts = () => getRequest<any>(`${API_URL.USER}/_count`);

export const getUsers = (params: IGetUserRequest) => getRequest<any>(`${API_URL.USER}`, params);
