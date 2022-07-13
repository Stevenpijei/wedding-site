import { Form, Formik } from 'formik';
import React from 'react';
import { parsePhoneNumber } from 'react-phone-number-input';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { POPUP_MESSAGE_POSITION_TOP_RIGHT } from '../../../../global/globals';
import { useBusinessService } from '../../../../rest-api/hooks/useBusinessService';
import { UPDATE_USER_BUSINESS } from '../../../../store/actions';
import { popMessageSuccess } from '../../../../utils/LSTVUtils';
import { FormContent, FormSectionVieled, FormSubmitButtons, FormTitle, HeaderContainer } from '../Style';
import { BusinessLocation, BusinessPhoneInput, BusinessType, TextArea, TextInput } from './inputs';

const BusinessInfoSchema = Yup.object().shape({
    business_name: Yup.string().required('Required'),
    inquiry_email: Yup.string().email('Must be a valid email.').required('Required'),
    business_roles: Yup.string().min(1, 'Must select a role').required('Required'),
});

export const BusinessInformationForm = ({ user, business, mutate }) => {
    const dispatch = useDispatch();
    const { editBusinessInfo, editBusinessPhone, postBusinessPhone, editBusinessRoles } = useBusinessService();
    const useMailingAddress = business.business_locations?.length && Object.keys(business.business_locations[0]).includes('address')

    const calcIV = (business) => {
        return {
            // general patch
            business_name: business.name,
            description: business.description || '',
            inquiry_email: business.inquiry_email,
            business_location: business.business_locations[0]?.display_name,
            // roles patch
            business_roles: business.roles.map((role) => role.slug).join(', '),
            // phone patch
            phoneNumber: business.phones.length > 0 ? business.phones[0].display_phone_number : '',
        };
    };

    const handleSubmit = async (values, actions, initialValues) => {
        const keysforGeneralPatch = ['business_name', 'description', 'inquiry_email', 'business_location'];
        const updatedKeys =
            ('filtered', Object.keys(initialValues).filter((key) => initialValues[key] !== values[key]));

        const generalPatchData = {};
        let businessRolesData = [];
        let phoneData = {};
        for (let i = 0; i < updatedKeys.length; i++) {
            if (keysforGeneralPatch.includes(updatedKeys[i])) {
                // build general patch object
                // handle specifics
                if (updatedKeys[i] === 'business_location') {
                    generalPatchData['business_location'] = {
                        google: {
                            components: values[updatedKeys[i]].address_components,
                            formatted: values[updatedKeys[i]].formatted_address,
                            position: values[updatedKeys[i]].geometry.location,
                        },
                    };
                } else {
                    generalPatchData[updatedKeys[i]] = values[updatedKeys[i]];
                }
            } else if (updatedKeys[i] === 'business_roles') {
                businessRolesData = values[updatedKeys[i]].split(', ');
            } else if (updatedKeys[i] === 'phoneNumber') {
                phoneData = {
                    country: parsePhoneNumber(values[updatedKeys[i]]).country,
                    type: 'business',
                    number: parsePhoneNumber(values[updatedKeys[i]]).nationalNumber,
                };
            }
        }
        // const generalPatchData = updatedKeys.reduce((dataObj, key) => dataObj[key] = values[key])
        // console.log('generalPatchData', generalPatchData);
        // console.log('businessRolesData', businessRolesData)
        // console.log('phoneData', phoneData)

        const promises = [
            Promise.resolve('generalPatchData'),
            Promise.resolve('business_roles'),
            Promise.resolve('phoneData'),
        ];
        if (Object.keys(generalPatchData).length > 0) {
            promises.splice(0, 1, editBusinessInfo(user.businessId, generalPatchData));
        }
        if (businessRolesData.length > 0) {
            promises.splice(1, 1, editBusinessRoles(user.businessId, businessRolesData));
        }
        if (Object.keys(phoneData).length > 0) {
            if (business.phones.length > 0) {
                // update existing phone
                promises.splice(2, 1, editBusinessPhone(user.businessId, business.phones[0].id, phoneData));
            } else {
                //  post new phone
                promises.splice(2, 1, postBusinessPhone(user.businessId, phoneData));
            }
        }
        Promise.allSettled(promises).then(async (results) => {
            const errors = {};

            results.forEach((result, index) => {
                if (index === 0 && result.status === 'fulfilled') {
                    // If business name was changed, newSlug will exist
                    if (result.value?.result?.new_slug) {
                        // update user with new business name and slug
                        dispatch({
                            type: UPDATE_USER_BUSINESS,
                            payload: {
                                businessSlug: result.value.result.new_slug,
                                businessName: result.value.result.new_business_name,
                            },
                        });
                    }
                } else if (index === 0) {
                    if (result.reason?.response?.data?.errors) {
                        result.reason?.response?.data?.errors.forEach((error) => {
                            errors[error.field] = error.errors[0];
                            // actions.setErrors( {[error.field] : error.errors[0]});
                        });
                    }
                } else if (index === 1 && result.status === 'fulfilled') {
                    // If business roles were changed
                } else if (index === 2 && result.status === 'fulfilled') {
                    // If business phones were changed
                }
            });
            await mutate({ values });
            popMessageSuccess(`Business information updated successfully`, '', POPUP_MESSAGE_POSITION_TOP_RIGHT, 50);
            actions.resetForm({
                values: {
                    ...values,
                },
                errors: {
                    ...errors,
                },
                submitCount: 1,
            });
        });
    };

    return (
        <Formik
            initialValues={calcIV(business)}
            validationSchema={BusinessInfoSchema}
            onSubmit={async (values, actions) => {
                handleSubmit(values, actions, calcIV(business));
            }}
            validateOnMount={true}
        >
            {({ isValid, isSubmitting, handleSubmit, dirty, handleReset, setFieldValue, values, submitCount }) => (
                <Form>
                    <FormSectionVieled showContent={true}>
                        <>
                        <HeaderContainer>
                            <FormTitle>Business Information</FormTitle>
                            <FormSubmitButtons
                                isValid={isValid}
                                isSubmitting={isSubmitting}
                                dirty={dirty}
                                onSubmit={handleSubmit}
                                handleReset={handleReset}
                                submitCount={submitCount}
                            />
                        </HeaderContainer>

                        <FormContent>
                            <TextInput label="Business Name" name="business_name" />
                            <BusinessLocation
                                label="Business Location"
                                name="business_location"
                                $useMailingAdress={useMailingAddress}
                            />
                            <TextInput label="Client Contact Email Address" type="email" name="inquiry_email" />
                            <BusinessType name="business_roles" label="Business Type(s)" />
                            <BusinessPhoneInput label="Phone Number" name="phoneNumber" />
                        </FormContent>
                        <FormContent>
                            <TextArea style={{ gridColumn: '1 /3' }} label="Business Description" name="description" />
                        </FormContent>
                        </>
                    </FormSectionVieled>
                    {/* <Debug /> */}
                </Form>
            )}
        </Formik>
    );
};
