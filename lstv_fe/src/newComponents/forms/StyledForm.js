import { Form, useField } from 'formik';
import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled, { css } from 'styled-components';
import { Flex } from '/utils/LSTVUtils';
import breakpoints from '/global/breakpoints';

// AK: should probably rename this to FormikTextInput
export const TextInput = ({ label, prefixContent, ...props }) => {
    const [field, meta] = useField(props);
    const hasError = meta.error && meta.touched
    const input = <Input {...field} {...props} touched={meta.touched} hasError={hasError} />

    return (
        <InputWrapper>
            <Label htmlFor={props.name}>{label}</Label>
            { prefixContent ?
                <Flex alignItems='center'>
                    { prefixContent }
                    { input }
                </Flex> :
                <>{ input }</>
            }
            <ErrorMessage style={{ opacity: hasError ? 1 : 0}}>
                { meta.error || '&nbsp;' }
            </ErrorMessage>
        </InputWrapper>
    );
};

export const FormikTextArea = ({ label, ...props}) => {
    const [field, meta] = useField(props);
    const hasError = meta.error && meta.touched

    return (
        <InputWrapper>
            <Label htmlFor={props.name}>{label}</Label>
            {/* AK: don't know why we're passing $touched in ... $hasError does the same thing. */}
            <TextArea {...field} {...props} $touched={meta.touched} $hasError={hasError} />
            <ErrorMessage style={{ opacity: hasError ? 1 : 0}}>
                { meta.error || '&nbsp;' }
            </ErrorMessage>
        </InputWrapper>
    );
}

export const StyledForm = styled(Form)`
    /* This missing box-sizing property is a killer. I wonder if we could add it globally without breaking everything? */
    box-sizing: border-box;

    /* flex: 1 1 100%; */
    width: 100%;

    /* TODO: Fix the padding/margin combo so we only need one, or up max-width ^ */
    margin: 18px 28px;

    // 414px actual width, plus 5px margin on Input wrappers for spacing
    max-width: ${(props) => props.$maxWidth || '422px'};

    @media ${breakpoints.UserDevice.isMobile} {
        padding: 0 28px;
        margin-top: 5px;
    }

    text-align: center;
`;

export const FormRow = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;
export const FormColumn = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`

export const InputWrapper = styled.div`
    position: relative;
    width: 100%;
    flex: 1;
    text-align: left;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 26px;

    @media ${breakpoints.UserDevice.isMobile} {
        margin-bottom: 19px;
    }
`;

export const Input = styled.input`
    /* Unsure why border-box not in CSS reset, but needed to stop multiple fields with padding overlapping */
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    width: 100%;
    border: 1px solid ${(props) => props.theme.midGrey};
    border-radius: 10px;
    background-color: ${(props) => props.theme.lightGrey};
    color: ${(props) => props.theme.black};

    /* font-size: 0.9375; */
    padding: 12px 20px;

    &:focus {
        border-color: ${(props) => props.theme.secondaryPurple};

        & ~ label {
            top: 0;
            color: ${(props) => props.theme.secondaryPurple};
            font-size: 0.8125rem;
        }
    }

    ${(props) =>
        Boolean(props.value) &&
        css`
            & ~ label {
                top: 0;
                color: ${(props) => props.theme.darkGrey};
                font-size: 0.8125rem;
            }
        `}

    ${(props) =>
        props.hasError &&
        props.touched &&
        css`
            border-color: ${props.theme.red};
            & ~ label {
                color: ${(props) => props.theme.red};
            }
        `}

        :not(:focus) {
        &[type='date']:in-range::-webkit-datetime-edit-year-field,
        &[type='date']:in-range::-webkit-datetime-edit-month-field,
        &[type='date']:in-range::-webkit-datetime-edit-day-field,
        &[type='date']:in-range::-webkit-datetime-edit-text {
            color: transparent;
        }
    }
    input::-webkit-calendar-picker-indicator {
        display: none;
    }
    input[type='date']::-webkit-input-placeholder {
        visibility: hidden !important;
    }
`;

export const TextArea = styled(TextareaAutosize)`
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    border: 1px solid #e5e5e5;
    position: relative;
    border-radius: 10px;
    padding: 16px 20px;
    min-height: 120px;
    background-color: #f9f9f9;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 100ms;

    &:focus {
        border-color: ${(props) => props.theme.secondaryPurple};

        & ~ label {
            top: 0;
            color: ${(props) => props.theme.secondaryPurple};
            font-size: 0.8125rem;
        }
    }
    ${(props) =>
        Boolean(props.value) &&
        css`
            & ~ label {
                top: 0;
                color: ${(props) => props.theme.darkGrey};
                font-size: 0.8125rem;
            }
        `}

    ${(props) =>
        props.$hasError &&
        props.$touched &&
        css`
            border-color: ${props.theme.red};
            & ~ label {
                color: ${(props) => props.theme.red};
            }
        `}

        :not(:focus) {
        &[type='date']:in-range::-webkit-datetime-edit-year-field,
        &[type='date']:in-range::-webkit-datetime-edit-month-field,
        &[type='date']:in-range::-webkit-datetime-edit-day-field,
        &[type='date']:in-range::-webkit-datetime-edit-text {
            color: transparent;
        }
    }
`;

export const Label = styled.label`
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    display: inline-block;
`;

export const FormSubmitButton = styled.div`
    margin-top: 20px;
    @media ${breakpoints.UserDevice.isMobile} {
        margin-top: 17px;
    }
`;

export const ErrorMessage = styled.p`
    color: ${(props) => props.theme.red};
    font-size: 0.8125rem;
    line-height: ${props => props?.numItems > 1 ? "1rem" : "1.2rem"};
    margin-left: 5px;
    text-align: left;
`;

const FormErrorMessageWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 7px 11px;
    margin-bottom: 16px;
    border: ${(props) => props.theme.midGrey} 1px solid;
    border-radius 4.5px;
    background-color: ${(props) => props.theme.lightGrey};
`;

const FormErrorMesssageIcon = styled.div`
    border: 1px solid;
    border-radius: 50%;
    margin-right: 5px;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    color: ${(props) => props.theme.red};
    font-size: 0.75rem;
`;

const ErrorMessageWeapper = styled.div`
    flex: 1;
    display: block;
`;

export const FormErrorMessage = ({ errors }) => {

    return errors ? (
        <FormErrorMessageWrapper>
            <FormErrorMesssageIcon>!</FormErrorMesssageIcon>
            <ErrorMessageWeapper>
                {errors.map((d, index) => (
                    <ErrorMessage numItems={errors.length} key={index}>{errors.length > 1 && "• "}{d}</ErrorMessage>
                ))}
            </ErrorMessageWeapper>
        </FormErrorMessageWrapper>
    ) : null;
};
