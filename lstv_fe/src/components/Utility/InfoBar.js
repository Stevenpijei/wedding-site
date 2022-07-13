import React, { useState } from 'react';
import { withRouter } from 'react-router';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/pro-solid-svg-icons';
import { getTimeAgoString, shorthandValue, Spacer, DateToMonthYearString } from '../../utils/LSTVUtils';
import { faClock } from '@fortawesome/pro-solid-svg-icons';

const InfoBarStyle = styled.div`
    display: inline;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    color: ${(props) => props.textColor || 'inherit'};
    padding:  ${(props) => props.padding || '0'};
    font-size: ${(props) => props.fontSize || '1rem'};
`;

const InfoContent = styled.div`
    color: inherit;
    display: inline;
`;

export const InfoPlaceHolder = (props) => {
    return (
        <InfoContent>
            &nbsp;
        </InfoContent>
    );
};

export const InfoNumWithAppendix = (props) => {
    return (
        <InfoContent>
            {props.icon}{props.icon && ' '}{shorthandValue(props.count, props.appendixStr, props.shorthand || true)}
        </InfoContent>
    );
};

export const InfoBarTimeAgoLabel = (props) => {
    return (
        <InfoContent>
            <FontAwesomeIcon className="fa" style={{ padding: '0 5px 0 0' }} icon={faClock} />
            {props.date ? '' : 'published '}
            {getTimeAgoString(new Date(props.date ? props.date : props.backupDate))}
        </InfoContent>
    );
};

export const InfoBarMonthYear = (props) => {
    return (
        <InfoContent>
            <FontAwesomeIcon className="fa" style={{ padding: '0 5px 0 0' }} icon={faClock} />
            {props.date ? '' : 'published '}
            {DateToMonthYearString (new Date(props.date ? props.date : props.backupDate))}
        </InfoContent>
    );
};

const InfoBar = (props) => {

    return (
        <InfoBarStyle {...props}>
            { props.children.filter( data => {
                return data;
            } ).map((data, index, arr) => {
                return (
                    <React.Fragment key={index}>
                        {data}
                        {index < arr.length - 1 ? (
                            <FontAwesomeIcon
                                className="fa-fw"
                                style={{
                                    padding: '0 4px 0 4px',
                                    fontSize: '0.3rem',
                                    opacity: '0.6',
                                    verticalAlign: 'middle'
                                }}
                                icon={faCircle}
                            />
                        ) : null}
                    </React.Fragment>
                );
            })}
        </InfoBarStyle>
    );
};

export default withRouter(InfoBar);
