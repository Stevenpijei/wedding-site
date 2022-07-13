import {
    IGetAllVideoRequest,
    IVideoAdminListResponse,
    IVideoCountResponse,
    IVideoGeneralInfoRequest,
    IVideoResponse,
    IVideoTagResponse,
    IVideoWeddingTeamPatchRequest,
    IWeddingTeamResponse,
} from 'interface';
import { getRequest, API_URL, patchRequest, postRequest } from '.';

export const getVideos = (params: IGetAllVideoRequest) =>
    getRequest<IVideoAdminListResponse>(`${API_URL.VIDEO}`, params);

export const getVideoCounts = () => getRequest<IVideoCountResponse>(`${API_URL.VIDEO}/_count`);

export const setFeaturedVideo = (videoId: string) =>
    postRequest(`/frontEndSettings`, {
        landing_page_video: videoId,
    });

export const getVideo = (slug: string) => getRequest<IVideoResponse>(`${API_URL.VIDEO}/${slug}`);

export const getVideoWeddingTeam = (videoId: string) =>
    getRequest<IWeddingTeamResponse>(`${API_URL.VIDEO}/${videoId}/weddingTeam`);

export const patchVideoWeddingTeam = ({
    videoId,
    weddingTeams,
}: {
    videoId: string;
    weddingTeams: IVideoWeddingTeamPatchRequest[];
}) => patchRequest(`${API_URL.VIDEO}/${videoId}/weddingTeam`, weddingTeams);

export const updateVideoGeneralInfo = ({ videoId, ...payload }: IVideoGeneralInfoRequest) =>
    patchRequest(`${API_URL.VIDEO}/${videoId}`, payload);

export const getVideoTags = (slug: string) => getRequest<IVideoTagResponse>(`${API_URL.VIDEO}/${slug}/tags`);

export const postVideoTags = ({ slug, tags }: { slug: string; tags: string[] }) =>
    postRequest(`${API_URL.VIDEO}/${slug}/tags`, { tags });
