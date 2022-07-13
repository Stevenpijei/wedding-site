import formatDate from 'date-fns/format';
import { useField } from 'formik';
import React, { useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import breakpoints from '/global/breakpoints';
import { DATE_FORMAT } from '/global/globals';
import ArrowNextSVG from './ArrowNext.svg';
import ArrowPreviousSVG from './ArrowPrevious.svg';
import { ErrorMessage, Input, InputWrapper, Label } from './StyledForm';

const handleDateChangeRaw = e => e.preventDefault()

const DateInput = ({ label, onChange, minDate, maxDate, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const hasError = useMemo(() => Boolean(meta.error), [meta.error]);

    const handleChangeInt = (selectedValue) => {
        onChange && onChange(selectedValue)
        helpers.setValue(selectedValue, true);
    };

    return (
        <DateInputWrapper>
            <DatePicker
                showDisabledMonthNavigation
                minDate={minDate}
                maxDate={maxDate}
                locale='en'
                monthsShown={2}
                selected={field.value}
                onChange={handleChangeInt}
                onChangeRaw={handleDateChangeRaw}
                onBlur={field.handleBlur}
                openToDate={field.value}
                calendarContainer={StyledDatePicker}
                customInput={
                    <div style={{ textAlign: 'left' }}>
                        <Label htmlFor={props.name}>{label}</Label>
                        <Input
                            {...props}
                            value={field.value ? formatDate(field.value, DATE_FORMAT) : ''}
                            readOnly
                            autoComplete="off"
                            touched={meta.touched}
                            hasError={hasError}
                        />
                        { meta.error && meta.touched &&
                            <ErrorMessage>{ meta.error }</ErrorMessage>
                        }
                    </div>
                }
                // {...props}
            />
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
        // ensure multiple months stack in landscape
        min-width: 565px;
    }
`;

export default DateInput;
