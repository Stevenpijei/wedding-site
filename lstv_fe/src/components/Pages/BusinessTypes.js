import React, { useEffect, useState } from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MainContent from './PageSupport/MainContent';
import { useAppDataService  } from '../../rest-api/hooks/useAppDataService';
import LSTVCard from "../../newComponents/cards/LSTVCard";
import {VerticalSpacer} from "../../utils/LSTVUtils";
import {BusinessGridItemContainerStyle} from "../Content/BusinessRoleGrid";

const PageStyle = styled.div`
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='stripes' patternUnits='userSpaceOnUse' width='7' height='6' patternTransform='rotate(45)'%3E%3Cline x1='1' y='0' x2='1' y2='7' stroke='%23eeeeee66' stroke-width='1.0' /%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23fffeea00' /%3E%3Crect width='100%25' height='100%25' fill='url(%23stripes)' /%3E%3C/svg%3E");
    width: 100%;
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: auto auto auto auto auto auto auto;
    background-color: white;
    padding: 10px;
    grid-gap: 10px;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        grid-template-columns: 1fr 1fr 1fr;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        grid-template-columns: 1fr 1fr;
    }
`;

const GridItem = styled.div`
    font-size: 1rem;
    transition: all 0.5s;
    transform-style: preserve-3d;
    z-index: 1;
`;

const PageHeader = styled.div`
    margin-top: 10px;
	background: ${LSTVGlobals.LSTV_YELLOW};
	text-align: center;
	font-size: 2rem;
	padding: 20px;
	border: 1px solid ${LSTVGlobals.TEXT_AND_SVG_BLACK};
	display: flex;
	align-items: center;
	filter: saturate(8);
	justify-content: center;
	
	${(props) =>
        props.background &&
        css`
            background: ${(props) => props.background};
        `}
	
    @media ${LSTVGlobals.UserDevice.isMobile} {
       font-size: 1.5rem;
       line-height: 1.5rem;
       
    }
`;

const BusinessTypes = () => {
    const { getBusinessTypes, getBusinessCapacityTypes, cancel } = useAppDataService();
    
    const [businessTypes, setBusinessTypes] = useState([]);
    const [businessCapacityTypes, setBusinessCapacityTypes] = useState([]);
   
    useEffect(() => {
        getBusinessTypes().then(data => (data && setBusinessTypes(data)))
        getBusinessCapacityTypes().then(data => (data && setBusinessCapacityTypes(data)))
    
        // Clean up function (get's called when component unmounts)
        return () => {
            cancel();
        }
    }, [])

    return (
        <MainContent>
            <PageStyle>
                <PageHeader background={'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)'}>
                    {businessTypes.length} Business Role Types
                </PageHeader>
                <GridContainer>{ 
                    businessTypes.length !== 0 && businessTypes.map((data, index) => (
                        <GridItem key={index}>

                            <LSTVCard
                                options={{
                                    cardType: 'wedding-business',
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    bg_color: data.bg_color,
                                    clickHandler: () => {},
                                }}
                                data={{
                                    premium: false,
                                    name: data.name,
                                    role: {
                                        name: data.slug,
                                        slug: data.business_capacity_type_slug || data.role_slug,
                                        family_type: data.role_family
                                    },
                                }}
                            />


                        </GridItem>
                )) }
                </GridContainer>
                <PageHeader background={'linear-gradient(315deg,#ffffff 0%,#f8f7c8 74%)'}>
                    {businessCapacityTypes.length} Event-Specific Role Capacity Types
                </PageHeader>
                <GridContainer>
                    {businessCapacityTypes.length !== 0 && businessCapacityTypes.map((data, index)=> (
                        <GridItem key={index}>
                            <LSTVCard
                                options={{
                                    cardType: 'wedding-business',
                                    orientation: 'portrait',
                                    containerMode: 'grid',
                                    bg_color: data.bg_color,
                                    clickHandler: () => {},
                                }}
                                data={{
                                    premium: false,
                                    name: data.name,
                                    role: {
                                        name: `based on ${ data.role_name }`,
                                    },
                                }}
                            />

                        </GridItem>
                    ))}
                </GridContainer>
            </PageStyle>
        </MainContent>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(BusinessTypes));
