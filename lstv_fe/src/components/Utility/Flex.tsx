import React from 'react'

type Position = 'flex-start' | 'flex-end' | 'center'
type Distribution = 'space-around' | 'space-between' | 'space-evenly' | 'stretch'

interface Props {
  direction?: 'row' | 'column',
  align?: Position,
  justify?: Position | Distribution,
  children?: React.ReactNode,
  style?: React.CSSProperties
}

/**
 * Handy wrappr for common flexbox cases. Augment as you like.
 *
 * AK: Use Flex in LSTVUtils instead
 */
const Flex = ({ direction, align, justify, children, style }: Props) =>
  <div style={{
    display: 'flex',
    flexDirection: direction ?? 'row',
    alignItems: align ?? 'flex-start',
    justifyContent: justify ?? 'flex-start',
    ...style
  }}>{ children && children }</div>

export default Flex
