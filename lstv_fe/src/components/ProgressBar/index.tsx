import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import { ProgressBarDot, ProgressBarDotSelected } from '/components/Utility/LSTVSVG'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Label = styled.p`
  font-weight: 500;
  font-size: 18px;
  padding: 20px 0;
`

const Bar = styled.div<{ selected: boolean }>`
  width: 100%;
  height: 6px;
  margin: 0 20px;
  border-radius: 6px;  
  background-color: ${props => props.selected ? props.theme.primaryPurple : props.theme.midGrey};
`

const Bullet = ({ selected, onClick }: {
  selected: boolean,
  onClick: () => void
}) => {
  const style: CSSProperties = {
    flexShrink: 0,
    height: 22,
    width: 22
  }
  if(selected) style.cursor = 'pointer'

  return (      
    <div style={style} onClick={onClick}>
      { selected ?
        <ProgressBarDotSelected /> :
        <ProgressBarDot />
      }
    </div>
  )
}

type Props = {
  labels: string[], 
  currentIndex: number,
  onLabelClick?: (index: number) => void,
  style?: CSSProperties
}

/**
 * Display progress a user has made in stepping through a process
 */
const ProgressBar = ({ labels, currentIndex, onLabelClick, style }: Props) => {
  if(currentIndex < 0 || currentIndex >= labels.length) 
    throw Error('ProgressBar: invalid currentIndex prop')

  const onItemClick = (index: number) => {
    onLabelClick && onLabelClick(index)
  }

  return (
    <div style={style}>
      <Container>
        { labels.map((label, index) => {
          const labelEl = <Label>{ label }</Label>
          return (
            <React.Fragment key={label}>
              { index <= currentIndex ? 
                <div style={{ cursor: 'pointer' }} onClick={() => onItemClick(index)}>
                  { labelEl }
                </div> :
                labelEl
              }
            </React.Fragment>
          )
        })}
      </Container>
      <Container>
      { labels.map((_, index) => {
        const selected = index <= currentIndex
        return (          
          <React.Fragment key={index}>
            <Bullet
              selected={selected}
              onClick={() => selected ? onItemClick(index) : null}
            />
            { index < labels.length-1 &&
              <Bar selected={index <= currentIndex - 1} />
            }
          </React.Fragment>
        )
      })}
      </Container>
    </div>
  )
}

export default ProgressBar