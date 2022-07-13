import React from 'react'
import styles from '!style-loader!css-loader!sass-loader!../src/styles/index.scss';
import { ThemeProvider } from 'styled-components';
import theme from '../src/styledComponentsTheme'
import { GlobalTypographyStyles } from '../src/components/typography';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ margin: 'auto' }}>
          <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8&libraries=places"></script>
          <GlobalTypographyStyles />
          <Story />
        </div>
      </ThemeProvider>
    )
  ]
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <div style={{ margin: 'auto' }}>
        <GlobalTypographyStyles />
        <Story />
      </div>
    </ThemeProvider>
  )
]
