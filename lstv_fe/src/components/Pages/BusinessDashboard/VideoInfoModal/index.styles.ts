import styled from 'styled-components'

export const ButtonContainer = styled.div`
  position: sticky;
  z-index: 2;
  top: 0px;
  background-color: ${props => props.theme.white};
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ContentContainer = styled.div`
  display: flex;
  // maintains space for fixed position PreviewContainer
  width: calc(100% - 336px);
`

export const ScreenContainer = styled.div`
  max-width: 900px;
`

export const PreviewContainer = styled.div`
  width: 336px;
  top: 204px;
  right: 50px;
  position: fixed;
`

export const Section = styled.div`
  margin: 20px 0 40px;
`

// not sure why this is special. *shrug*
export const H4 = styled.h4`
  font-size: 32px;
  // note that for some reason Heldane is laded with 700 = "regular" and 900 = "bold"
  font-weight: 900;
  line-height: 1.24;
`

export const P = styled.p`
  font-size: 20px;
  font-weight: 400;
  line-height: 1.19;
  max-width: 560px;
`

export const InvalidFormWarning = styled.div`
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 44px;
  color: ${props => props.theme.red};
  font-weight: 500;
  background-color: ${props => props.theme.lightGrey};
  border-radius: 10px;
  border: 1px solid ${props => props.theme.red};
`

export const HelpContainer = styled.div`
  padding: 12px;
  border-radius: 10px;
  background-color: ${props => props.theme.midGrey};
  display: flex;
`
