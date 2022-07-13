import React from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import GooglePlacesSearchBar from './GooglePlacesSearchBar'; //"../../Utility/GooglePlacesSearchBar";

import { StyledForm, FormRow, DateInput, FormSubmitButton } from './StyledForm';
import { OutlinedCTAButton } from '../../Utility/OutlinedCTALink'


const EditProfileSchema = Yup.object().shape({
    weddingLocation: Yup.string().min(5, 'too short!').required('Required'),
    weddingDate: Yup.date()
        .min(new Date(), 'must be a future date')
        .required('Required'),
});

export const PostGuestSignUpForm = ({ onSubmit }) => {
    const locationFieldName = 'weddingLocation';
    return (
        <Formik
            initialValues={{
                weddingDate: '',
                [locationFieldName]: '',
            }}
            validationSchema={EditProfileSchema}
            validateOnMount={true}
            validateOnBlur={true}
            onSubmit={(values) => {

                onSubmit({
                    weddingDate: values.weddingDate,
                    weddingLocation: {
                        components: values.weddingLocation.address_components,
                        formatted: values.weddingLocation.formatted_address,
                        position: {
                            lat: values.weddingLocation.geometry.location.lat().toString(),
                            long: values.weddingLocation.geometry.location.lng().toString(),
                        },
                    },
                });
            }}


        >
            {({
                errors,
                touched,
                isSubmitting,
                isValid,
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
            }) => (
                    <StyledForm onSubmit={handleSubmit} maxWidth="576px">
                        <FormRow>
                            <DateInput name="weddingDate" placeholder="" label="When is your wedding?" minDate={new Date()} />
                        </FormRow>
                        <FormRow>
                            <GooglePlacesSearchBar
                                label="Where are you getting married?"
                                identifier={'weddingLocation'}
                                name="weddingLocation"
                                placeHolder={''}
                                type={'string'}
                                placeSelectionHandler={(place) => {
                                    setFieldValue(locationFieldName, place);
                                    setFieldTouched(locationFieldName, true, true);
                                }}
                                textChangeHandler={(text) => {
                                    setFieldValue(locationFieldName, '');
                                    setFieldTouched(locationFieldName, true, true);
                                }}
                                types={['(regions)']}
                                apiKey={'AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8'}
                                blurHandler={(e) => {
                                    handleBlur(e);
                                }}
                            />
                        </FormRow>
                        <FormSubmitButton>
                            <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>Create</OutlinedCTAButton>
                        </FormSubmitButton>
                    </StyledForm>
                )}
        </Formik>
    );
};
