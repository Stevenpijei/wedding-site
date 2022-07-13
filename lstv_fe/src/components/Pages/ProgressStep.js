import React from 'react';
import styled, { css } from 'styled-components';
import breakpoints from '../../global/breakpoints';

const ProgressStep = styled.div`
    border-radius: 30px;
    width: 29.6px;
    height: 8px;
    
    margin: 0 8px;

    ${(props) => props.active &&
        css`
                background-color: ${props.theme.primaryPurple}
            `}

    ${(props) => !props.active &&
        css`
                background-color: ${props.theme.midGrey}
            `}
`;

const ProgressStepperContainer = styled.div`
    margin-bottom: 42px;
    @media ${breakpoints.UserDevice.isMobile} {
        margin-bottom: 16px;
    }
`

export const ProgressStepper = ({ steps, currentStep }) => {

    return (
        <ProgressStepperContainer style={{ display: 'flex', flexDirection: 'row' }}>
            {Array.from({ length: steps }).map((_, i) => (
                <ProgressStep key={`step-${i}`} active={i === currentStep - 1} />
            ))}
        </ProgressStepperContainer>
    );
};

export default ProgressStepper;