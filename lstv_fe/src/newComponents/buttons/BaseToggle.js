import React from 'react';
import styled from 'styled-components';

export const Toggle = ({disabled, toggleId, name, onCheckboxChange, isSelected, label }) => (
  <ToggleWrapper disabled={disabled}>
    <div className="switch">
      <input id={toggleId} name={label} type="checkbox" className="switch-input" disabled={disabled}  checked={isSelected}
        onChange={onCheckboxChange}/>
        <label htmlFor={toggleId} className="switch-label">switch</label>
    </div>
    
  </ToggleWrapper>
)
export const ToggleWrapper = styled.div`
  /* padding: 2rem; */
.switch {
  position: relative;
  display: inline-block;
  opacity: ${props => props.disabled ? 0.5 : 1};
  height: 47.6px;
}
.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}
.switch-label {
  display: block;
  width: 48px;
  height: 24px;
  text-indent: -150%;
  clip: rect(0 0 0 0);
  color: transparent;
  user-select: none;
}
.switch-label::before,
.switch-label::after {
  content: "";
  display: block;
  position: absolute;
  cursor: pointer;
}
.switch-label::before {
  width: 90%;
  height: 40%;
  background-color: ${props => props.theme.darkGrey};
  border-radius: 9999em;
  -webkit-transition: background-color 0.25s ease;
  transition: background-color 0.25s ease;
  top: -3px;  
}
.switch-label::after {
  top: -5px;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.45);
  -webkit-transition: left 0.25s ease;
  transition: all 0.25s ease;
  
}
.switch-input:checked + .switch-label::before {
  background-color: ${props => props.theme.highlightColor};
}
.switch-input:checked + .switch-label::after {
  left: 24px;
  background-color: ${props => props.theme.primaryPurple};
}
`
