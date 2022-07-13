import { useQuery, UseQueryOptions, useMutation } from 'react-query';

import {
    IError,
    ITagCountResponse,
    ITagResponse,
    ITagListRequest,
    ITagListResponse,
    ITagTypesResponse,
    IUpdateTagRequest,
    IUpdateTagResponse,
} from 'interface';

import { getTag, getTags, getTagCounts, getTagTypes, deleteTag, updateTag } from 'service/api/tag';

export const PhotoQueryKeys = {
    GET_ALL_TAGS: 'GET_ALL_TAGS',
    GET_TAG_COUNTS: 'GET_TAG_COUNTS',
    GET_TAG: 'GET_TAG',
    GET_TAG_TYPES: 'GET_TAG_TYPES',
};

export const useTagCount = (config?: UseQueryOptions<ITagCountResponse, IError>) =>
    useQuery<ITagCountResponse, IError>([PhotoQueryKeys.GET_TAG_COUNTS], () => getTagCounts(), config);

export const useListTags = (params: ITagListRequest, config?: UseQueryOptions<ITagListResponse, IError>) =>
    useQuery<ITagListResponse, IError>([PhotoQueryKeys.GET_ALL_TAGS, params], () => getTags(params), config);

export const useTag = (slug: string, config?: UseQueryOptions<ITagResponse, IError>) =>
    useQuery<ITagResponse, IError>([PhotoQueryKeys.GET_TAG, { slug }], () => getTag(slug), config);

export const useGetTagTypes = () =>
    useQuery<ITagTypesResponse, IError>([PhotoQueryKeys.GET_TAG_TYPES], () => getTagTypes());

export const useUpdateTag = () => useMutation<IUpdateTagResponse, IError, IUpdateTagRequest>(updateTag);

export const useDeleteTag = () => useMutation<undefined, IError, string>(deleteTag);
