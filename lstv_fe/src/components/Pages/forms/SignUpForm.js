import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types'
import { StyledForm, TextInput, FormRow, FormSubmitButton } from './StyledForm'
import { OutlinedCTAButton } from '/components/Utility/OutlinedCTALink'

const SignUpSchema = Yup.object().shape({
    email: Yup.string().email().required('Required'),
    password: Yup.string().required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required.'),
    first_name: Yup.string().required('Required'),
    last_name: Yup.string().required('Required')
});

const SignUpForm = ({ isBusiness, onSubmit, style }) => {
    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={SignUpSchema}
            onSubmit={async (values, actions) => {
                onSubmit(values).then(d => {
                    if (d) {
                        if (!d.success)
                            actions.setErrors(d?.response_errors);
                    }
                }, (error) => {})
            }}
            validateOnMount={true}
        >
            {({ isValid, isSubmitting }) => (
                <StyledForm style={style}>
                    <FormRow>
                        <TextInput label="First Name" name="first_name" />
                        <TextInput label="Last Name" name="last_name"/>
                    </FormRow>
                    <FormRow>
                        <TextInput label={isBusiness ? "Business Email" : "Email"} name="email" type="email" />
                    </FormRow>
                    <FormRow>
                        <TextInput label="Password" name="password" type="password" />
                    </FormRow>
                    <FormRow>
                        <TextInput label="Confirm Password" name="confirmPassword" type="password" />
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

SignUpForm.propTypes = {
    isBusiness: PropTypes.bool,
    onSubmit: PropTypes.func,
    style: PropTypes.object
};

SignUpForm.defaultProps = {
    isBusiness: false,
    onSubmit: () => {}
};

export default SignUpForm