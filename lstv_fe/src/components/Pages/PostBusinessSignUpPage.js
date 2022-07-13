import React from 'react';

import { useAuthService } from '../../rest-api/hooks/useAuthService';

import Overlay from './PageSupport/Overlay';

import PageContent from './PageContent';
import SingleSectionLayout from './layouts/SingleSectionLayout';

import { PostBusinessSignUpForm } from '../../newComponents/forms/PostBusinessSignupForm';

import ProgressStepper from './ProgressStep';
import { FormErrorMessage } from './forms/StyledForm';
import { useHideFooter } from '../../newComponents/layout/Layout';


const PostBusinessSignUpPage = () => {
    const { updateBusinessProfile, errorMessages } = useAuthService();
    useHideFooter();

    return (
        <PageContent>
            <Overlay />
            <SingleSectionLayout>
                <ProgressStepper steps={2} currentStep={2} />
                <h1>Create Pro Account</h1>
                <FormErrorMessage errors={errorMessages?.generic} />
                <PostBusinessSignUpForm onSubmit={updateBusinessProfile} />
            </SingleSectionLayout>
        </PageContent>
    );
};

export default PostBusinessSignUpPage;
