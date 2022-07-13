import React from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom';

import { useAuthService } from '../../rest-api/hooks/useAuthService';

import { TwoPanelContainer, PurplePanel, WhitePanel } from './layouts/TwoPanelLayout';

import {LabelWithSeparator, SubtitleBold, SubtitleBoldLarger} from '../typography';

import { OutlinedCTAButton } from '../Utility/OutlinedCTALink';

import BackgroundWavesSVG from '../../images/background-artwork-waves-sign-in.svg';
import SocialLogins from './SocialLogins';

import SignUpForm from './forms/SignUpForm';
import { FormErrorMessage } from './forms/StyledForm';
import { ProgressStepper } from './ProgressStep';
import useMedia from 'use-media';
import breakpoints from '../../global/breakpoints';

import {
    USER_TYPE_VENDOR_TEAM_MEMBER,
    USER_TYPE_CONSUMER,
    USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING
} from '../../global/globals';
import { useHideFooter } from '../../newComponents/layout/Layout';
import {VerticalSpacer} from "../../utils/LSTVUtils";
import {JoinLink} from "./HomePage/MainHeroSection/JoinLink";


const SignUpPage = ({ isBusiness }) => {
    const {
        errorMessages,
        signUpWithEmailAndPassword,
        signInWithOAuthForGuest,
        signInWithOAuthForBusinessTeamMember,
        handleOAuthFailure,
        redirectIfAuthenticated,
        goToSignIn,
    } = useAuthService();
    useHideFooter();
    const isMobileOrTablet = useMedia(breakpoints.UserDevice.isMobileOrTablet);

    React.useEffect(() => {
        redirectIfAuthenticated();
    }, []);

    const handleOnSubmit = (data) => {
        data.type = getUserType()
        let res = signUpWithEmailAndPassword(data);
        console.log(res);
        return res;
    }
    
    const handleLoginWithOAuth = (oauthPayload) => {
        if (getUserType() === USER_TYPE_CONSUMER)
            signInWithOAuthForGuest(oauthPayload);
        else
            signInWithOAuthForBusinessTeamMember(oauthPayload);
    };

    const getUserType = () => (isBusiness ? USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING : USER_TYPE_CONSUMER);

    return (
        <TwoPanelContainer>
            <WhitePanel>
                <ProgressStepper steps={2} currentStep={1} />
                <h1>{isBusiness ? 'Create a Pro Account' : 'Create An Account'}</h1>
                <FormErrorMessage errors={errorMessages}/>
                <SignUpForm
                    isBusiness={isBusiness}
                    onSubmit={handleOnSubmit}
                    responseErrors={errorMessages?.response_errors}
                />
                { isBusiness ?
                    <SubtitleBold>
                        Not a wedding professional? <Link to="/sign-up">Join here</Link>
                    </SubtitleBold> :
                    <SubtitleBold>
                        Wedding professional?  <Link to="/sign-up-pro">Join here</Link>
                    </SubtitleBold>
                }                    
                <LabelWithSeparator>Or</LabelWithSeparator>
                <SocialLogins loginWithOAuth={handleLoginWithOAuth} handleOAuthFailure={handleOAuthFailure} />
                { isMobileOrTablet &&
                    <div>
                        <SubtitleBold>
                            Already have an account? <Link to="/sign-in">Sign In</Link>
                        </SubtitleBold>
                    </div>
                }
            </WhitePanel>
            <PurplePanel bg={BackgroundWavesSVG}>
                <h1 style={{ marginBottom: '28px' }}>Already Registered?</h1>
                <OutlinedCTAButton dark onClick={goToSignIn}>
                    Sign In
                </OutlinedCTAButton>

                { !isBusiness &&
                    <>
                        <VerticalSpacer space={100}/>
                        <SubtitleBoldLarger>Are you a wedding professional?</SubtitleBoldLarger>
                        <JoinLink textColor="#fff" title={"Join as a Pro"}/>
                    </>
                }
            </PurplePanel>
        </TwoPanelContainer>
    );
};

SignUpPage.propTypes = {
    isBusiness: PropTypes.bool,
};

SignUpPage.defaultProps = {
    isBusiness: false,
};

export default SignUpPage;
