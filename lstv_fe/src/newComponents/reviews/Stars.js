import React, {useState} from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';

import theme from '../../styledComponentsTheme';
import { StarIcon } from '../../components/Utility/LSTVSVG';

const fadeInAnimation = keyframes`${fadeIn}`;


const ReviewsAverageStars = styled('div')`
    margin: 8px 0;
    display: flex;
    align-items: flex-start;
    
    div {
        margin: 8px;
    }

    div:first-child {
        margin: 8px 8px 8px 0;
    }
    
    div:last-child {
        margin: 8px 0 8px 8px;
    }
`;

const StarContainer = styled.div`
    animation: 0.3s ${fadeInAnimation} ease-out;
`;

const Stars = ({ rate, count, size, onClick, emptyColor, fillColor, stroke  }) => {
    const [selectedRate, setSelectedRate] = useState(null)
    const stars = new Array(count || 5).fill('');
    const highestFull = Math.floor(rate || selectedRate)
    
    const getFraction = () => {
        const fraction = parseFloat(`${rate}`.split('.')[1] || 0);

        // not a ternary for readability
        if (fraction < 3) {
            return 0;
        }

        if (fraction <= 7) {
            return 5
        }

        return 10
    }

    const getFillStop = (index) => {
        const isFull = index < highestFull;
        const isFraction = index  === highestFull;

        if (isFull) {
            return 10;
        }

        if (isFraction) {
            return getFraction()
        }

        return 0;
    }

    const handleClick = (index) => {
        if (onClick) {
            onClick(index + 1);
            setSelectedRate(index + 1)
        }
    }

    return (
        <ReviewsAverageStars>
            {stars.map((star, index) => (
                <StarContainer onClick={() => handleClick(index)} key={index} role="button">
                    <StarIcon
                        size={size}
                        fillColor={fillColor || theme.primaryPurple}
                        emptyColor={emptyColor || theme.midGrey}
                        stroke={stroke || theme.midGrey}
                        fillStop={getFillStop(index)}
                    />
                </StarContainer>
            ))}
        </ReviewsAverageStars>
    );
};

export default Stars;
