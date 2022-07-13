import React from 'react';
import styled from 'styled-components';

export const RadioButton = (props) => (
  <RadioButtonWrapper primary={props.primary} disabled={props.disabled}>
    <label className="radio">
      <span className="radio__input">
        <input
          type="radio"
          name={props.name}
          checked={props.groupValue === props.value}
          value={props.value}
          onChange={() => props.handleChange(props.value)}
        />
        <span className="radio__control"></span>
      </span>
      <div className="radio__desc">
        <span className="radio__label">{props.labelName}</span>
        {props.labelDesc && <span className="radio__label__desc">{props.labelDesc}</span>}
        </div>
    </label>
  </RadioButtonWrapper>
)

export const RadioButtonGroup = (props) => {
  const childrenWithProps = React.Children.map(props.children, child => {
    // checking isValidElement is the safe way and avoids a typescript error too
    const {name} = props
    const newProps = { name };
    if (React.isValidElement(child)) {
        return React.cloneElement(child, newProps);
    }
    return child;
  });
  return <>{childrenWithProps}</>
}

export const RadioButtonWrapper = styled.div`
  cursor: pointer;

  .radio {
    font-size: 2.25rem;
    color: ${props => props.primary ? props.theme.primaryPurple : props.theme.black};
    display: grid;
    grid-template-columns: min-content auto;
    grid-gap: 0.5em;
    align-items: start;
    padding: 10px;
    opacity: ${props => props.disabled ? .5 : 1};
  }

  .radio__input {
    display: flex;
    margin-top: 4px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
      position: relative;

      &:checked + .radio__control {
        &:after {
          content: '';
          display: block;
          position: absolute;
          top: 3px;
          left: 3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: currentColor;
        }
      }
    }
  }

  .radio__control {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 0.2em solid currentColor;
    transform: translateY(-0.05em);
  }

  .radio__desc {
    display: flex;
    flex-direction: column;
  }

  .radio__label {
    font-weight: 600;
    font-size: 1.312rem;
    line-height: 1.562rem;
    color: ${props => props.theme.black};
  }

  .radio__label__desc {
    font-size: 1.125rem;
    line-height: 1.5rem;
    color: ${props => props.theme.darkerGrey};
  }
`
