import React from 'react';
import styled from 'styled-components';

import RateBar from './RateBar'
import theme from '../../styledComponentsTheme';

const RateContainer = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 350px;

    @media ${theme.breakpoints.isWithinMobile} {
        width: 100%;
    }
`;


const RateRow = styled('div')`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

const Label = styled('p')`
    width: 60px;
`

const Value = styled('p')`
    width: 40px;
    text-align: right;
`

/**
 * 
 * @param {array} rating - [{ label: '5 Stars' value: 1-100 }]
 */

 const Rate = ({ rating }) => {
     const reversed = [...rating].reverse()
    return (
        <RateContainer>
            {reversed?.map((row) => (
                <RateRow key={row.label}>
                    <Label>{row.label}</Label>
                    <RateBar value={row.value} count={5} />
                    <Value>{row.value}%</Value>
                </RateRow>
            ))}
        </RateContainer>
    );
};

export default Rate