import React from 'react';
import styled from 'styled-components';
import useMedia from 'use-media';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import FacebookLoginButtonSVG from '../../images/social-login-button-facebook.svg';
import FacebookLoginButtonMobileSVG from '../../images/social-login-button-facebook-mobile.svg';
import GoogleLoginButtonSVG from '../../images/social-login-button-google.svg';
import GoogleLoginButtonMobileSVG from '../../images/social-login-button-google-mobile.svg';

import breakpoints from '../../global/breakpoints';

export const SocialLogins = ({ loginWithOAuth, handleOAuthFailure }) => (
    <SocialLoginRow>
        <FacebookLogin
            appId="1202364220127674"
            fields="first_name,last_name,email,picture"
            callback={loginWithOAuth}
            onFailure={handleOAuthFailure}
            isMobile={false}
            render={(renderProps) => <FacebookLoginButton {...renderProps} />} />
        <GoogleLogin
            clientId="787829919361-tkhpnmpm6p7me0711o1kdlhlmhe1l3u8.apps.googleusercontent.com"
            buttonText="Sign up with Google"
            onSuccess={loginWithOAuth}
            onFailure={handleOAuthFailure}
            cookiePolicy={'single_host_origin'}
            render={(renderProps) => <GoogleLoginButton {...renderProps} />} />
    </SocialLoginRow>
);

export const SocialLoginRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 20px;
`;

const SocialMediaButton = styled.button`
    background-color: transparent;
    cursor: pointer;
    margin: 0 8px;
    
    &:hover {
        opacity: 0.8;
    }
`

const SocialMediaButtonIcon = styled.img`
    box-shadow: 0px 0px 6px ${props => props.theme.darkGrey};
    border-radius: 90px;
`

const HiddenAccessibleTextSpan = styled.span`
    width: 1px;
    height: 1px;
    overflow: hidden;
    position: absolute;
`

export const FacebookLoginButton = (props) => {
    const isMobile = useMedia(breakpoints.UserDevice.isMobile);

    return (
        <SocialMediaButton {...props} style={{ backgroundColor: 'transparent' }}>
            <SocialMediaButtonIcon
                src={isMobile ? FacebookLoginButtonMobileSVG : FacebookLoginButtonSVG}
            />
            <HiddenAccessibleTextSpan style={{}}>
                Sign in with Facebook
               </HiddenAccessibleTextSpan>
        </SocialMediaButton>
    );
}

export const GoogleLoginButton = (props) => {
    const isMobile = useMedia(breakpoints.UserDevice.isMobile);

    return (
        <SocialMediaButton {...props} style={{ backgroundColor: 'transparent' }}>
            <SocialMediaButtonIcon border src={isMobile ? GoogleLoginButtonMobileSVG : GoogleLoginButtonSVG} />
            <HiddenAccessibleTextSpan style={{ width: '1px', height: '1px', overflow: 'hidden', position: 'absolute' }}>
                Sign in with Google
            </HiddenAccessibleTextSpan>
        </SocialMediaButton>
    );
}
export default SocialLogins