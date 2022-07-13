import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import KebabMenu from 'components/DataTable/EditRowMenu';

import { useFeaturedVideo } from 'service/hooks/video';

import { PrivateRoutes } from 'config/routes';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    slug: string;
    videoId: string;
}

const VideoMenu: React.FC<Props> = ({ videoId, slug }: Props) => {
    const history = useHistory();
    const { showToast } = useContext(ToastContext);
    const { mutateAsync: requestSetFeaturedVideo } = useFeaturedVideo();

    const handleSetVideoFeatureClick = async () => {
        try {
            await requestSetFeaturedVideo(videoId);
            showToast({
                type: 'success',
                message: 'Successfully set as featured video.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const handleEditClick = () => {
        history.push(`${PrivateRoutes.VIDEOS}/${slug}`);
    };

    return (
        <KebabMenu
            items={[
                {
                    title: 'Set As Featured Video',
                    action: handleSetVideoFeatureClick,
                },
                {
                    title: 'Edit',
                    action: handleEditClick,
                },
            ]}
        />
    );
};

export default VideoMenu;
