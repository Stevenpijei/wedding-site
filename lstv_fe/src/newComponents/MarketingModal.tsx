import React, { useState } from 'react';
import Modal from './Modal';
import BaseCTAButton from './buttons/BaseCtaButton';
import wfaCarouselUrl from '../images/wfa_carousel.png';
import wfaLstvUrl from '../images/wfa_lstv.svg';
import styled from 'styled-components';
import { useMediaReady } from '../utils/LSTVUtils';
import { trackEvent } from '/global/trackEvent';

/**
 * Time before which the popup is never shown. 0 to disable this check.
 */
const startTimestamp = 0;

/**
 * Time after which the popup is never shown. Jun 11, 2021 22:00:00 EST.
 */
const endTimestamp = 1623463200000;

/**
 * If the user dismisses the popup, it will reappear after this duration. 1 week.
 */
const snoozeAfter = 7 * 24 * 60 * 60 * 1000;

/**
 * We store data on past user interactions under this key. For future compaigns,
 * modify the key, and add the old key to this comment to prevent collisions.
 */
const localStorageKey = 'marketingModal_wfa';

/**
 * The data stored in localStorage. If the user dismisses the popup, we store
 * `clickedThru: false` plus the timestamp of the interaction.
 */
type StoredState =
    | {
          clickedThru: true;
          timestamp: null;
      }
    | {
          clickedThru: false;
          timestamp: number;
      };

const WfaCarouselImage = styled.img(({ isMobile }: { isMobile: boolean }) => ({
    height: isMobile ? `285px` : `362px`,
}));

const WfaLstvImage = styled.img(({ isMobile }: { isMobile: boolean }) => ({
    height: isMobile ? `91px` : `168px`,
    marginRight: isMobile ? '21px' : '0',
    marginBottom: isMobile ? '0' : '21px',
}));

const WfaLstvContainer = styled.h1(
    ({ isMobile }: { isMobile: boolean }) => `
  display: flex;
  flex-direction: ${isMobile ? 'row' : 'column'};
  align-items: center;
  font-family: 'Heldane Display';
  font-size: 32px;
  font-weight: 900;
  line-height: 124.4%;
  color: #0C090A;
  text-align: ${isMobile ? 'left' : 'center'};
  margin: 0;
  padding: 0;
`
);

const WfaLstv = ({ isMobile }: { isMobile: boolean }) => (
    <WfaLstvContainer isMobile={isMobile}>
        <WfaLstvImage isMobile={isMobile} src={wfaLstvUrl} />
        Wedding Film Awards 2021
    </WfaLstvContainer>
);

const PseudoLinkContainer = styled.div({
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '100%',
});

const MarketingModal = () => {
    const [open, setOpen] = useState(() => {
        if (location.pathname === '/wedding-film-awards-2021-winners') {
            return false;
        }
        const now = Date.now();
        if (now < startTimestamp || now > endTimestamp) {
            return false;
        }
        const serializedStoredState = localStorage.getItem(localStorageKey);
        if (serializedStoredState === null) {
            return true;
        }
        const storedState: StoredState = JSON.parse(serializedStoredState);
        if (storedState.clickedThru) {
            return false;
        }
        return now > storedState.timestamp + snoozeAfter;
    });

    const [isMobile, ready] = useMediaReady(`(max-width: 830px)`);

    const handleCtaClick = () => {
        const storedState: StoredState = {
            clickedThru: true,
            timestamp: null,
        };
        localStorage.setItem(localStorageKey, JSON.stringify(storedState));
        window.open('https://lovestoriestv.com/wedding-film-awards-2021-winners', '_blank');
        setOpen(false);
        trackEvent('pop_up', {
            event_label: `WFA popup click thru`,
            event_category: 'business_engagement',
            sent_from_button_location: 'popup',
        });
    };

    return (
        <Modal
            // fullHeight
            closeButtonAtEnd
            height={'fit-content'}
            width={'95vw'}
            // id={id}
            open={ready && open}
            onClose={() => {
                const storedState: StoredState = {
                    clickedThru: false,
                    timestamp: Date.now(),
                };
                localStorage.setItem(localStorageKey, JSON.stringify(storedState));
                setOpen(false);
            }}
            data-scroll-lock-scrollable
            customStyles={{
                content: {
                    overflow: 'hidden',
                    maxWidth: '830px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingBottom: isMobile ? '12px' : '28px',
                },
                container: {},
            }}
        >
            {!isMobile && (
                <PseudoLinkContainer onClick={handleCtaClick} style={{ marginBottom: '22px' }}>
                    <WfaCarouselImage src={wfaCarouselUrl} isMobile={isMobile} />
                    <WfaLstv isMobile={isMobile} />
                </PseudoLinkContainer>
            )}
            {isMobile && (
                <PseudoLinkContainer onClick={handleCtaClick} style={{ marginBottom: '36px' }}>
                    <WfaLstv isMobile={isMobile} />
                </PseudoLinkContainer>
            )}
            <BaseCTAButton title={'Check out the winners!'} size={'large'} onClick={handleCtaClick} hideIcon />
            {isMobile && (
                <PseudoLinkContainer onClick={handleCtaClick} style={{ marginTop: '18px' }}>
                    <WfaCarouselImage src={wfaCarouselUrl} isMobile={isMobile} />
                </PseudoLinkContainer>
            )}
        </Modal>
    );
};

export default MarketingModal;
