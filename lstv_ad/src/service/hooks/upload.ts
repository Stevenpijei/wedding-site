import { useState } from 'react';

import { preAuthorize, uploadPhoto } from 'service/api/upload';

export const useFileUpload = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const requestFileUpload = async (file: File) => {
        setLoading(true);
        try {
            const response = await preAuthorize(file.name);
            const {
                result: { download_url, upload_url },
            } = response;
            await uploadPhoto(upload_url, file);
            setLoading(false);
            return download_url;
        } catch (e) {
            setLoading(false);
            throw new Error(e.message);
        }
    };

    return { loading, requestFileUpload };
};
