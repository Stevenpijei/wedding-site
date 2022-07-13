import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(103,103,103,0.25);
`

export const ThumbContainer = styled.div`
  width: 100%;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-color: ${props => props.theme.lightGrey};
`

export const ContentContainer = styled.div`
  padding: 18px 20px;
`

export const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`

export const Title = styled.p`
  font-size: 21px;
  font-weight: 600;
  margin-bottom: 6px;
`

export const Author = styled.p`
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 12px;
`

export const Location = styled.p`
  font-size: 18px;
  margin-bottom: 6px;
  margin-bottom: 12px;
`

export const Tag = styled.div`
  border-radius: 3px;
  background-color: ${props => props.theme.lightGrey};
  padding: 3px 10px;
  font-size: 15px;
  font-weight: 500;
  margin-right: 10px;
  margin-bottom: 10px;
`
