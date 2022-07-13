import React, { useState } from 'react';
import styled from 'styled-components';

import theme from '../../styledComponentsTheme';

import Stars from './Stars';
import Modal from '../../newComponents/Modal';
import CurrentUserAvatar from '../CurrentUserAvatar';
import BaseCTAButton from '../../newComponents/buttons/BaseCtaButton';
import TextareaAutosize from 'react-textarea-autosize';
import { Input, ErrorMessage } from '../forms/StyledForm';
import { useMediaReady } from '../../utils/LSTVUtils';
import birdsImage from '../../images/birds_artwork.svg';

const Section = styled.div`
    margin: 16px 0;
    padding: 16px 0;
    border-top: 1px solid ${theme.midGrey};
`;

const SectionTitle = styled.h2`
    font-family: 'Heldane Display', serif;
    font-weight: 800;
    font-size: 1.75em;
    margin: 16px 0;
`;

const TextArea = styled(TextareaAutosize)`
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
    min-height: 120px;
    background-color: #f9f9f9;
    width: 100%;
    box-sizing: border-box;
`;

const Container = styled.div`
    padding: 16px 8px;

    @media ${theme.breakpoints.laptop} {
        display: grid;
        grid-template-columns: 0.5fr 0.5fr;
    }
`;

const HeadlineContainer = styled.div`
    display: grid;
    grid-template-columns: 0.2fr 1fr;

    input {
        padding: 5px 16px;
    }
`;

const SendContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 24px 0 0 0;
`;

const TopTitle = styled('p')`
    height: 30px;
    font-size: 1.25rem;
    font-family: Calibre;
`;

const HeaderTitle = styled('h1')`
    font-size: 1.5em;
    font-weight: 800;
    padding: 0;
`;

const HeaderSubtitle = styled('h1')`
    font-size: 1em;
    font-weight: 800;
    margin-top: 8px;
    padding: 0;
`;

const Thumbnail = styled('img')`
    height: 60px;
    width: 60px;
    border-radius: 30px;
    margin-bottom: 8px;

    @media ${theme.breakpoints.tablet} {
        margin-bottom: 0;
    }
`;

const BusinessHeaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    @media ${theme.breakpoints.tablet} {
        flex-direction: row;
        width: 100%;
    }
`;

const FormContainer = styled.div`
    margin: 0 0 50px 0;
`;

const BusinessHeaderDetails = styled.div`
    @media ${theme.breakpoints.tablet} {
        margin: 0 0 0 16px;
    }
`;

const BusinessHeader = ({ business }) => {
    return (
        <BusinessHeaderContainer>
            <Thumbnail src={business?.thumbnailUrl} />
            <BusinessHeaderDetails>
                <TopTitle>{business?.roles?.map(({ name }) => name).join(', ')}</TopTitle>
                <HeaderTitle>{business?.name}</HeaderTitle>
                <HeaderSubtitle>
                    {business?.location?.place} {business?.location?.display_name}
                </HeaderSubtitle>
            </BusinessHeaderDetails>
        </BusinessHeaderContainer>
    );
};

const EditReviewForm = ({ review, onSubmit, onSuccess }) => {
    const [content, setContent] = useState(review?.content);
    const [title, setTitle] = useState(review?.title);
    const [rating, setRating] = useState(review?.rating);
    const [errors, setErrors] = useState({
        content: '',
        title: '',
    });

    const handleContentChange = ({ target: { value } }) => {
        setContent(value);
    };

    const handleTitleChange = ({ target: { value } }) => {
        setTitle(value);
    };

    const handleRateChange = (rate) => {
        setRating(rate);
    };

    const handleSubmit = async () => {
        const request = await onSubmit({ content, title, rating });

        if (request?.review_id) {
            onSuccess();
            return;
        }

        setErrors(request?.response_errors);
    };

    return (
        <div>
            <Section>
                <SectionTitle>Add Rating</SectionTitle>
                <Stars onClick={handleRateChange} size={52} emptyColor={theme.lightGrey} stroke={theme.midGrey} />
            </Section>
            <Section>
                <SectionTitle>Write Your Review</SectionTitle>
                <HeadlineContainer>
                    <CurrentUserAvatar />
                    <Input value={title} onChange={handleTitleChange} />
                </HeadlineContainer>
                {errors ? <ErrorMessage>{errors?.title}</ErrorMessage> : null}
                <TextArea onChange={handleContentChange} value={content} minLength={100} maxLength={500} />
                {errors ? <ErrorMessage>{errors?.content}</ErrorMessage> : null}
                <SendContainer>
                    <BaseCTAButton
                        hideIcon
                        title="Update"
                        disabled={!content || !rating}
                        onClick={handleSubmit}
                        style={ctaStyles}
                    />
                </SendContainer>
            </Section>
        </div>
    );
};

const EditReview = ({ open, onClose, review, business, onEdit }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.tablet);

    const handleSuccess = () => {
            onClose();
    };

    return ready ? (
        <Modal
            open={open}
            onClose={onClose}
            modalTitle="Edit Review"
            bigCloseButton
            customStyles={modalStyles}
            shouldDisableScroll={false}
        >
            <Container>
                {isMobile ? (
                    <div>
                        <img src={birdsImage} />
                    </div>
                ) : null}
                <FormContainer>
                    {business ? <BusinessHeader business={business} /> : null}
                    {review ? <EditReviewForm review={review} onSubmit={onEdit} onSuccess={handleSuccess} /> : null}
                </FormContainer>
            </Container>
        </Modal>
    ) : null;
};

const modalStyles = {
    content: {
        width: '100%',
        height: '100%',
    },
};

const ctaStyles = {
    paddingLeft: 0,
};

export default EditReview;
