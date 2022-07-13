import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { Formik } from 'formik';
import * as Yup from 'yup';

import SingleSectionLayout from './layouts/SingleSectionLayout';
import Overlay from './PageSupport/Overlay';
import PageContent from './PageContent';

import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { FormRow, StyledForm, TextInput, FormSubmitButton, FormErrorMessage } from './forms/StyledForm';
import { OutlinedCTAButton } from '../Utility/OutlinedCTALink';
import { SubtitleBold } from '../typography';
import LSTVLink from "../Utility/LSTVLink";
import { useHideFooter } from '../../newComponents/layout/Layout';

const ChangePasswordSchema = Yup.object().shape({
    new_password: Yup.string().required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
        .required('Confirm Password is required.')
});

const ChangePasswordForm = ({onSubmit, code}) => {
    return (
        <Formik
            initialValues={{ new_password: '', confirmPassword: '' }}
            validationSchema={ChangePasswordSchema}
            validateOnMount
            onSubmit={async (values, actions) => {
                onSubmit({ password: values.new_password, code }).then(d => {
                    if (d) {
                        if (!d.success){ 
                            actions.setErrors(d?.response_errors);
                        }
                    } 
                    }, () => {})
            }}
        >
            {({ isSubmitting, isValid }) => (
                <StyledForm>
                    <FormRow>
                        <TextInput name="new_password" label="New Password" type="password" />
                    </FormRow>
                    <FormRow>
                        <TextInput name="confirmPassword" label="Confirm New Password" type="password" />
                    </FormRow>
                    <FormSubmitButton>
                        <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>
                            Confirm
                        </OutlinedCTAButton>
                    </FormSubmitButton>
                </StyledForm>
            )}
        </Formik>
    );
};

export const ForgotPasswordPage = () => {
    const { errorMessages, resetPasswordFinish } = useAuthService();
    useHideFooter();

    const location = useLocation();
    const history = useHistory();

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const handleOnSubmit = async (data) => {
        let res = await resetPasswordFinish(data);
        console.log(res);
        if(res) {
            history.push('/sign-in');
        }
        return res;
    }

    return (
        <>
            <Overlay />
            <PageContent>
                <SingleSectionLayout>
                    {code ? (
                        <>
                            <h1 style={{ padding: '0 20px' }}>Enter a new password</h1>
                            <SubtitleBold style={{ padding: '28px 0' }}>
                                Make sure it's not only secure but  memorable too 😉
                            </SubtitleBold>
                            {errorMessages && (
                                <FormErrorMessage errors={errorMessages}/>
                                // <FormErrorMessage>
                                //     {errorMessages} <LSTVLink to={'/forgot-password'}> You can ask for a new one.</LSTVLink>
                                // </FormErrorMessage>
                            )}
                            <ChangePasswordForm
                                onSubmit={handleOnSubmit}
                                code={code}
                                responseErrors={errorMessages?.response_errors}
                            />
                        </>
                    ) : (
                        <p>Invalid code, please check your email</p>
                    )}
                </SingleSectionLayout>
            </PageContent>
        </>
    );
};

export default ForgotPasswordPage;
