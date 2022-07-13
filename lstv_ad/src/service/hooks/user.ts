import { useQuery, UseQueryOptions } from 'react-query';

import { IError, IGetUserRequest, IUserCountResponse, IUserListResponse } from 'interface';

import { getUserCounts, getUsers } from 'service/api/user';

export const UserQueryKeys = {
    GET_USER_COUNT: 'GET_USER_COUNT',
    GET_ALL_USERS: 'GET_ALL_USERS',
};

export const useUserCount = () =>
    useQuery<IUserCountResponse, IError>([UserQueryKeys.GET_USER_COUNT], () => getUserCounts());

export const useListUsers = (params: IGetUserRequest, config?: UseQueryOptions<IUserListResponse, IError>) =>
    useQuery<IUserListResponse, IError>([UserQueryKeys.GET_ALL_USERS, params], () => getUsers(params), config);
