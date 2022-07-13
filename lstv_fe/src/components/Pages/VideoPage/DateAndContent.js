import React, { useState } from 'react';
import LinesEllipsis from 'react-lines-ellipsis';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { UserDevice } from '../../../global/globals';
import { Section } from "./LayoutComps";
import { BaseChip } from '../../../newComponents/BaseTag';
var dayjs = require('dayjs')


const WeddingDateContainer = styled.div`
    padding: 0px 20px 20px 20px;
    max-width: 650px;
    h3 {
        font-family: Calibre;
        font-weight: 500;
        margin: 15px 0px;
        font-size: 1.25rem;
        line-height: 1.5rem;
    }
    p {
        font-size: 1.125rem;
        line-height: 1.4rem;
        white-space: pre-wrap;
        margin-bottom: 20px;
        @media ${UserDevice.laptopL} {
            margin-top: 20px;
        }
    }
`

const ReadMoreButton = styled.button`
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.312rem;
    /* identical to box height */
    background-color: unset;
    cursor: pointer;
    text-decoration-line: underline;
`

const DateAndContent = ({event_date, content, isDesktop}) => {
    const [clamped, setClamped] = useState(true);
    const clampedLines = isDesktop ? 2 : 5

    return (
        <Section>
            <WeddingDateContainer>
                {!isDesktop && event_date && <h3>Wedding Date on {dayjs(event_date).format("MMM D, YYYY")}</h3>}
                { content && 
                    <>
                    <LinesEllipsis
                        text={content}
                        maxLine={clamped ? clampedLines: 500}
                        component="p"
                    />
                    <ReadMoreButton onClick={() => setClamped(!clamped)}>{clamped ? "Read More" : "Read Less"}</ReadMoreButton>
                    </>
                }
            </WeddingDateContainer>
        </Section>
    )
}

DateAndContent.propTypes = {
    event_date: PropTypes.string,
    content: PropTypes.string,
    isDesktop: PropTypes.bool,
};

export default DateAndContent
