import React, { useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Box, TextField } from '@material-ui/core';

import RegularButton from 'components/CustomBtns/Button';
import { BusinessQueryKeys, useAddBusinessReview, usePatchBusinessReview } from 'service/hooks/business';
import { ModalContext } from 'contexts/ModalContext';
import { ToastContext } from 'contexts/ToastContext';
import Dropzone from '../Dropzone';
import { useFileUpload } from 'service/hooks/upload';

interface IFormProps {
    title: string;
    content: string;
    rating: number;
}

interface Props extends IFormProps {
    mode?: 'add' | 'edit';
    businessSlug: string;
    reviewId: string;
}

const ReviewDetailsModal: React.FC<Props> = ({
    title,
    content,
    rating,
    businessSlug,
    reviewId,
    mode = 'add',
}: Props) => {
    const isEditMode = mode === 'edit';
    const queryClient = useQueryClient();
    const { showToast } = useContext(ToastContext);
    const { closeModal } = useContext(ModalContext);
    const [imageFile, setImageFile] = useState<File>();
    const { handleSubmit, register } = useForm<IFormProps>({
        defaultValues: {
            title,
            content,
            rating,
        },
    });

    const { requestFileUpload, loading: isFileUploading } = useFileUpload();
    const { mutateAsync: requestAddBusinessReview, isLoading: isAdding } = useAddBusinessReview();
    const { mutateAsync: requestPatchBusinessReview, isLoading: isPatching } = usePatchBusinessReview();

    const handleUpload = (file: File) => {
        setImageFile(file);
    };

    const onSubmit = async (formValues: IFormProps) => {
        if (isEditMode) {
            // if this modal is `edit` mode
            try {
                await requestPatchBusinessReview({
                    businessSlug,
                    reviewId,
                    request: formValues,
                });
                showToast({
                    type: 'success',
                    message: 'Susccessfully edited the review',
                });
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        } else {
            // if this modal is `add` mode
            let from_profile_image_url: string | undefined;
            if (imageFile) {
                try {
                    from_profile_image_url = await requestFileUpload(imageFile);
                } catch (e) {
                    showToast({
                        type: 'error',
                        message: e.message,
                    });
                }
            }
            try {
                await requestAddBusinessReview({
                    businessSlug,
                    request: {
                        ...formValues,
                        from_profile_image_url,
                    },
                });
                showToast({
                    type: 'success',
                    message: 'Susccessfully added a review',
                });
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        }
        await queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS_REVIEWS]);
        closeModal();
    };

    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : '';

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} py="20px">
            <TextField fullWidth label="Title" name="title" inputRef={register} style={{ marginBottom: 20 }} required />
            <TextField
                fullWidth
                label="Content"
                name="content"
                multiline
                rowsMax={4}
                inputRef={register}
                style={{ marginBottom: 20 }}
                required
            />
            <TextField
                fullWidth
                label="Rating"
                name="rating"
                inputProps={{
                    type: 'number',
                    min: 0,
                    max: 5,
                }}
                inputRef={register}
                style={{ marginBottom: 20 }}
                required
            />
            {!isEditMode && (
                <>
                    <TextField
                        fullWidth
                        label="First Name"
                        name="from_first_name"
                        inputRef={register}
                        style={{ marginBottom: 20 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Last Name"
                        name="from_last_name"
                        inputRef={register}
                        style={{ marginBottom: 20 }}
                        required
                    />
                    <Dropzone handleUpload={handleUpload} />
                    <Box paddingTop="20px">
                        {imageUrl && <img src={imageUrl} alt="New Img" style={{ width: '100%' }} />}
                    </Box>
                </>
            )}

            <Box textAlign="right">
                <RegularButton className="round_btn" type="submit" loading={isPatching || isAdding || isFileUploading}>
                    {isEditMode ? 'Update' : 'Add'}
                </RegularButton>
            </Box>
        </Box>
    );
};

export default ReviewDetailsModal;
