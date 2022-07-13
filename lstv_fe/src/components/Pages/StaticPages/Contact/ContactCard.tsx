import React from 'react';
import styled from 'styled-components';
import theme from '../../../../styledComponentsTheme';
import { ContactPoint } from './content';

const ContactCardContainer = styled.a({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '198px',
  width: '264px',
  backgroundColor: theme.lightGrey,
  border: `1px solid ${theme.midGrey}`,
  borderRadius: '20px',
  padding: '10px',
  marginBottom: '30px',
  textDecoration: 'none',
  ':hover': {
    boxShadow: `0px 0px 14px 0px rgba(169,169,169,0.25)`,
    color: 'inherit',
  }
});

const Title = styled.div({
  marginTop: '11px',
  textAlign: 'center',
  fontWeight: '600' as any,
  fontSize: '21px',
  lineHeight: '24.61px',
});

const Link = styled.div({
  marginTop: '2px',
  color: theme.primaryPurple,
  fontSize: '18px',
  fontWeight: '600' as any,
  lineHeight: '21.09px',
});

const ContactCard = ({ contactPoint: { title, email, icon: Icon } }: { contactPoint: ContactPoint }) => {
  return (
    <ContactCardContainer target="_blank" rel="noreferrer" href={`mailto:${email}`}>
      <Icon />
      <Title>{title}</Title>
      <Link>
        {email}
      </Link>
    </ContactCardContainer>
  );
};

export default ContactCard;
