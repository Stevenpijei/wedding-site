import { useMutation, useQuery, UseQueryOptions } from 'react-query';

import {
    IError,
    IGetAllVideoRequest,
    IVideoAdminListResponse,
    IVideoCountResponse,
    IVideoGeneralInfoRequest,
    IVideoResponse,
    IVideoTagResponse,
    IVideoWeddingTeamPatchRequest,
    IWeddingTeamResponse,
} from 'interface';

import {
    getVideo,
    getVideoCounts,
    getVideos,
    getVideoTags,
    getVideoWeddingTeam,
    patchVideoWeddingTeam,
    postVideoTags,
    setFeaturedVideo,
    updateVideoGeneralInfo,
} from 'service/api/video';

export const VideoQueryKeys = {
    GET_ALL_VIDEOS: 'GET_ALL_VIDEOS',
    GET_VIDEO: 'GET_VIDEO',
    GET_VIDEO_COUNTS: 'GET_VIDEO_COUNTS',
    GET_VIDEO_WEDDING_TEAM: 'GET_VIDEO_WEDDING_TEAM',
    GET_VIDEO_TAGS: 'GET_VIDEO_TAGS',
};

export const useListVideos = (params: IGetAllVideoRequest, config?: UseQueryOptions<IVideoAdminListResponse, IError>) =>
    useQuery<IVideoAdminListResponse, IError>([VideoQueryKeys.GET_ALL_VIDEOS, params], () => getVideos(params), config);

export const useVideoCount = (config?: UseQueryOptions<IVideoCountResponse, IError>) =>
    useQuery<IVideoCountResponse, IError>([VideoQueryKeys.GET_VIDEO_COUNTS], () => getVideoCounts(), config);

export const useFeaturedVideo = () => useMutation((videoId: string) => setFeaturedVideo(videoId));

export const useVideo = (slug: string, config?: UseQueryOptions<IVideoResponse, IError>) =>
    useQuery<IVideoResponse, IError>([VideoQueryKeys.GET_VIDEO, { slug }], () => getVideo(slug), config);

export const useVideoWeddingTeam = (videoId: string) =>
    useQuery<IWeddingTeamResponse, IError>([VideoQueryKeys.GET_VIDEO_WEDDING_TEAM, { videoId }], () =>
        getVideoWeddingTeam(videoId)
    );

export const usePatchVideoWeddingTeam = () =>
    useMutation<undefined, IError, { videoId: string; weddingTeams: IVideoWeddingTeamPatchRequest[] }>(
        patchVideoWeddingTeam
    );

export const useUpdateVideoGeneralInfo = () =>
    useMutation<undefined, IError, IVideoGeneralInfoRequest>(updateVideoGeneralInfo);

export const useVideoTags = (slug: string) =>
    useQuery<IVideoTagResponse, IError>([VideoQueryKeys.GET_VIDEO_TAGS, { slug }], () => getVideoTags(slug));

export const useUpdateVideoTags = () => useMutation<undefined, IError, { slug: string; tags: string[] }>(postVideoTags);
