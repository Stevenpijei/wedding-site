import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import { useAuthService } from '../../rest-api/hooks/useAuthService';

import { TwoPanelContainer, WhitePanel, PurplePanel } from './layouts/TwoPanelLayout';
import BackgroundBirdsSVG from '../../images/background-artwork-birds-sign-up.svg';

import { OutlinedCTAButton } from '../Utility/OutlinedCTALink';
import {LabelWithSeparator, SubtitleBold, SubtitleBoldLarger} from '../typography';

import { FormErrorMessage } from './forms/StyledForm';
import { SignInForm } from './forms/SignInForm';

import SocialLogins from './SocialLogins';

import PageContent from './PageContent';
import useMedia from 'use-media';
import breakpoints from '../../global/breakpoints';
import { useHideFooter } from '../../newComponents/layout/Layout';
import {error} from "cogo-toast";
import {JoinLink} from "./HomePage/MainHeroSection/JoinLink";
import {VerticalSpacer} from "../../utils/LSTVUtils";



export const SignInPage = () => {
    //const [errors, setErrors] = useState(null);
    const {
        errorMessages,
        signInWithOAuthForGuest,
        handleOAuthFailure,
        signInWithEmailAndPassword,
        redirectIfAuthenticated,
        goToSignUp,
    } = useAuthService();
    useHideFooter();

    const isMobileOrTablet = useMedia(breakpoints.UserDevice.isMobileOrTablet);

    React.useEffect(() => {
        redirectIfAuthenticated();
    }, []);

    return (
        <PageContent>
            <TwoPanelContainer>
                <WhitePanel>
                    <h1>Sign In</h1>
                    <FormErrorMessage errors={errorMessages}/>
                    <SignInForm onSubmit={signInWithEmailAndPassword} />
                    <Link to="/forgot-password">
                        <SubtitleBold>Forgot your password?</SubtitleBold>
                    </Link>
                    <LabelWithSeparator>Or</LabelWithSeparator>
                    <SocialLogins userType='guest' loginWithOAuth={signInWithOAuthForGuest} handleOAuthFailure={handleOAuthFailure} />
                    {isMobileOrTablet && (
                        <div>
                            <SubtitleBold>
                                Don&apos;t have an account? <Link to="/sign-up">Sign Up</Link>
                            </SubtitleBold>
                            <JoinLink />
                        </div>
                    )}
                </WhitePanel>

                <PurplePanel bg={BackgroundBirdsSVG}>
                    <h1 style={{ marginBottom: '28px' }}>Join Now</h1>
                    <OutlinedCTAButton dark onClick={goToSignUp}>
                        Sign Up
                    </OutlinedCTAButton>
                    <VerticalSpacer space={100}/>
                    <SubtitleBoldLarger>Are you a wedding professional?</SubtitleBoldLarger>
                    <JoinLink textColor="#fff" title={"Join as a Pro"}/>
                </PurplePanel>
            </TwoPanelContainer>
        </PageContent>
    );
};

export default SignInPage;
