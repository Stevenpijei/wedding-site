import React, { useState } from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {isMobileOnly } from 'react-device-detect';
import {
    generateLocationJSX,
    generateBusinessRoleJSX,
    generateVenueNameJSX,
    GenericContainer,
    businessFromVideo,
} from '../../utils/LSTVUtils';

import InlineLabelAndContent from '../Utility/InlineLabelAndContent';
import { generateWeddingDateJSX } from '../../utils/LSTVUtils';
import LSTVLink from '../Utility/LSTVLink';
import { ContactBrideAndGroomButton, ContactBusinessButton } from '../Forms/LSTVInlineContactButtons';
import {faEllipsisV} from "@fortawesome/pro-light-svg-icons";

const LSTVVideoInfoBarStyle = styled(GenericContainer)`
    display: inline;
    font-size: 1.2em;
    line-height: 1.5em;
    text-align: ${(props) => props.textAlign || 'left'};
    background: ${(props) => props.background || 'transparent'};
`;

const LSTVVideoInfoBar = (props) => {

    let embeddedFontSize = isMobileOnly ? (props.embedded ? '4vw' : '1em') : props.embedded ? '2.8vw' : '1em';

    if (props.embeddedSize) {
        if (props.embeddedSize.width < 300) embeddedFontSize = '16px';
    }

    let coupleNames = props.postProperties['spouse_1'] + ' & ' + props.postProperties['spouse_2'];

    return (
        <LSTVVideoInfoBarStyle {...props}>
            {/* Event Date */}
            <InlineLabelAndContent embedded={props.embedded}>
                {generateWeddingDateJSX(
                    props.video.event_date,
                    LSTVGlobals.FONT_WEIGHT_NORMAL,
                    'inherit',
                    null,
                    props.embedded
                )}
            </InlineLabelAndContent>{' '}
            {/* Couple Names */}
            {!props.embedded && !props.linkToVideo ? (
                coupleNames
            ) : (
                <LSTVLink
                    to={props.embedded ? props.directLink : props.slug}
                >{coupleNames}</LSTVLink>
            )}{' '}

            {/* Contact Couple */}
            {!props.embedded && props.contactCouple && (
                <ContactBrideAndGroomButton
                    id={'bride-groom-contact'}
                    coupleNames={coupleNames}
                    contactFrom={window.location.pathname}
                    message={`I watched your wedding video and I wanted to ask...`}
                    tooltip={'Message The Bride & Groom'}
                />
            )}


            <FontAwesomeIcon
                className="fa-fw"
                style={{
                    padding: '0 2px 0 2px',
                    verticalAlign: 'middle',
                    color: LSTVGlobals.SECONDARY_CARD_TEXT_COLOR
                }}
                icon={faEllipsisV}
            />

            {/* Filmmaker */}by{' '}
            {generateBusinessRoleJSX(
                props.video.businesses,
                'videographer',
                LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                '1em',
                null,
                'inline',
                null,
                false,
                props.embedded
            )}
            {/* Contact videographer */}{' '}
            {!props.embedded && props.contactBusinesses && (
                <ContactBusinessButton
                    id={'videographer-contact'}
                    business={businessFromVideo(
                        props.video.businesses,
                        'videographer'
                    )}
                    videoId={props.video.id}
                    tooltip={'Contact The Videographer'}
                    title={
                        'Contact ' +
                        businessFromVideo(
                            props.video.businesses,
                            'videographer'
                        ).name
                    }
                    message={
                        `I watched ${coupleNames}'s wedding video on Love Stories TV, in which you are tagged as ` +
                        `the videographer. I'm impressed and would like to inquire about your services for my ` +
                        `upcoming wedding.`
                    }
                />
            )}


            <FontAwesomeIcon
                className="fa-fw"
                style={{
                    padding: '0 2px 0 2px',
                    verticalAlign: 'middle',
                    color: LSTVGlobals.SECONDARY_CARD_TEXT_COLOR
                }}
                icon={faEllipsisV}
            />


            {/* Venue */}
            at{' '}
            {generateVenueNameJSX(
                props.video.businesses,
                LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
                '1em',
                null,
                'inline',
                props.embedded
            )}{' '}
            {/* Venue Contact */}
            {!props.embedded && props.contactBusinesses && (
                <ContactBusinessButton
                    id={'venue-contact'}
                    business={businessFromVideo(
                        props.video.businesses,
                        'venue'
                    )}
                    videoId={props.video.id}
                    tooltip={'Contact The Wedding Venue'}
                    title={
                        'Contact ' +
                        businessFromVideo(
                            props.video.businesses,
                            'venue'
                        ).name
                    }
                    message={
                        `I watched ${coupleNames}'s wedding video on Love Stories TV held at your wedding venue. ` +
                        `I'm impressed and would like to inquire about your services for my ` +
                        `upcoming wedding.`
                    }
                />
            )}

            {/* Location */}{' '}
            {generateLocationJSX(
                props.video.location,
                LSTVGlobals.FONT_WEIGHT_NORMAL,
                '1em',
                null,
                'inline',
                'in',
                props.embedded
            )}

        </LSTVVideoInfoBarStyle>
    );
};

export default LSTVVideoInfoBar;
