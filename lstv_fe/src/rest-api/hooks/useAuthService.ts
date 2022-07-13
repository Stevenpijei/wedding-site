import React from 'react';
import { useState } from 'react';
import authService from '../services/authService';
import { useHistory, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { userLoginSuccess, userLogout } from '../../store/actions';
import { useServerErrors } from './useServerErrors';
import {
    USER_TYPE_CONSUMER,
    USER_TYPE_VENDOR_TEAM_MEMBER,
    USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING,
} from '../../global/globals';
import { IStore } from '/store/store';

const querystring = require('querystring');

export const adaptResponseToUser = (response: any = {}) => ({
    uid: response.uid,
    firstName: response.first_name,
    lastName: response.last_name,
    profileThumbnail: response.profile_thumbnail_url,
    email: response.email,
    userType: response.user_type,
    businessName: response.business_name,
    businessRoles: response.business_roles,
    teamMemberPermissions: response.team_member_permissions,
    businessThumbnail: response.business_thumbnail_url,
    businessSlug: response.business_slug,
    businessId: response.business_id,
    subscriptionLevel: response.subscription_level
});

export const useAuthService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();
    const [result, setResult] = useState();
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const [redirectUrl, setRedirectUrl] = React.useState();

    const user = useSelector((state: IStore) => state.user);
    const loggedIn = useSelector((state: IStore) => state.user.loggedIn);

    React.useEffect(() => {
        const queryParams = querystring.parse(location.search && location.search.substring(1));
        setRedirectUrl(queryParams.from);
    }, [location]);

    const onLoginSuccess = (response) => {
        return dispatch(userLoginSuccess(adaptResponseToUser(response)));
    };

    const goToEditProfile = (userType) =>
        history.push({
            pathname:
                userType === USER_TYPE_VENDOR_TEAM_MEMBER || userType === USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING
                    ? '/edit-profile-pro'
                    : '/edit-profile',
            search: location.search,
        });

    const goToSignUp = () =>
        history.push({
            pathname: '/sign-up',
            search: location.search,
        });

    const goToSignUpPro = () =>
        history.push({
            pathname: '/sign-up-pro',
            search: location.search,
        });

    const goToSignIn = () =>
        history.push({
            pathname: '/sign-in',
            search: location.search,
        });

    const goToRedirectOrHome = () => history.push(redirectUrl || '/');

    const goToLogin = () => {
        // Redirect user if they came from any route not in NO_REDIRECT_ROUTES
        const NO_REDIRECT_ROUTES = ['/', '/sign-in', '/sign-up', '/edit-profile'];
        const redirectTo = NO_REDIRECT_ROUTES.includes(location.pathname) ? `` : `?from=${location.pathname}`;
        history.push(`/sign-in${redirectTo}`);
    };

    return {
        // TODO: Can we just remove the result state?
        loggedIn,
        user,
        result,
        errorMessages,
        goToLogin,
        goToSignIn,
        goToSignUp,
        goToSignUpPro,
        updateUserProfile(data) {
            return authService.updateUserProfile(data).then(
                ( data ) => {
                    setResult(data);
                    history.push(redirectUrl || '/');
                },
                (error) => {
                    analyzeServerErrors(error);
                }
            );
        },
        updateBusinessProfile(data) {
            const shouldConvertBusinessTypes =
                Array.isArray(data.business_roles) && data.business_roles[0] && data.business_roles[0].value;
            if (shouldConvertBusinessTypes) {
                data.business_roles = data.business_roles.map(({ value }) => value).join(', ');
            }

            return authService.updateBusinessProfile(data).then(
                (result) => {
                    const business = {
                        ...user,
                        businessRoles: result.business_roles,
                        businessName: result.business_name,
                        businessSlug: result.business_slug,
                        businessId: result.business_id,
                        location: result.location,
                        teamMemberPermissions: result.team_member_permissions,
                        businessThumbnail: result.business_thumbnail_url,
                        userType: USER_TYPE_VENDOR_TEAM_MEMBER,
                    };  
                    // console.log("business", business)

                    dispatch(userLoginSuccess(business));
                    goToRedirectOrHome();
                },
                (error) => {
                    return Promise.reject(analyzeServerErrors(error));
                    //analyzeServerErrors(error?.data?.errors);
                    //throw new Error(error)
                }
            );
        },
        redirectIfAuthenticated() {
            if (loggedIn) {
                history.replace('/');
            }
        },

        signInWithOAuthForGuest(payload) {
            return authService.loginWithOAuth(payload, USER_TYPE_CONSUMER).then(
                ( {data}) => {
                    console.log(data);
                    setResult(data);
                    onLoginSuccess(data);

                    if (data.isNewUser || data['post-signup-interview-required']) {
                        goToEditProfile(data.user_type);
                    } else {
                        goToRedirectOrHome();
                    }
                },
                (error) => {
                    analyzeServerErrors(error);
                }
            );
        },
        signInWithOAuthForBusinessTeamMember(payload) {
            return authService.loginWithOAuth(payload, USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING).then(
                ({data}) => {
                    console.log(data);
                    setResult(data);
                    onLoginSuccess(data);

                    if (data.isNewUser || data['post-signup-interview-required']) {
                        goToEditProfile(data.user_type);
                    } else {
                        goToRedirectOrHome();
                    }
                },
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },

        signUpAndClaimBusiness(businessSlug: string, claimData: {
            code: string,
            email: string,
            first_name: string,
            last_name: string,            
            password: string,            
        }): Promise<any/* TFIXME */> {
            return authService.signUpAndClaimBusiness(businessSlug, claimData)
                .then(
                    data => {
                        setResult(data)
                        onLoginSuccess(data)
                        // really should have all these routes somewhere as constants
                        history.push('/dashboard/info')
                    },
                    error => analyzeServerErrors(error)
                )
        },

        verifyAccountClaim(code: string): Promise<any /* TSFIXME */> {
            return authService.verifyAccountClaim(code)
        },

        /*
              _                                  __                    __            __
          ___(_) __ _ _ __        _   _ _ __    / /   _ ___  ___ _ __ / / ____      _\ \
         / __| |/ _` | '_ \ _____| | | | '_ \  | | | | / __|/ _ \ '__/ / '_ \ \ /\ / /| |
         \__ \ | (_| | | | |_____| |_| | |_) | | | |_| \__ \  __/ | / /| |_) \ V  V / | |
         |___/_|\__, |_| |_|      \__,_| .__/  | |\__,_|___/\___|_|/_/ | .__/ \_/\_/  | |
                |___/                  |_|      \_\                    |_|           /_/

         */

        signUpWithEmailAndPassword(data) {
            return authService.signUpWithEmailAndPassword(data).then(
                (data) => {
                    setResult(data);
                    onLoginSuccess(data);
                    goToEditProfile(data.user_type);
                },
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        handleOAuthFailure(error) {
            analyzeServerErrors(error.details);
        },

        /*
              _                   _          __                    __           __
          ___(_) __ _ _ __       (_)_ __    / /   _ ___  ___ _ __ / /____      _\ \
         / __| |/ _` | '_ \ _____| | '_ \  | | | | / __|/ _ \ '__/ / _ \ \ /\ / /| |
         \__ \ | (_| | | | |_____| | | | | | | |_| \__ \  __/ | / / (_) \ V  V / | |
         |___/_|\__, |_| |_|     |_|_| |_| | |\__,_|___/\___|_|/_/ \___/ \_/\_/  | |
                |___/                       \_\                                 /_/

         */

        signInWithEmailAndPassword(data) {
            return authService.signInWithEmailAndPassword(data).then(
                (result) => {
                    setResult(result);
                    onLoginSuccess(result);

                    if (result['post-signup-interview-required']) {
                        goToEditProfile(result.user_type);
                    } else {
                        goToRedirectOrHome();
                    }
                },
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
        signOut() {
            return authService
                .signOut()
                .then(
                    (result) => {},
                    (error) => {
                        console.error(error);
                    }
                )
                .then(() => {
                    // Dispatch logout, whether or not logout works
                    dispatch(userLogout());
                    goToRedirectOrHome();
                });
        },
        resetPasswordStart(email) {
            return authService.resetPasswordStart(email).then(
                (result) => {
                    setResult(result);
                },
                (error) => {
                    analyzeServerErrors(error);
                }
            );
        },
        resetPasswordFinish({ password, code }) {
            return authService.changePassword({ password, code }).then(
                (res) => {
                    setResult(res.data.result);
                    return res
                },
                (error) => {
                    return analyzeServerErrors(error);
                }
            );
        },
    };
};
