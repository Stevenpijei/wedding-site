import React from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Avatar from '../../../../newComponents/Avatar';
import EditComment from './EditComment';
import {GetElapsedTimeLabel} from "../../../../utils/LSTVUtils";

const CardTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
`;

const LeftCont = styled.div`
    display: flex;
`

const CardTitle = styled.div`
    margin-left: 10px;
    h4 {
        font-family: Calibre;
        font-weight: 500;
        font-size: 1.25rem;
        line-height: 1.4rem;
    }
    p {
        font-family: Calibre;
        font-weight: 400;
        font-size: 1.25rem;
        line-height: 1rem;
        color: #9b9b9b;
    }
`;

const MobileCardTitle = ({post, isEditable, handleEditClicked, handleDeleteClicked}) => {
    return (
        <CardTitleContainer>
            <LeftCont>
                <Avatar
                    imageSrc={post.author_thumbnail_url}
                    initial={post.author.slice(0, 1)}
                />
                <CardTitle>
                    <h4>{post.author}</h4>
                    <p>{GetElapsedTimeLabel(post.posted_at)}</p>
                </CardTitle>
            </LeftCont>
            {isEditable && <EditComment handleEditClicked={handleEditClicked} handleDeleteClicked={handleDeleteClicked} />}
        </CardTitleContainer>
    );
}

MobileCardTitle.propTypes = {
    post: PropTypes.object,
    isEditable: PropTypes.bool,
    handleEditClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,
}

export default MobileCardTitle
