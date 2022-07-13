import React from 'react';
import { Formik, Form } from 'formik';
import { OutlinedCTAButton } from '../../Utility/OutlinedCTALink';
import { FormSubmitButton, StyledForm, FormRow, TextInput } from './StyledForm';

import * as Yup from 'yup';
import { USER_TYPE_CONSUMER } from '../../../global/globals';

export const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Must be a valid email.').required('Required'),
    password: Yup.string().required('Required'),
});

export const SignInForm = ({ onSubmit }) => {
    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={onSubmit}
            validateOnMount={true}
        >
            {({ errors, touched, values, isValid, isSubmitting }) => {
                return (
                    <StyledForm>
                        <FormRow>
                            <TextInput name="email" label="Email" type="email" />
                        </FormRow>
                        <FormRow>
                            <TextInput name="password" label="Password" type="password" />
                        </FormRow>
                        <FormSubmitButton>
                            <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>
                                Sign In
                            </OutlinedCTAButton>
                        </FormSubmitButton>
                    </StyledForm>
                );
            }}
        </Formik>
    );
};
