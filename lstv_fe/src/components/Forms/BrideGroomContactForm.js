import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Flex, popMessageSuccess, synthesizeErrorMessage } from '../../utils/LSTVUtils';
import * as LSTVGlobals from '../../global/globals';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';
import Button, { ButtonBaseStyle } from '../Utility/Button';
import { faExclamationTriangle, faSpinner } from '@fortawesome/pro-light-svg-icons';
import { isMobile, isMobileOnly } from 'react-device-detect';
import { FormInput, FormLabel, InputErrors, TextAreaInput, FormFooter, FormErrorMessage } from './FormStyle';
import slugify from 'slugify';
import RealTimeService from '../../rest-api/services/realTimeService';

const BrideGroomContactForm = (props) => {
    const inputRef = useRef(null);
    const nameFieldName = 'bride-groom-contact-name-' + slugify(props.coupleNames);
    const emailFieldName = 'bride-groom-contact-email-' + slugify(props.coupleNames);
    const messageFieldName = 'bride-groom-contact-message-' + slugify(props.coupleNames);
    const background = props.background;

    if (!isMobileOnly) {
        const [formActive, setFormActive] = useState(false);
        useEffect(() => {
            if (!formActive) {
                setTimeout(() => {
                    if (inputRef.current) inputRef.current.focus();
                }, 250);
            }
        });
    }

    const [lastError, setLastError] = useState(null);

    return (
        <Formik
            initialValues={{ [emailFieldName]: '', [nameFieldName]: '', [messageFieldName]: props.message }}
            onSubmit={(values, { setSubmitting, setErrors, resetForm, setFieldValue, setValues }) => {
                // transmit request

                RealTimeService.contactBrideOrGroom(
                    values[nameFieldName],
                    values[emailFieldName],
                    props.contactFrom,
                    values[messageFieldName]
                ).then(
                    (r) => {
                        resetForm();
                        setSubmitting(false);
                        props.doneHandler(true);
                        setLastError(null);
                        popMessageSuccess(
                            `Message sent to ${props.coupleNames}`,
                            '',
                            LSTVGlobals.POPUP_MESSAGE_POSITION_TOP_RIGHT,
                            1500
                        );
                    },
                    (error) => {
                        setLastError(["Issues sending the message. Please try again later."]);
                        setSubmitting(false);
                    }
                );
            }}
            validationSchema={Yup.object().shape({
                [nameFieldName]: Yup.string().min(5, 'too short!').required('Required'),
                [emailFieldName]: Yup.string().email('must be a valid email address').required('Required'),
                [messageFieldName]: Yup.string().min(20, 'too short!').required('Required'),
            })}
        >
            {(props) => {
                const {
                    values,
                    touched,
                    errors,
                    dirty,
                    isSubmitting,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    handleReset,
                    fields,
                    setFieldValue,
                    setFieldTouched,
                } = props;

                let errorMessages = null;
                if (lastError) {
                    errorMessages = lastError.map((data, index) => {
                        return (
                            <p key={index}>
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                &nbsp;&nbsp;{data.toString().toLowerCase()}
                            </p>
                        );
                    });
                }

                return (
                    <React.Fragment>
                        {lastError && <FormErrorMessage> {errorMessages} </FormErrorMessage>}
                        <form onSubmit={handleSubmit} style={{ background: background }}>
                            <Flex
                                justifyContent={'space-around'}
                                flexWrap={'wrap'}
                                padding={isMobile ? '85px 15px 15px 15px' : '15px'}
                            >
                                <Flex
                                    justifyContent={'flex-start'}
                                    flexWrap={'wrap'}
                                    flex={`0 0 ${isMobileOnly ? '98%' : '48%'}`}
                                >
                                    <FormLabel htmlFor="name">Your Name</FormLabel>
                                    <FormInput
                                        style={{ display: 'block' }}
                                        ref={inputRef}
                                        id={nameFieldName}
                                        placeholder=""
                                        type="text"
                                        value={values[nameFieldName]}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors[nameFieldName] && touched[nameFieldName] && (
                                        <InputErrors>
                                            <FontAwesomeIcon className="fa-fw" icon={faExclamationCircle} />{' '}
                                            {errors[nameFieldName]}
                                        </InputErrors>
                                    )}
                                </Flex>

                                <Flex
                                    margin={isMobileOnly ? '10px 0 0 0' : 0}
                                    justifyContent={'flex-start'}
                                    flexWrap={'wrap'}
                                    flex={`0 0 ${isMobileOnly ? '98%' : '48%'}`}
                                >
                                    <FormLabel htmlFor={emailFieldName}>Your Email</FormLabel>
                                    <FormInput
                                        style={{ display: 'block' }}
                                        id={emailFieldName}
                                        placeholder=""
                                        form="novalidatedform"
                                        type="email"
                                        value={values[emailFieldName]}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors[emailFieldName] && touched[emailFieldName] && (
                                        <InputErrors>
                                            <FontAwesomeIcon className="fa-fw" icon={faExclamationCircle} />{' '}
                                            {errors[emailFieldName]}
                                        </InputErrors>
                                    )}
                                </Flex>
                            </Flex>

                            <Flex margin="10px 15px 5px 15px" justifyContent={'space-evenly'} flexWrap={'nowrap'}>
                                <Flex justifyContent={'flex-start'} flexWrap={'wrap'} flex={'0 0 98%'}>
                                    <FormLabel htmlFor="message">Message {isMobile && ''}</FormLabel>
                                    <TextAreaInput
                                        style={{ display: 'block' }}
                                        id={messageFieldName}
                                        placeholder=""
                                        type="text"
                                        value={values[messageFieldName]}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors[messageFieldName] && touched[messageFieldName] && (
                                        <InputErrors>
                                            <FontAwesomeIcon className="fa-fw" icon={faExclamationCircle} />{' '}
                                            {errors[messageFieldName]}
                                        </InputErrors>
                                    )}
                                </Flex>
                            </Flex>

                            <FormFooter>
                                <Button
                                    isDisabled={isSubmitting}
                                    type={'submit'}
                                    onBlur={(e) => {
                                        inputRef.current.focus();
                                    }}
                                    style={{
                                        ...ButtonBaseStyle,
                                        height: LSTVGlobals.DEFAULT_BUTTON_HEIGHT,
                                        borderRadius: '20px',
                                        marginTop: '10px',
                                        marginBottom: '0px',
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        '&:focus': {
                                            borderLeft: `2px solid ${LSTVGlobals.CARD_BACKGROUND_DARKEST}`,
                                            borderRight: `2px solid ${LSTVGlobals.CARD_BACKGROUND_DARKEST}`,
                                        },
                                    }}
                                >
                                    {isSubmitting && (
                                        <FontAwesomeIcon className="fa fa-fw" spin icon={faSpinner}>
                                            &nbsp;
                                        </FontAwesomeIcon>
                                    )}
                                    {isSubmitting ? 'Sending' : 'Send'}
                                </Button>
                            </FormFooter>
                        </form>
                    </React.Fragment>
                );
            }}
        </Formik>
    );
};

export default BrideGroomContactForm;
