import dayjs from 'dayjs';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as Yup from 'yup';
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink';
import DateInput from '/newComponents/forms/DateInput';
import GooglePlacesSearchBar from '/newComponents/forms/GooglePlacesSearchBar';
import { ErrorMessage, FormRow, FormSubmitButton, Input, InputWrapper, Label, StyledForm, TextArea } from '/newComponents/forms/StyledForm';
import { useBusinessService } from '/rest-api/hooks/useBusinessService';
import theme from '../../styledComponentsTheme';
import { popMessageSuccess } from '/utils/LSTVUtils';
import { trackEvent } from '../../global/trackEvent';

const ReStyledForm = styled(StyledForm)`
    margin: 10px 0px 0px 0px;
    padding: 0;

    @media ${theme.breakpoints.laptop} {
        display: grid;
        grid-template-columns: minmax(0, 0.5fr) minmax(0, 0.5fr);
        margin: 50px 0px 0px 0px;
        width: 100%;
        max-width: none;
    }
`;

const TextAreaFormRow = styled(FormRow)`
    margin-top: 20px;

    @media ${theme.breakpoints.laptop} {
        grid-column: 1 / span 2;
    }
`;

const StyledFormSubmitButton = styled(FormSubmitButton)`
    @media ${theme.breakpoints.laptop} {
        grid-column: 2;
        justify-self: end;
    }
`;

const ContactBusinessForm = ({ business, message, videoId, onSuccess }) => {
    const user = useSelector((state) => state.user);
    const { contactBusiness } = useBusinessService();
    const [submitError, setSubmitError] = useState("")

    const threeYearsFromNow = dayjs().add(3, 'year').toDate();

    const nameFieldName = 'contact-business-name'
    const emailFieldName = 'contact-business-email';
    const dateFieldName = 'contact-business-date';
    const messageFieldName = 'contact-business-message';
    const locationFieldName = 'contact-business-location';
    const optInFieldName = 'contact-business-optin'

    // AK: what happened to this?
    const optInLabel = `I'd like to receive wedding planning resources from Love Stories TV including recommended vendors, top wedding videos, advice, and more.`

    const schema = Yup.object().shape({
        [nameFieldName]: Yup.string().required('A name is required'),
        [emailFieldName]: Yup.string().email('Must be a valid email address').required('An email address is required'),
        [messageFieldName]: Yup.string(),
        [locationFieldName]: Yup.object().typeError("Location should be selected from the list"),
        [dateFieldName]: Yup.date()
            .min(new Date(), 'Selected date must be in the future')
            .max(threeYearsFromNow, 'Selected date must be within 3 years of today'),
        [optInFieldName]: Yup.boolean(),
    });

    const initialValues = {
        [emailFieldName]: user.loggedIn ? user.email : '',
        [nameFieldName]: user.loggedIn ? `${user.firstName} ${user.lastName}` : '',
        [dateFieldName]: undefined,
        [locationFieldName]: undefined,
        [messageFieldName]: message || '',
        [optInFieldName]: true,
    };

    const submit = async (values, helpers) => {
        const { setSubmitting, resetForm } = helpers;

        try {
            let businessRole = 'videographer'
            // business object may take different shape
            // depending on the page it came from :-/
            if(business.roles?.length) {
                businessRole = business.roles[0].slug
            } else if(business.role_slug) {
                businessRole = business.role_slug
            }

            const params = {
                fromPage: window.location.pathname,
                guestName: values[nameFieldName],
                guestEmail: values[emailFieldName],
                message: values[messageFieldName],
                optIn: values[optInFieldName],
                businessName: business.name,
                businessRole,
                businessSlug: business.slug,
                videoId: videoId || undefined,
                userUid: user?.uid,
            }

            if(values[locationFieldName]) {
                params.googleLocationComponent = values[locationFieldName].address_components
                params.GoogleLocationFormatted = values[locationFieldName].formatted_address
                params.latitude = values[locationFieldName].geometry.location.lat().toString()
                params.longitude = values[locationFieldName].geometry.location.lng().toString()
            }

            if(values[dateFieldName]) {
                params.weddingDate = values[dateFieldName]
            }

            await contactBusiness(params);
            resetForm();
            setSubmitting(false);
            popMessageSuccess("Submitted Successfully")
            onSuccess && onSuccess()

            trackEvent('vendor_inquiry', {
                'event_label': `inquiry - ${business.name}`,
                'event_category': 'business_engagement',
                'sent_from_page_type': videoId ? "video_page" : "business_page",
            });

        } catch (error) {
            console.log(error);
            setSubmitting(false);
            setSubmitError("Sorry, we had an error. please try again later.")
        }
    };

    return (
        <Formik validateOnMount initialValues={initialValues} onSubmit={submit} validationSchema={schema}>
            {({ values, touched, errors, isValid, isSubmitting, handleChange, handleSubmit, handleBlur }) => {
                return (
                    <ReStyledForm onSubmit={handleSubmit}>
                        <FormRow>
                            <InputWrapper>
                                <Label htmlFor={nameFieldName}>Your Name*</Label>
                                <Input
                                    id={nameFieldName}
                                    value={values[nameFieldName]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder=""
                                    type="text"
                                />
                                {errors[nameFieldName] && touched[nameFieldName] ? (
                                    <ErrorMessage>{errors[nameFieldName]}</ErrorMessage>
                                ) : null}
                            </InputWrapper>
                        </FormRow>
                        <FormRow>
                            <InputWrapper>
                                <Label htmlFor={emailFieldName}>Your Email*</Label>
                                <Input
                                    id={emailFieldName}
                                    value={values[emailFieldName]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder=""
                                    form="novalidatedform"
                                    type="email"
                                />
                                {errors[emailFieldName] && touched[emailFieldName] ? (
                                    <ErrorMessage>{errors[emailFieldName]}</ErrorMessage>
                                ) : null}
                            </InputWrapper>
                        </FormRow>
                        <FormRow>
                            <DateInput
                                name={dateFieldName}
                                label="Wedding Date?"
                                value={values[dateFieldName]}
                                onBlur={handleBlur}
                            />
                        </FormRow>
                        <FormRow>
                            <GooglePlacesSearchBar
                                label='Where are you getting married?'
                                identifier='weddingLocation'
                                name={locationFieldName}
                                defaultValue=''
                                $placeHolder=''
                                type='string'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                types={['(regions)']}
                            />
                        </FormRow>
                        <TextAreaFormRow>
                            <InputWrapper>
                                <Label htmlFor={messageFieldName}>Your message</Label>
                                <TextArea
                                    id={messageFieldName}
                                    placeholder=""
                                    type="text"
                                    value={values[messageFieldName]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </InputWrapper>
                        </TextAreaFormRow>
                        <ErrorMessage>{submitError || ""}</ErrorMessage>
                        <StyledFormSubmitButton>
                            <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>
                                Send
                            </OutlinedCTAButton>
                        </StyledFormSubmitButton>
                    </ReStyledForm>
                );
            }}
        </Formik>
    );
};

export default ContactBusinessForm;
