import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Overlay from './PageSupport/Overlay';
import PageContent from './PageContent';
import { useAuthService } from '../../rest-api/hooks/useAuthService';

import SingleSectionLayout from './layouts/SingleSectionLayout';

import { SubtitleBold } from '../typography';
import { FormRow, StyledForm, TextInput, FormSubmitButton, FormErrorMessage } from './forms/StyledForm';
import { OutlinedCTAButton } from '../Utility/OutlinedCTALink';

import SecurityCheck from '../../images/security-check.svg';
import { useHideFooter } from '../../newComponents/layout/Layout';


const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Must be a valid email.').required('Required'),
});

const ForgotPasswordForm = ({ onSubmit }) => {
    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={onSubmit}
            validateOnMount
        >
            {({ isValid, isSubmitting }) => (
                <StyledForm maxWidth="576px">
                    <FormRow>
                        <TextInput name="email" label="Email" type="email" />
                    </FormRow>
                    <FormSubmitButton>
                        <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>
                            Help me
                        </OutlinedCTAButton>
                    </FormSubmitButton>
                </StyledForm>
            )}
        </Formik>
    );
};

export const ForgotPasswordPage = () => {
    const { errorMessage, resetPasswordStart } = useAuthService();
    useHideFooter();
    const [submitted, setSubmitted] = React.useState(false);

    const handleForgotPasswordSubmit = (data) => {
        resetPasswordStart(data).then(() => {
            setSubmitted(true);
        });
    };
    return (
        <>
            <Overlay />
            <PageContent>
                <SingleSectionLayout>
                        {submitted ? (
                            <>
                                <h1 style={{ marginBottom: '28px' }}>Email Sent</h1>
                                <img src={SecurityCheck} alt="" style={{ marginBottom: '28px' }} />
                                <SubtitleBold>
                                    We’ve emailed you a link to reset your password. It should appear in your inbox
                                    within the next five minutes. If you still don’t see it, please check your spam
                                    folder before getting in touch!
                                </SubtitleBold>
                            </>
                        ) : (
                                <>
                                    <h1 style={{ marginBottom: '28px' }}>Forgot your password?</h1>
                                    <SubtitleBold style={{ marginBottom: '28px'}}>
                                        Don’t panic — we’ve got you covered. Give us the email address you use with Love Stories TV  and we’ll email you instructions for resetting your password.
                                </SubtitleBold>
                                {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
                                    <ForgotPasswordForm onSubmit={handleForgotPasswordSubmit} />
                                </>
                            )}
                </SingleSectionLayout>
            </PageContent>
        </>
    );
};

export default ForgotPasswordPage;
