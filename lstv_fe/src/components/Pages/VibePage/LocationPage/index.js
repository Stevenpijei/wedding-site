import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { POST_PAGE_LOADER_SIZE } from '../../../../global/globals';
import LoadSpinner from '../../../Utility/LoadSpinner';


import { useTagService } from '../../../../rest-api/hooks/useTagService';
import LocationPage from './LocationPage';
import NotFound from '../../NotFound';

const ConnectedLocationPage = () => {
    const { pathname } =useLocation();
    const { getLocation } = useTagService();
    const [location, setLocation] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        init();
    }, [pathname]);

    const init = async () => {
        const slug = pathname.replace('/location/', "")
        const location = await getLocation(slug, true);

        if (!location.location_id && !location.success) {
            setNotFound(true);
            return;
        }

        setLocation(location);
    };

    if (notFound) {
        return <NotFound />
    }

    if (!location) {
        return (
            <div style={{ height: '80vh' }}>
                <LoadSpinner size={POST_PAGE_LOADER_SIZE} />
            </div>
        );
    }

    return <LocationPage data={location} />
};

export default ConnectedLocationPage;
