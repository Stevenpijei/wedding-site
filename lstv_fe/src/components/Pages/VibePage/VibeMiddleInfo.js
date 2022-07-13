import React, { useState } from 'react';
import styled from 'styled-components';

import theme from '../../../styledComponentsTheme';
import { useMediaReady } from '../../../utils/LSTVUtils';

import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import {
    Section,
    SectionTitle,
    SectionSubtitle,
    SectionContent,
} from '../../../newComponents/layout/TwoColumnLayoutBlocks';

const MiddleInfoContainer = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    margin: 16px 0 24px 0;
    max-height: ${(props) => (props.open ? '9999px' : '0')};
    overflow-y: hidden;
    transition: max-height 0.7s linear;

    @media ${theme.breakpoints.isMobileOrTablet} {
        display: flex;
        flex-direction: column-reverse;
    }
`;

const ImageContainer = styled.div`
    height: 100%;
    width: 100%;
    border-radius: 10px;
`;

const Image = styled.img`
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;

    @media ${theme.breakpoints.isMobileOrTablet} {
        margin: 24px 0 8px 0;
    }
`;

const SecondaryHeader = styled(SectionTitle)`
    margin: 48px 0;
    line-height: 2.5rem;
`;
const SecondaryText = styled.p`
    line-height: 1.5em;
`;

const Description = styled(SectionSubtitle)`
    line-height: 1.5em;
`;

const ImageCredit = styled.p`
    text-align: center;
    margin: 8px 0 0 0;
`

const MiddleInfoText = styled.div`
    margin: 0 48px 0 0;
`;

const VibeMiddleInfo = ({ content }) => {
    const {
        middle_info_header_1,
        middle_info_text_1,
        middle_info_header_2,
        middle_info_image_url,
        middle_info_text_2,
        middle_info_image_credit,
    } = content || {};
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);
    const [expend, setExpend] = useState(false);

    const onToggleReadMore = () => {
        setExpend(!expend);
    };

    return ready ? (
        <Section>
            <SectionTitle>{middle_info_header_1}</SectionTitle>
            <SectionContent>
                <Description>{middle_info_text_1}</Description>
                <MiddleInfoContainer open={expend || !isMobile}>
                    <MiddleInfoText>
                        <SecondaryHeader>{middle_info_header_2}</SecondaryHeader>
                        <Description>{middle_info_text_2}</Description>
                    </MiddleInfoText>
                    <ImageContainer>
                        <Image src={middle_info_image_url} />
                        <ImageCredit>{middle_info_image_credit}</ImageCredit>
                    </ImageContainer>
                </MiddleInfoContainer>
                {isMobile ? (
                    <BaseCTAButton
                        hideIcon
                        size="fullWidthMedium"
                        title={`Read ${expend ? 'less' : 'more'}`}
                        onClick={onToggleReadMore}
                    />
                ) : null}
            </SectionContent>
        </Section>
    ) : null;
};

export default VibeMiddleInfo;
