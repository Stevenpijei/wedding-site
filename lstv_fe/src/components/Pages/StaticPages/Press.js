import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';
import mediaIcons1 from '../../../images/media_icons1.png';
import mediaIcons2 from '../../../images/media_icons2.png';
import mediaIcons3 from '../../../images/media_icons3.png';
import mediaIcons4 from '../../../images/media_icons4.png';
import LSTVLink from '../../Utility/LSTVLink';
import Text from './commonComponents/Text';
import Title from './commonComponents/Title';
import StaticPageLayout from './StaticPageLayout';

const Press = ({}) => {
    return (
        <StaticPageLayout headerText="Press">
            <Title>Love Stories TV is the new way to plan your wedding.</Title>

            <Text>
                We use real wedding videos to connect engaged couples with pros, products, and ideas for their weddings.
                We have the fastest growing wedding channel on YouTube, we are the only wedding company with a Snap
                Discover Channel, and we reach of millions of engaged couples and wedding enthusiasts across our site
                and social channels every month.{' '}
            </Text>

            <Text>
                For all media inquiries, please contact{' '}
                <a className="lstvLink" rel={'noreferrer'} target={'_blank'} href="mailto:pr@lovestoriestv.com">
                    pr@lovestoriestv.com
                </a>{' '}
                including inquiries about The Wedding Film Awards and Bridal Fashion Month.
            </Text>
            <MediaIconsContainer>
                <IconsStrip src={mediaIcons1} />
                <IconsStrip src={mediaIcons2} />
                <IconsStrip src={mediaIcons3} />
                <IconsStrip src={mediaIcons4} />
            </MediaIconsContainer>
        </StaticPageLayout>
    );
};

const MediaIconsContainer = styled.div`
    @media ${LSTVGlobals.UserDevice.isMobile} {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`;

const IconsStrip = styled.img`
    @media ${LSTVGlobals.UserDevice.tablet} {
        width: 24%;
    }
`;

export default Press;
