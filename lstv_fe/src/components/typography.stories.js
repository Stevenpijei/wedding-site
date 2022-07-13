import React from 'react'

import { Subtitle, SubtitleBold } from './typography';


export default {
  title: 'Base/Typography',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

export const h1 = () => <h1>Example Text</h1>;
export const h2 = () => <h2>Example Text</h2>;
export const h3 = () => <h3>Example Text</h3>;
export const h4 = () => <h4>Example Text</h4>;
export const h5 = () => <h5>Example Text</h5>;

export const subtitleBold = () => <SubtitleBold>Example Text</SubtitleBold>;
export const subtitle = () => <Subtitle>Example Text</Subtitle>;