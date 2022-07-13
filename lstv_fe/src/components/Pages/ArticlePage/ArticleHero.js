import React from 'react'
import styled from 'styled-components'

const Image = styled.img`
    max-width: 100%;
    height: auto;
    object-fit: cover;
`;

const ArticleHero = ({ image }) => {
    return (
        <div>
            <Image src={image} />
        </div>
    );
}

export default ArticleHero