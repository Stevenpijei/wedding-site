import React from 'react';
import styled from 'styled-components';
import { UserDevice, USER_TYPE_CONSUMER } from '../../../global/globals';
import { Section, SectionSeperator } from './LayoutComps';
import { OutlinedCTALink } from '../../../newComponents/common/OutlinedCTALink';
import { useSelector } from 'react-redux';

const Callout = styled.h3`
    font-family: Heldane;
    font-style: normal;
    font-weight: bold;
    font-size: 2.5rem;
    line-height: 115.7%;
    text-align: center;
    margin-bottom: 30px;
    @media ${UserDevice.tablet} {
        font-size: 3.5rem;
        line-height: 118.7%;
    }
`;
const DidYouWorkContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 30px;
    margin: 20px 0px;
    align-items: center;
    @media ${UserDevice.tablet} {
        margin: 70px 0px;
    }
`;

const DidYouWork = (props) => {
    const user = useSelector((state) => state.user);
    const isBusinessUser = user?.loggedIn && user?.userType !== USER_TYPE_CONSUMER;
    
    return (
        !isBusinessUser && <Section {...props}>
            <SectionSeperator {...props} />
            <DidYouWorkContainer>
                <Callout>Did you work on this wedding?</Callout>
                {/* <Link> */}
                <OutlinedCTALink to="/sign-up-pro" className="filled">
                    Join as Pro
                </OutlinedCTALink>
                {/* </Link> */}
            </DidYouWorkContainer>
        </Section>
    )
}
export default DidYouWork;
