import React from 'react';
import styled from 'styled-components';
import { useMediaReady } from '../../../utils/LSTVUtils';
import { trackEvent } from '../../../global/trackEvent'

import VideoCard from '../VideoPage/VideoCard';
import theme from '../../../styledComponentsTheme';
import { ContactBusinessButton } from '../../Forms/LSTVInlineContactButtons';

const Container = styled('div')`
    @media ${theme.breakpoints.isWithinTablet} {
        margin: 20px;
    }
`;

const BusinessHero = ({ video, business, isAutoPlay }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);

    const onClickContact = () => {
        trackEvent('vendor_contact', {
            event_label: `contact - ${business.name}`,
            event_category: 'business_engagement',
            sent_from_button_location: 'body',
        });
    };

    const Cta = () => {
        return (
            <ContactBusinessButton
                business={business}
                tooltip={`Contact ${business.name}`}
                title={`Contact`}
                onClickCallback={onClickContact}
            />
        );
    };

    const calcSubTitle = () => {
        if (business?.roles[0]?.slug) {
            return `${business?.roles[0].name}: ${business.name}`;
        } else {
            return `${business.name}`;
        }
    };

    return (
        ready && (
            <Container>
                <VideoCard
                    data={video}
                    isBusiness
                    subTitle={calcSubTitle()}
                    isDesktop={!isMobile}
                    hideDetails={false}
                    style={{ container: style.container }}
                    CustomCTA={<Cta />}
                    isAutoPlay={isAutoPlay}
                />
            </Container>
        )
    );
};

const style = {
    container: {
        padding: 0,
    },
};

export default BusinessHero;
