import axios, { AxiosInstance } from 'axios';

import { BASE_URL } from 'config/env';

let axiosInstance: AxiosInstance;

const getHeaders = () => ({
    Accept: 'application/json',
});

export const API_URL = {
    ROOT: '',
    BUSINESS: '/business',
    VIDEO: '/video',
    PHOTOS: '/photos',
    PHOTO: '/photo',
    USER: '/user',
    HOME_CARD_SECTION: '/homeCardSections',
    SEARCH: '/search',
    ARTICLES: '/articles',
    TAGS: '/tag',
    TAG_FAMILY_TYPE: '/tagFamilyType',
};

export const getAxiosInstance = (): AxiosInstance => {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            baseURL: `${BASE_URL}/v1`,
            headers: getHeaders(),
        });
    }
    axiosInstance.defaults.withCredentials = true;
    return axiosInstance;
};

export const responseHandler = async (func: () => Promise<any>) => {
    try {
        const response = await func();
        return response.data;
    } catch (e) {
        const statusCode: number = e.response.status;
        if (statusCode === 401 || statusCode === 403) {
            window.localStorage.clear();
            window.location.reload();
        } else {
            if (e.response && e.response.data && e.response.data.errors) {
                const error = e.response.data.errors;
                if (error[0].field !== 'generic') {
                    throw new Error(`${error[0].field}: ${error[0].errors[0]}`);
                } else {
                    throw new Error(error[0].errors[0]);
                }
            } else {
                throw new Error('Unexpected error occurred. We are working to correct the issue.');
            }
        }
    }
};

export const getRequest = async <T, K = any>(url: string, params: K = null as any): Promise<T> => {
    const instance = getAxiosInstance();
    return responseHandler(() => instance.get(url, { params }));
};

export const postRequest = async <T, K = any>(url: string, payload: T = null as any, params: K = null as any) => {
    const instance = getAxiosInstance();
    return responseHandler(() => instance.post(url, payload, params));
};

export const patchRequest = async <T, K = any>(url: string, payload: T, params: K = null as any) => {
    const instance = getAxiosInstance();
    return responseHandler(() => instance.patch(url, payload, { params }));
};

export const deleteRequest = async (url: string) => {
    const instance = getAxiosInstance();
    return responseHandler(() => instance.delete(url));
};

export const putRequest = async <T>(url: string, payload: T) => {
    const instance = getAxiosInstance();
    return responseHandler(() => instance.put(url, payload));
};
