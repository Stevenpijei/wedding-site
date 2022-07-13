import React from 'react';
import styled from 'styled-components';
import HeartIcon from '../../images/black-heart.png';
import BlueHeartIcon from '../../images/blue-heart.png';
import HeartIconSVG from '../../images/black-heart.svg';



export const HeartToggle = (props) => (
  <HeartToggleWrapper disabled={props.disabled}>
    <div className="switch">
      <input id='heart-toggle' type="checkbox" className="switch-input" />
      <label htmlFor='heart-toggle' className="switch-label"/>
    </div>
  </HeartToggleWrapper>
)
export const HeartToggleWrapper = styled.div`
  padding: 2rem;
  .switch {
    position: relative;
    display: inline-block;
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
  }
  .switch-label::before{
    content: "";
    display: block;
    position: absolute;
    cursor: pointer;
    background-image: url(${HeartIcon});
    width: 48px;
    height: 42px;
  }

  .switch-input:checked + .switch-label::before {
    background-image: url(${BlueHeartIcon});
    
  }
`
