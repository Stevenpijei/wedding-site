import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components';
import Avatar from '../../../../newComponents/Avatar';
import LinesEllipsis from 'react-lines-ellipsis';
import Modal  from '../../../../newComponents/Modal';
import {  SimpleCardGrid } from '../LayoutComps';
import CardFooter from './CardFooter';
import CommentCard from './CommentCard';
import NewCommentComp from './NewComment';
import MobileCard from './MobileCard';
import {GetElapsedTimeLabel} from "../../../../utils/LSTVUtils";
import { useVideoService } from '../../../../rest-api/hooks/useVideoService';


const MobileContainer = styled(SimpleCardGrid)`
    margin-right: -20px;
`;

const CardContent = styled.div`
    align-self: flex-start;
    p {
        font-weight: normal;
        font-size: 1.125rem;
        line-height: 1.3rem;
    }
`;

const StyledModal = styled(Modal)`
    z-index: 100;
`

const ModalCardTitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    margin-bottom: 40px;
    margin-top: 40px;
    h4 {
        margin-top: 10px;
    }
    h5 {
        text-align: center;
        font-size: 1.25rem;
        line-height: 1.5rem;
        font-weight: 400;
        color: #9b9b9b;
    }

`;
const ModalCardFooter = styled(CardFooter)`
    border-bottom: 1px solid #ECECEC;
`;

const ModalChildrenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px);
    overflow: overlay;
    border-bottom: 1px solid #ECECEC;
    h4 {
        font-family: Calibre;
        font-style: normal;
        font-weight: 400;
        font-size: 1.25rem;
        line-height: 1.5rem;
    } 
`;
const MobileCards = ({ QandAData, videoId, slug, handleNewComment, handleEditClicked, handleDeleteClicked }) => {
    const [commentsModalData, setShowCommentsModal] = useState(QandAData[0]);
    const [selectedPostId, setSelectedPostId] = useState(QandAData[0]?.message_id)
    const [showModal, setShowModal] = useState(false);
    const [commentDefaultValue, setCommentDefaultValue] = useState('')
    const [newCommentId, setNewCommentId] = useState(QandAData[0].message_id)
    const textInput = useRef(null);
    const dummyDiv = useRef(null);
    const { flagQandA } = useVideoService();
    

    useEffect(() => {
        
        const selectedComment = QandAData.find(element => element.message_id === selectedPostId);
        setShowCommentsModal(selectedComment);
        setNewCommentId(selectedComment.message_id)
        if(commentsModalData.message_id === selectedComment.message_id && commentsModalData.replies.length < selectedComment.replies.length) {
            setTimeout(() => dummyDiv.current.scrollIntoView({ behavior: "smooth" }), 200);
        }
       
        
    }, [selectedPostId, QandAData])

    

    const handleShow = (post) => {
        setSelectedPostId(post.message_id)
        //This lets the props reset before the comp is shown so you get a clean animation
        setTimeout(() => {
            setShowModal(true);
        }, 50);
    }

    const scrollAndSelectInput = (scroll=true) => {
        //scroll to bottom of modal,
        scroll && dummyDiv.current.scrollIntoView({ behavior: "smooth" });
        // if you do this, it overirdes the scroll behavior, so setTimeout waits for that to be finished
        setTimeout(()=>  textInput.current.focus(), 600);
    }

    const handleParentCommentClicked = () => {
        scrollAndSelectInput()
        setNewCommentId(commentsModalData.message_id);
        setCommentDefaultValue('');
    }

    const handleCommentInterceptor = (data) => {
        handleNewComment(data);
        setCommentDefaultValue('')
        
        // this comment was an edit update
        if(data.message_id) {
            console.log('updated message', data.content) 
            // setActive state to false
        }
    }

    const handleEditCommentClicked = (message_id) => {
        const editedMessage = commentsModalData.replies.find(reply => reply.message_id === message_id);
        scrollAndSelectInput(false)
        setNewCommentId(editedMessage.message_id);
        setCommentDefaultValue(editedMessage.content);
    }

    const handleFlag = (message_id, radioValue) => {
        flagQandA(slug, message_id, radioValue)
    }
    

    return (
        <>
        <MobileContainer>
            {QandAData?.length > 0 && QandAData?.map(post => (
                <MobileCard post={post} setShowCommentsModal={handleShow}  key={post.message_id} handleEditClicked={handleEditClicked} handleDeleteClicked={handleDeleteClicked} 
                handleFlag={(radioValue) => handleFlag(post.message_id, radioValue)} />
            ))}
        </MobileContainer>

        {/* MODAL HERE */}
        <StyledModal open={showModal} onClose={() => setShowModal(false)} bigCloseButton={true} fullHeight key={commentsModalData.message_id} data-scroll-lock-scrollable>
            <ModalChildrenContainer>
                <div style={{ width: "100%", overflow: 'overlay'}} data-scroll-lock-scrollable>
                    <ModalCardTitleContainer isOverlay>
                        <Avatar
                            imageSrc={commentsModalData.author_thumbnail_url}
                            initial={commentsModalData.author.slice(0, 1)}
                            size={'92px'}
                            fontSize={'2.125rem'}
                        />
                        <h4>{commentsModalData.author}</h4>
                        <h5>{GetElapsedTimeLabel(commentsModalData.posted_at)}</h5>
                    </ModalCardTitleContainer>

                    <CardContent>
                        <LinesEllipsis text={commentsModalData.content} maxLine={3} component="p" />
                    </CardContent>
                    <ModalCardFooter isreply={false} slug={slug} post={commentsModalData} handleCommentClick={handleParentCommentClicked}/>
                    
                    {commentsModalData.replies.map(reply => (
                        <CommentCard 
                            post={reply} 
                            key={reply.message_id} 
                            slug={slug}
                            handleNewComment={handleCommentInterceptor} 
                            handleEditClicked={handleEditCommentClicked} 
                            handleDeleteClicked={handleDeleteClicked}
                            isMobile 
                            isBeingEdited={reply.message_id === newCommentId}
                        />
                    ))}
                     <div style={{ }}
                        ref={dummyDiv}>
                    </div>
                </div>
                <div style={{flexBasis: '70px'}}>
                    <NewCommentComp 
                        message_id={newCommentId} 
                        parentMessageId={commentsModalData.message_id} 
                        value={commentDefaultValue} 
                        slug={slug}
                        handleNewComment={handleCommentInterceptor} 
                        ref={textInput} 
                    />
                </div>
            </ModalChildrenContainer>
        </StyledModal>
        
    </>
    )
}



export default MobileCards
