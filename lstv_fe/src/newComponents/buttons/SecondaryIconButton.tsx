import React, { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 43px;
  height: 43px;
  box-sizing: border-box;
  border: 2px solid ${props => props.theme.black};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  &:hover {
    background-color: ${props => props.theme.primaryPurple};
    border-color: ${props => props.theme.primaryPurple};

    svg {
      fill: ${props => props.theme.white};
    }
  }
`

type Props = {
  /**
   * For hover to work, should contain an SVG
   */
  icon: ReactNode,
  onClick: (e?: any) => void,
  style?: CSSProperties
}

const SecondaryIconButton = ({ icon, onClick, ...props }: Props) => {
  return (
    <Container onClick={onClick} {...props}>
      { icon }
    </Container>
  )
}

export default SecondaryIconButton
