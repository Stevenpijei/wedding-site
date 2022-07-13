import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Avatar from '../../../../newComponents/Avatar';
import { useInPageMessagingService } from '../../../../rest-api/hooks/useInPageMessagingService';
import { UserDevice } from '../../../../global/globals';
import { useAuthService } from '../../../../rest-api/hooks/useAuthService';
import { OutlinedCTAButton } from '../../../../newComponents/common/OutlinedCTALink';
import { useSelector } from 'react-redux';
import { useMediaReady } from '../../../../utils/LSTVUtils';
import TextareaAutosize from 'react-textarea-autosize';
import LSTVLink from '../../../Utility/LSTVLink';

const NewCommentTeaxtArea = styled(TextareaAutosize)`
    border: 1px solid #ececec;
    border-radius: 20px;
    background: #f9f9f9;
    padding: 10px 90px 10px 20px;
    flex-grow: 1;
    height: 100%;
    resize: none;
    position: relative;
    @media ${UserDevice.tablet} {
        padding: 5px 20px;
        margin-left: 10px;
    }
`;
const WriteAComment = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 12px;
    align-items: center;
    @media ${UserDevice.tablet} {
        margin-left: 60px;
        flex-direction: column;
        align-items: flex-end;
    }
`;
const TopLine = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    position: relative;
    margin: 13px 0px;
    transition: height 0.2s ease-in;
    @media ${UserDevice.tablet} {
        margin: 60px 0px 20px 0px;
        width: 100%;
    }
`;
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

const MobileCommentButton = styled(OutlinedCTAButton)`
    position: absolute;
    right: 0px;
    bottom: 0px;
    width: unset;
    padding: 8px 8px;
    transition: all 0.2s ease-in;
`;

// eslint-disable-next-line react/display-name
const NewCommentComp = React.forwardRef(({ message_id,  parentMessageId, slug, handleNewComment, value, closeComment}, ref) => {
    const { loggedIn, goToLogin } = useAuthService();
    const [isDesktop, ready] = useMediaReady(UserDevice.tablet, false)
    const [newCommentContent, setNewCommentContent] = useState('');
    const [newCommentId, setNewCommentId] = useState('')
    const [isFocused, setIsFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false)
    const { postComment, editComment, cancel } = useInPageMessagingService();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        if(value) {
            setNewCommentContent(value);
            setNewCommentId(message_id) 
        }
    }, [value, message_id])

    const addNewComment = () => {
        setIsSaving(true)
        // If a value is supplied we are editing a comment
        if(value) {
            editComment(slug, newCommentId, newCommentContent).then(data => {
                setIsSaving(false);
                handleNewComment({newCommentContent, newCommentId});
                // closeComment();
                setNewCommentContent('');
                setNewCommentId('') 
            })
        } else {
            postComment(slug, newCommentContent, parentMessageId).then(data => {
                setIsSaving(false);
                if(data) {
                    handleNewComment(data);
                    setNewCommentContent('');
                    setNewCommentId('') 
                }
            }),
            (error) => {
                console.log(error);
                setIsSaving(false)
            }
        }
    };

    const renderSubmitButtonText = () => {
        if(isSaving){
            return 'Saving'
        } else if(value) {
            return "update"
        } else {
            return 'Comment'
        }
    }

    return(
        ready &&
        <>
        { loggedIn ? 
            <WriteAComment>
                <TopLine >
                    {isDesktop && loggedIn && <Avatar
                        imageSrc={user.profileThumbnail}
                        initial={user.firstName.slice(0, 1)}
                    />}
                    <NewCommentTeaxtArea
                        maxRows={4}
                        placeholder="Write a comment"
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent( e.target.value )}
                        onFocus={()=> setIsFocused(true)}
                        onBlur={()=> setIsFocused(false)}
                        onKeyPress={(e) => {
                            e.preventDefault;
                            // e.key === 'Enter' && handleNewComment(post.message_id);
                        }}
                        ref={ref} 
                     />
                    {!isDesktop && 
                        <MobileCommentButton isFocused={isFocused} onClick={() => addNewComment()} className='filled'>
                            {renderSubmitButtonText()}
                        </MobileCommentButton>
                    }
                </TopLine>
                {isDesktop &&  
                    <ButtonBox>
                    <OutlinedCTAButton onClick={closeComment}>Cancel</OutlinedCTAButton>
                        <OutlinedCTAButton onClick={() => addNewComment( )} className='filled'>
                            Comment
                        </OutlinedCTAButton>
                    </ButtonBox>
                }
            </WriteAComment>
        :
            <h5 style={{padding: '10px'}} onClick={() => goToLogin()}>Log in to post a comment</h5>
        }
        </> 
    )
})

NewCommentComp.propTypes = {
    message_id : PropTypes.string,
    parentMessageId : PropTypes.string,
    videoId : PropTypes.string,
    slug: PropTypes.string.isRequired,
    handleNewComment : PropTypes.func,
    //This is the initial input value, if supplied the component assumes you are editing a comment
    value : PropTypes.string,
    closeComment: PropTypes.func,
}

export default NewCommentComp;