import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Dropdown as RODropdown, useDropdownMenu, useDropdownToggle } from "react-overlays";

const Menu = ({ role, children }) => {
  const [props, { toggle, show }] = useDropdownMenu({
    flip: true,
    offset: [0, 10],
  });

  const style = show ? {
    ...props.style,
    transition: 'opacity 200ms ease, margin 200ms ease',
    margin: '10px 0 0'
  } : props.style
  
  return (
    <div
      {...props}
      style={style}
      role={role}      
    >
      <div onClick={() => toggle(false)}>
        { children }
      </div>
    </div>
  );
};

// AK: other thing we could do is export these and expect 
// devs to next Dropdown.Toggle as a child of Dropdown instead of
// using the button and menu props on Dropdown.
const Toggle = ({ id, children }) => {
  const [props] = useDropdownToggle();
  return (
    <button
      type="button"
      style={{ background: 'none' }}
      id={id}
      {...props}
    >
      { children }
    </button>
  );
};

/**
 * Generic dropdown comonent. BYO toggle button and menu.
 */
const Dropdown = ({ id, toggle, menu, alignEnd, drop }) => {
  const [show, setShow] = useState(false);

  return (
    <RODropdown
      show={show}
      onToggle={() => setShow(!show)}
      drop={drop || 'down'}
      alignEnd={alignEnd}
    >
      <>
        <Toggle id={id}>{ toggle }</Toggle>
        <Menu role='menu'>{ menu }</Menu>
      </>
    </RODropdown>
  )
}

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  toggle: PropTypes.element.isRequired,
  menu: PropTypes.element.isRequired,
  alignEnd: PropTypes.bool,
  drop: PropTypes.oneOf(['up', 'down', 'left', 'right'])
}

export default Dropdown