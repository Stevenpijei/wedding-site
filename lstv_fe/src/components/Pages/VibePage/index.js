import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { POST_PAGE_LOADER_SIZE } from '../../../global/globals';
import LoadSpinner from '../../Utility/LoadSpinner';

import NotFound from '../NotFound';
import VibePage from './VibePage';
import { useTagService } from '../../../rest-api/hooks/useTagService';

const ConnectedVibePage = () => {
    const { slug } = useParams();
    const { getVibe } = useTagService();
    const [vibe, setVibe] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        init();
    }, [slug]);

    const init = async () => {
        setVibe(null)
        const vibe = await getVibe(slug, true);
        
        if (!vibe.slug && !vibe.success) {
            setNotFound(true)
            return
        }

        setVibe(vibe);
    };

    if (notFound) {
        return <NotFound />
    }

    if (!vibe) {
        return (
            <div style={{ height: '80vh' }}>
                <LoadSpinner size={POST_PAGE_LOADER_SIZE} />
            </div>
        );
    }


    return (
        <VibePage data={vibe} />
    )
};

export default ConnectedVibePage;
