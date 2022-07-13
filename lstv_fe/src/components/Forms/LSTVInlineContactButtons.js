import React, { useState } from 'react';
import { TEXT_AND_SVG_LIGHTER_BLACK, PRIMARY_COLOR, SUPER_FAST_EASE_OUT_ANIM, UserDevice } from '../../global/globals';
import styled from 'styled-components';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/pro-light-svg-icons';
import ModalContainer from '../Utility/ModalContainer';
import BrideGroomContactForm from './BrideGroomContactForm';
import { useModals }  from '../../global/use-modals'
import BaseCTAButton from '../../newComponents/buttons/BaseCtaButton';
import { MailIcon } from '../../components/Utility/LSTVSVG';

const ContactButtonStyle = styled.div`
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    position: relative;
    color: ${TEXT_AND_SVG_LIGHTER_BLACK};
    padding: 2px 8px 2px 8px;
    border: 1px solid ${TEXT_AND_SVG_LIGHTER_BLACK};
    border-radius: 999px;
    transition: all ${SUPER_FAST_EASE_OUT_ANIM};
    cursor: pointer;
    height: ${(props) => props.height || '1rem'};

    &:hover {
        color: ${PRIMARY_COLOR};
        border: 1px solid ${PRIMARY_COLOR};
    }

    @media ${UserDevice.isMobileOrTablet} {
        padding: 2x 5px 2px 5px;
    }
`;

export const ContactBrideAndGroomButton = (props) => {
    const [open, setOpen] = useState(false);

    let form = (
        <ModalContainer
            id={'bride-groom-contact'}
            open={open}
            closeHandler={() => {
                setOpen(false);
            }}
            modalTitle={'Message ' + props.coupleNames}
        >
            <BrideGroomContactForm
                id={'venue-contact-form'}
                coupleNames={props.coupleNames}
                contactFrom={window.location.pathname}
                message={`I watched your wedding video and I wanted to ask...`}
            />
        </ModalContainer>
    );

    return (
        <>
            {form}
            <ContactButtonStyle
                {...props}
                data-tip={props.tooltip}
                data-for={'mainTooltip'}
                onClick={() => {
                    setOpen(true);
                }}
            >
                <FontAwesomeIcon className="fa-fw" icon={faComment} />
            </ContactButtonStyle>
        </>
    );
};

export const ContactBusinessButton = ({
    title,
    business,
    videoId,
    message,
    CustomButtonComp = undefined,
    tooltip,
    size,
    onClickCallback,
    dsm
}) => {
    const { openContactBusinessModal } = useModals()
    const onClick = () => {
        onClickCallback && onClickCallback()
        openContactBusinessModal({ business, videoId, message });
    }
    return CustomButtonComp ? (
        <div onClick={onClick}>
            <CustomButtonComp data-for='mainTooltip' data-tip={tooltip} />{' '}
        </div>
    ) : (
        <BaseCTAButton
            data-for='mainTooltip'
            data-tip={tooltip}
            title={title}
            size={size}
            icon={<MailIcon fillColor='white' strokeColor='none' />}
            onClick={onClick}
            dsm={dsm}
        />
    );
};

ContactBusinessButton.propTypes = {
    title: PropTypes.string,
    business: PropTypes.object, // should be typed eventually
    videoId: PropTypes.string,
    message: PropTypes.string,
    CustomButtonComp: PropTypes.element,
    tooltip: PropTypes.string,
    size: BaseCTAButton.propTypes.size,
    onClickCallback: PropTypes.func,
    dsm: PropTypes.bool
}