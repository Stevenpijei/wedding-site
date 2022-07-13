import {
    IGetAllPhotosRequest,
    IPhotoCountResponse,
    IPhotoListResponse,
    IPhotoResponse,
    IUploadWeddingPhotosRequest,
} from 'interface';
import { API_URL, getRequest, deleteRequest, postRequest } from '.';

export const getPhotos = (params: IGetAllPhotosRequest) => getRequest<IPhotoListResponse>(`${API_URL.PHOTOS}`, params);

export const getPhotoCounts = () => getRequest<IPhotoCountResponse>(`${API_URL.PHOTOS}/_count`);

export const getPhoto = (slug: string) => getRequest<IPhotoResponse>(`${API_URL.PHOTO}/${slug}`);

export const uploadWeddingPhotos = (payload: IUploadWeddingPhotosRequest) => postRequest(`${API_URL.PHOTOS}`, payload);

export const deletePhoto = (photoId: string) => deleteRequest(`${API_URL.PHOTOS}/${photoId}`);
