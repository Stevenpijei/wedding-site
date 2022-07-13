import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { UserDevice } from '../../../../global/globals';
import { Section, SectionTitle } from '../LayoutComps';
import { useMediaReady, couplesNamesFromProperties } from '../../../../utils/LSTVUtils';
import { OutlinedCTAButton } from '../../../../newComponents/common/OutlinedCTALink';
import { useInPageMessagingService } from '../../../../rest-api/hooks/useInPageMessagingService';
import Modal  from '../../../../newComponents/Modal';
import MobileCards from './MobileCards';
import CommentCard from './CommentCard';
import birdsImage from '../../../../images/birds_artwork.svg';
import theme from '../../../../styledComponentsTheme'
import { useVideoService } from '../../../../rest-api/hooks/useVideoService';
import { useAuthService } from '../../../../rest-api/hooks/useAuthService';
import { useModals } from '../../../../global/use-modals';

const QandAContainer = styled.div`
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
`;



const QuestionButton = styled(OutlinedCTAButton)`
    /* margin-top: 40px; */
    width: 70%;
    margin: 40px auto 0px auto;
    @media ${UserDevice.tablet} {
        position: absolute;
        top: 0;
        right: 20px;
        width: 200px;
        padding: 5px;
        margin-top: 20px;
    }
`;
const SubmitQuestionButton = styled(OutlinedCTAButton)`
    /* margin-top: 40px; */
    width: 70%;
    margin: 40px auto 0px auto;
    @media ${UserDevice.tablet} {
        width: 250px;
        margin: 20px auto;
    }
`;

const NewQuestion = styled.textarea`
    
    /* Remove First */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    
    border: 1px solid #E5E5E5;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
    width: 100%;
    height: 120px;
    background-color: #F9F9F9;
    @media ${UserDevice.tablet} {
        width: 350px;
        margin: 5px auto;
    }
`;

const DesktopContainer = styled.div`
    /* border: 1px solid green; */
`;

const ShowAllButton = styled.div`
    display: none;
    background: #f9f9f9;
    border: 1px solid #ececec;
    box-sizing: border-box;
    border-radius: 4.5px;
    margin-top: 60px;
    cursor: pointer;
    &:hover {
        border: 1px solid black;
        p {
            color: black;
        }
    }
    p {
        font-family: Calibre;
        text-align: center;
        font-size: 1.125rem;
        line-height: 1.5rem;
        color: #9b9b9b;
    }
    @media ${UserDevice.tablet} {
        display: block;
    }
`;
const NewQuestionModal = styled(Modal)`
    /* z-index: 0; */
`
const NewQuestionModalContent = styled.div`
    padding: 16px 8px;
    position: relative;
    height: 100%;

    @media ${theme.breakpoints.laptop} {
        display: grid;
        grid-template-columns: minmax(0, 0.5fr) minmax(0, 0.5fr);
        height: calc(100vh - 70px);
        padding: 0px;
    }

    h4 {
        text-align: center;
        font-size: 2rem;
        line-height: 2.5rem;
        font-weight: 800;
        margin: 0 0 8px 0;
    }
    h5 {
        text-align: center;
        font-size: 1.25rem;
        line-height: 1.5rem;
        font-weight: 400;
        margin: 0 0 16px 0;
    }
    /* padding: 10px; */
`;

const NewQuestionForm = styled.div`
    margin: 10px 0 50px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media ${theme.breakpoints.laptop} {
        margin: 0px;
        margin-right: 100px;
    }
`;


const BirdsImage = styled.img`
    position: absolute;
    bottom: 0;
    left: 0;
`;

const EmptyPara = styled.p`
    font-family: Calibre;
    font-weight: normal;
    font-size: 1.25rem;
    line-height: 1.5rem;
`
// This is a hook to make using the QandA Like easier all over the place. 
export const useQandALike = (video_slug, qAndA_id) => {
    const [isLiked, setIsLiked] = useState(false)
    const { getQandALike, likeQandA, unLikeQandA  } = useVideoService();
    const { loggedIn  } = useAuthService();

    useEffect(() => {
        if (loggedIn) {
            getQandALike(video_slug, qAndA_id).then((response) => {
                setIsLiked(response?.like);
            });
        }
    }, [])

    const like = () => {
        if(isLiked) {
            unLikeQandA(video_slug, qAndA_id)
        } else {
            likeQandA(video_slug, qAndA_id)
        }
        setIsLiked(!isLiked);
    }
    return [isLiked, like];
}

const QandA = ({ data }) => {
    const { q_and_a, id, slug, location } = data;
    const [QandAData, setQandAData] = useState()
    const coupleNames = couplesNamesFromProperties(data.post_properties)
    const [isDesktop, ready] = useMediaReady(UserDevice.tablet, false);
    const [showNewQuestionContainer, setShowNewQuestionContainer] = useState(false);
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    const [newQuestion, setNewQuestion] = useState({message_id: '', content: ''});
    const { loggedIn } = useAuthService();
    const { openLoginModal } = useModals();
    
    const { postRootLevelQuestion, getQandA, editComment, deleteComment, cancel } = useInPageMessagingService();

    useEffect(() => {
        setQandAData(q_and_a)
        // setQandAData(testData)
    }, [q_and_a])

    const fetchQandAData = async () => {
        try {
            const data = await getQandA(id)

            if (data.success) {
                setQandAData(data);
            }
        } catch (error) {
            console.log(error)
        }
    }
    

    const handleSubmittingQuestion = () => {
        setShowNewQuestionContainer(false);
        if(newQuestion.message_id === '') {
            postRootLevelQuestion(slug, newQuestion.content).then(data => {
                if(data && data?.success) {
                    
                    setQandAData([...QandAData, data])
                    setShowNewQuestionContainer(false);
                } else if( data && !data.success) {
                    console.log("Error in submitting new question", data)
                }
            })
            ,(e) => {
                console.log(e)
            }
            // return () => {
            //     cancel()
            // }
        } else {
            editComment(slug, newQuestion.message_id, newQuestion.content).then(data => {
            if(data) {
                const tempArr = [...QandAData];
                tempArr[tempArr.findIndex(el=> (el.message_id=== newQuestion.message_id))].content = newQuestion.content
                setQandAData([...tempArr])
                setShowNewQuestionContainer(false);
                setNewQuestion({content: '', message_id: ''})

            }
          })
        }
    }

    const handleNewComment = (data) => {
        // This also handles updating UI after edits to top-level and comments
        if(data?.message_id) {
            // this is a new comment
            const tempArr = [...QandAData];
            tempArr[tempArr.findIndex(el=> el.message_id === data.parent_message_id)].replies.push(data)
            setQandAData([...tempArr])
        } else {
            // this is an edit to a top level question on desktop
            const tempArr = [...QandAData];
            const editedComment = tempArr.find(ele => (ele.message_id === data.newCommentId))
            if(editedComment) {
                tempArr.find(ele => (ele.message_id === data.newCommentId)).content = data.newCommentContent
            } else {
                // The edit is on a comment
                tempArr.forEach((element, index) => {
                    const commentIndex = element.replies.findIndex(comment => (comment.message_id === data.newCommentId));
                    if(commentIndex !== -1){
                        tempArr[index].replies[commentIndex].content = data.newCommentContent
                    }
                })
            }
            setQandAData([...tempArr])
        }
    }

    const handleEditClicked = (content, message_id) => {
        setNewQuestion({content: content, message_id: message_id});
        setShowNewQuestionContainer(true);
    }
    const handleAskAQuestion = () => {
        if(!loggedIn){
            openLoginModal();
        } else {
            setShowNewQuestionContainer(!showNewQuestionContainer)
        }
    }

    const handleDeleteClicked = (message_id) => {
        deleteComment(slug, message_id).then(data => {
            if(data) {
                // removes top level comments
                const filtered = QandAData.filter(comment => ( comment.message_id !== message_id))
                
                if (filtered.length === QandAData.length) {
                    // removes nested comments
                    filtered.forEach(element => {
                        element.replies = element.replies.filter(comment => (comment.message_id !== message_id))
                    });
                }
                setQandAData(filtered)
            }
        })
    }
    
    
    return (
        ready && (
            <Section>
                <QandAContainer>
                    <SectionTitle>Questions about {!isDesktop && <br />}this wedding</SectionTitle>
                    {QandAData.length < 1 && (
                        <div>
                            <EmptyPara>There aren't any questions yet. Ask the first question!</EmptyPara>
                        </div>
                    )}
                    {isDesktop ? (
                        <DesktopContainer>
                            {QandAData?.map(
                                (post, index) =>
                                    (index === 0 || showAllQuestions) && (
                                        <CommentCard
                                            handleEditClicked={handleEditClicked}
                                            handleNewComment={handleNewComment}
                                            handleDeleteClicked={handleDeleteClicked}
                                            post={post}
                                            key={post.message_id}
                                            slug={slug}
                                        >
                                            {post.replies.map((reply) => (
                                                <CommentCard
                                                    post={reply}
                                                    key={reply.message_id}
                                                    isReply={true}
                                                    handleEditClicked={handleEditClicked}
                                                    handleDeleteClicked={handleDeleteClicked}
                                                    handleNewComment={handleNewComment}
                                                    slug={slug}
                                                />
                                            ))}
                                        </CommentCard>
                                    )
                            )}
                        </DesktopContainer>
                    ) : (
                        QandAData.length > 0 && (
                            <MobileCards
                                QandAData={QandAData}
                                post={data}
                                key={data.message_id}
                                videoId={id}
                                slug={slug}
                                handleNewComment={handleNewComment}
                                handleEditClicked={handleEditClicked}
                                handleDeleteClicked={handleDeleteClicked}
                            />
                        )
                    )}

                    <NewQuestionModal
                        width="100%"
                        open={showNewQuestionContainer}
                        onClose={() => setShowNewQuestionContainer(false)}
                        bigCloseButton={true}
                        fullHeight
                        data-scroll-lock-scrollable
                    >
                        <NewQuestionModalContent>
                            {isDesktop ? (
                                <div>
                                    <BirdsImage src={birdsImage} />
                                </div>
                            ) : null}
                            <NewQuestionForm>
                                    <h4>{coupleNames}</h4>
                                    <h5>{`in ${location.display_name}`}</h5>
                                <NewQuestion
                                    rows="5"
                                    placeholder="Ask a question"
                                    value={newQuestion.content}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                />
                                <SubmitQuestionButton onClick={() => handleSubmittingQuestion()} className={'filled'}>
                                    {newQuestion.message_id ? 'Update your question' : 'Post'}
                                </SubmitQuestionButton>
                            </NewQuestionForm>
                        </NewQuestionModalContent>
                    </NewQuestionModal>

                    <QuestionButton onClick={() => handleAskAQuestion()}>
                        {'Ask a Question'}
                    </QuestionButton>
                    {!showAllQuestions && QandAData.length > 1 && (
                        <ShowAllButton onClick={() => setShowAllQuestions(true)}>
                            <p>
                                Show {QandAData.length - 1} more question{QandAData.length > 2 ? 's' : ''}
                            </p>
                        </ShowAllButton>
                    )}
                </QandAContainer>
            </Section>
        )
    );
};

export default QandA;

