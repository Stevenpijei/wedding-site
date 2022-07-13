import React from 'react';
import styled from 'styled-components';

export const ButtonGroup = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;

`;

export const MenuButton = styled('button')(({style, theme, selected}) => ({
  fontWeight: theme.fontWeightSemibold,
  height: '30px',
  fontSize: '1.125rem',
  cursor: 'pointer',
  outline: 'none',
  overflow: 'visible',
  userSelect: 'none',
  lineHeight: '1.125rem',
  background: 'transparent',
  padding: '0 4px 0 15px',
  border: `2px solid ${theme.textAndSvgBlack}`,
  border: 'none',
  backgroundImage: 'linear-gradient(to right, #7B3DFF 0, #6A25FF 100%)',
  backgroundPosition: '0 bottom',
  backgroundSize: `${selected ? '100% 2px' : '0% 2px'}`,
  backgroundRepeat: 'no-repeat',
  borderRadius: '2px',
  color: theme.black,
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  marginRight: '1rem',
  boxSizing: 'border-box',
  ':hover': {
    backgroundSize: '100% 2px',
  },
  ...style,
}));
  

