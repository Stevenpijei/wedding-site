import React from 'react';
import styled from 'styled-components';
import { Section } from "./LayoutComps";
import WeddingTeamItem from './WeddingTeamItem';
import { UserDevice } from '/global/globals';

const StyledSection = styled(Section)`
  padding: 20px;
  width: unset;

  @media ${UserDevice.tablet} {
    width: 100%;
  }
`

const Container = styled.div`
  // 5 rows
  max-height: 625px;
  overflow: auto;

  @media ${UserDevice.tablet} {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 10px;
    // 2 rows
    max-height: 244px;
  }

  @media ${UserDevice.laptop} {
    display: block;
    // 5 rows
    max-height: 625px;
  }
`;

// TODO: move/combine/abstract this
export interface IBusiness {
  bg_color: string,
  name: string,
  plural: string,
  premium: boolean,
  role_family: string,
  role_name: string,
  role_slug: string,
  singular: string,
  slug: string,
  subscription_level: string,
  weight: number,
  logo_image_url?: string,
}

// AK: why is this not a standard header??
const Title = styled.h2`
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 26px;
`

type Props = {
  isLast?: boolean,
  videoId: string,
  businesses: IBusiness[]
}

// Using Forward ref so I can track the visibility of this section
// eslint-disable-next-line react/display-name
const WeddingTeam = React.forwardRef<HTMLDivElement, Props>(({
  isLast,
  businesses,
  videoId,
  ...props
}: Props, ref) => {
  return (
    <StyledSection {...{ ...props, isLast: isLast || false }}>
      <div ref={ref}>
        <Title>Wedding Team</Title>
        <Container>
          {
            businesses.map((biz, index) =>
              <WeddingTeamItem videoId={videoId} business={biz} key={index} />
            )
          }
        </Container>
      </div>
    </StyledSection>
  )
})

export default WeddingTeam
