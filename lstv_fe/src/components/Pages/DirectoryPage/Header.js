import React, { useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useMediaReady } from '/utils/LSTVUtils';
import { UserDevice } from '/global/globals';
import theme from '../../../styledComponentsTheme'
import imageXMobile from '/images/HeroBanner_X_Mobile.svg';
import imageXDesktop from '/images/HeroBanner_X_Desktop.svg';
import imageOMobile from '/images/HeroBanner_O_Mobile.svg';
import imageODesktop from '/images/HeroBanner_O_Desktop.svg';

const Container = styled.div`
    color: white;
    position: relative;
`;

const Background = styled.div`
    background-color: ${props => props.bg_color || theme.business_role_family_color.default_purple};
    background-image: url(${props => props.xOrO ? imageXMobile : imageOMobile});
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    height: 102px;
    padding: 20px;
    margin-bottom: 0px;
    display: flex;
    flex-direction: column;
    
    @media ${UserDevice.tablet} {
        background-image: url(${props => props.xOrO ? imageXDesktop : imageODesktop});
        align-items: center;
        justify-content: center;
        background-size: contain;
        background-position: right;
        height: 268px;
        padding: 0px 30px;
        border-radius: 10px;
        margin-bottom: 0px;
    }
`;

const Title = styled.h1`
    font-family: Heldane Display Test;
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.5rem;
    margin: auto 0px;
    padding: 0px;
    text-align: center;

    @media ${UserDevice.tablet} {
        margin: unset;
        font-size: 3.5rem;
        line-height: 4.125rem;
    }
`

const Description = styled.h2`
    color: black;
    font-family: Calibre;
    font-size: 1.125rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
    letter-spacing: 0em;
    padding: 20px;
    text-align: center;

    @media ${UserDevice.tablet} {
        color: white;
        font-size: 1.312rem;
        font-weight: 600;
        line-height: 1.562rem;
        padding-top: 24px;
    }
`;

const Header = ({ title, description, location, numberInCollection, hideDescription, bg_color }) => {
    const [isDesktop, ready] = useMediaReady(UserDevice.tablet, false)
    const xOrO = useRef(!!Math.round(Math.random()))

    if(!ready) return null

    if(!description) {
        description = `Browse and discover ${title} for your wedding. Search by location to find the perfect pros for you.`
    } else {
        description = description.replace('LOCATION', location || 'any location').replace('NUMBER', numberInCollection || '')
    }

    return (
        <Container>            
            <Background bg_color={bg_color} xOrO={xOrO.current}>
                <Title>{title}</Title>
                {/* desktop, the desc goes in the banner */}
                { (!hideDescription && isDesktop) &&
                    <Description>{description}</Description> 
                }
            </Background>
            {/* mobile, the desc goes beneath */}
            { (!hideDescription && !isDesktop) &&
                <Description>{description}</Description>
            }
        </Container>
    )
}

Header.propTypes = {
    hideDescription: PropTypes.bool,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    bg_color: PropTypes.string,
    numberInCollection: PropTypes.number,
    location: PropTypes.string,
}

export default Header
