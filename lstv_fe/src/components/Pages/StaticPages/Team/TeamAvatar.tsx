import React from 'react'
import styled from 'styled-components'
import { TeamMember } from "./content"
import theme from '../../../../styledComponentsTheme'

type ImageProps = {
  src: string
}

const Container = styled.div`
  text-align: center;
  width: 175px;
  margin: 25px 20px;
  
  @media ${theme.breakpoints.tablet} {
    margin: 30px 20px;
  }

  @media ${theme.breakpoints.laptop} {
    margin: 40px;
  }
`

const Image = styled.img<ImageProps>`
  background-image: url(${props => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 115px;
  height: 115px;
  border-radius: 50%;
  margin-bottom: 10px;
`

const Name = styled.p`
  font-size: 21px;
  font-weight: 600;
  margin-bottom: 10px;
`

const Title = styled.p`
  font-size: 16px;
  font-weight: 500;
`

const TeamAvatar = ({ member }: { member: TeamMember }) =>
  <Container>
    <Image src={member.imageUri} />
    <Name>{ member.name }</Name>
    <Title>{ member.title }</Title>
  </Container>

export default TeamAvatar