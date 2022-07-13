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

const BottomInfoContainer = styled.div`
    margin: 0 0 16px 0;
    max-height: ${(props) => (props.open ? '9999px' : '0')};

    overflow: visible;

    @media ${theme.breakpoints.isMobileOrTablet} {
        transition: max-height 0.7s linear;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
    }
`;

const Image = styled.img`
    max-width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;

    @media ${theme.breakpoints.isMobileOrTablet} {
        margin: 24px 0 8px 0;
    }
`;

const OverImage = styled(Image)`
    transform: translate(-25px, 50px);

    overflow: visible;
    max-height: 500px;
    width: 100%;
`;

const SecondaryHeader = styled(SectionTitle)`
    line-height: 2.5rem;
    margin-bottom: 45px;
    margin-right: 50px;
    text-align: left;
`;
const SecondaryText = styled(SectionSubtitle)`
    line-height: 1.5em;
`;

const BottomContent = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
`

const ImageCredit = styled.p`
    text-align: center;
`

const OverImageCredit = styled.p`
    transform: translate(-25px, 50px);
    text-align: center;
`;

const VibeBottomInfo = ({ content }) => {
    const {
        bottom_info_header_1,
        bottom_info_text_1,
        bottom_info_image_url_credit_1,
        bottom_info_image_url_credit_2,
        bottom_info_image_url_1,
        bottom_info_image_url_2,
        bottom_info_text_2,
    } = content || {};
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);
    const [expend, setExpend] = useState(false);

    const onToggleReadMore = () => {
        setExpend(!expend);
    };

    return ready ? (
        <Section>
            <SectionTitle>{bottom_info_header_1}</SectionTitle>
            <SectionContent>
                <SecondaryText>{bottom_info_text_1}</SecondaryText>
                <BottomInfoContainer open={expend || !isMobile}>
                    {isMobile ? (
                        <>
                            <Image src={bottom_info_image_url_1} />
                            <ImageCredit>{bottom_info_image_url_credit_1}</ImageCredit>
                            <SecondaryHeader>{bottom_info_text_2}</SecondaryHeader>
                            <Image src={bottom_info_image_url_2} />
                            <ImageCredit>{bottom_info_image_url_credit_2}</ImageCredit>
                        </>
                    ) : (
                        <BottomContent>
                            <div>
                                <SecondaryHeader>{bottom_info_text_2}</SecondaryHeader>
                                <Image src={bottom_info_image_url_1} />
                                <ImageCredit>{bottom_info_image_url_credit_1}</ImageCredit>
                            </div>
                            <div>
                                <OverImage src={bottom_info_image_url_2} />
                                <OverImageCredit>{bottom_info_image_url_credit_2}</OverImageCredit>
                            </div>
                        </BottomContent>
                    )}
                </BottomInfoContainer>
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

export default VibeBottomInfo;
