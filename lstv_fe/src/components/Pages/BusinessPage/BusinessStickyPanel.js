import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../../styledComponentsTheme';

import MobileStickyPanel from '../../../newComponents/layout/MobileStickyPanel';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import { ContactBusinessButton } from '../../../components/Forms/LSTVInlineContactButtons';
import { ArrowRight, ShopIcon } from '../../Utility/LSTVSVG';
import Avatar from '../../../newComponents/Avatar';
import { trackEvent } from '../../../global/trackEvent';

const BusinessStickyPanel = ({ business, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    const handleClick = () => {
        if (!isOpen && !hasOpened) {
            setIsOpen(true);
            setHasOpened(true);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const onClickContact = () => {
        trackEvent('vendor_contact', {
            'event_label': `contact - ${business.name}`,
            'event_category': 'business_engagement',
            'sent_from_button_location': 'mobile_sticky_bar'
        });
    }

    const Header = () => (
        <StickyHeader>
            <StickyHeaderTitle>
                {business.isPremium ? <Avatar imageSrc={business.thumbnailUrl} /> : null}
                <BusinessName>{business.name}</BusinessName>
            </StickyHeaderTitle>

            <Actions>
                {business.isFashion ? (
                    <a href={business?.website} target="_blank" rel="noreferrer">
                        <BaseCTAButton size="iconOnly" icon={<ShopIcon fillColor={theme.white} />} />
                    </a>
                ) : (
                    <ContactBusinessButton
                        id='videographer-contact'
                        business={business}
                        tooltip={`Contact ${business.name}`}
                        title=''                 
                        size='iconOnly'
                        onClickCallback={onClickContact}
                    />
                )}
                <HeaderButton onClick={() => handleClick()}>
                    <IconContainer className={`${isOpen && hasOpened && 'open'} ${!isOpen && hasOpened && 'closing'}`}>
                        <ArrowRight fillColor={theme.white} strokeColor={'none'} />
                    </IconContainer>
                </HeaderButton>
            </Actions>
        </StickyHeader>
    );

    return (
        <MobileStickyPanel isOpen={isOpen} header={<Header />} containerHeight="auto" headerHeight="85px">
            {children}
        </MobileStickyPanel>
    );
};

const StickyHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    z-index: 10;
    background: ${theme.white};
    -webkit-transform: translate3d(0, 0, 0);
`;

const HeaderButton = styled.button`
    height: 51px;
    width: 51px;
    border-radius: 25px;
    color: white;
    margin-left: 10px;
    background-color: ${theme.primaryPurple};
    box-shadow: 0px 0px 24px 0px #000000 25%;
`;

const StickyHeaderTitle = styled.div`
    display: flex;
    width: auto;
    flex: 1;
    align-items: center;
`;

const rotateAnimation = keyframes`
  0% {
    transform: rotate(-90deg);
  }
  100% {
    transform: rotate(90deg);
  }
`;

const IconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: auto;
    transform: rotate(-90deg);
    height: 18px;
    width: 18px;

    &.open {
        transform: rotate(90deg);
        animation-name: ${rotateAnimation};
        animation-duration: 0.6s;
    }

    &.closing {
        animation-name: ${rotateAnimation};
        transform: rotate(-90deg);
        animation-direction: reverse;
        animation-duration: 0.6s;
        animation-timing-function: ease-in;
    }
`;

const Actions = styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BusinessName = styled('h5')`
    margin: 0 0 0 8px;
`;

export default BusinessStickyPanel;
