import styled from 'styled-components';
import transparentPurpleDotsSmall from '../../../../images/transparent_purple_dots_small.svg';
import theme from '../../../../styledComponentsTheme';

export const Hero = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 60px;
    margin: 18px 0 48px;

    @media ${theme.breakpoints.isMobileOrTablet} {
        display: block;
        margin: 22px 16px 66px;
    }
`;

export const HeroTitle = styled.h2`
    font-family: Heldane Display Test;
    font-size: 2.25em;
    font-style: normal;
    font-weight: 700;
    text-align: left;
    margin: 0 0 24px 0;
    width: 100%;

    @media ${theme.breakpoints.isMobileOrTablet} {
        text-align: center;
    }
`;

export const HeroText = styled.p`
    font-family: Calibre;
    font-size: 1.175em;
    font-weight: 400;
    line-height: 1em;
    text-align: ${(props) => props.align || 'center'};
`;

export const HeroTextContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    max-width: 420px;

    @media ${theme.breakpoints.isMobileOrTablet} {
        max-width: none;
        text-align: center;
    }
`;

export const HeroImage = styled.img`
    width: 100%;
    max-height: 350px;
`;

export const Section = styled.div`
    display: flex;
    flex-direction: ${(props) => (props.reversePanels ? 'row-reverse' : 'row')};
    margin-top: 48px;
    height: 500px;
    grid-auto-flow: dense;

    @media ${theme.breakpoints.isMobileOrTablet} {
        flex-direction: column;
        margin: 0;
        height: 850px;
    }
`;

export const SectionPanel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${(props) => (props.primary ? theme.primaryPurple : theme.lightGrey)};
    background-image: ${(props) => (props.primary ? `url(${transparentPurpleDotsSmall})` : null)};
    background-size: cover;
    padding: ${(props) => (props.primary ? '0' : '60px')};
    border-radius: 10px;

    @media ${theme.breakpoints.isMobileOrTablet} {
        padding: 0 16px;
    }
`;

export const SectionContent = styled.div`
    max-width: 420px;
    @media ${theme.breakpoints.isMobileOrTablet} {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`

export const SectionCta = styled.div`
    margin: 22px 0 0 0;

    button {
        max-width: 240px;
    }

    @media ${theme.breakpoints.isMobileOrTablet} {
        display: flex;
        flex-direction: column;
        align-items: center;

        button {
            max-width: 220px;
        }
    }
`;

export const SectionCtaHelperText = styled.p`
    color: white;
    font-weight: 500;
    margin: 8px 0 0 0;

     a:hover {
        color: white !important;
     }
`;

export const SectionImage = styled.img`
    max-width: 100%;
    height: auto;
    max-height: 380px;
    object-fit: cover;
    background: transparent;
    box-shadow: ${(props) =>
        props.shadow
            ? `0px 100px 80px rgba(0, 0, 0, 0.07), 0px 41.7776px 33.4221px rgba(0, 0, 0, 0.0503198),
        0px 22.3363px 17.869px rgba(0, 0, 0, 0.0417275), 0px 12.5216px 10.0172px rgba(0, 0, 0, 0.035),
        0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0282725), 0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0196802);`
            : null};
`;

export const SectionTitle = styled.h4`
    font-family: Heldane Display Test;
    font-size: 2.5em;
    font-weight: 700;
    text-align: ${(props) => props.align || 'left'};
    margin: 0 0 24px 0;
    color: ${theme.white};
`;

export const SectionText = styled.p`
    font-family: Calibre;
    font-size: 1.25em;
    line-height: 1.25em;
    text-align: ${(props) => props.align || 'left'};
    color: ${theme.white};

    @media ${theme.breakpoints.isMobileOrTablet} {
        text-align: center;
    }
`;
