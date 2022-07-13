import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import ContentShareWidget from '../../Utility/ContentShareWidget';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import { ShopIcon, ContactPhoneIcon, ContactEmailIcon, ContactWebsiteIcon } from '../../../components/Utility/LSTVSVG'
import { OutlinedCTAButton } from '../../../components/Utility/OutlinedCTALink';
import { ContactBusinessButton } from '../../Forms/LSTVInlineContactButtons';

import theme from '../../../styledComponentsTheme';
import { ACTION_BAR_OWNER_TYPE_BUSINESS } from '../../../global/globals';
import { getSocialIconByNetwork } from '../../../utils/LSTVUtils';
import { useAuthService } from '../../../rest-api/hooks/useAuthService';
import { useModals } from '../../../global/use-modals';
import { trackEvent } from '../../../global/trackEvent';

const Container = styled('div')`
    padding: 15px 20px 20px;
    max-width: 100%;
`;

const Details = styled('div')`
    display: flex;
    margin: 0 0 15px 0;
`;

const ShareIconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: 0 0 0 auto;

    svg {
        transform: scale(1.5);
    }
`;

const TopTitle = styled('p')`
    font-size: 1.25rem;
    font-family: Calibre;
`;

const Title = styled('h1')`
    font-size: 2rem;
    font-weight: 800;
    padding: 0;
    margin: 4px 0 2px;
`;

const Location = styled('p')`
    font-size: 1.125em;
    font-family: Calibre;
    font-weight: 600;
`;

const Description = styled('div')`
    margin: 0 0 24px 0;
`;

const DescriptionContent = styled('p')`
    display: block;
    font-size: 1.125em;
    line-height: 130.7%;
    max-height: ${(props) => (props.open ? '1000px' : '92px')};
    overflow-y: hidden;
    transition: max-height 0.7s linear;
`;

export const ThumbnailContainer = styled.div`
    height: 72px;
    width: 72px;
    margin: auto;
`;

export const Thumbnail = styled('img')`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
`;

const DescriptionExpandButton = styled('button')`
    margin-top: 8px;
    font-size: 1.125em;
    font-weight: 600;
    background: none;
    text-decoration: underline;
    cursor: pointer;
`;

const Footer = styled('div')`
    display: flex;
    flex-direction: column;
    margin: 25px 0 0 0;
`;

const SocialLink = styled('a')`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border-radius: 50%;

    text-decoration: none;
    padding-top: 14px;
    padding-bottom: 14px;

    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;

    border: 2px solid;

    box-sizing: border-box;
    border-radius: 90px;

    transition: all 0.3s ease;

    cursor: pointer;

    &:hover {
        color: ${(props) => (props.dark ? props.theme.black : props.theme.white)};
        border-color: ${(props) => (props.dark ? props.theme.white : props.theme.primaryPurple)};
        background-color: ${(props) => (props.dark ? props.theme.white : props.theme.primaryPurple)};

        svg {
            fill: white;
            stroke: white;
        }
    }
`;

const SubscribeButton = styled(OutlinedCTAButton)`
    max-width: 130px;
    width: 100%;
    height: 40px;
    margin: 16px 0 0 0;
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

const SocialIcons = styled('div')`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min-content, 40px));
    grid-gap: 17px;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    margin: 0 8px 0 0;
`;

const ContactDetails = styled('div')`
    margin: 16px 0;
    overflow: hidden;
`;

const Brand = styled('div')`
    flex: 1;
    margin: ${(props) => (props.hasImage ? '0 0 0 10px' : 'none')};
`;
const PremiumBadge = styled.div`
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* width: 70px; */
    line-height: 25px;
    padding: 0 10px;
    margin-bottom: 10px;
    background: ${theme.primaryPurple};
    border-radius: 4px;
    font-weight: 500;
    color: white;
    text-align: center;
`;

const ContactDetailContainer = styled('a')`
    display: flex;
    text-decoration: none;
    height: 48px;
    align-items: center;
    padding-left: 3px;
    border-bottom: 1px solid ${theme.midGrey};
`;

const ContactDetailCaption = styled('div')`
    font-size: 1.125em;
    font-weight: 600;
    margin-left: 14px;
`;

const ContactDetail = ({ href, type, name, children, id, isPremium }) => (
  <ContactDetailContainer
    {...{ href }}
    target="_blank"
    rel="noreferrer"
    onClick={() => {
      trackEvent('vendor_contact', {
        event_label: `${type} - ${name}`,
        event_category: 'business_engagement',
        sent_from_button_location: 'sidebar',
        method: type,
        vendor: name,
        vendor_id: id,
        is_premium: isPremium
      })
    }}
  >
    {type === 'phone' ? (
      <ContactPhoneIcon />
    ) : type === 'email' ? (
      <ContactEmailIcon />
    ) : type === 'website' ? (
      <ContactWebsiteIcon />
    ) : null}
    <ContactDetailCaption>{children}</ContactDetailCaption>
  </ContactDetailContainer>
)

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 10px 0;
`;

const BusinessInfo = ({
    id,
    slug,
    name,
    email,
    socialLinks,
    phones,
    website,
    altContactCTALink,
    altContactCTALabel,
    location,
    roles,
    thumbnailUrl,
    profileImageUrl,
    description,
    isPremium,
    withThumbnail,
    isFashion,
    isUserSubscribed,
    onSubscribe,
}) => {
    const { loggedIn } = useAuthService();
    const { openLoginModal } = useModals();
    const [expandDescription, setExpandDescription] = useState(false);

    const onClickContact = () => {
        trackEvent('vendor_contact', {
          event_label: `contact - ${name}`,
          event_category: 'business_engagement',
          sent_from_button_location: 'sidebar',
          method: 'form',
          vendor: name,
          vendor_id: id,
          is_premium: isPremium
        });
    }

    const toggleDescription = () => {
        setExpandDescription(!expandDescription);
    };

    const goToBusinessSite = () => {
        window.open(altContactCTALink ? altContactCTALink : website, '_blank');
    };

    const handleSubscribe = () => {
        if (!loggedIn) {
            openLoginModal();
            return;
        }

        onSubscribe();
    };

    return (
        <Container>
            <Header>
                <ShareIconContainer>
                    <ContentShareWidget
                        ownerType={ACTION_BAR_OWNER_TYPE_BUSINESS}
                        ownerId={id}
                        shareOptions={{
                            title: name,
                            shareThumbnailUrl: thumbnailUrl,
                        }}
                        shareThumbnailUrl={thumbnailUrl}
                    />
                </ShareIconContainer>
            </Header>
            {isPremium ? <PremiumBadge>Suggested</PremiumBadge> : null}
            <Details>
                {isPremium || withThumbnail ? (
                    <ThumbnailContainer>
                        <Thumbnail src={profileImageUrl || thumbnailUrl} />
                    </ThumbnailContainer>
                ) : null}
                <Brand hasImage={isPremium || withThumbnail}>
                    <TopTitle>{roles?.map(({ name }) => name).join(', ')}</TopTitle>
                    <Title>{name}</Title>
                    <Location>{location}</Location>
                </Brand>
            </Details>
            <Description>
                <DescriptionContent open={expandDescription}>{description}</DescriptionContent>
                {description && description.length > 200 ? (
                    <DescriptionExpandButton onClick={toggleDescription}>
                        Read {expandDescription ? 'Less' : 'More'}
                    </DescriptionExpandButton>
                ) : null}
            </Description>
            {isFashion ? (
                website ? (
                    <BaseCTAButton
                        title={altContactCTALabel ? altContactCTALabel : 'Find a Store'}
                        icon={isFashion ? <ShopIcon fillColor={theme.white} /> : undefined}
                        onClick={goToBusinessSite}
                    />
                ) : null
            ) : (
                <ContactBusinessButton
                    business={{ name, roles, thumbnailUrl, slug }}
                    tooltip={`Contact ${name}`}
                    title={`Contact`}
                    onClickCallback={onClickContact}
                    dsm
                    size={'medium'}
                />
            )}

            <ContactDetails>
              {phones && phones?.length ? (
                <ContactDetail href={`tel:${phones[0].link_phone_number}`} type="phone" {...{ name, id, isPremium }}>
                  Call Us
                </ContactDetail>
              ) : null}
              {isPremium && email ? (
                <ContactDetail href={`mailto: ${email}`} type="email" {...{ name, id, isPremium }}>
                  Send Message
                </ContactDetail>
              ) : null}
              {isPremium && website && (
                <ContactDetail href={website} type="website" {...{ name, id, isPremium }}>
                  Website
                </ContactDetail>
              )}
            </ContactDetails>

            <Footer>
                <SocialIcons>
                    {socialLinks?.map(({ link, type }) => (
                        <SocialLink key={link} href={link} target="_blank">
                            {getSocialIconByNetwork(type)}
                        </SocialLink>
                    ))}
                </SocialIcons>
                <SubscribeButton onClick={handleSubscribe} isSubscribed={isUserSubscribed}>
                    {isUserSubscribed ? 'Subscribed' : 'Subscribe'}
                </SubscribeButton>
            </Footer>
        </Container>
    );
};

export default BusinessInfo;
