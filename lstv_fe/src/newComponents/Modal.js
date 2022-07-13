import PropTypes from 'prop-types';
import React, { useLayoutEffect } from 'react';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import styled from 'styled-components';
import { CloseIcon } from '../components/Utility/LSTVSVG';
import { UserDevice } from '../global/globals';
import theme from '../styledComponentsTheme';
import BaseCTAButton from './buttons/BaseCtaButton';

const Modal = (props) => {
    const {
        open,
        onClose,
        showCloseButton,
        closeButtonAtEnd,
        height,
        width,
        customStyles,
        bigCloseButton,
        children,
        fullHeight,
        title,
        shouldDisableScroll,
        contentRef
    } = props;

    useLayoutEffect(() => {
        if (open && shouldDisableScroll) {
            disablePageScroll();
        } else {
            enablePageScroll();
        }
        return () => {
            enablePageScroll();
        };
    }, [open]);

    const fullHeightCalc = fullHeight ? `100vh` : `calc(100vh - ${theme.headerHeight})`;

    return (
        <>
            {open && (
                <>
                    <Overlay open={open} fullHeightCalc={fullHeightCalc} />
                    <Container
                        open={open}
                        fullHeightCalc={fullHeightCalc}
                        fullHeight={fullHeight}
                        style={customStyles && customStyles.container}
                        {...props}
                    >
                        <Content
                            ref={contentRef}
                            height={height}
                            width={width}
                            style={customStyles && customStyles.content}
                            fullHeight={fullHeight}
                            data-scroll-lock-scrollable
                        >
                            {showCloseButton && (
                                <CloseContainer closeButtonAtEnd={closeButtonAtEnd}>
                                    {bigCloseButton ? (
                                        <div>
                                            <BaseCTAButton
                                                title="Close"
                                                size="fullWidthMedium"
                                                iconLeft
                                                icon={<CloseIcon fillColor="white" strokeColor="none" />}
                                                onClick={onClose}
                                            />
                                        </div>
                                    ) : (
                                        <CloseButton onClick={onClose}>
                                            <CloseIcon fillColor={'white'} strokeColor="none" />
                                        </CloseButton>
                                    )}
                                    {title && <TitleText>{title}</TitleText>}
                                </CloseContainer>
                            )}
                            {children}
                        </Content>
                    </Container>
                </>
            )}
        </>
    );
};

const Container = styled('div')(({ style, open }) => ({
    zIndex: theme.zIndex.uberModalOrVeil,
    position: 'fixed',
    top: open ? '0px' : '100vh',
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    transition: 'top 0.3s linear',
    ...style,
    '*': {
        'box-sizing': 'border-box',
    },
}));

const Overlay = styled('div')(({ open }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    opacity: open ? 1 : 0,
    width: '100%',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.65)',
    transition: 'all 0.4s ease-in',
    zIndex: theme.zIndex.modalOverlay,
}));

const Content = styled('div')(({ style, theme, height, width, fullHeight }) => ({
    background: 'white',
    height: fullHeight ? '100%' : height || '100%',
    padding: '20px',
    width: width || '100%',
    borderRadius: fullHeight ? '0px' : '10px',
    [`@media ${theme.breakpoints.laptop}`]: {
        width: width || '60vw',
        height: fullHeight ? '100%' : height || '60%',
        borderRadius: '10px',
    },
    overflow: 'auto',
    ...style,
}));

const CloseContainer = styled('div')(({ closeButtonAtEnd }) => ({
    display: 'flex',
    alignItems: 'center',
    // height: '70px',
    alignSelf: 'flex-start',
    width: '100%',
    flexDirection: closeButtonAtEnd ? 'row-reverse' : 'row',
}));

const TitleText = styled.h5`
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 0.937rem;
    line-height: 1.125rem;
    text-align: center;
    margin: 0 auto;

    @media ${UserDevice.tablet} {
        font-size: 1.125rem;
        line-height: 1.3rem;
        text-align: center;
    }
`;

const CloseButton = styled('button')`
    border-radius: 50%;
    height: 38px;
    width: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.primaryPurple};
    cursor: pointer;
`;

Modal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    showCloseButton: PropTypes.bool,
    closeButtonAtEnd: PropTypes.bool,
    customStyles: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullHeight: PropTypes.bool,
    bigCloseButton: PropTypes.bool,
    title: PropTypes.string,
    children: PropTypes.node,
};

Modal.defaultProps = {
    open: true,
    onClose: () => {},
    showCloseButton: true,
    bigCloseButton: false,
    shouldDisableScroll: true,
};

export default Modal;
