import {
    containerFluid,
    defaultFont,
    primaryColor,
    defaultBoxShadow,
    infoColor,
    successColor,
    warningColor,
    dangerColor,
    whiteColor,
    grayColor,
} from 'assets/tss/material-dashboard-pro-react';

const headerStyle = () => ({
    appBar: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '0',
        marginBottom: '0',
        position: 'absolute',
        width: '100%',
        paddingTop: '10px',
        zIndex: '1029',
        color: grayColor[6],
        border: '0',
        borderRadius: '3px',
        padding: '10px 0',
        transition: 'all 150ms ease 0s',
        minHeight: '50px',
        display: 'block',
    },
    container: {
        ...containerFluid,
        minHeight: '50px',
    },
    flex: {
        flex: 1,
    },
    title: {
        ...defaultFont,
        display: 'flex',
        lineHeight: '30px',
        fontSize: '24px',
        borderRadius: '3px',
        textTransform: 'none',
        color: 'inherit',
        padding: '0.625rem 0.3rem',
        margin: '0 !important',
        letterSpacing: 'unset',
        '&:hover': {
            background: '#dddddd',
            color: 'inherit',
        },
        '&:focus': {
            color: 'inherit',
        },
        '&:active': {
            background: '#cccccc',
        },
    },
    primary: {
        backgroundColor: primaryColor[0],
        color: whiteColor,
        ...defaultBoxShadow,
    },
    info: {
        backgroundColor: infoColor[0],
        color: whiteColor,
        ...defaultBoxShadow,
    },
    success: {
        backgroundColor: successColor[0],
        color: whiteColor,
        ...defaultBoxShadow,
    },
    warning: {
        backgroundColor: warningColor[0],
        color: whiteColor,
        ...defaultBoxShadow,
    },
    danger: {
        backgroundColor: dangerColor[0],
        color: whiteColor,
        ...defaultBoxShadow,
    },
    sidebarMinimize: {
        float: 'left',
        padding: '0 0 0 15px',
        display: 'block',
        color: grayColor[6],
    },
    sidebarMinimizeRTL: {
        padding: '0 15px 0 0 !important',
    },
    sidebarMiniIcon: {
        width: '20px',
        height: '17px',
    },
});

export default headerStyle;
