import styled from "styled-components";

const HorizontalRule = styled.hr`
  border-width: 1px 0 0;
  border-style: solid;
  border-color: ${props => props.theme.lighterGrey};
`

export default HorizontalRule