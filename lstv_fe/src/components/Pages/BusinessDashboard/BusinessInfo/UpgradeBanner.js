import React from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types'
import theme from '../../../../styledComponentsTheme';
import { PromotionButton } from '../Menu';
import { UserDevice } from '../../../../global/globals';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.primaryPurple};
    border-radius: 10px;
    padding: 20px 40px;
    color: white;
    h4 {
        font-family: Calibre;
        white-space: nowrap;
        font-weight: 600;
        font-size: 1.312rem;
        line-height: 1.562rem;
        padding: 0px 20px 0px 0px;  
    }
    p {
        font-size: 1.125rem;
        line-height: 1.5rem;
        padding: 0px 30px; 
        max-width: 350px;
        flex-basis: 60%;
    }
`
const StyledButton = styled(PromotionButton)`
    width: 114px;
    @media ${UserDevice.laptopL} {
        width: 214px;
        
    }
`
const Link = styled.a`
    text-decoration: none;
    
`

const UpgradeBanner = ({message}) => {
    return (
        <Container>
            <h4>Love Stories TV <br /> Premium</h4>
            <p>{message}</p>
            <Link href="mailto:upgrade@lovestoriestv.com"><StyledButton type="button">Upgrade</StyledButton></Link>
        </Container>
    )
}

UpgradeBanner.propTypes = {
    message: PropTypes.string,  
}

UpgradeBanner.defaultProps = {
    message: 'Upgrade your account to access this feature',  
}


export default UpgradeBanner
