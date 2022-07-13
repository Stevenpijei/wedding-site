import styled from 'styled-components';
import breakpoints from '../../../global/breakpoints';

const SingleSectionLayout = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 72px 0;

    background-color: ${(props) => props.theme.white};
    color: ${(props) => props.theme.black};
    text-align: center;

    min-height: calc(100vh - 60px);
    max-width: 583px;
    margin: 0 auto;

    @media ${breakpoints.UserDevice.isMobile} {
        padding: 39px 20px;
        min-height: calc(100vh - 73px);
    }

    @media ${breakpoints.UserDevice.isTablet} {
        min-height: 692px;
    }
`

export default SingleSectionLayout
