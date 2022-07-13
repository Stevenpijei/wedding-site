import React from 'react'
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import { DeleteIcon } from '../Utility/LSTVSVG';


const Thumb = styled.div`
    position: relative;
    max-width: 250px;
    margin: 20px;
    img {
        width: 100%;
    }
`

const DeleteButton = styled.div`
    position: absolute;
    right: -10px;
    top: -10px;
    border-radius: 100%;
    background-color: ${theme.primaryPurple};
    width: 30px;
    min-width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    cursor: pointer;
    :hover {
        background-color: ${theme.highlightColor};
    }
`;

const PhotoPreview = ({imageSrc, onDelete}) => {
    return (
        <Thumb >
            <DeleteButton type="button" onClick={() => onDelete() }>
                <DeleteIcon fillColor="white" strokeColor="none" />
            </DeleteButton>
            <img src={imageSrc} />
           
        </Thumb>
    )
}

export default PhotoPreview
