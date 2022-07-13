import React, { useState } from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import FlagableFlag from '../../../Utility/FlagableFlag';
import LikableHeart from '../../../Utility/LikableHeart';
import { ACTION_BAR_LIKES_DISPLAY_THRESHOLD } from '../../../../global/globals'
import { useQandALike } from '.';
import { useInPageMessagingService } from '../../../../rest-api/hooks/useInPageMessagingService';
import { useVideoService } from '../../../../rest-api/hooks/useVideoService';

const Footer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 0px;
    margin-left: ${(props) => props.isReply && '52px'};
    div {
        display: flex;
    }
    p {
        font-weight: 500;
        font-size: 1.25rem;
        line-height: 1.5rem;
    }
`;

const LikesBox = styled.div`
    margin-right: 20px;
`;
const StyledHeartContainer = styled.div`
    width: 20px;
    margin-right: 10px;
`

const ButtonBox = styled.div`
    display: flex;
    justify-content: flex-end;
    button {
        height: 30px;
        padding: 0px 20px;
        width: unset;
    }
    button:first-child {
        border: none;
    }
`;

const CardFooter = (props) => {
    const { post, handleCommentClick} = props;
    // const [isLiked, setIsLiked] = useState(false);
    const [postLikes, setPostLikes] = useState(post.likes)
    const [isLiked, like] = useQandALike(props.slug, post.message_id)
    const { flagQandA } = useVideoService();

    const handleLiked= async () => {
        const newLikes = postLikes + 1
        setPostLikes(newLikes);
        like()
        
    }
    const handleFlag = (radioValue) => {
        flagQandA(props.slug, post.message_id, radioValue)
    }

    const  handleUnLiked =  () => {
        setPostLikes(postLikes - 1);
        like()
    }
    return (
        <Footer isReply={false} {...props}>
            <div>
                <LikesBox>
                    <StyledHeartContainer>
                        <LikableHeart
                            isLiked={isLiked}
                            onLike={handleLiked}
                        />
                    </StyledHeartContainer>
                    {postLikes >= ACTION_BAR_LIKES_DISPLAY_THRESHOLD ? (
                        <p>
                            {postLikes} Like{postLikes === 1 ? '' : 's'}
                        </p>
                    ) : null}
                </LikesBox>
                {handleCommentClick && (
                    <ButtonBox onClick={handleCommentClick}>
                        {post.replies.length > 0 ? (
                            <p>
                                {post.replies.length} Comment{post.replies.length >= 1 && 's'}
                            </p>
                        ) : (
                            <p>Comment</p>
                        )}
                    </ButtonBox>
                )}
            </div>
            <FlagableFlag isFlagged={false} onFlag={handleFlag} width={'18px'} />
        </Footer>
    );
}

CardFooter.propTypes = {
    //If it's a reply, it's indented and styled differently
    isReply: PropTypes.bool,
    post: PropTypes.object,
    slug: PropTypes.string,
    handleCommentClick: PropTypes.func,
}

export default CardFooter
