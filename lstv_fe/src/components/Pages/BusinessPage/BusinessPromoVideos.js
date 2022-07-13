import React from 'react';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';

import LSTVCard, { CARD_TYPE_PROMO_VIDEO } from '../../../newComponents/cards/LSTVCard';
import { VerticalSpacer } from '../../../utils/LSTVUtils';

const Container = styled('div')`
    @media ${theme.breakpoints.isMobileOrTablet} {
        display: flex;
        overflow-x: scroll;
        flex-wrap: no-wrap;
    }
`;

const BusinessPromoVideos = ({ videos, isMobile, onVideoChange }) => {
    const handleClick = (video) => {
        onVideoChange(video);
    };

    return (
        <Container>
            {videos?.map((video) => (
                <>
                    <LSTVCard
                        options={{
                            cardType: CARD_TYPE_PROMO_VIDEO,
                            orientation: isMobile ? 'portrait' : 'landscape',
                            containerMode: 'grid',
                            cardId: video?.id,
                            clickHandler: () => handleClick(video),
                        }}
                        data={{ ...video, thumbnailUrl: video.thumbnail_url }}
                        key={video?.id}
                    />
                    {!isMobile && <VerticalSpacer space={10} />}
                </>
            ))}
        </Container>
    );
};

export default BusinessPromoVideos;
