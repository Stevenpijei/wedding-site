import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useField } from 'formik';
import DatePicker from 'react-datepicker';
import useMedia from 'use-media';
import breakpoints from '../../../global/breakpoints';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parseISO';
import 'react-datepicker/dist/react-datepicker.css';

import { InputWrapper, ErrorMessage, Input, Label } from '../../../newComponents/forms/StyledForm';
import { VideoInput } from './VideoUpload';
import Modal from '../../../newComponents/Modal';
import BaseCtaButton from '../../../newComponents/buttons/BaseCtaButton';
import ArrowNextSVG from '../../../newComponents/forms/ArrowNext.svg';
import ArrowPreviousSVG from '../../../newComponents/forms/ArrowPrevious.svg';


const handleDateChangeRaw = (e) => {
    e.preventDefault();
}

const DateInput = ({ label, ...props }) => {

    // const isMobile = useMedia(breakpoints.UserDevice.isMobile);
    const sixMonthsFromNow = React.useMemo(() => {
        const currentDate = new Date();
        return currentDate.setMonth(currentDate.getMonth() + 6);
    });
    const [value, setValue] = useState(formatDate(sixMonthsFromNow, 'yyyy-MM-dd'))
    const [field, meta, helpers] = useField(props);
    const hasError = React.useMemo(() => Boolean(meta.error), [meta.error]);
    // const dateFromValue = React.useMemo(() => (value ? parseDate(value) : undefined), [value]);
    

    const handleChangeInt = (selectedValue) => {
        setValue(formatDate(selectedValue, 'yyyy-MM-dd'));
        helpers.setValue(formatDate(selectedValue, 'yyyy-MM-dd'), true);
    };

    // return isMobile ? (
    //     <DateInputModal
    //         label={label}
    //         hasError={hasError}
    //         onChange={handleChange}
    //         field={field}
    //         meta={meta}
    //         dateFromValue={dateFromValue}
    //         {...props}
    //     />
    // ) : (
        return (
        <DateInputWrapper>
            <DatePicker
                locale={"en"}
                monthsShown={2}
                selected={parseDate(value)}
                onChange={handleChangeInt}
                onChangeRaw={handleDateChangeRaw}
                onBlur={field.handleBlur}
                openToDate={parseDate(value)}
                calendarContainer={StyledDatePicker}
                customInput={
                    <div>
                        <Label htmlFor={props.name}>{label}</Label>
                        <VideoInput
                            {...props}
                            value={value}
                            readOnly
                            autoComplete="off"
                            touched={meta.touched}
                            hasError={hasError}
                        />                        
                        {meta.error && meta.touched ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
                    </div>
                }
                // {...props}
            />
        </DateInputWrapper>
    );
};

const DateInputModal = ({ field, meta, helpers, dateFromValue, hasError, onChange, label, ...props }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = (isOpen = null) => {
        setIsModalOpen(isOpen !== null ? isOpen : !isModalOpen);
    };

    const getButtonTitle = () => {
        return field.value ? formatDate(new Date(field.value), 'eee, MMM d, yyyy') : 'Select the Date';
    };

    return (
        <DateInputWrapper>
            <div>
                <Label htmlFor={props.name}>{label}</Label>
                <Input
                    {...props}
                    readOnly
                    value={field.value}
                    autoComplete="off"
                    touched={meta.touched}
                    onFocus={() => toggleModal(true)}
                    hasError={hasError}
                />                
                {meta.error && meta.touched ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
            </div>
            <Modal open={isModalOpen} onClose={() => toggleModal(false)} fullHeight>
                <DateButtonContainer>
                    <BaseCtaButton
                        stretchWidth
                        disabled={!field.value}
                        type="button"
                        size="large"
                        title={getButtonTitle()}
                        onClick={() => toggleModal(false)}
                    />
                </DateButtonContainer>
                <DatePicker
                    locale={"en"}
                    inline
                    open={open}
                    monthsShown={36}
                    minDate={new Date()}
                    selected={dateFromValue}
                    calendarContainer={StyledDatePicker}
                    onChange={onChange}
                    onChangeRaw={handleDateChangeRaw}
                    onBlur={field.onBlur}
                    {...props}
                />
            </Modal>
        </DateInputWrapper>
    );
};

const StyledDatePicker = styled.div`
    border: 1px solid #ececec;
    border-radius: 30px;
    padding: 10px;

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

    @media ${breakpoints.UserDevice.isMobileOrTablet} {
        overflow: scroll;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
        margin: 0 auto;
        border-radius: 0px;

        .react-datepicker__day--keyboard-selected {
            background-color: white;
            color: black;
        }
    }
`;

const DateInputWrapper = styled(InputWrapper)`
    .react-datepicker-wrapper {
        width: 100%;
    }

    .react-datepicker-popper {
        transform: translate(0, 60px) !important;
        z-index: 6;
    }
`;

const DateButtonContainer = styled('div')`
    width: 80%;
    margin: 24px auto 16px auto;
`;

export default DateInput;
