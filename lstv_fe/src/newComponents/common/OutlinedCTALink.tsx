import styled from 'styled-components';
import { Link } from 'react-router-dom';
import React, { ReactNode, CSSProperties } from 'react';
import LoadingGif from '/images/button-loading-purple.gif'

export const OutlinedCTALink = styled(Link)`
    width:  ${props => props.width ? props.width : '254px'};
    text-align: center;
    text-decoration: none;
    padding-top: 14px;
    padding-bottom: 14px;

    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;

    border: 2px solid;

    box-sizing: border-box;
    border-radius: 90px;

    transition: all 0.3s ease;

    cursor: pointer;

    &:hover {
        color: ${props => props.dark ? props.theme.black : props.theme.white};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        background-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }
    &.filled {
        color: ${props => props.dark ? props.theme.black : props.theme.white};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        background-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }
`

const StyledOutlinedCTA = styled.button<Props>`
    width:  ${props => props.width ? props.width : '254px'};
    height: ${props => props.height ? props.height : props.short ? '35px' : '51px'};

    text-decoration: none;
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;

    background-color: inherit;

    border: 2px solid;
    box-sizing: border-box;
    border-radius: 90px;

    transition: all 0.3s ease;

    &:enabled {
        cursor: pointer;
    }

    &:hover:enabled {
        color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }

    &.filled {
        color: ${props => props.dark ? props.theme.black : props.theme.white};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        background-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }

    &:disabled {
        opacity: 20%;
    }
`

const Loading = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`

type Props = {
  short?: boolean,
  dark?: boolean,
  width?: string,
  height?: string,
  loading?: boolean,
  style?: CSSProperties,
  onClick: (e?: any) => void,
  children: ReactNode
}

export const OutlinedCTAButton = ({ children, loading, ...props }: Props) => {
  return (
    <StyledOutlinedCTA {...props}>
      { loading ?
        <Loading>
          <img src={LoadingGif} />
        </Loading> :
        <>{ children }</>
      }
    </StyledOutlinedCTA>
  )
}
