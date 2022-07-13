import axios from 'axios';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import styled from 'styled-components';
import useSWR from 'swr';
import { Container } from '../Style';
import { BusinessInformationForm } from './BusinessInformationForm';
import CardThumbnail from './CardThumbnailForm';
import ProfilePhotoForm from './ProfilePhotoForm';
import { SocialLinksForm } from './SocialLinksForm';
import { USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING } from '/global/globals';

const LoaderContainer = styled.div`
    margin: 16px 0 0 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Loader = styled.div`
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
`;

function useBusiness(id) {
    const fetcher = (url) => axios.get(url).then((res) => res.data.result);
    const { data, error, mutate } = useSWR(`${API_URL}/v1/business/${id}`, fetcher);

    // TODO: the form values and the business object values don't quite match
    // so there needs to be a mapping on patchedValues before mutating.
    // For example, it's business.name not business.business_name
    async function mutateBusiness(patchedValues) {
        return mutate(async (business) => ({
            ...business,
            ...patchedValues,
        }));
        // return mutate(async (business) => (console.log('business', business)));
    }

    return {
        business: data,
        isLoading: !error && !data && (
            <Loader>
                <BeatLoader size={24} color={'#fff072'} loading={true} />
            </Loader>
        ),
        isError: error,
        mutate: mutateBusiness,
    };
}

const BusinessInfo = () => {
    let history = useHistory();

    const user = useSelector((state) => state.user);
    const { business, isLoading, isError, mutate } = useBusiness(user.businessId);

    useEffect(() => {
        if (user.userType === USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING) {
            history.push('/edit-profile-pro');
        }
    }, [user]);

    if (isError) {
        return (
            <LoaderContainer>
                <p>There was a network error</p>
            </LoaderContainer>
        );
    }

    if (isLoading) return isLoading;

    return (
        business &&
            <Container>
                <BusinessInformationForm user={user} business={business} mutate={mutate} />
                <ProfilePhotoForm business={business} />
                <CardThumbnail business={business} />
                {/* TODO: Remove conditional when other premium forms are implemented */}
                {(business.subscription_level !== 'free' || business.social_links.length > 0) && (
                    <SocialLinksForm business={business} mutate={mutate} />
                )}
            </Container>
    );
};

export default BusinessInfo;
