import React from 'react';
import { isBrowser, isMobile, isMobileOnly, isTablet } from 'react-device-detect';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive/src/Component';
import slugify from 'slugify';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';
import { FancySeparator, Flex, GenericContainer, VerticalSpacer } from '../../../utils/LSTVUtils';
import * as ActionTypes from './../../../store/actions';
import CardGrid from './CardGrid';

export const CardSectionStyle = styled.div`
    display: block;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        padding: 0 0 40px 0;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        padding: 17px 0 49px 0;
        display: flex;
        flex-direction: column;
    }
`;

const getSlugForViewModePersistence = (props) => {
    return `grid-view-mode-${slugify(props.data.header, { lower: true })}`;
};

class CardSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
        };
    }

    render() {
        // obtain base class properties to transfer to card grid and their cards.
        let parentProps = {};
        Object.keys(this.props)
            .filter((key) => {
                return key.startsWith('font') && key !== 'children';
            })
            .map((key) => {
                parentProps[key] = this.props[key];
            });

        let verbosity = isMobile
            ? LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MEDIUM
            : LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM;

        // no max verbosity for mobile + blog story
        if (isMobile && this.props.data.card_type === 'article') {
            verbosity = LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MEDIUM;
        }

        let propSet = {
            ...parentProps,
            numCards: 4,
            content: this.props.data.content,
            cardType: this.props.data.card_type,
            even: this.props.even,
            name: this.props.data.header,
            verbosity: verbosity,
            options: this.props.data.content_options,
            containerMode: isMobileOnly ? 'h-scroll' : 'grid',
        };


        return (
            <CardSectionStyle>
                <Flex alignItems={'center'} padding={isMobile ? '10px 5px 0 5px' : '0'}>
                    <HeadersContainer>
                        <Header>{this.props.data.header}</Header>
                        {this.props.data.sub_header && <SubHeader>{this.props.data.sub_header}</SubHeader>}
                    </HeadersContainer>

                    <MediaQuery query={LSTVGlobals.UserDevice.tablet}>
                        <DesktopSeeAllButton
                            onClick={() => {
                                this.props.history.push(this.props.data.url);
                            }}
                        >
                            See All
                        </DesktopSeeAllButton>
                    </MediaQuery>
                </Flex>

                <VerticalSpacer space={isMobile ? 25 : 68} />
                {/* <CardGrid {...propSet} containerMode='h-scroll' /> */}
                <CardGrid {...propSet} />
                <MediaQuery query={LSTVGlobals.UserDevice.isMobile}>
                    <MobileSeeAllButton
                        onClick={() => {
                            this.props.history.push(this.props.data.url);
                        }}
                    >
                        See All
                    </MobileSeeAllButton>
                </MediaQuery>
            </CardSectionStyle>
        );
    }
}

const HeadersContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 80%;
`;

const Header = styled.h4`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 32px;
    line-height: 124.4%;
`;

const SubHeader = styled.h4`
    font-family: Calibre;
    font-style: normal;
    font-weight: 400;
    font-size: 21px;
    line-height: 22px;
    line-height: 124.4%;
`;

const SeeAllButton = styled.button`
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    background: white;
    color: ${LSTVGlobals.BLACK};
    border: 2px solid #000000;
    box-sizing: border-box;
    cursor: pointer;
`;

const DesktopSeeAllButton = styled(SeeAllButton)`
    width: 150px;
    height: 37px;
    border-radius: 20px;
`;

const MobileSeeAllButton = styled(SeeAllButton)`
    width: 275px;
    height: 56px;
    border-radius: 50px;
    margin-top: 30px;
    align-self: center;
`;

const mapDispatchToProps = (dispatch) => {
    return {
        onViewModeChanged: (data) => dispatch({ type: ActionTypes.ACTION_CHANGE_CARD_GRID_VIEW_MODE, data: data }),
    };
};

const mapStateToProps = (state, ownProps) => {
    return {
        viewMode:
            state.user.options && state.user.options && getSlugForViewModePersistence(ownProps) in state.user.options
                ? state.user.options[getSlugForViewModePersistence(ownProps)]
                : isMobileOnly
                ? 'h-scroll'
                : 'masonry',
    };
};

CardSection.defaultProps = {
    verbosity: LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM,
};

export default connect(mapStateToProps, mapDispatchToProps)(CardSection);
