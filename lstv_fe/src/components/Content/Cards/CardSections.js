import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';
import * as ActionTypes from '../../../store/actions';
import CardSection from './CardSection';
import { useAppDataService  } from '../../../rest-api/hooks/useAppDataService';
import ValueProposition from '../ValueProposition'
import { useHistory } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useAuthService } from '../../../rest-api/hooks/useAuthService';

export const CardSectionsStyle = styled.div`
    position: relative;
    background-color: ${LSTVGlobals.SHOWCASE_SECTIONS_BG_COLOR};
   // background-image: ${LSTVGlobals.DIAGONAL_SUBLE_BACKGROUND};

    @media ${LSTVGlobals.UserDevice.tablet} {
        margin: 0 58px 0 60px;
        padding: 31px 0 10px 0;
        border-radius: 0 0 20px 20px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        background-image: none;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        margin: 0 40px;
        border-radius: 0;
    }
`;


const CardSectionContainerStyle = styled.div`
    ${({withTopBorder}) => withTopBorder ? `border-top: 1px solid ${LSTVGlobals.MIDGREY};` : ''};

    @media ${LSTVGlobals.UserDevice.isMobile} {
        margin: 0 19px;
    }

    @media ${LSTVGlobals.UserDevice.tablet} {
        padding: 31px 0 91px 0;
    }
`;

const CardSectionItem = ({ even, index, data, withTopBorder }) => {
    const history = useHistory()

    return (
        <CardSectionContainerStyle id="CardSectionContainerStyle" even={even} withTopBorder={withTopBorder}>
            <CardSection even={even} index={index} data={data} options={{ showBlogName: false }} history={history}/>
        </CardSectionContainerStyle>
    );
};

const CardSectionsBlock = ({cardSectionsData, cardSectionsKey, showValuePropsCards}) => {
    const history = useHistory();
    const loginAction = useCallback(() => history.push('/sign-in'))

    return (
        <>
            {cardSectionsData.map((data, index) => (
                <CardSectionItem
                    key={index}
                    even={index % 2 === 0}
                    index={index}
                    data={data}
                    withTopBorder={!(index === 0 && cardSectionsKey !== '0')}
                />
            ))}
            {showValuePropsCards && <ValueProposition cardSectionsKey={cardSectionsKey} onLoginClick={loginAction} />}
        </>
    );
}


const CardSections = () => {
    const { loggedIn } = useAuthService()
    const [homeCardSections, setHomeCardSections] = useState({});

    const { getHomeCardSections, cancel } = useAppDataService();

    useEffect(() => {
        getHomeCardSections().then(data => (data && setHomeCardSections(data)))
        return () => {
            cancel();
        }
    }, [])

    return (
        <CardSectionsStyle id="CardSectionsStyle">
            {Object.keys(homeCardSections).includes('sections') &&
                Object.entries(homeCardSections.sections).map(([sectionKey, cardSectionsData], index) => (
                    <CardSectionsBlock key={index} cardSectionsKey={sectionKey} cardSectionsData={cardSectionsData} showValuePropsCards={!loggedIn}/>
                ))}
        </CardSectionsStyle>
    );
}

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

const mapStateToProps = (state) => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CardSections);
