import React from 'react';
import styled from 'styled-components';

const V3PageContent = styled.div`
    overflow: hidden;
    background: ${props => props.theme.white};
    display: flex;
    flexDirection: row;
    border: 1px blue solid;
`;
export default V3PageContent;
