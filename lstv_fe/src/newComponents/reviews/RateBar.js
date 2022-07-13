import React from 'react';
import styled from 'styled-components';
import theme from '../../styledComponentsTheme'

const Container = styled('div')`
    display: flex;
    flex: 1;
    justify-content: space-around;
`;

const StyledCell = styled('div')`
    width: 35px;
    height: 10px;
    margin: 0 5px;
    border-radius: 30px;
`;

const Cell = ({ index, value }) => {
    const style = {}

    const startRange = index * 20;
    const endRange = startRange + 20;
    const isValueInRange = value > startRange && value < endRange;
    const isValueBiggerThenRange = value >= endRange
    
    style.background = isValueBiggerThenRange
        ? theme.primaryPurple
        : isValueInRange
        ? `linear-gradient(90deg, ${theme.primaryPurple} 50%, ${theme.midGrey} 50%)`
        : theme.midGrey;
    
    return <StyledCell style={style} />
}

const RateBar = ({ value, count }) => {
    const all = new Array(count).fill('');

    return (
        <Container>
            {all.map((key, index) => (
                <Cell key={index} index={index} value={value} />
            ))}
        </Container>
    );
};

export default RateBar