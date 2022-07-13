import styled from 'styled-components'
import theme from '../../../../styledComponentsTheme'

// AK: not sure how to type the ref for a div
type ICProps = { selected?: boolean, ref?: any }

export const ItemContainer = styled.div<ICProps>`
  background-color: ${props => props.selected ? props.theme.midGrey : 'transparent'};
  max-width: 96px;
  padding: 8px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  box-sizing: border-box;

  &:hover {
    background-color: ${theme.midGrey};
  }

  @media ${theme.breakpoints.laptop} {
    max-width: none;
    width: 100%;
    height: auto;
    padding: 18px;
    flex-direction: row;
    margin: 5px 0;
    justify-content: flex-start;
  }
`

export const Icon = styled.div`
  width: 32px;
  height: 32px;

  @media ${theme.breakpoints.laptop} {
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }
`

export const Title = styled.p`
  text-align: center;
  margin-top: 5px;
  font-size: 15px;
  
  @media ${theme.breakpoints.tablet} {
    font-weight: 500;
    font-size: 18px;
  }

  @media ${theme.breakpoints.laptop} {
    margin-top: 0;
  }
` 

export const MenuBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 40px;
  box-shadow: 0 0 20px rgba(156,156,156,0.25);
  padding: 10px;

  // because of the way StaticPageLayout works now. 
  // we'll be revisiting all layouts soon.
  margin-left: -16px;
  margin-right: -16px;
  margin-top: -16px;

  @media ${theme.breakpoints.tablet} {
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
    border-radius: 10px;
  }

  @media ${theme.breakpoints.laptop} {
    width: 317px;
    height: 100%;
    flex: 0 0 auto;
    flex-direction: column;    
    border-radius: 10px;
  }
`
