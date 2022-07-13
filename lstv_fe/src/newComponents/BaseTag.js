import React from 'react';
import styled  from 'styled-components';
import { LSTVSVG } from '../components/Utility/LSTVSVG';

export const BaseChip = ({title, onClick=undefined}) => (
  <ChipDiv onClick={onClick}>
    <Text>{title}</Text>
  </ChipDiv>
)
const BaseTag = ({title, disabled}) => (
  <Div>
      <Text>{title}</Text>
      <Button disabled={disabled}>
        <LSTVSVG 
          icon="tag-x"
        />
      </Button>
  </Div>

)
const Div = styled('div')(({theme}) =>({
  display: 'flex',
  borderRadius: 50,
  width: 'max-content',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingRight: '8px',
  marginTop: '10px',
  marginBottom: '10px',
  
  background: theme.primaryPurple,

}));
const ChipDiv = styled(Div)`
  padding-right: 10px;
  padding-left: 10px;
`

const InnerDiv = styled.div`

`
const Text = styled('span')`
  display: block;
  flex: 1;
  width: 100%;
  padding-right: 30;
  padding-left: 30;
  font-weight: 500;
  font-size: 15px;
  color: white;
  line-height: 17.85px;
  margin-left: 12px;
  margin-right: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
`
const Button = styled('button')(() =>({
  borderRadius: '50%',
  cursor: 'pointer',
  width: '20px',
  height: '20px',
  background: 'white',

}))
const P = styled.p`
  transform: rotate(45deg);
`

export default BaseTag;