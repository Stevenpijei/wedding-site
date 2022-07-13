import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Avatar from '../../../../newComponents/Avatar';
import {  UserDevice } from '../../../../global/globals';
import CardFooter from './CardFooter';
import { useSelector } from 'react-redux';
import EditComment from './EditComment';
import MobileCardTitle from './MobileCardTitle';
import NewCommentComp from './NewComment';
import {GetElapsedTimeLabel} from "../../../../utils/LSTVUtils";

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 40px;
    border-bottom: 1px solid #ececec;
    margin-left: ${(props) => props.isReply && '60px'};
    background-color: ${(props) => props.isBeingEdited && 'beige'};
`;
const DesktopTitle = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 40px;
    h4 {
        font-family: Calibre;
        font-style: normal;
        font-weight: 500;
        font-size: 0.937rem;
        line-height: 1.125rem;
        margin-left: 10px;
        span {
            font-size: 1.125rem;
            font-weight: 400;
        }
    }
    p {
        font-size: 1.125rem;
    }
    div {
        display: flex;
        align-items: center;
    }
`;
const CardContent = styled.div`
    align-self: flex-start;
    width: 100%;
    .content {
        font-weight: normal;
        font-size: 1.125rem;
        line-height: 1.3rem;
        @media ${UserDevice.tablet} {
            margin-bottom: 20px;
            margin-left: ${(props) => props.isReply && '52px'};
        }
    }
`;

const CommentCard = ({ post, isReply, isMobile, isBeingEdited, slug, handleNewComment, handleEditClicked, handleDeleteClicked, children }) => {
    const [commentDefaultValue, setCommentDefaultValue] = useState('')
    const [newCommentId, setNewCommentId] = useState('')
    
    const user = useSelector((state) => state.user);
    const textInput = useRef(null);

    const handleNewCommentInterceptor = (data) => {
        handleNewComment(data)
    }

    const isReplyEditInterceptor = (message_id, content) => {
        setCommentDefaultValue(content)
        setNewCommentId(message_id)
    }
    const isReplyNewCommentInterceptor = (comment, success) => {
        setCommentDefaultValue('');
        setNewCommentId('');
        handleNewComment(comment, success)
    }

    const handleEditClickedInterceptor = (message_id, content) => {
        if(isReply) {
            isReplyEditInterceptor(message_id, content)
            
        } else if(isMobile) {
            // This passes editing state responsibility up to parent for mobile only
            handleEditClicked(message_id) 
        } else {
            // This set the default value for parent questions on desktop
            setCommentDefaultValue(content)
            setNewCommentId(message_id)
            textInput.current.focus()
        }
    }

    

    return (
        <>
        <CardContainer key={post.message_id} isReply={isReply} isBeingEdited={isBeingEdited}>
            { isMobile ? 
                <MobileCardTitle post={post} isEditable={user.uid === post.author_id} handleEditClicked={() => handleEditClickedInterceptor(post.message_id)} handleDeleteClicked={() => handleDeleteClicked(post.message_id)} /> 
            :
                <DesktopTitle>
                    {post.author &&
                    <div>
                        <Avatar imageSrc={post.author_thumbnail_url} initial={post?.author.slice(0, 1)} />
                        <h4>
                            {post.author} <span>Wrote:</span>
                        </h4>
                    </div>
                    }
                    {user.uid === post.author_id  ? 
                        <EditComment loggedInUserId={user.uid} commentAuthorId={post.author_id} handleEditClicked={() => handleEditClickedInterceptor(post.message_id, post.content)} handleDeleteClicked={() => handleDeleteClicked(post.message_id)} />
                    :
                        <p>{GetElapsedTimeLabel(post.posted_at)}</p>
                    }   
                </DesktopTitle>
            }
            <CardContent isReply={isReply}>
                {newCommentId && isReply ? 
                    <NewCommentComp 
                        message_id={newCommentId} 
                        parentMessageId={post.message_id} 
                        value={commentDefaultValue} 
                        slug={slug}
                        handleNewComment={isReplyNewCommentInterceptor}
                        closeComment ={() => setNewCommentId('')}
                        ref={textInput}   
                    />
                :   
                    <p className="content">{post.content}</p>
                }
            </CardContent>
            <CardFooter isreply={isReply} post={post} slug={slug} />
        </CardContainer>

        {children}

        {!isReply && !isMobile && 
            <NewCommentComp 
                message_id={newCommentId} 
                parentMessageId={post.message_id} 
                value={commentDefaultValue} 
                slug={slug}
                handleNewComment={handleNewCommentInterceptor} 
                ref={textInput}   
            />
        }
        </>
         );
}

CommentCard.propTypes = {
    post: PropTypes.object,
    isReply: PropTypes.bool,
    isMobile: PropTypes.bool,
    isBeingEdited: PropTypes.bool,
    slug: PropTypes.string,
    videoId: PropTypes.string,
    handleNewComment: PropTypes.func,
    handleEditClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,
    children: PropTypes.array,
}

CommentCard.defaultProps = {
    isMobile: false,
    isBeingEdited: false
}

export default CommentCard
