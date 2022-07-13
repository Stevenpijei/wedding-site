import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../../global/globals';
import FeaturedWedding from './FeaturedWedding';
import BusinessCards from '../../BusinessCards';
import useMainVideo from '../../../../rest-api/hooks/useMainVideo';
import { couplesNamesFromProperties } from '../../../../utils/LSTVUtils';

const SecondaryMobileLoggedInHero = ({ className, hideScrollController }) => {
    const video = useMainVideo()
    const {videosSources, post_properties, businesses, title, slug} = video
    const coupleNames = couplesNamesFromProperties(post_properties);
    return (
        videosSources && videosSources?.length > 0 ?
        <Container className={className}>
            <FeaturedWedding videoSource={videosSources[0]} title={coupleNames || title} slug={slug}/>
            <BusinessCards hideScrollController={!!hideScrollController}  businesses={businesses} />
        </Container>: null
    );
};

const Container = styled.div`
    margin: 0 60px 0 88px;
    border-top: 1px solid ${LSTVGlobals.MIDGREY};
    display: flex;
    flex-direction: column;
`;

export default SecondaryMobileLoggedInHero;
