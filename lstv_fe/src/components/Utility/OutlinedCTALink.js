import styled from 'styled-components';
import { Link } from 'react-router-dom';


export const OutlinedCTALink = styled(Link)`
    width: 254px;

    text-decoration: none;
    padding-top: 14px;
    padding-bottom: 14px;

    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;

    border: 2px solid;

    box-sizing: border-box;
    border-radius: 90px;

    transition: all 0.3s ease;

    cursor: pointer;
    
    &:hover {
        color: ${props => props.dark ?  props.theme.black : props.theme.white};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        background-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }
`


export const OutlinedCTAButton = styled.button`
    width: 254px;

    text-decoration: none;
    padding-top: 14px;
    padding-bottom: 14px;

    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;

    background-color: inherit;
    
    border: 2px solid;
    box-sizing: border-box;
    border-radius: 90px;

    transition: all 0.3s ease;

    &:enabled {
        cursor: pointer;
    }

    &:hover:enabled {
        color: ${props => props.dark ?  props.theme.black : props.theme.white};
        border-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
        background-color: ${props => props.dark ? props.theme.white : props.theme.primaryPurple};
    }

    &:disabled {
        opacity: 20%;
    }
`