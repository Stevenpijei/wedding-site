import React, { useState } from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { PRIMARY_PURPLE } from '../../../../global/globals';
import { DeleteIcon, DotsIcon, EditIcon } from '../../../Utility/LSTVSVG';

const Dots = styled(DotsIcon)`
    /* padding: 15px; */
    cursor: pointer; 
`
const DotContainer = styled.div`
     position: relative;
`;

const EditMenu = styled.ul`
    position: absolute;
    bottom: -115px;
    width: 130px;
    right: 5px;
    padding: 10px;
    background: #FFFFFF;
    box-shadow: 0px 0px 6px rgba(186, 186, 186, 0.25);
    li {
        padding: 10px 5px;
        display: flex;
        align-items: center;
        cursor: pointer;
        svg {
            margin-right: 5px;
        }
    }
`;

export const EditComment = ({loggedInUserId, commentAuthorId, handleEditClicked, handleDeleteClicked}) => {
    const [openMenu, setOpenMenu] = useState(false)

    const handleEditClick = () => {
        handleEditClicked();
        setOpenMenu(false);
    }
    const handleDeleteClick = () => {
        handleDeleteClicked();
        setOpenMenu(false);
    }

    return (
        <DotContainer>
            <Dots fillColor={PRIMARY_PURPLE} onClick={()=> setOpenMenu(!openMenu)} />
            { openMenu && <EditMenu>
                <li onClick={handleEditClick}>{<EditIcon />} Edit</li>
                <li onClick={handleDeleteClick}>{<DeleteIcon />} Delete</li>
            </EditMenu>}
        </DotContainer>
    )
}

EditComment.propTypes = {
    loggedInUserId: PropTypes.string,
    commentAuthorId: PropTypes.string,
    handleEditClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,
}

export default EditComment
