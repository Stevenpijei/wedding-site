import React from 'react';
import { useAuthService } from '../../rest-api/hooks/useAuthService';

import Overlay from './PageSupport/Overlay';
import { SubtitleBold } from '../typography';

import PageContent from './PageContent';
import SingleSectionLayout from './layouts/SingleSectionLayout';

import { PostGuestSignUpForm } from "./forms/PostGuestSignUpForm"

import ProgressStepper from './ProgressStep';
import { FormErrorMessage } from './forms/StyledForm';

import styled from 'styled-components';
import { useHideFooter } from '../../newComponents/layout/Layout';

const UnstyledButton = styled.button`
    all: unset;
    cursor: pointer;
    
    :hover {
        color: ${props => props.theme.primaryPurple};
    }
`

const EditProfilePage = () => {
    const { updateUserProfile, errorMessages } = useAuthService();
    useHideFooter();

    const handleUpdateProfile = (data) => {
        updateUserProfile(data)
    }
    return (
        <PageContent>
            <Overlay />
            <SingleSectionLayout>
                <ProgressStepper steps={2} currentStep={2} />
                <h1>Create Your Profile</h1>
                <FormErrorMessage errors={errorMessages?.generic}/>
                <PostGuestSignUpForm onSubmit={handleUpdateProfile} />
                <UnstyledButton onClick={() => handleUpdateProfile({ skip: true })}>
                    <SubtitleBold>Skip</SubtitleBold>
                </UnstyledButton>
            </SingleSectionLayout>
        </PageContent>
    );
}


export default EditProfilePage;