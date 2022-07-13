import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useMediaReady } from '../../../utils/LSTVUtils';
import { VENDOR_ROLE_VIDEOGRAPHER } from '../../../global/globals'

import VideoCard from '../VideoPage/VideoCard';
import theme from '../../../styledComponentsTheme';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';

const Container = styled('div')`
    @media ${theme.breakpoints.isWithinTablet} {
        margin: 20px;
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
`

const BusinessHero = ({ post }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);

    const mainBusiness = post?.businesses?.find((business) => business.role_slug === VENDOR_ROLE_VIDEOGRAPHER);

    const Cta = () => {
        return (
            <StyledLink to={`/business/${mainBusiness.slug}`}>
                <BaseCTAButton title={mainBusiness.name} />
            </StyledLink>
        );
    };

    return (
        ready && (
            <Container>
                <VideoCard
                    data={post}
                    isDesktop={!isMobile}
                    hideDetails={isMobile}
                    style={{ container: style.container }}
                    CustomCTA={<Cta />}
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
