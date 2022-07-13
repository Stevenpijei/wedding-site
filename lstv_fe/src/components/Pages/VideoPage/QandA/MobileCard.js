import React from 'react'
import styled from 'styled-components';
import LinesEllipsis from 'react-lines-ellipsis';
import { OutlinedCTAButton } from '../../../../newComponents/common/OutlinedCTALink';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FlagableFlag from '../../../Utility/FlagableFlag';
import MobileCardTitle from './MobileCardTitle';

const MobileCardContainer = styled.div`
    min-width: 60vw;
    height: 220px;
    box-shadow: 0px 0px 6px rgba(183, 183, 183, 0.25);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    margin-right: 20px;
    position: relative;
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
`;



const CardContent = styled.div`
    align-self: flex-start;
    p {
        font-weight: normal;
        font-size: 1.125rem;
        line-height: 1.3rem;
    }
`;

const ReplyButton = styled(OutlinedCTAButton)`
    width: 100px;
    padding: 4px 0px;
    font-weight: 500;
    font-size: 0.937rem;
    line-height: 1.125rem;
`;




const MobileCard = ({ post, setShowCommentsModal, handleEditClicked, handleDeleteClicked, handleFlag }) => {
    const user = useSelector((state) => state.user);
    return (
        <>
           {post &&  <MobileCardContainer key={post.message_id}>
                <div>
                    <MobileCardTitle 
                        post={post} 
                        isEditable={post.author_id === user.uid}
                        handleEditClicked={() => handleEditClicked(post.content, post.message_id)} 
                        handleDeleteClicked={() => handleDeleteClicked(post.message_id)} 
                    />
                    <CardContent>
                        {/* <p>{post.content}</p> */}
                        <LinesEllipsis text={post.content} maxLine={3} component="p" />    
                    </CardContent>
                </div>
                <div className="footer">
                    <ReplyButton onClick={()=> setShowCommentsModal(post)}>{post?.replies?.length > 0 && post?.replies?.length} Comments</ReplyButton>
                    <FlagableFlag  isFlagged={false} onFlag={handleFlag}  width={'20px'} />
                </div>
            </MobileCardContainer>}
        </>
    )
}

MobileCard.propTypes = {
    post: PropTypes.object,
    setShowCommentsModal: PropTypes.func, 
    handleEditClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,
    handleFlag: PropTypes.func,
}

export default MobileCard
