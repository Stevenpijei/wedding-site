import React from 'react';
import styled from 'styled-components';
import { ArrowCircleLeft, ArrowCircleRight } from '../../../Utility/LSTVSVG';

const ScrollController = ({ className, onScrollRight, onScrollLeft }) => {
    return (
        <Container className={className}>
            <ButtonWithMargin onClick={onScrollLeft}>
                <ArrowCircleLeft width="50px" height="50px"></ArrowCircleLeft>
            </ButtonWithMargin>
            <Button onClick={onScrollRight}>
                <ArrowCircleRight width="50px" height="50px"></ArrowCircleRight>
            </Button>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
`;

const Button = styled.button`
    background-color: unset;
    cursor: pointer;
    max-width: 50px;
`;

const ButtonWithMargin = styled(Button)`
    margin-right: 22px;
`;

export default ScrollController;
