import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { UserDevice, PAGE_CONTENT_BG_COLOR } from '../../global/globals';
import MobileFooter from './MobileFooter';
import theme from '../../styledComponentsTheme';
const appearAnimation = (props) => keyframes`
    0% { bottom: -${props.headerHeight}; }
    90% {bottom: 5px }
    100% {bottom: 0px }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0px;
    height: ${(props) => (props.show ? `calc(100vh - 0px)` : `${props.headerHeight}`)};
    max-height: 100%;
    background-color: ${PAGE_CONTENT_BG_COLOR};
    box-shadow: 0px -3px 4px rgba(178, 178, 178, 0.25);
    border-radius: 4px 4px 0px 0px;
    width: 100vw;
    z-index: 10;
    transition: height 0.6s ease-out;
    animation-name: ${appearAnimation};
    animation-duration: 0.6s;
    animation-timing-function: ease-out;
    overflow-y: scroll;

    @media ${UserDevice.laptop} {
        display: none;
    }
`;

const HeaderWrapper = styled.div`
    position: relative;
    z-index: ${theme.zIndex.specifcPageFooter};
    background: ${theme.white};
`;

const ContentWrapper = styled.div`
    text-align: left;
    background-color: white;
    overflow: scroll;
    //180px is roughly the combined height of header and footer
    height: calc(100% - 180px);
`;

const MobileStickyPanel = ({ header, children, isOpen, headerHeight = '60px', hideMobileFooter, style }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <Container show={isOpen} headerHeight={headerHeight}>
            <HeaderWrapper>{header}</HeaderWrapper>
            <ContentWrapper show={isOpen} style={style?.content}>
                {children}
            {!hideMobileFooter ? <MobileFooter /> : null}
            </ContentWrapper>
        </Container>
    );
};

MobileStickyPanel.propTypes = {
    isOpen: PropTypes.bool,
    hideMobileFooter: PropTypes.bool,
    headerHeight: PropTypes.string,
    children: PropTypes.object,
    header: PropTypes.object,
    style: PropTypes.any,
};

export default MobileStickyPanel;
