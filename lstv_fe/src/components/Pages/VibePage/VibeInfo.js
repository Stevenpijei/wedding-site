import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { OutlinedCTAButton } from '../../Utility/OutlinedCTALink';
import theme from '../../../styledComponentsTheme';
import ContentShareWidget from '../../Utility/ContentShareWidget';
import { ACTION_BAR_OWNER_TYPE_VIBE } from '../../../global/globals';
import { useTagService } from '../../../rest-api/hooks/useTagService';
import { useAuthService } from '../../../rest-api/hooks/useAuthService';
import { useModals } from '../../../global/use-modals';

const Container = styled('div')`
    padding: 32px 16px;
    max-width: 100%;
`;

const Details = styled('div')`
    margin: 0 0 24px 0;
`;

const ShareIconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: 0 0 16px auto;
    transform: scale(1.5);
`;

const Title = styled('h1')`
    font-size: 2rem;
    font-weight: 800;
    padding: 0;
    margin: 0 0 16px 0;
`;

const Description = styled('div')``;

const DescriptionContent = styled('p')`
    display: block;
    font-size: 1.125em;
    max-height: ${(props) => (props.open ? '500px' : '80px')};
    overflow-y: hidden;
    transition: max-height 0.7s linear;
`;

const DescriptionExpandButton = styled('button')`
    margin-top: 8px;
    font-weight: Calibre;
    font-size: 1.125em;
    font-weight: bold;
    background: none;
    text-decoration: underline;
    cursor: pointer;
`;

const Footer = styled('div')`
    display: flex;
    margin: 32px 0 0 0;
`;

const SubscribeButton = styled(OutlinedCTAButton)`
    max-width: 130px;
    width: 100%;
    height: 40px;
    padding: 0;
    border-radius: 20px;

    background: ${(props) => (props.isSubscribed ? theme.primaryPurple : theme.white)};
    color: ${(props) => (props.isSubscribed ? theme.white : theme.black)};
    transition: background-color 0.3s ease;

    ${(props) =>
        props.isSubscribed
            ? css`
                  border: none;
              `
            : ''}
`;

const VibeInfo = ({ name, title, description, slug, isLocation, videosCount }) => {
    const [expandDescription, setExpandDescription] = useState(false);
    const {
        subscribeTag,
        subscribeLocation,
        unsubscribeLocation,
        isSubscribedToTag,
        isSubscribedToLocation,
        unsubscribeTag,
    } = useTagService();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { loggedIn } = useAuthService();
    const { openLoginModal } = useModals();

    const fallbackTitle = `${videosCount > 0 ? videosCount.toLocaleString('en-US', {maximumFractionDigits:2}): ""} ${name} Wedding Videos To Inspire Your Big Day`;
    const fallbackDescription = `Planning a ${name} wedding? Watch real ${name} wedding videos and explore ${name} wedding vendors to find ideas and pros for your big day.`;

    useEffect(() => {
        if (loggedIn) {
            verifySubscription();
        }
    }, []);

    const verifySubscription = async () => {
        if (isLocation) {
            const request = await isSubscribedToLocation(slug);
            setIsSubscribed(request);
        } else {
            const request = await isSubscribedToTag(slug);
            setIsSubscribed(request);
        }
    };

    const toggleDescription = () => {
        setExpandDescription(!expandDescription);
    };

    const handleSubscribe = async () => {
        if (!loggedIn) {
            openLoginModal();
            return;
        }

        if (isLocation) {
            handleSubscribeToLocation(slug);
            return;
        }

        handleSubscribeToTag();
    };

    const handleSubscribeToTag = async () => {
        if (isSubscribed) {
            await unsubscribeTag(slug);
            setIsSubscribed(false);
            return;
        }

        await subscribeTag(slug);
        setIsSubscribed(true);
    };

    const handleSubscribeToLocation = async () => {
        if (isSubscribed) {
            await unsubscribeLocation(slug);
            setIsSubscribed(false);
            return;
        }

        await subscribeLocation(slug);
        setIsSubscribed(true);
    };

    return (
        <Container>
            <ShareIconContainer>
                <ContentShareWidget
                    ownerType={ACTION_BAR_OWNER_TYPE_VIBE}
                    ownerId={slug}
                    shareOptions={{
                        title,
                    }}
                />
            </ShareIconContainer>
            <Details>
                <Title>{title || fallbackTitle}</Title>
                <Description>
                    <DescriptionContent open={expandDescription}>
                        {description || fallbackDescription}
                    </DescriptionContent>
                    {description && description?.length > 160 ? (
                        <DescriptionExpandButton onClick={toggleDescription}>Read More</DescriptionExpandButton>
                    ) : null}
                </Description>
            </Details>
            <Footer>
                <SubscribeButton isSubscribed={isSubscribed} onClick={handleSubscribe}>
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </SubscribeButton>
            </Footer>
        </Container>
    );
};

export default VibeInfo;
