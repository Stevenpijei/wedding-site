import styled from 'styled-components';
import theme from '../../styledComponentsTheme'

const V3MainContent = styled.div`
    /* border: 1px red solid; */
    max-width: 100%;
    padding-bottom: 15px;
    
    @media ${theme.breakpoints.laptopL} {
        max-width: 1440px;
        margin: 0 auto;
    }

    @media ${theme.breakpoints.isMobileOrTablet} {
        overflow-x: hidden;
    }
`;

export default V3MainContent;
