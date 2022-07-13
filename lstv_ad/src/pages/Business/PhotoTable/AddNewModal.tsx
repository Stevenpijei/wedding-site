import React, { useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Box, TextField } from '@material-ui/core';
import isEqual from 'lodash/isEqual';
import { CODE_RETURN } from 'keycode-js';

import { useFileUpload } from 'service/hooks/upload';
import RegularButton from 'components/CustomBtns/Button';
import Dropzone from '../Dropzone';
import { ModalContext } from 'contexts/ModalContext';
import { BusinessQueryKeys, useAddBusinessPhoto, usePatchBusinessPhoto } from 'service/hooks/business';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    slug: string;
    defaultValues?: {
        photoId: string;
        title: string;
        description: string;
        photoUrl: string;
    };
}

interface IAddNewPhotoForm {
    title: string;
    description: string;
}

const AddEditPhotoModal: React.FC<Props> = ({ slug, defaultValues }: Props) => {
    const queryClient = useQueryClient();
    const { closeModal } = useContext(ModalContext);
    const { showToast } = useContext(ToastContext);
    const { handleSubmit, register } = useForm<IAddNewPhotoForm>({
        defaultValues: {
            title: defaultValues?.title || '',
            description: defaultValues?.description || '',
        },
    });
    const [imageFile, setImageFile] = useState<File>();
    const { loading, requestFileUpload } = useFileUpload();
    const { mutateAsync: requestAddBusinessPhoto, isLoading: isAdding } = useAddBusinessPhoto();
    const { mutateAsync: requestPatchBusinessPhoto, isLoading: isUpdating } = usePatchBusinessPhoto();
    const isEditMode = !!defaultValues;

    const handleUploadClick = (file: File) => {
        setImageFile(file);
    };

    const checkKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.code === CODE_RETURN) e.preventDefault();
    };

    const onSubmit = async (formValues: IAddNewPhotoForm) => {
        const { title, description } = formValues;
        if (!isEditMode) {
            // if the modal is add modal
            if (imageFile) {
                try {
                    const photo_url = await requestFileUpload(imageFile);
                    await requestAddBusinessPhoto({
                        slug,
                        photo_url,
                        title,
                        description,
                    });
                    closeModal();
                    showToast({
                        type: 'success',
                        message: 'Successfully added a new photo',
                    });
                    queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS_PHOTO, slug]);
                } catch (e) {
                    showToast({
                        type: 'error',
                        message: e.message,
                    });
                }
            }
        } else {
            // if the modal is edit modal
            const patchData: { [key: string]: string } = {};
            if (!isEqual(defaultValues?.title, title)) {
                patchData['title'] = title;
            }
            if (!isEqual(defaultValues?.description, description)) {
                patchData['description'] = description;
            }
            if (Object.keys(patchData).length === 0 && !imageFile) {
                showToast({
                    type: 'info',
                    message: 'Nothing to update',
                });
            } else {
                if (imageFile) {
                    try {
                        const photo_url = await requestFileUpload(imageFile);
                        patchData['photo_url'] = photo_url;
                    } catch (e) {
                        showToast({
                            type: 'error',
                            message: e.message,
                        });
                    }
                }
                try {
                    await requestPatchBusinessPhoto({
                        slug,
                        photoId: defaultValues?.photoId || '',
                        ...patchData,
                    });
                    closeModal();
                    showToast({
                        type: 'success',
                        message: 'Successfully updated the photo',
                    });
                    queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS_PHOTO, slug]);
                } catch (e) {
                    showToast({
                        type: 'error',
                        message: e.message,
                    });
                }
            }
        }
    };

    let imageUrl = '';

    if (!imageFile) {
        if (defaultValues) imageUrl = defaultValues.photoUrl;
    } else if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
    }

    return (
        <Box
            py="20px"
            maxHeight="800px"
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => checkKeyDown(e)}
        >
            <Box textAlign="right">
                <RegularButton
                    className="round_btn"
                    type="submit"
                    disabled={loading || !imageUrl}
                    loading={loading || isAdding || isUpdating}
                >
                    {isEditMode ? 'Save' : 'Upload'}
                </RegularButton>
            </Box>
            <Box mb="20px">
                <TextField fullWidth label="Title" name="title" inputRef={register} />
                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    inputRef={register}
                    style={{ marginTop: '20px' }}
                />
            </Box>
            <Dropzone handleUpload={handleUploadClick} />
            <Box paddingTop="20px">{imageUrl && <img src={imageUrl} alt="New Img" style={{ width: '100%' }} />}</Box>
        </Box>
    );
};

export default AddEditPhotoModal;
