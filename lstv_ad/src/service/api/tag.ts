import {
    ITagCountResponse,
    ITagResponse,
    ITagListRequest,
    ITagListResponse,
    ITagTypesResponse,
    IUpdateTagRequest,
} from 'interface';
import { API_URL, getRequest, deleteRequest, patchRequest } from '.';

export const getTagCounts = () => getRequest<ITagCountResponse>(`${API_URL.TAGS}/_count`);

export const getTags = (params: ITagListRequest) => getRequest<ITagListResponse>(`${API_URL.TAGS}`, params);

export const getTagTypes = () => getRequest<ITagTypesResponse>(`${API_URL.TAG_FAMILY_TYPE}`);

export const getTag = (slug: string) => getRequest<ITagResponse>(`${API_URL.TAGS}/${slug}`);

export const deleteTag = (tagId: string) => deleteRequest(`${API_URL.TAGS}/${tagId}`);

export const updateTag = ({ slug, ...payload }: IUpdateTagRequest) => patchRequest(`${API_URL.TAGS}/${slug}`, payload);
