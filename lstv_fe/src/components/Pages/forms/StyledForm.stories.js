import React from 'react';

import { Formik } from 'formik';

import { StyledForm, TextInput, FormSubmitButton, FormErrorMessage, FormRow, DateInput } from './StyledForm';
import { OutlinedCTAButton } from '../../Utility/OutlinedCTALink';

export default {
    title: 'Forms/StyledForm',
    component: StyledForm,
    subcomponents: [TextInput, DateInput, FormSubmitButton],
    parameters: { actions: { argTypesRegex: '^on.*' } }
};

// const Template = (args) => 
export const form = ({ onSubmit }) => (
    <Formik initialValues={{}} onSubmit={onSubmit}>
        <StyledForm>
            <TextInput name="email" label="Email" type="email" />
            <TextInput name="password" label="Password" type="password" />
            <FormRow>
                <TextInput name="first" label="First Name" />
                <TextInput name="last" label="Last Name" />
            </FormRow>
            <FormSubmitButton>
                <OutlinedCTAButton type="submit">Sign In</OutlinedCTAButton>
            </FormSubmitButton>
        </StyledForm>
    </Formik>
)
form.args = {
    onSubmit: console.log
};

export const formErrorMessage = () => (
    <FormErrorMessage>Unable to sign! in with the provided credentials!.</FormErrorMessage>
)

export const dateInput = ({ onSubmit = console.log, onChange }) => {
    return (<Formik initialValues={{ weddingDate: '' }}
        onSubmit={onSubmit}
        validate={onChange}
    >
        <StyledForm maxWidth="576px">
            <DateInput label="When is your wedding?" name="weddingDate" />
            <FormSubmitButton>
                <OutlinedCTAButton type="submit">Sign In</OutlinedCTAButton>
            </FormSubmitButton>
        </StyledForm>
    </Formik>)
}

dateInput.args = {
    onSubmit: console.log,
    onChange: console.log
}
