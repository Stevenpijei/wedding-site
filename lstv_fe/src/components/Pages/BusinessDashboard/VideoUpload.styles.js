import styled, { css } from 'styled-components'

export const VideoInput = styled.input`
  box-sizing: border-box;
  width: 90%;
  border: 1px solid ${(props) => props.theme.midGrey};
  border-radius: 15px;
  background-color: ${(props) => props.theme.lightGrey};
  color: ${(props) => props.theme.black};
  font-size: 0.9375;
  padding: 19px 16px 5px 16px;

  &:focus {
    border-color: ${(props) => props.theme.secondaryPurple};

    & ~ label {
      top: 0;
      color: ${(props) => props.theme.secondaryPurple};
      font-size: 0.8125rem;
    }
  }

  ${(props) =>
    props.hasError &&
    props.touched &&
    css`
      border-color: ${props.theme.red};

      & ~ label {
        color: ${(props) => props.theme.red};
      }
  `}
`;

export const Container = styled.div`
  padding-top: 30px;
  padding-left: 40px;
  display: flex;
  flex-direction: column;
`;

export const Section = styled.section`
  padding-bottom: 40px;
`;

export const H4 = styled.h4`
  font-size: 32px;
  // note that for some reason Heldane is laded with 700 = "regular" and 900 = "bold"
  font-weight: 900;
  line-height: 1.24;
`

export const DragandDropContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  max-height: 100%;
  border-radius: 10px;
  border: 1px dashed #9b9b9b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const VideoTypeBackContainer = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
`

// needed because the arrowLeft svg isn't naturally centered :-/
export const VideoTypeBackIcon = styled.div`
  width: 24px;
  margin-left: 6px;
  margin-top: 6px;
`

export const VideoTypeTitle = styled.h4`
  font-size: 32px;
  margin-bottom: 24px;
  font-weight: 900;
`

export const VideoTypeContainer = styled.div`
  max-width: 424px;
  margin-bottom: 10px;
  text-align: center;

  h5 {
    margin-bottom: 6px;
  }

  p {
    font-size: 18px;
    margin-bottom: 20px;
    line-height: 1.25;
  }
`

export const UploadPromptContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${props => props.isDragActive ? props.theme.primaryPurple : props.theme.midGrey};
  transition: background-color 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Disclaimer = styled.p`
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  font-size: 12px;
  text-align: center;
  color: ${props => props.theme.darkGrey};
`
