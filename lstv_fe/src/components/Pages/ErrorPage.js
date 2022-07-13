import React from 'react';
import styled from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import oops from '../../images/oops.png';
import {Flex, GenericContainer, VerticalSpacer} from '../../utils/LSTVUtils';
import Button, { ButtonBaseStyle } from '../Utility/Button';
import { Link } from 'react-router-dom';
import { isMobileOnly } from 'react-device-detect';

const ErrorPageStyle = styled.div`
    background: ${LSTVGlobals.LSTV_ERROR_PAGE_INTERNAL};
    display: fixed;
    width: 100vw;
    height: 100vh;
`;

export const ErrorPage = ({ error, componentStack, resetErrorBoundary }) => {
    return (
        <ErrorPageStyle>
            <Flex width={'100%'} height={'100%'} flexDirection={'column'} justifyContent={'center'}>
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                    height={'100%'}
                    textAlign={'center'}
                >
                    <GenericContainer textAlign={'center'} padding={'10px'}>
                        <img src={oops} width={'30%'} />

                        <div
                            style={{
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                fontSize: isMobileOnly ? '4vw' : '2vw',
                                fontFamily: 'Heldane Display, sans-serif',
                                color: LSTVGlobals.TEXT_AND_SVG_BLACK,
                                marginTop: '30px',
                            }}
                        >
                            <h1>
                            Something unexpected happened.
                            </h1>
                            <VerticalSpacer space={20}/>
                            <Button
                                onClick={() => {
                                    resetErrorBoundary();
                                }}
                                style={{
                                    ...ButtonBaseStyle,
                                    background: LSTVGlobals.TEXT_AND_SVG_BLACK,
                                    color: LSTVGlobals.ABSOLUTE_WHITE,
                                    fontSize: isMobileOnly ? '4vw' : '2vw',
                                    fontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
                                    textAlign: 'center',
                                    padding: '1vw 2vw 1vw 2vw',
                                    margin: '0 2vw 0 2vw',
                                }}
                            >
                                TRY AGAIN
                            </Button>
                            <a href={'/'}>
                                <Button
                                    style={{
                                        ...ButtonBaseStyle,
                                        background: LSTVGlobals.TEXT_AND_SVG_BLACK,
                                        color: LSTVGlobals.ABSOLUTE_WHITE,
                                        fontSize: isMobileOnly ? '3vw' : '2vw',
                                        fontWeight: LSTVGlobals.FONT_WEIGHT_BOLD,
                                        textAlign: 'center',
                                        padding: '1vw 2vw 1vw 2vw',
                                        margin: '0 2vw 0 2vw',
                                        minWidth: '80px',
                                    }}
                                >
                                    RETREAT
                                </Button>
                            </a>
                            <br />
                            <br />
                            <br />
                            <h4>If the issue persists, please try later. We are on it...</h4>
                        </div>

                    </GenericContainer>
                </Flex>
            </Flex>
        </ErrorPageStyle>
    );

    // <div role="alert">
    //     <p>Something went wrong:</p>
    //     <pre>{error.message}</pre>
    //     <pre>{componentStack}</pre>
    //     <button onClick={resetErrorBoundary}>Try again</button>
    // </div>
};
