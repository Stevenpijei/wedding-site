import styled from 'styled-components';
import theme from '../../../../styledComponentsTheme'

type QSProps = {
  selected?: boolean
}

export const FaqQuestionContainer = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid ${theme.midGrey};
`

export const QuestionSet = styled.div<QSProps>`
  display: ${props => props.selected ? 'block' : 'none'};
` 

export const QuestionTarget = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`

export const Answer = styled.p`
  padding-top: 15px;
  margin-right: 40px;

  @media ${theme.breakpoints.tablet} {
    padding-top: 5px;
  }
`

export const Container = styled.div`
  width: 100%;

  @media ${theme.breakpoints.laptop} {
    margin-left: 46px;
  }
`
