
import React from 'react';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';

const Interview = styled('div')`
    margin-top: 32px
`

const QuestionContainer = styled('div')`
    display: grid;
    grid-gap: 8px;
    grid-template-columns: 0.65fr 1fr;
    border-bottom: 1px solid ${theme.midGrey};
    align-items: center;
    align-content: center;
    padding: 16px 0;
    text-align: left;

    &:last-of-type {
        border-bottom: none;
    }

    @media ${theme.breakpoints.isWithinMobile} {
        grid-template-columns: 1fr;
    }
`;

const Question = styled('p')`
    font-weight: 600;
    font-family: Calibre;
    margin: 0 0 8px 0;
`;

const Answer = styled('p')`
    font-family: Calibre;
`;


const BusinessFaq = ({ faq }) => {
    return (
        <Interview>
            {faq?.map(({ content, fixed_response }, index) => (
                <QuestionContainer key={index}>
                    <Question>{content}</Question>
                    <Answer>{fixed_response}</Answer>
                </QuestionContainer>
            ))}
        </Interview>
    );
}
    
export default BusinessFaq
