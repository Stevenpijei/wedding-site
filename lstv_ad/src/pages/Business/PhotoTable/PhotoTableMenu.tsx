import React, { useContext } from 'react';

import KebabMenu from 'components/DataTable/EditRowMenu';
import { ModalContext } from 'contexts/ModalContext';
import { BusinessQueryKeys, useDeleteBusinessPhoto } from 'service/hooks/business';
import { useQueryClient } from 'react-query';
import AddEditPhotoModal from './AddNewModal';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    slug: string;
    photoId: string;
    photoUrl: string;
    title: string;
    description: string;
}

const PhotoTableMenu: React.FC<Props> = ({ slug, photoId, title, description, photoUrl }: Props) => {
    const queryClient = useQueryClient();
    const { showToast } = useContext(ToastContext);
    const { showConfirmModal, showModal } = useContext(ModalContext);
    const { mutateAsync: requestDeleteBusinessPhoto } = useDeleteBusinessPhoto();

    const handleDeletePhoto = async () => {
        try {
            await requestDeleteBusinessPhoto({ slug, photoId });
            queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS_PHOTO, slug]);
            showToast({
                type: 'success',
                message: 'Successfully removed a photo',
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const handleDeleteClick = async () => {
        showConfirmModal({
            content: null,
            header: `Are you sure to delete ${title}?`,
            confirmButton: {
                name: 'Delete',
                action: handleDeletePhoto,
            },
        });
    };

    const handleEditClick = () => {
        showModal({
            header: `Update the photo`,
            content: (
                <AddEditPhotoModal
                    slug={slug}
                    defaultValues={{
                        title,
                        description,
                        photoUrl,
                        photoId,
                    }}
                />
            ),
        });
    };

    return (
        <KebabMenu
            items={[
                {
                    title: 'Edit',
                    action: handleEditClick,
                },
                {
                    title: 'Delete',
                    action: handleDeleteClick,
                },
            ]}
        />
    );
};

export default PhotoTableMenu;
