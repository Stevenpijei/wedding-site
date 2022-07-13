import React from 'react';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';

import Avatar from '../../../newComponents/Avatar';

const Members = styled('div')`
  display: grid;
  grid-template-columns: repeat(min(4, ${(props) => props.teamSize}), 1fr);
  grid-gap: 32px;

  @media ${theme.breakpoints.isWithinMobile} {
    grid-template-columns: repeat(min(2, ${(props) => props.teamSize}), 1fr);
  }
`;

const AvatarContainer = styled('div')`
  margin: 0 auto 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled('h5')`
  font-family: Calibre;
  font-weight: 700;
  font-size: 1.25em;
  margin: 12px 0 0 0;
  text-align: center;
`;

const Role = styled('p')`
  margin: 0 0 12px 0;
`
const Description = styled('p')`
  font-size: 0.975em;
  text-align: left;
  margin-bottom: 15px;
`

const Member = styled('div')`

  text-align: ${props => props.teamSize < 3 ? "left" : "center"};
`

const BusinessTeam = ({team}) => {
    return (
        <Members teamSize={team.length}>
            {team?.map(({thumbnailUrl, headshot_image_url, name, title, description}) => (
                <Member key={name}>
                    <AvatarContainer key={name}>
                        <Avatar
                            imageSrc={headshot_image_url || thumbnailUrl}
                            initial={name?.slice(0, 1)}
                            size={'100px'}
                        />
                    </AvatarContainer>
                    <Title>{name}</Title>
                    <Role>{title}</Role>
                    {description.split("\\n").map((d, index) => {
                            console.log(d);
                            return <Description key={index} teamSize={team.length}>{d || ''}</Description>
                        }
                    )}

                </Member>
            ))}
        </Members>
    );
};

export default BusinessTeam;
