import styled, { createGlobalStyle, css } from 'styled-components';
import * as breakpoints from '../global/breakpoints';

export const GlobalTypographyStyles = createGlobalStyle`
  a {
    text-decoration: underline;
    font: inherit;
    cursor: pointer;
    
    &:hover {
      color: ${props => props.theme.primaryPurple};
    }
  }

  h1 {
    padding-bottom: 16px;
  }

  @media ${breakpoints.UserDevice.isMobile} {
    h1 {
      font-size: 2.5rem;
    }
  }
`;

export const CardTitle = styled.p`
    font-size: 1.312rem;
    font-weight: 600;
`;

export const Subtitle = styled.p`
    font-size: 1.12rem;
    line-height: 1.562rem;
`;

export const SubtitleBold = styled.p`
    font-size: 1.12rem;
    font-weight: 500;
    padding-bottom: 18px;
`;

export const SubtitleBoldLarger = styled.p`
    font-size: 1.30rem;
    font-weight: 500;
    padding-bottom: 18px;
`;


export const LabelWithSeparator = styled(SubtitleBold)`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    text-align: center;
    max-width: ${props => props.maxWidth || "580px"};
    width: ${props => props.width || "100%"};
    padding: 0 28px;

    margin-top: 35px;
    @media ${breakpoints.UserDevice.isMobile} {
      margin-top: 0;
    }

    // Divider lines
    &:before,
    &:after {
        content: '';
        flex: 1;
        border-bottom: 1px solid ${props => props.theme.darkGrey};
    }

    &:before {
        margin-right: 1.6875rem;
    }

    &:after {
        margin-left: 1.6875rem;
    }
`;

export const ButtonTopNavTextStyles = css`
    font-size: 1.125rem;
    font-weight: 500;
    font-family:  'Calibre', sans-serif;
    text-decoration: none;
    color: ${props => props.theme.black};
    background-color: transparent;

    :hover {
      color: ${props => props.theme.primaryPurple};
    }
`
