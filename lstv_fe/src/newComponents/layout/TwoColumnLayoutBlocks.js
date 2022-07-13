import styled, { keyframes } from 'styled-components';

const bounceIn = keyframes`
  from {
    transform: translateY(3.125rem);
    opacity: 0;
  }

  to {
    transform: translateY(0px);
    opacity: 1;
  }
`;

export const Container = styled('main')`
    position: relative;
    display: grid;
    grid-template-columns: [left] 1fr [right] 400px;
    grid-column-gap: 60px;
    padding: 40px;

    @media ${(props) => props.theme.breakpoints.isMobileOrTablet} {
        display: block;
        padding: 0;
    }
`;

export const SectionTitle = styled('h2')`
    font-weight: 800;
    font-size: 2rem;
    margin: 32px 0 0 0;
    max-width: 650px;
`;

export const SectionHeader = styled('div')`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0px 0px 16px 0;
`;

export const SectionSubtitle = styled('p')`
    margin: 8px 0 0 0;
    font-size: 1.25em;
`;

export const Section = styled('div')`
    border-top: 1px solid ${(props) => props.theme.midGrey};
    margin: 56px 0;

    ${(props) =>
        props.hide &&
        `
     border-top: none;
     margin: 0 0;
  `}
`;

export const SectionContent = styled('div')`
    margin: 16px 0 0 0;
`;

export const SectionCtaContainer = styled('div')`
  display: ${(props) => (props.hideDesktop ? 'none' : 'flex')}
  justify-content: center;

  button {
    max-width: 150px;
    height: 37px;
    padding: 0;
  }


  @media ${(props) => props.theme.breakpoints.isMobileOrTablet} {
    display: flex;
    width: 100%;

    button {
      width: 100%;
      max-width: unset;
      height: 56px;
    }
  }
`;

export const InfoCardContainer = styled('div')`
    position: relative;
    bottom: 0;
    max-width: 400px;
    border-radius: 4px;
    box-shadow: 0px 0px 6px ${(props) => props.theme.cardDropShadow};
    background: ${(props) => props.theme.white};

    @media ${(props) => props.theme.breakpoints.isMobileOrTablet} {
        margin: 28px auto 0 auto;
        max-width: 100%;
    }
`;

export const MapContainer = styled('div')`
    min-height: 300px;
    margin: 24px 0 0 0;

    div {
        border-radius: 10px;
    }
`;

export const Content = styled('div')`
    @media ${(props) => props.theme.breakpoints.isMobileOrTablet} {
        padding: 16px;
    }
`;

export const DesktopContainer = styled('div')`
    flex: 1;
`;

export const Sidebar = styled('div')`
    position: relative;
`;

export const StickyInfoCardContainer = styled(InfoCardContainer)`
    position: sticky;
    z-index: 1;
    top: 164px;
    max-height: ${(props) => (props.hasDescription ? '50rem' : '30rem')};
    width: 100%;
    border-radius: 4px;
    box-shadow: 0px 0px 6px ${(props) => props.theme.cardDropShadow};
    background: ${(props) => props.theme.white};
    transition: all 0.15s ease-in;
    animation: ${bounceIn} 300ms linear;
`;
