import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
import * as S from './ProfilePhotoForm.styles.js';
import { FormTitle, HeaderContainer, FormSubmitButtons, FormSectionVieled, FormSubtitle } from '../Style';
import FileUpload from '../../../FileUpload';
import PublicContentService from '/rest-api/services/publicContentService.js';
import LSTVCard from '/newComponents/cards/LSTVCard.js';
import { useBusinessService } from '/rest-api/hooks/useBusinessService';
import { popMessageSuccess } from '/utils/LSTVUtils.js';
import { POPUP_MESSAGE_POSITION_TOP_RIGHT } from '/global/globals.js';

const ThumbnailPhotoSchema = Yup.object().shape({
    card_thumbnail_url: Yup.string(),
});

const CardThumbnail = ({business}) => {
    // eslint-disable-next-line react/prop-types
    const {id, card_thumbnail_url, slug, name, premium, business_locations, roles} = business;
    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState([]);
    const { editBusinessInfo } = useBusinessService()

    const onThumbDrop = async (acceptedFiles, setField) => {
        if (!acceptedFiles.length) return;

        setLoading(true)
        setFiles(acceptedFiles)
        const thumbnail_url = await PublicContentService.uploadPhoto(acceptedFiles[0]);      
        setLoading(false)
        setField('card_thumbnail_url', thumbnail_url);
    };

    return (
        <Formik
            validateOnMount
            initialValues={{ card_thumbnail_url: card_thumbnail_url || '' }}
            validationSchema={ThumbnailPhotoSchema}
            onSubmit={async values => {
                const patchResponse = await editBusinessInfo(id, values)
                if(patchResponse.success) {
                    popMessageSuccess(`Business card thumbnail updated successfully`, '', POPUP_MESSAGE_POSITION_TOP_RIGHT, 50);
                }
            }}
        >
            {({ isValid, isSubmitting, dirty, handleReset, setFieldValue, values, submitCount }) => (
                <Form>
                    <FormSectionVieled
                        showContent={true}
                        upgradeMessage={'Upgrade your account to add more social links'}
                    >
                        <>
                            <HeaderContainer>
                                <div>
                                    <FormTitle>Business Card Thumbnail</FormTitle>
                                    <FormSubtitle>
                                        This image will be displayed as a thumbnail within the vendor directory. 
                                        Please choose an image that showcases your business.
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
                                <S.PreviewRightCard>
                                    <S.H3>Preview</S.H3>
                                    {(files.length > 0 || values.card_thumbnail_url) && 
                                        <S.CardCont>
                                            <LSTVCard 
                                                options={{
                                                    cardType: "business",
                                                    orientation: "portrait",
                                                    containerMode: "grid",
                                                    bg_color: "#FF80A6",
                                                    cardSlug: `business/${slug}`
                                                }}
                                                data={{
                                                    name: name,
                                                    thumbnailUrl: files[0]?.preview || values.card_thumbnail_url,
                                                    thumbnailAlt: `Wedding Business: ${name}`,
                                                    premium: premium,
                                                    location: business_locations[0],
                                                    videoViews: 1500,
                                                    roles: roles,
                                                    views: 150,
                                                    likes: 150
                                                }}
                                            />
                                        </S.CardCont>
                                    }
                                </S.PreviewRightCard>
                            </S.Content>
                        </>
                    </FormSectionVieled>
                </Form>
            )}
        </Formik>
    );
};

export default CardThumbnail;
