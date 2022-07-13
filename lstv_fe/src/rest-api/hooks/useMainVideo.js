import React, { useEffect, useState } from 'react';
import { useAppDataService } from './useAppDataService';

const useMainVideo = () => {
    const [mainVideoData, setMainVideoData] = useState({});
    const { getMainVideo } = useAppDataService();

    useEffect(() => {
        getMainVideo().then((data) => data && setMainVideoData(data));
    }, []);

    return mainVideoData
};

export default useMainVideo;
