import styled from 'styled-components';
import * as LSTVGlobals from '../../global/globals';

export const SectionHeader = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    margin-bottom: ${(props) => props.marginBottom || '20px'};
    width: 100%;
    text-align: ${(props) => props.textAlign || 'center'};
    font-family: 'Dancing Script';
`;

export const HighriseAdContainer = styled.div`
    margin: 20px auto;
`;

export const LoveClubIconContainer = styled.div`
    position: absolute;
    transform: translateX(-50%);
    right: -21px;
    top: -29px;
    width: 40px;
    height: 40px;
    filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4));

    @media ${LSTVGlobals.UserDevice.tablet} {
        right: 0px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        right: -15px;
    }
`;

export const Content = styled.div`
    display: flex;

    flex-direction: column;
    overflow: hidden;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        flex-direction: column;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        flex-direction: row;
    }
`;

export const ContentLeft = styled.div`
    flex-direction: row;
    flex-wrap: wrap;
    background: ${LSTVGlobals.CONTENT_LEFT_BG_COLOR};

    @media ${LSTVGlobals.UserDevice.isTablet} {
        flex: ${(props) => props.flex || '0 0 100%'};
        flex-direction: column;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        flex-direction: row;
        flex: 1;
    }
`;

export const ContentRight = styled.div`
    display: flex;
    align-items: flex-start;
    align-content: flex-start;
    flex-direction: row;
    overflow: visible;
    flex-wrap: wrap;
    padding: 10px 10px 5px 10px;
    background: ${(props) => props.background || LSTVGlobals.CONTENT_RIGHT_BG_COLOR};
    

    @media ${LSTVGlobals.UserDevice.laptop} {
        flex: ${(props) => props.flexLaptop || '0 0 500px'};
        //border-left: 1px dashed #eee;
    }
`;


