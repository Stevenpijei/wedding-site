import React from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { keyframes } from 'styled-components';
import { Flex, GenericContainer } from '../../utils/LSTVUtils';
import { pulse } from 'react-animations';

const anim = keyframes`${pulse}`;

const GiantSectionHeaderStyle = styled(GenericContainer)`
    position: relative;
    margin: ${(props) => props.textAlign || 'right'};
    font-size: 3rem;
    line-height: 2.8rem;
    text-transform: uppercase;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_BLACK};
    margin: 0 0 20px 0;
    background-color: #dcdbdb;
    //background-image: ${LSTVGlobals.DIAGONAL_SUBLE_BACKGROUND};
    border-radius: 100px 100px 0 0;

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        margin: 0 0 20px 0;
    }

    @media ${LSTVGlobals.UserDevice.isTablet} {
        margin: 0 0 20px;
        font-size: 2rem;
        line-height: 1.8rem;
        clip-path: polygon(0% 50%, 0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%);
        margin: 20px 0 0 0;
        padding: 20px 0 20px 0;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1.5rem;
        line-height: 1.6rem;
        clip-path: polygon(0% 50%, 0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%);

        padding: 20px 0 20px 0;
        border-radius: 50px 50px 0 0;
        margin: 20px 0 0 0;
        padding: 20px 0 20px 0;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        background-color: #cecece;
        margin: 45px 0 0 0;
    }
`;

const SecondaryStyle = styled(GenericContainer)`
    text-align: left;
    padding: 0 0 0 20px;
    margin: 0 0 0 20px;
    border-left: 0.8rem solid ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    font-size: 2.5rem;
    line-height: 2.7rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
    text-transform: uppercase;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        font-size: 1.5rem;
        line-height: 1.7rem;
        border-left: 0.5rem solid ${LSTVGlobals.TEXT_AND_SVG_BLACK};
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1rem;
        line-height: 1.2rem;
        border-left: 0.3rem solid ${LSTVGlobals.TEXT_AND_SVG_BLACK};
        padding: 0 0 0 15px;
        margin: 0 0 0 15px;
    }
`;

const AnimatedContainer = styled(GenericContainer)`
    animation-name: ${anim};
    animation-duration: 0.8s;
    animation-delay: ${props => 3 + (props.delay * 1)}s;
    
`;

const GiantSectionHeader = (props) => {
    return (
        <GiantSectionHeaderStyle {...props}>
            <Flex justifyContent={'center'} width={'100%'} alignItems={'center'}>
                <GenericContainer textAlign={'right'} textTransform={'uppercase'}>
                    {props.headline.map((data, index) => {
                        return (
                            <React.Fragment key={index}>
                                {data}
                                <br />
                            </React.Fragment>
                        );
                    })}
                </GenericContainer>
                <Flex flexDirection={'column'}>
                    <SecondaryStyle>
                        {props.secondary.map((data, index) => {
                            return (
                                <AnimatedContainer
                                    delay={(index + 1)}
                                    textTransform={'uppercase'}
                                    key={index}
                                >
                                    {data}
                                    <br />
                                </AnimatedContainer>
                            );
                        })}
                    </SecondaryStyle>
                </Flex>
            </Flex>
        </GiantSectionHeaderStyle>
    );
};

export default GiantSectionHeader;
