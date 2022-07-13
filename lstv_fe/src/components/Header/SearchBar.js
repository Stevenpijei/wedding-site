import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { BeatLoader } from 'react-spinners';
import * as LSTVGlobals from '../../global/globals';
import SearchSvg from '../../images/search_icon.svg';
import CloseSvg from '../../images/burger_close.svg';
import StateImage from '../Utility/StateImage';
import HintsProjector from '../Utility/HintsProjector';
import LSTVButton from '../Utility/LSTVButton';
import { isBrowser, isChrome, isSafari } from 'react-device-detect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import Button from '../Utility/Button';
import { GenericContainer } from '../../utils/LSTVUtils';
import Typewriter from 'typewriter-effect';

const SearchBarStyle = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    border-radius: ${LSTVGlobals.STANDARD_RADIUS};
    border: 1px solid ${LSTVGlobals.TEXT_AND_MILD_GRAY_BORDER_FOR_TEXT_CONTROLS};
    overflow: hidden;
    height: 30px;
    background: ${LSTVGlobals.SIDE_AND_NAV_BAR_BG};
    width: 100%;

    ${(props) =>
        props.forceVCenter &&
        css`
            top: 50%;
            transform: translateY(-50%);
            margin: 0 auto;
        `};
`;

const SearchBarInputStyle = styled.input`
    flex: 1;
    margin-left: 20px;
    outline: none;
    border: none;
    font-size: 1rem;
`;

const RoundGlyphButton = {
    alignItems: 'center',
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex ',
    fontSize: 'inherit',
    height: '30px',
    justifyContent: 'center',
    outline: 0,
    transition: 'background-color 200ms',
    width: '30px',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
    },
    background: 'rgba(255, 255, 255, 0.5)',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.18)',
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    '&:hover, &:active': {
        backgroundColor: 'white',
        color: LSTVGlobals.PRIMARY_COLOR,
        opacity: 1,
    },
    '&:active': {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.14)',
        transform: 'scale(0.96)',
    },
    '&:focus': {
        outline: 'none',
    },
    ['@media (max-width: 769px)']: {
        width: '40px',
        height: '40px',
        '&:hover, &:active': {
            background: 'rgba(255, 255, 255, 0.5)',
            color: LSTVGlobals.TEXT_AND_SVG_BLACK,
            opacity: 1,
        },
    },
};

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            searchStr: '',
            isSearching: false,
            isIdle: true,
            activeMode: 'search',
            contentReady: false,
            isEditing: false,
        };
    }

    onChange = (e) => {
        this.setState(
            {
                ...this.state,
                searchStr: e.target.value,
                isSearching: e.target.value.length > 0,
                activeMode: this.state.isEditing ? 'close' : 'search',
            },
            () => {}
        );
    };

    OnInputBlur = () => {
        //console.log('blur');

        this.setState(
            {
                ...this.state,
                activeMode: this.isEditing ? 'close' : 'search',
                isSearching: false,
                isEditing: false,
                searchStr: '',
            },
            () => {}
        );
    };

    OnInputFocus = () => {
        this.setState({
            ...this.state,
            isEditing: true,
        });
    };

    OnHintsClicked = () => {
        this.setState(
            {
                ...this.state,
                activeMode: 'close',
            },
            () => {
                this.inputRef.current.focus();
            }
        );
    };

    OnCloseButtonClicked = (e) => {
        //console.log('clicked');
        this.setState({
            ...this.state,
            searchStr: '',
            isSearching: false,
            isEditing: false,
            activeMode: 'search',
        });
        e.stopPropagation();
    };

    render() {
        return (
            <SearchBarStyle
                width={this.props.width}
                forceVCenter={this.props.forceVCenter}
                onClick={this.OnHintsClicked}
            >
                {this.state.activeMode === 'close' ? (
                    <SearchBarInputStyle
                        value={this.state.searchStr}
                        type="text"
                        onChange={this.onChange}
                        ref={this.inputRef}
                        onBlur={this.OnInputBlur}
                        onFocus={this.OnInputFocus}
                    />
                ) : null}

                {this.state.activeMode === 'search' && (
                    <GenericContainer padding={'0 5px 0 20px'}>
                        {/*<Typewriter*/}
                        {/*    options={{*/}
                        {/*        loop: true,*/}
                        {/*        wrapperClassName: 'searchbar-typewriter',*/}
                        {/*        deleteSpeed: 10,*/}
                        {/*        delay: 10,*/}
                        {/*    }}*/}
                        {/*    onInit={(typewriter) => {*/}
                        {/*        typewriter*/}
                        {/*            .pauseFor(3000)*/}
                        {/*            .typeString('filmmakers in new york')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('photographers in chicago')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('planners in boston')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('hotel venues in los angeles')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('catholic weddings')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('catholic weddings')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .typeString('florists in atlanta')*/}
                        {/*            .pauseFor(2500)*/}
                        {/*            .deleteAll()*/}
                        {/*            .start();*/}
                        {/*    }}*/}
                        {/*/>*/}
                    </GenericContainer>
                )}

                <BeatLoader
                    css={{ padding: '10px' }}
                    size={9}
                    color={LSTVGlobals.LSTV_YELLOW}
                    loading={this.state.isSearching}
                />

                {this.state.activeMode === 'close' && (
                    <Button onClick={this.OnCloseButtonClicked} style={RoundGlyphButton}>
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                    </Button>
                )}
            </SearchBarStyle>
        );
    }
}

SearchBar.defaultProps = {};

export default SearchBar;
