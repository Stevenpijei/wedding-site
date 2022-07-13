

import React from "react";
import styled, { keyframes } from "styled-components";
import * as LSTVGlobals from "../../global/globals";
import {pulse} from 'react-animations';

const pulseAnimation = keyframes`${pulse}`;

const HintsProjectorStyle = styled.div`
    padding: 0 5px 0 20px;
    color: ${LSTVGlobals.DISABLED_COLOR};
`;

const ExampleStyle = styled.div`
    color: ${LSTVGlobals.DISABLED_COLOR};
    animation: ${LSTVGlobals.SEARCHBAR_HINT_ANIMATION} ${pulseAnimation};
    
    @media ${ LSTVGlobals.UserDevice.isMobile } {
    	font-size: 0.7rem;
    }
    
    & span {
      font-style: italic;
      color: ${LSTVGlobals.DISABLED_DARKER};
    }
`;


class HintsProjector extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        const hintItems = [
            "filmmakers in new york",
            "photographers in chicago",
            "planners in boston",
            "hotels in los angeles",
            "catholic weddings",
            "weddings in florida",
            "jewish weddings in new york",
            "florists in atlanta"
        ];

        const hints = hintItems.map( (hint, index) => {

           return {
               hint: hint,
               style: {
                visibility: index === 0 ? 'visible' : 'hidden'
               }};
        });


        this.state = {
            hints: hints,
            activeHint: 0
        };

        setInterval( () => {

            let newActiveHint = ++this.state.activeHint;
            if (newActiveHint > this.state.hints.length-1)
                    newActiveHint = 0;

            if (this._isMounted)
                this.setState({
                    ...this.state,
                    activeHint: newActiveHint
                });

        }, 3000);
    }

    componentDidMount() {
        this._isMounted = true;
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    onClick = (e) => {
        this.props.onClickHandler();
        e.stopPropagation();
    };



    render () {
        const hints = this.state.hints.map( (hint, index) => {
            if (index === this.state.activeHint)
                return <ExampleStyle key={ index }>Search things like: <span>{ hint.hint }</span> </ExampleStyle>
        });

        return (
            <HintsProjectorStyle onClick={ this.onClick }>
                {hints}
            </HintsProjectorStyle>
        );
    }
}

export default HintsProjector;