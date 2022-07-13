import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Stars from './Stars';
import { DeleteIcon, DotsIcon, EditIcon } from '../../components/Utility/LSTVSVG';
import theme from '../../styledComponentsTheme';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useBusinessService } from '../../rest-api/hooks/useBusinessService';
import FlagableFlag from '../../components/Utility/FlagableFlag';
import LikableHeart from '../../components/Utility/LikableHeart';
import Avatar from '../../newComponents/Avatar';
import { ACTION_BAR_LIKES_DISPLAY_THRESHOLD } from '../../global/globals';
import {GetElapsedTimeLabel} from "../../utils/LSTVUtils";

const Container = styled('div')`
    font-family: Calibre;
    border-bottom: 1px solid ${(props) => props.theme.midGrey};
    margin-bottom: 8px;

    &:last-of-type {
        border-bottom: none;
    }
`;

const Header = styled('div')`
    display: flex;
    justify-content: space-between;
`;

const User = styled('div')`
    display: flex;
    align-items: center;
`;

const UserName = styled('div')`
    font-weight: 500;
    margin: 0 0 0 5px;
`;

const Content = styled('p')`
    font-size: 1.125rem;
    line-height: 1.25rem;
    max-width: 650px;
    text-align: justify;
`;

const Title = styled('p')`
    font-family: Calibre;
    font-weight: 700;
    font-size: 1.25em;
    margin-bottom: 4px;
`;

const Reactions = styled('div')`
    display: flex;
    justify-content: space-between;
    margin: 16px 0;
`;

const Date = styled('div')``;

const Dots = styled(DotsIcon)`
    cursor: pointer;
`;
const DotContainer = styled.div`
    position: relative;
    padding: 8px;
`;

const EditMenu = styled.ul`
    position: absolute;
    top: 25px;
    width: 130px;
    right: 0;
    padding: 10px;
    background: #ffffff;
    box-shadow: 0px 0px 6px rgba(186, 186, 186, 0.25);
    cursor: pointer;
    
    z-index: ${theme.zIndex.dropdown} li {
        padding: 10px 5px;
        display: flex;
        align-items: center;
        cursor: pointer;
        svg {
            margin-right: 5px;
        }
    }
`;

const StyledHeartContainer = styled.div`
    width: 20px;
    margin-right: 10px;
`;

const Likes = styled.div`
    display: flex;
`;

export const EditReview = ({ handleEdit, handleDelete }) => {
    const [openMenu, setOpenMenu] = useState(false);

    const handleEditClick = () => {
        handleEdit();
        setOpenMenu(false);
    };

    const handleDeleteClick = () => {
        handleDelete();
        setOpenMenu(false);
    };

    return (
        <DotContainer>
            <Dots fillColor={theme.primaryPurple} onClick={() => setOpenMenu(!openMenu)} />
            {openMenu && (
                <EditMenu>
                    <li onClick={handleEditClick}>{<EditIcon />} Edit</li>
                    <li onClick={handleDeleteClick}>{<DeleteIcon />} Delete</li>
                </EditMenu>
            )}
        </DotContainer>
    );
};

const Review = ({ review, businessSlug, onEdit, onDelete, onFlag, onLike }) => {
    const { user, loggedIn } = useAuthService();
    const { getIsLikedBusinessReview } = useBusinessService();
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(review?.likes || 0);

    useEffect(() => {
        if (loggedIn) {
            getIsLiked();
        }
    }, [])

    const getIsLiked = async () => {
        const request = await getIsLikedBusinessReview(businessSlug, review.review_id);

        if (request?.like) {
            setIsLiked(true)
        }
    }

    const handleLikeClick = (isLiked) => {
        if (isLiked) {
            setLikes(likes + 1);
            setIsLiked(true);
        } else {
            setLikes(likes - 1);
            setIsLiked(false);
        }

        onLike(review.review_id, isLiked);
    };

    return (
        <Container key={review.review_id}>
            <Header>
                <User>
                    <Avatar imageSrc={review.author_thumbnail_url} initial={review.author?.slice(0, 1)} />
                    <UserName>{review.author}</UserName>
                </User>
                <Date>{GetElapsedTimeLabel(review.posted_at)}</Date>
            </Header>
            <Stars rate={review.rating} />
            {review?.title ? <Title>{review?.title}</Title> : null}
            <Content>{review.content}</Content>
            <Reactions>
                <Likes>
                    <StyledHeartContainer>
                        <LikableHeart
                            isLiked={isLiked}
                            onLike={handleLikeClick}
                        />
                    </StyledHeartContainer>
                    {likes > ACTION_BAR_LIKES_DISPLAY_THRESHOLD ? <p>{likes} Likes</p> : null}
                </Likes>
                {review.author_id === user.uid ? (
                    <EditReview
                        handleEdit={() => onEdit(review.review_id)}
                        handleDelete={() => onDelete(review.review_id)}
                    />
                ) : (
                    <FlagableFlag onFlag={(complaint)=> onFlag(review.review_id, complaint)} messageId={review.review_id} width={'18px'} title={"Report Review"} />
                )}
            </Reactions>
        </Container>
    );
};

export default Review;
