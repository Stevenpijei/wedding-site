import React from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { IBusiness } from './WeddingTeam'
import Flex from '/components/Utility/Flex'
import { ArrowRight, MailIcon } from '/components/Utility/LSTVSVG'
import { useModals } from '/global/use-modals'
import Avatar from '/newComponents/Avatar'
import { trackEvent } from '/global/trackEvent'
import SecondaryIconButton from '/newComponents/buttons/SecondaryIconButton'

const Container = styled.div`
  // fixed height so wedding team container
  // can be set to overflow after exactly 5 items.
  height: 117px;
  padding: 10px;
  box-sizing: border-box;
  background-color: ${props => props.theme.lightGrey};
  border-radius: 10px;
  border: 1px solid ${props => props.theme.midGrey};
  margin: 0 0 10px;
  cursor: pointer;
`

const Name = styled.span`
  margin: 0 16px;
  font-weight: 600;
  font-size: 18px;
`

const Role = styled.span`
  font-weight: 500;
  font-size: 18px;
`

const RoleDot = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 10px;
`

const SuggestedTag = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.theme.white};
  background-color: ${props => props.theme.primaryPurple};
  padding: 3px 10px;
  border-radius: 3px;
`

type ItemProps = {
  videoId: string,
  business: IBusiness
}

const WeddingTeamItem = ({ business, videoId }: ItemProps) => {
  const { openContactBusinessModal } = useModals()
  const history = useHistory()

  const onClick = () => {
    trackEvent('vendor_engagement', {
      'event_label': `visit_vendor_page - ${business.name}`,
      'event_category': 'business_engagement',
      'sent_from_button_location': 'wedding_team_card'
    });

    history.push(`/business/${business.slug}`)
  }

  const onContactClick = e => {
    e.stopPropagation()

    trackEvent('vendor_contact', {
      'event_label': `contact - ${business.name}`,
      'event_category': 'business_engagement',
      'sent_from_button_location': 'wedding_team_card'
    });

    openContactBusinessModal({ business, videoId })
  }

  return (
    <Container onClick={onClick}>
      <Flex align='center' justify='space-between' style={{ marginBottom: 4 }}>
        <Flex align='center'>
          <div style={{ flexShrink: 0 }}>
            <Avatar
              imageSrc={business.logo_image_url}
              size='49px'
              initial={business.name?.slice(0, 1)}
            />
          </div>
          <Name>{ business.name }</Name>
        </Flex>
        { business.premium &&
          <SuggestedTag>Suggested</SuggestedTag>
        }
      </Flex>
      <Flex align='center' justify='space-between'>
        <Flex align='center'>
          <RoleDot color={business.bg_color} />
          <Role>{ business.role_name }</Role>
        </Flex>
        <Flex>
          <SecondaryIconButton
            icon={<MailIcon />}
            onClick={onContactClick}
            style={{ marginRight: 20 }}
          />
          <SecondaryIconButton
            icon={<ArrowRight />}
            onClick={e => {
              e.stopPropagation()
              onClick()
            }}
          />
        </Flex>
      </Flex>
    </Container>
  )
}

export default WeddingTeamItem
