import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import FileUpload from '../../../FileUpload';
import { Thumbnail, ThumbnailContainer } from '../../BusinessPage/BusinessInfo';
import { FormSectionVieled, FormSubmitButtons, FormTitle, FormSubtitle, HeaderContainer } from '../Style';
import * as S from './ProfilePhotoForm.styles.js';
import { POPUP_MESSAGE_POSITION_TOP_RIGHT } from '/global/globals.js';
import { useBusinessService } from '/rest-api/hooks/useBusinessService';
import PublicContentService from '/rest-api/services/publicContentService.js';
import { popMessageSuccess } from '/utils/LSTVUtils.js';

const ProfilePhotoSchema = Yup.object().shape({
    profile_image: Yup.string(),
});

const ProfilePhotoForm = ({ business }) => {
    const { profile_image, id, premium } = business;
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false)
    const { editBusinessInfo } = useBusinessService()

    const onThumbDrop = async (acceptedFiles, setField) => {
        if (!acceptedFiles.length) return;

        setLoading(true)
        setFiles(acceptedFiles)
        const thumbnail_url = await PublicContentService.uploadPhoto(acceptedFiles[0]);
        setLoading(false)
        setField('profile_image', thumbnail_url);
    };

    return (
        <Formik
            validateOnMount
            initialValues={{ profile_image: profile_image || '' }}
            validationSchema={ProfilePhotoSchema}
            onSubmit={async values => {
                const patchResponse = await editBusinessInfo(id, { profile_image_url: values.profile_image })
                if(patchResponse.success) {
                    popMessageSuccess(`Business logo updated successfully`, '', POPUP_MESSAGE_POSITION_TOP_RIGHT, 50);
                }
            }}            
        >
            {({ isValid, isSubmitting, dirty, handleReset, setFieldValue, values, submitCount }) => (
                <Form>
                    <FormSectionVieled
                        showContent={premium}
                        upgradeMessage='Upgrade your account to add a business avatar image'
                    >
                        <>
                            <HeaderContainer>
                                <div>
                                    <FormTitle>Business Logo</FormTitle>
                                    <FormSubtitle>
                                        This image will be displayed on the side of your business page.
                                        This can be a logo or an image that is easily recognizable.
                                    </FormSubtitle>
                                </div>
                                <FormSubmitButtons
                                    isValid={isValid}
                                    isSubmitting={loading || isSubmitting}
                                    dirty={dirty}
                                    handleReset={handleReset}
                                    submitCount={submitCount}
                                />
                            </HeaderContainer>
                            <S.Content>
                                <FileUpload
                                    previewImage
                                    accept="image/*"
                                    multiple={false}
                                    onDrop={(file) => onThumbDrop(file, setFieldValue)}
                                />
                                <S.PreviewRight>
                                    <S.H3>Preview</S.H3>
                                    <ThumbnailContainer>
                                        {files.length > 0 || values.profile_image ?
                                            <Thumbnail src={files[0]?.preview || values.profile_image} /> :
                                            <S.PlaceHolder />
                                        }
                                    </ThumbnailContainer>
                                </S.PreviewRight>
                            </S.Content>
                        </>
                    </FormSectionVieled>
                </Form>
            )}
        </Formik>
    );
};

export default ProfilePhotoForm;
