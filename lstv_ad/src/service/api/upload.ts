import axios from 'axios';

import { IUploadResponse } from 'interface';
import { API_URL, getRequest, responseHandler } from '.';

export const preAuthorize = (filename: string): Promise<IUploadResponse> =>
    getRequest<IUploadResponse>(`${API_URL.ROOT}/preAuthorizePhotoUpload?filename=${encodeURIComponent(filename)}`);

export const uploadPhoto = async (url: string, file: File) => {
    return responseHandler(() =>
        axios.put(url, file, {
            headers: {
                'Content-Type': file.type,
            },
        })
    );
};
