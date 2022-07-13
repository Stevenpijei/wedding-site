import styled from 'styled-components';
import theme from '../../styledComponentsTheme';

export const Container = styled.div`
    position: relative;
    background: white;

    @media ${theme.breakpoints.isMobileOrTablet} {
        padding: 0 24px;
    }

    @media ${theme.breakpoints.laptop} {
        border-radius: 80px;
        border: 1px solid ${theme.midGrey};
        display: flex;
        align-items: center;
    }

    &:nth-child(2) {
        &:focus-within {
        }
    }

    &:focus-within {
        .location-input-container:before {
            background: transparent;
        }
    }
`;

export const ButtonContainer = styled.div`
    position: absolute;
    right: 5px;

    button {
        max-width: 112px;
    }

    @media ${theme.breakpoints.isMobileOrTablet} {
        position: static;
        width: 100%;
        margin: 24px 0 0 0;

        button {
            max-width: 100%;
            width: 100%;
        }
    }
`;

export const IconContainer = styled.div`
    height: 24px;
    width: 24px;
`;

export const ClearIconContainer = styled.button`
    position: ${(props) => (props.absolute ? 'absolute' : 'relative')};
    right: ${(props) => (props.absolute ? '115px' : 0)};
    opacity: ${(props) => (props.visible ? 1 : 0)};
    height: 18px;
    width: 18px;
    border: none;
    background: none;
    margin: 0 16px 0 0;
    transition: all 0.2s ease-in;
    cursor: pointer;
    transition opacity: 0.3ms ease-in-out;

    svg {
        stroke: none;
        fill: ${theme.primaryPurple};
        width: 12px;
        height: 12px;
    }
`;

export const InputContainer = styled.div`
    display: flex;
    align-items: center;
    height: 59px;
    width: 100%;
    padding: 0 0 0 24px;
    transition: background-color 0.15s ease-in, color 0.15s ease-in;

    @media ${theme.breakpoints.isMobileOrTablet} {
        border: 1px ${theme.midGrey} solid;
    }

    &:focus-within {
        background-color: ${theme.lightGrey};
        box-shadow: 0px 0px 6px rgba(186, 186, 186, 0.25);
        color: black;
    }
`;

export const FreeTextContainer = styled(InputContainer)`
    position: relative;

    @media ${theme.breakpoints.isMobileOrTablet} {
        border-top: 1px ${theme.midGrey} solid;
        border-radius: 10px 10px 0 0;
    }

    @media ${theme.breakpoints.laptop} {
        width: 55%;
        border: none;

        &:focus-within {
            border-radius: 80px;
            border-right: 1px solid ${theme.midGrey};
        }
    }
`;

export const TextInput = styled.input`
    -webkit-appearance: none;
    appearance: none;
    height: 100%;
    width: 100%;
    padding: 0 0 0 16px;
    background: transparent;
    transition: all 100ms ease-in;
    color: black;

    &::placeholder {
        font-weight: 500;
        font-family: Calibre;
        font-size: 1.175em;
        color: ${theme.darkGrey};
    }

    &:focus {
        &::placeholder {
            color: black;
        }
    }
`;