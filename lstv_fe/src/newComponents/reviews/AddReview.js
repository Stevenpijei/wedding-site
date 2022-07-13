import React, { useState } from 'react';
import styled from 'styled-components';

import theme from '../../styledComponentsTheme';

import Stars from './Stars';
import Modal from '../../newComponents/Modal';
import CurrentUserAvatar from '../CurrentUserAvatar';
import BaseCTAButton from '../../newComponents/buttons/BaseCtaButton';
import TextareaAutosize from 'react-textarea-autosize';
import { ErrorMessage, Input } from '../forms/StyledForm';
import { useMediaReady } from '../../utils/LSTVUtils';
import birdsImage from '../../images/birds_artwork.svg';
import Avatar from '../Avatar';

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
    appearance: none;
    -webkit-appearance: none;
`;

const Container = styled.div`
    padding: 16px 8px;

    @media ${theme.breakpoints.laptop} {
        display: grid;
        grid-template-columns: 0.5fr 0.5fr;
        padding-right: 100px;
        padding-left: 100px;
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

    @media ${theme.breakpoints.laptop} {
        text-align: left;
    }
`;

const HeaderSubtitle = styled('h1')`
    font-size: 1em;
    font-weight: 800;
    margin-top: 8px;
    padding: 0;
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
`

const FormContainer = styled.div`
    margin: 0 0 50px 0;
  
 
`;

const AfterPostReviewNote = styled.p`
    font-size: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px 0 0 0;
    height: auto;
    text-align: center;
    line-height: 1.15em;
`;

const BusinessHeaderDetails = styled.div`
    margin: 8px 0 0 0;

    @media ${theme.breakpoints.tablet} {
        margin: 0 0 0 16px;
    }
`;

export const BusinessHeader = ({ business }) => {
    return (
        <BusinessHeaderContainer>
            <Avatar imageSrc={business?.thumbnailUrl} initial={business?.name.slice(0,1)} size='60px' fontSize='1.25rem' />
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

const AddReviewForm = ({ onSubmit, onSuccess }) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(0);
    const [errors, setErrors] = useState({
        content: '',
        title: ''
    })

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


        setErrors(request?.response_errors)
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
                <TextArea onChange={handleContentChange} minLength={100} maxLength={500} />
                {errors ? <ErrorMessage>{errors?.content}</ErrorMessage> : null}
                <SendContainer>
                    <BaseCTAButton
                        hideIcon
                        title="Send"
                        disabled={!content || !rating}
                        onClick={handleSubmit}
                        style={ctaStyles}
                    />
                </SendContainer>
            </Section>
        </div>
    );
};

const AddReview = ({ open, onClose, business, Header, onAdd }) => {
    const [isMobile, ready] = useMediaReady(theme.breakpoints.tablet);
    const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);

    const handleSuccess = () => {
        setIsSentSuccessfully(true);

        setTimeout(() => {
            onClose()
            setIsSentSuccessfully(false)
        }, 3 * 1000)
    }

    return ready ? (
        <Modal
            fullHeight
            bigCloseButton
            open={open}
            onClose={onClose}
            modalTitle="New Review"
            shouldDisableScroll={false}
            customStyles={modalStyles}
        >
            <Container>
                {isMobile ? (
                    <div>
                        <img src={birdsImage} />
                    </div>
                ) : null}
                <FormContainer>
                    {Header ? <Header /> : null}
                    {business ? <BusinessHeader business={business} /> : null}
                    {!isSentSuccessfully ? <AddReviewForm onSubmit={onAdd} onSuccess={handleSuccess} /> : null}
                    {isSentSuccessfully ? (
                        <AfterPostReviewNote>Thank you very much for the review.</AfterPostReviewNote>
                    ) : null}
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
    paddingLeft: 0
}

export default AddReview;
