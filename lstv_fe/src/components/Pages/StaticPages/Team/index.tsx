import React from 'react'
import styled from 'styled-components'
import StaticPageLayout from '../StaticPageLayout'
import members from './content'
import TeamAvatar from './TeamAvatar'

const MembersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
`

const TeamPage = () => {
  return (
    <StaticPageLayout headerText='Meet Our Team' wideContent>
      <MembersGrid>
        { members.map((member, index) => <TeamAvatar key={index} member={member} />) }
      </MembersGrid>
    </StaticPageLayout>
  )
}

export default TeamPage
