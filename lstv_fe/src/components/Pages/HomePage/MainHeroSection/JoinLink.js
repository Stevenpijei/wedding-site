import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../../global/globals';
import { InlineSVG } from '../../../Utility/LSTVSVG';

export const UnderlineIcon = (props) => {
    return (
        <InlineSVG {...props} width="99px" height="11px" viewBox="0 0 99 11" fill="none">
            <path
                d="M1.88182 5.65402C3.84379 5.54207 5.72622 5.03825 7.66167 4.78634C11.7712 4.22654 15.8807 4.50644 19.9903 4.73036C25.7436 5.01026 31.0993 7.13749 36.5345 8.73291C41.7575 10.2723 47.0602 11.196 52.4954 10.9721C55.1467 10.8601 57.6919 10.2164 60.1577 9.20873C62.809 8.11713 65.4338 6.96955 67.979 5.65402C71.2136 4.00263 74.6338 3.33087 78.1866 3.16293C81.0765 3.02298 83.993 3.02298 86.8829 3.2469C89.1365 3.44283 91.2576 4.19855 93.2725 5.26217C94.5982 5.96191 96.0034 6.46573 97.4881 6.71764C97.8593 6.80161 98.1775 6.80161 98.5221 6.71764C98.8138 6.63367 99.3175 6.63367 98.7873 6.12985C98.7077 6.04588 98.8403 5.96191 98.8403 5.87794C98.8403 5.40212 98.6547 5.12222 98.2305 5.09423C96.7193 5.06624 95.3936 4.39448 94.0679 3.72273C92.4772 2.91102 90.9394 1.93138 89.2426 1.39957C87.5192 0.839775 85.7958 0.307969 83.9664 0.335959C82.6938 0.363948 81.4477 0.196009 80.1751 0.0280698C79.3797 -0.0838895 78.5843 0.0840499 77.8154 0.14003C77.3116 0.168019 76.8609 -0.0558992 76.3837 8.0428e-05C75.7739 0.0560601 75.1376 0.0560599 74.5278 0.0840497C72.8044 0.168019 71.1076 0.559877 69.4372 0.923744C66.4413 1.5955 63.79 3.27489 60.9 4.31051C58.7259 5.06624 56.6049 6.01789 54.4043 6.5497C53.1052 6.85759 51.7265 6.88558 50.3743 6.88558C44.674 6.88558 39.1858 5.57006 33.8036 3.72273C32.0007 3.10695 30.1978 2.49117 28.3684 1.98736C26.8837 1.56751 25.399 1.20364 23.8612 0.979724C21.9522 0.699826 20.0433 0.419927 18.1344 0.307968C13.1234 7.99942e-05 8.16542 0.196009 3.31352 1.65148C3.02188 1.73545 2.73024 1.90339 2.41208 1.93138C1.08642 2.12731 0.556153 3.16293 0.0524041 4.28252C-0.133188 4.70237 0.423589 5.62603 0.874313 5.65402C1.19247 5.68201 1.53715 5.68201 1.88182 5.65402ZM10.1804 3.58278C7.317 3.77871 4.50661 4.53443 1.64319 4.81433C4.6922 3.97464 9.06687 3.35886 10.1804 3.58278ZM11.4796 0.531886C11.4796 0.503897 11.4796 0.475907 11.4796 0.447917C13.2294 0.447917 14.9793 0.447917 16.7292 0.447917C16.7292 0.475907 16.7292 0.503897 16.7292 0.531886C14.9793 0.531886 13.2294 0.531886 11.4796 0.531886Z"
                fill="white"
            />
        </InlineSVG>
    );
};

const StyledLink = styled(Link)`
    color: ${LSTVGlobals.OFFWHITE};
    font-family: Calibre;
    font-style: normal;
    font-weight: 600;
    font-size: 21px;
    line-height: 25px;
    text-decoration: none !important;
    margin-bottom: 5px;

    ${props => props.textColor && `
        &:hover {
            color: ${props => props.textColor};
        }
    `}
`;

export const JoinLink = (props) => {
    const history = useHistory();
    return (
        <LinkContainer {...props} onClick={() => history.push('sign-up-pro')}>
            <StyledLink {...props}>{props?.title || 'Or Join as a Pro'}</StyledLink>
            <UnderlineIcon />
        </LinkContainer>
    );
};

const LinkContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    :hover {
        svg {
            path {
                fill: ${props => props.textColor || LSTVGlobals.PRIMARY_PURPLE};
            }
        }

        a {
            color: ${props => props.textColor || LSTVGlobals.PRIMARY_PURPLE};
        }
    }
`;
