import styled from 'styled-components';
import breakpoints from '/global/breakpoints';

export const TwoPanelContainer = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;

    width: 100%;

    @media ${breakpoints.UserDevice.isMobile} {
        padding: 0;
    }
    @media ${breakpoints.UserDevice.isTablet} {
        padding: 0 98px;
    }
`;

export const PurplePanel = styled.div`
    box-sizing: border-box;

    // 100vh - height of Header
    min-height: calc(100vh - 60px);
    max-width: 518px;
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 79px 30px;

    background-color: ${(props) => props.theme.primaryPurple};
    background-image: url(${props => props.bg});
    background-size: cover;

    color: ${(props) => props.theme.white};
    text-align: center;

    @media ${breakpoints.UserDevice.isMobileOrTablet} {
        display: none;
    }
    @media ${breakpoints.UserDevice.isMobile} {
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
    }
`;

export const WhitePanel = styled.div`
    box-sizing: border-box;
    flex: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    overflow: auto;

    background-color: ${(props) => props.theme.white};
    color: ${(props) => props.theme.black};
    text-align: center;

    @media ${breakpoints.isMobileOrTablet} {
        // 100vh - height of Header
        min-height: calc(100vh - 60px);
    }
    @media ${breakpoints.UserDevice.isMobile} {
        padding: 18px 0;
    }

    @media ${breakpoints.UserDevice.isMobileOrTablet} {
        // Force it to break lines on Tablet
        flex: 3 3 100%;
    }
`;
