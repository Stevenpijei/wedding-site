import React from 'react';
import PropTypes from 'prop-types';
import * as LSTVGlobals from '../../global/globals';
import styled, { css, keyframes } from 'styled-components';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useModals } from '../../global/use-modals';

const borderAnimationLike = keyframes`
    0% {
        transform: scale(1.0);
        opacity: 0.3;
    }
    30% {
        transform: scale(2.3);
        opacity: 0.15;
    }
    100% {
        transform: scale(0.8);
        opacity: 0;
    }
`;

const borderAnimationLikeMobile = keyframes`
    0% {
        transform: translateY(0) scale(1.0);
        opacity: 0.3;
    }
    30% {
        transform: translateY(0) scale(2);
        opacity: 0.15;
    }
    100% {
        transform: translateY(0px) scale(0.8);
        opacity: 0;
    }

`;

const borderAnimationUnlike = keyframes`
   0% {
		transform: scale(1.0);
		opacity: 1;
	}
	100% {
		transform: scale(1.0);
		opacity: 0;
	}
`;

const heartAnimation = keyframes`
	0% {
		transform: scale(1.0);
	}
	50% {
		transform: scale(0.75);
	}
	100% {
		transform: scale(1.0);
	}
`;

const HeartContainer = styled.div`
    -webkit-tap-highlight-color: transparent;
    position: relative;
    display: flex;
    justify-content: center;
`;

const HeartSvgStyle = styled.svg`
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 1;

    #heart {
        stroke-width: 80px;
        stroke: ${(props) => props.heartOutlineColor};
        fill: none;
    }

    ${(props) =>
        !props.isLiked &&
        props.ready &&
        css`
            @media ${LSTVGlobals.UserDevice.laptop} {
                &:hover {
                    #heart {
                        stroke: ${LSTVGlobals.PRIMARY_COLOR};
                    }
                }
            }
        `};

    ${(props) =>
        props.isLiked &&
        css`
            #heart {
                stroke: none;
                fill: url(#gradient-heart-fill);
            }

            @media ${LSTVGlobals.UserDevice.laptop} {
                &:hover {
                    #heart {
                        stroke: none;
                        fill: ${LSTVGlobals.PRIMARY_COLOR};
                    }
                }
            }
        `};

    ${(props) =>
        !props.ready &&
        css`
            opacity: ${LSTVGlobals.DISABLED_OPACITY_LEVEL};
            cursor: default;
        `};

    ${(props) =>
        props.heartAnimated &&
        props.isLiked &&
        css`
            animation: ${heartAnimation} 0.35s;
        `};
`;

const HeartSvgStylePopup = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transform: scale(0);
    transform-style: preserve-3d;
    backface-visibility: hidden;

    #heart2 {
        stroke: none;
        fill: url(#gradient-heart-fill);
    }

    ${(props) =>
        props.borderAnimated &&
        props.isLiked &&
        css`
            animation: ${borderAnimationLike} 0.85s 0.1s;

            ${(props) =>
                props.heartAnimStyle === 'mobile-card-heart' &&
                props.isLiked &&
                css`
                    animation: ${borderAnimationLikeMobile} 0.85s 0.1s;
                `}
        `};

    ${(props) =>
        props.borderAnimated &&
        !props.isLiked &&
        css`
            animation: ${borderAnimationUnlike} 0.42s;
        `};
`;

const LikableHeart = (props) => {
    const [ready, setReady] = React.useState(true);
    // const [isLiked, setIsLiked] = React.useState(props.ownerType && props.ownerIds ? null : props.isLiked);
    const [heartAnimated, setHeartAnimated] = React.useState(false);
    const [borderAnimated, setBorderAnimated] = React.useState(false);

    
    const { loggedIn } = useAuthService();
    const { openLoginModal } = useModals();


    const onHeartClicked = async () => {
        if (!loggedIn) {
            openLoginModal()
            return;
        } else {
            props.onLike(!props.isLiked);
        }
    };

    return (
        <HeartContainer>
            <HeartSvgStyle
                heartOutlineColor={props.heartOutlineColor}
                heartAnimated={heartAnimated}
                heartAnimStyle={props.heartAnimStyle}
                ready={ready}
                onAnimationEnd={() => {
                    setHeartAnimated(false);
                }}
                onClick={onHeartClicked}
                x="0px"
                y="0px"
                viewBox="-100 -100 1200 1200"
                isLiked={props.isLiked}
            >
                <linearGradient id="gradient-heart-fill">
                    <stop offset="0%" stopColor={LSTVGlobals.PRIMARY_COLOR} />
                    <stop offset="100%" stopColor={LSTVGlobals.PRIMARY_COLOR} />
                </linearGradient>
                <linearGradient id="gradient-heart-fill-hover">
                    <stop offset="0%" stopColor={LSTVGlobals.PRIMARY_HIGHLIGHT_COLOR} />
                    <stop offset="100%" stopColor={LSTVGlobals.PRIMARY_HIGHLIGHT_COLOR} />
                </linearGradient>
                <path
                    id="heart"
                    strokeWidth="80"
                    d="M429,884.9C176.6,656.1,10,505.1,10,319.9C10,169,128.6,50.4,279.5,50.4c85.3,0,
                                   167.1,39.7,220.5,102.4C553.4,90.1,635.2,50.4,720.5,50.4C871.4,50.4,990,169,990,319.9c0,
                                   185.2-166.6,336.1-419,565.5l-71,64.2L429,884.9z"
                />
            </HeartSvgStyle>

            <HeartSvgStylePopup
                heartOutlineColor={props.heartOutlineColor}
                heartAnimStyle={props.heartAnimStyle}
                borderAnimated={borderAnimated}
                onAnimationEnd={() => {
                    setBorderAnimated(false);
                }}
                x="0px"
                y="0px"
                viewBox="0 0 1000 1000"
                isLiked={props.isLiked}
            >
                <linearGradient id="gradient-heart-fill">
                    <stop offset="0%" stopColor={LSTVGlobals.PRIMARY_COLOR} />
                    <stop offset="100%" stopColor={LSTVGlobals.ACCENT_COLOR_2} />
                </linearGradient>
                <path
                    id="heart2"
                    strokeWidth="5"
                    stroke="none"
                    fill="gradient-heart-fill"
                    d="M429,884.9C176.6,656.1,10,505.1,10,319.9C10,169,128.6,50.4,279.5,50.4c85.3,0,
                                   167.1,39.7,220.5,102.4C553.4,90.1,635.2,50.4,720.5,50.4C871.4,50.4,990,169,990,319.9c0,
                                   185.2-166.6,336.1-419,565.5l-71,64.2L429,884.9z"
                />
            </HeartSvgStylePopup>
        </HeartContainer>
    );
};
LikableHeart.propTypes = {
    isLiked: PropTypes.bool.isRequired,
    onLike: PropTypes.func.isRequired, 
}

LikableHeart.defaultProps = {
    isLiked: false,
    onLike: null,
    heartAnimStyle: 'standard',
    heartOutlineColor: LSTVGlobals.TEXT_AND_SVG_BLACK,
};


export default LikableHeart;
