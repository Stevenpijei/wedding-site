import { useQuery, UseQueryOptions, useMutation } from 'react-query';

import {
    IError,
    IGetAllPhotosRequest,
    IPhotoCountResponse,
    IPhotoListResponse,
    IPhotoResponse,
    IUploadWeddingPhotosRequest,
} from 'interface';

import { getPhotos, getPhotoCounts, getPhoto, deletePhoto, uploadWeddingPhotos } from 'service/api/photo';

export const PhotoQueryKeys = {
    GET_ALL_PHOTOS: 'GET_ALL_PHOTOS',
    GET_PHOTO: 'GET_PHOTO',
    GET_PHOTO_COUNTS: 'GET_PHOTO_COUNTS',
};

export const useListPhotos = (params: IGetAllPhotosRequest, config?: UseQueryOptions<IPhotoListResponse, IError>) =>
    useQuery<IPhotoListResponse, IError>([PhotoQueryKeys.GET_ALL_PHOTOS, params], () => getPhotos(params), config);

export const usePhotoCount = (config?: UseQueryOptions<IPhotoCountResponse, IError>) =>
    useQuery<IPhotoCountResponse, IError>([PhotoQueryKeys.GET_PHOTO_COUNTS], () => getPhotoCounts(), config);

export const usePhoto = (slug: string) =>
    useQuery<IPhotoResponse, IError>([PhotoQueryKeys.GET_PHOTO, { slug }], () => getPhoto(slug));

export const useUploadWeddingPhotos = () =>
    useMutation<undefined, IError, IUploadWeddingPhotosRequest>(uploadWeddingPhotos);

export const useDeletePhoto = () => useMutation<undefined, IError, string>(deletePhoto);
