import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types'

export const CheckBox = ({ checked, disabled, checkBoxId, label, onChange }) => (
    <CheckBoxWrapper disabled={disabled}>
        <div>
            <input
                type='checkbox'
                id={checkBoxId}
                name={checkBoxId}
                disabled={disabled}
                checked={checked}
                onChange={onChange}
            />
        </div>
        <label htmlFor={checkBoxId} className='checkbox-label'>
            { label }
        </label>
    </CheckBoxWrapper>
)

const CheckBoxWrapper = styled.div`    
    display: flex;
    align-items: center;
    input[type='checkbox'] {
        position: relative;
        display: inline-block;
        background: #fff;
        display: flex;
        align-items: center;
        width: 1.437rem;
        height: 1.437rem;
        line-height: 1rem;
        box-sizing: border-box;
        box-shadow: 0px 0px 4px rgba(223, 223, 223, 0.25);
        border: 2px solid ${(props) => props.theme.darkGrey};
        opacity: ${(props) => (props.disabled ? 0.5 : 1)};
        border-radius: 5px;
        margin-right: 7px;
        text-align: center;
        cursor: pointer;
    }
    input[type='checkbox']:checked {
        background: ${(props) => props.theme.primaryPurple};
        border: 2px solid ${(props) => props.theme.primaryPurple};
    }
    input[type='checkbox']:before {
        content: '';
        display: inline-block;
        padding-top: 4px;
    }
    input[type='checkbox']:after {
        padding-top: 0px;
    }
    input[type='checkbox']:checked:before {
        width: 7px;
        border-bottom: 2px solid #fff;
        border-right: 2px solid #fff;
        transform: rotate(45deg);
        height: 12px;
        transform: rotate(45deg) translateX(-4px);
        margin-left: 5px;
    }
    .checkbox-label {
        text-align: left;
        opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    }
`;

CheckBox.propTypes = {
    disabled: PropTypes.bool,
    checked: PropTypes.bool,
    checkBoxId: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
}