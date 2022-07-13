import formatDate from 'date-fns/format';
import { Form, useField } from 'formik';
import parse from 'html-react-parser';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled, { css } from 'styled-components';
import breakpoints from '../../../global/breakpoints';
import * as globals from '../../../global/globals';
import ArrowNextSVG from './ArrowNext.svg';
import ArrowPreviousSVG from './ArrowPrevious.svg';

export const StyledForm = styled(Form)`
    /* This missing box-sizing property is a killer. I wonder if we could add it globally without breaking everything? */
    box-sizing: border-box;

    /* flex: 1 1 100%; */
    width: 100%;

    /* TODO: Fix the padding/margin combo so we only need one, or up max-width ^ */
    margin: 18px 28px;

    // 414px actual width, plus 5px margin on Input wrappers for spacing
    max-width: ${(props) => props.maxWidth || '422px'};

    @media ${breakpoints.UserDevice.isMobile} {
        padding: 0 28px;
        margin-top: 5px;
    }

    text-align: center;
`;

export const FormRow = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 16px;
`;

export const InputWrapper = styled.div`
    position: relative;
    flex: 1;

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
    border-radius: 42px;
    background-color: ${(props) => props.theme.lightGrey};
    color: ${(props) => props.theme.black};

    font-size: 0.9375;
    padding: 19px 16px 5px 16px;

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

const StyledDatePicker = styled.div`
    border: 1px solid #ececec;
    border-radius: 30px;
    padding: 11px;

    .react-datepicker-wrapper,
    .react-datepicker__input-container {
        width: 100%;
        z-index: 5;
    }
    .react-datepicker__header {
        background-color: white;
        border-bottom: none;
    }
    .react-datepicker__current-month {
        font-size: 1.12rem;
        font-weight: 500;
    }
    .react-datepicker__day-names {
        padding-top: 24px;
        padding-bottom: 6px;

        .react-datepicker__day-name {
            font-family: 'Calibre', sans-serif;
            font-weight: 500;
            font-size: 0.75rem;
        }
    }
    .react-datepicker__month-container {
        margin: 0 15px;
    }

    .react-datepicker__day--keyboard-selected,
    .react-datepicker__month-text--keyboard-selected,
    .react-datepicker__quarter-text--keyboard-selected,
    .react-datepicker__year-text--keyboard-selected {
        background-color: ${(props) => props.theme.secondaryPurple};
    }

    .react-datepicker__day--selected {
        background-color: ${(props) => props.theme.primaryPurple};
    }

    .react-datepicker__day--outside-month {
        opacity: 0.7;
    }

    .react-datepicker__day {
        font-family: 'Calibre', sans-serif;
        font-weight: 400;
        font-size: 0.9375rem;
    }

    .react-datepicker__navigation--previous {
        left: 45px;
        top: 30px;
        height: 12.35px;
        width: 7.36px;
        border: none;

        background: url(${ArrowPreviousSVG});
        background-size: contain;
        background-repeat: no-repeat;
    }
    .react-datepicker__navigation--next {
        right: 45px;
        top: 30px;
        height: 12.35px;
        width: 7.36px;
        border: none;

        color: ${(props) => props.theme.black};

        background: url(${ArrowNextSVG});
        background-size: contain;
        background-repeat: no-repeat;
    }
`;

const DateInputWrapper = styled(InputWrapper)`
    width: 100%;

    .react-datepicker-wrapper {
        width: 100%;
    }

    .react-datepicker-popper {
        //transform: translate(0, 60px) !important;
        right: 0;
        z-index: 6;
    }
`;

export const Label = styled.label`
    /* Stop floating label from preventing clicking on form */
    pointer-events: none;

    position: absolute;
    top: 12.5px;
    left: 16px;

    color: ${(props) => props.theme.darkGrey};

    z-index: ${globals.Z_INDEX_5_OF_100};

    transition: all 0.3s ease;
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
    line-height: ${(props) => (props?.numItems > 1 ? '1rem' : '1.2rem')};
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

export const TextInput = ({label, ...props}) => {
    const [field, meta, helpers] = useField(props);
    const hasError = React.useMemo(() => Boolean(meta.error), []); //, [meta.error]);

    return (
        <InputWrapper hasError={hasError} touched={meta.touched}>
            <Input {...field} {...props} touched={meta.touched} hasError={hasError}/>
            <Label htmlFor={props.name}>{label}</Label>
            {meta.error && meta.touched ? (
                <ErrorMessage>{Array.isArray(meta.error) ? parse(meta.error[0]) : meta.error}</ErrorMessage>
            ) : null}
        </InputWrapper>
    );
};

export const DateInput = ({label, maxWidth, ...props}) => {
    const [field, meta, helpers] = useField(props);
    const hasError = React.useMemo(() => Boolean(meta.error), [meta.error]);

    const handleDateChangeRaw = (e) => {
        e.preventDefault();
    }

    return (
        <DateInputWrapper maxWidth={maxWidth}>
            <DatePicker
                locale='en'
                monthsShown={1}
                popperPlacement="bottom-end"
                popperModifiers={{
                    offset: {
                        enabled: true,
                        offset: "5px, 10px"
                    },
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: "viewport"
                    }
                }}
                selected={field.value}
                onChange={val => helpers.setValue(val, true)}
                onChangeRaw={handleDateChangeRaw}
                onBlur={field.onBlur}
                calendarContainer={StyledDatePicker}
                customInput={
                    <div>
                        <Input
                            {...props}
                            value={field.value ? formatDate(field.value, 'd-MMM-yyyy') : undefined}
                            autoComplete="off"
                            touched={meta.touched}
                            hasError={hasError}
                            readonly
                        />
                        <Label htmlFor={props.name}>{label}</Label>
                        {meta.error && meta.touched ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
                    </div>
                }
                {...props}
            />
        </DateInputWrapper>
    );
};

export const FormErrorMessage = ( {errors} ) => {

    let use_errors = {};

    if (errors) {
        if (Object.keys(errors.request_errors).length > 0)
            use_errors = errors?.request_errors
        if (Object.keys(errors?.response_errors).length > 0)
            if(Object.keys(errors?.response_errors).includes('generic')){
                use_errors = errors?.response_errors
            } else {
                use_errors['generic'] = errors?.response_errors.code
            }
            
    }

    return use_errors?.generic  ? (
        <FormErrorMessageWrapper>
            <FormErrorMesssageIcon>!</FormErrorMesssageIcon>
            <ErrorMessageWeapper>
                {use_errors.generic.map((d, index) => {
                        return <ErrorMessage numItems={use_errors.generic.length} key={index}>
                            {use_errors.generic.length > 1 && '• '}
                            {d}
                        </ErrorMessage>;
                    }
                )}
            </ErrorMessageWeapper>
        </FormErrorMessageWrapper>
    ) : null;
};
