import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import articeImg from '../../images/Article.png';
import vendorsImg from '../../images/Vendors.png';
import videosImg from '../../images/Videos.png';
import XsBackground from '../../images/xs.svg';
import OsBackground from '../../images/os.svg';
import { isMobile, isTablet } from 'react-device-detect';
import theme from '../../styledComponentsTheme';
import { useMediaReady } from '../../utils/LSTVUtils';
import BaseCTAButton from '../../newComponents/buttons/BaseCtaButton';
import { useHistory } from 'react-router';


const Contents = ({ headerText, subHeaderText, onLoginClick, withRightMarginOnLaptop, withLeftMarginOnLaptop }) => {
    const history = useHistory();
    return (
        <ContentsContainer
            withRightMarginOnLaptop={withRightMarginOnLaptop}
            withLeftMarginOnLaptop={withLeftMarginOnLaptop}
        >
            <Header>{headerText}</Header>
            <SubHeader>{subHeaderText}</SubHeader>
            {/* <GetStartedButton /> */}
            <BaseCTAButton title={'Get Started'} size={'large'} onClick={() => history.push('/sign-in')} lightMode />
            <LoginButton onClick={onLoginClick}>
                Already a member? <LoginText>Log In</LoginText>
            </LoginButton>
        </ContentsContainer>
    )
}

const Header = styled.h2`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 45px;
    line-height: 112%;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    margin-bottom: 22px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        text-align: center;
        font-size: 32px;
    }
`;

const SubHeader = styled.h2`
    font-family: Calibre;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 24px;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    margin-bottom: 22px;
    max-width: 90%;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        text-align: center;
    }
`;

const ValueProposition = ({ cardSectionsKey, onLoginClick }) => {
    const [isTabletWidth, ready] = useMediaReady(theme.breakpoints.isTablet);

    return ready ? (cardSectionsKey === '0' ? (
        <Container>
            <ContentsBackgroundImage image={OsBackground} imagePosition="left">
                <Contents
                    headerText="Real Wedding Videos"
                    subHeaderText="Watch weddings by venue, location, style, religion, culture, and more to get ideas and find pros for
                    your wedding."
                    onLoginClick={onLoginClick}
                    withLeftMarginOnLaptop
                />
            </ContentsBackgroundImage>
            <CardStackImage withRightMarginOnLaptop src={videosImg} />
        </Container>
    ) : cardSectionsKey === '1' ? (
        <Container>
            {!(isMobile || isTablet || isTabletWidth) && <CardStackImage withLeftMarginOnLaptop src={vendorsImg} />}
            <ContentsBackgroundImage flexEndOnLaptop image={XsBackground} imagePosition="right">
                <Contents
                    headerText="Find Your Wedding Team"
                    subHeaderText="Search and browse tens of thousands of wedding pros to find the right vendors for your wedding."
                    onLoginClick={onLoginClick}
                    withRightMarginOnLaptop
                />
            </ContentsBackgroundImage>
            {(isMobile || isTablet || isTabletWidth) && <CardStackImage withLeftMarginOnLaptop src={vendorsImg} />}
        </Container>
    ) : cardSectionsKey === '2' ? (
        <Container>
            <ContentsBackgroundImage image={OsBackground} imagePosition="left">
                <Contents
                    headerText="Ideas And Tips"
                    subHeaderText="Get inspired with our editors' favorite weddings and advice from experts"
                    onLoginClick={onLoginClick}
                    withLeftMarginOnLaptop
                />
            </ContentsBackgroundImage>
            <CardStackImage withRightMarginOnLaptop src={articeImg} />
        </Container>
    ) : null) : null;
};

const Container = styled.div`
    height: 551px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: ${LSTVGlobals.LIGHTGREY};
    border-radius: 10px;
    overflow: hidden;
    margin: 0 19px;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        height: 830px;
        flex-direction: column;
    }

    @media ${LSTVGlobals.UserDevice.isTablet} {
        height: 880px;
        flex-direction: column;
    }
`;

const ContentsBackgroundImage = styled.div`
    height: 551px;
    width: 50%;
    display: flex;
    background-image: ${({ image }) => `url(${image})`};
    background-repeat: no-repeat;
    background-size: 170% 170%;
    background-color: ${LSTVGlobals.PRIMARY_PURPLE};

    @media ${LSTVGlobals.UserDevice.isMobile} {
        height: 446px;
        border-radius: 10px;
        margin: 0 10px 47px 10px;
    }

    @media ${LSTVGlobals.UserDevice.isWithinTablet} {
        justify-content: center;
        width: 100%;
    }

    @media ${LSTVGlobals.UserDevice.tablet} {
        ${({ flexEndOnLaptop }) => (flexEndOnLaptop ? 'justify-content: flex-end;' : '')};
    }
`;

const LoginButton = styled.button`
    outline: unset;
    border: unset;
    background: unset;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    margin-top: 13px;
`;

const LoginText = styled.span`
    text-decoration: underline;
    color: ${LSTVGlobals.ABSOLUTE_WHITE};
`;

const CardStackImage = styled.img`
    @media ${LSTVGlobals.UserDevice.isMobile} {
        height: 310px;
        margin: 10px 16px 13px 16px;
    }

    @media ${LSTVGlobals.UserDevice.isWithinTablet} {
        margin: 10px 16px 13px 16px;
    }

    @media ${LSTVGlobals.UserDevice.tablet} {
        ${({ withLeftMarginOnLaptop }) => (withLeftMarginOnLaptop ? 'margin-left: 77px;' : '')};
        ${({ withRightMarginOnLaptop }) => (withRightMarginOnLaptop ? 'margin-right: 77px;' : '')};
        width: 350px;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        margin: 10px 16px 13px 16px;
        width: 410px;
    }
`;

const ContentsContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    max-width: 40%;

    @media ${LSTVGlobals.UserDevice.isWithinMobile} {
        align-items: center;
    }

    @media ${LSTVGlobals.UserDevice.isWithinTablet} {
        max-width: 80%;
    }

    @media ${LSTVGlobals.UserDevice.laptop} {
        ${({ withLeftMarginOnLaptop }) => (withLeftMarginOnLaptop ? 'margin-left: 77px' : '')}
        ${({ withRightMarginOnLaptop }) => (withRightMarginOnLaptop ? 'margin-right: 77px' : '')}
    }
`;

export default ValueProposition;
