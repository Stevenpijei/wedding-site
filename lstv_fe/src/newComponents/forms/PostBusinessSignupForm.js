import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Formik, useField } from 'formik';
import * as Yup from 'yup';
import GooglePlacesSearchBar from '../../components/Pages/forms/GooglePlacesSearchBar'; //"../../Utility/GooglePlacesSearchBar";
import BaseMultiSelect from '../BaseMultiSelect';
import { StyledForm, FormRow, FormSubmitButton } from '../../components/Pages/forms/StyledForm';
import { OutlinedCTAButton } from '../../components/Utility/OutlinedCTALink';
import { useAppDataService } from '../../rest-api/hooks/useAppDataService';
import * as breakpoints from '../../global/breakpoints';
import { TextInput, ErrorMessage } from '../../components/Pages/forms/StyledForm';

const EditProfileSchema = Yup.object().shape({
    business_name: Yup.string().required('Required'),
    location: Yup.object().required('Required'),
    business_roles: Yup.array().required('Required'),
});

const MultiSelectContainer = styled(FormRow)`
    display: flex;
    flex-direction: column;
    margin: 0 auto 26px auto;
    width: 99%;

    @media ${breakpoints.UserDevice.isMobile} {
        margin-bottom: 19px;
    }
`;

export const PostBusinessSignUpForm = ({ onSubmit }) => {
    const { getBusinessTypes } = useAppDataService();
    const [businessRoles, setBusinessRoles] = useState([]);

    useEffect(() => {
        fetchBusinessTypes();
    }, []);

    const fetchBusinessTypes = async () => {
        const types = await getBusinessTypes();
        const processed = types.map((type) => ({
            label: type.name,
            value: type.slug,
        }));

        setBusinessRoles(processed);
    };




    const handleSubmit = async  (values, actions) => {
        onSubmit({
            business_name: values.business_name,
            business_roles: values.business_roles,
            location: {
                components: values.location.address_components,
                formatted: values.location.formatted_address,
                position: {
                    lat: values.location.geometry.location.lat().toString(),
                    long: values.location.geometry.location.lng().toString(),
                },
            },
        }).then( d => {}, (error) => {
            console.log(error);
            actions.setErrors(error.response_errors);
        })
    };

    return (
        <Formik
            initialValues={{
                business_name: '',
                location: '',
                business_roles: '',
            }}
            validationSchema={EditProfileSchema}
            validateOnMount={true}
            validateOnBlur={true}
            onSubmit={handleSubmit}
        >
            {({
                isSubmitting,
                isValid,
                values,
                getFieldMeta,
                errors,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
            }) => (
                <StyledForm onSubmit={handleSubmit} maxWidth="576px">
                    <TextInput name="business_name" label="Business Name" />
                    <MultiSelectContainer>
                        <BaseMultiSelect
                            placeholder="Business Type"
                            name={"business_name"}
                            options={businessRoles}
                            onChange={(value) => {
                                setFieldValue('business_roles', value || []);
                            }}
                        />
                        <ErrorMessage>
                            {errors.businessTypes && getFieldMeta('business_roles').touched ? (
                                <ErrorMessage>{errors.business_roles}</ErrorMessage>
                            ) : null}
                        </ErrorMessage>
                    </MultiSelectContainer>
                    <FormRow>
                        <GooglePlacesSearchBar
                            label="Business location (city and state)"
                            identifier={'location'}
                            name="location"
                            placeHolder={''}
                            type="string"
                            placeSelectionHandler={(place) => {
                                setFieldValue('location', place);
                                setFieldTouched('location', true, true);
                            }}
                            textChangeHandler={() => {
                                setFieldValue('location', '');
                                setFieldTouched('location', true, true);
                            }}
                            types={['(regions)']}
                            apiKey={'AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8'}
                            blurHandler={(e) => handleBlur(e)}
                        />
                    </FormRow>
                    <FormSubmitButton>
                        <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>
                            Sign Up
                        </OutlinedCTAButton>
                    </FormSubmitButton>
                </StyledForm>
            )}
        </Formik>
    );
};
