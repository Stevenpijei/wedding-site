import React from 'react';
import styled from 'styled-components';
import { PRIMARY_PURPLE } from "../global/globals";

const UserInitialImage = styled.div`
    width: ${(props) => props.size || '32px'};
    height: ${(props) => props.size || '32px'};
    border-radius: ${(props) => props.size || '32px'};
    background-color: ${PRIMARY_PURPLE};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    
    p {
        font-size: ${(props) => props.fontSize || '1.125rem'};
        line-height: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.1rem;
    }
`;

const renderInitialCircle = (initial, props = {}) => (
    <UserInitialImage {...props}>
        <p>{initial}</p>
    </UserInitialImage>
);

const UserAvatarImage = styled.img`
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: 50%;
`;

const ImageWrapper = styled.div`
    width: ${(props) => props.size || '32px'};
    height: ${(props) => props.size || '32px'};
`;  

const Avatar = ({ imageSrc, initial, size='42px', fontSize='1.125rem' }) => {
    return (
        imageSrc ? (
            <ImageWrapper size={size} fontSize={fontSize}>
                <UserAvatarImage src={imageSrc} />
            </ImageWrapper>
        ) : (
            renderInitialCircle(initial, { size, fontSize },)
        )
    );
};

export default Avatar;