import React from 'react';
import styled from 'styled-components';
import ContactBusinessForm from '../components/Forms/ContactBusinessForm';

import Modal from '../newComponents/Modal';
import { BusinessHeader } from './reviews/AddReview';

import theme from '../styledComponentsTheme';
import birdsImage from '../images/birds_artwork.svg';

import { useModals } from '../global/use-modals'
import { useMediaReady } from '../utils/LSTVUtils';

const Container = styled.div`
    padding: 16px 8px;
    position: relative;

    @media ${theme.breakpoints.laptop} {
        display: grid;
        grid-template-columns: minmax(0, 0.5fr) minmax(0, 0.5fr);
        height: calc(100vh - 70px);
        grid-gap: 50px;
        padding: 0px;
    }
`;

const BirdsImage = styled.img`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    opacity: 0.05;
`;

const FormContainer = styled.div`
    margin: 10px 0 50px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;

    @media ${theme.breakpoints.laptop} {
        margin: 0px;
        margin-right: 100px;
    }
`;

const FormHeader = styled.div`
    @media ${theme.breakpoints.laptop} {
        width: auto;
        align-self: flex-start;
    }
`;

const ContactBusinessModal = () => {
    const { isContactBusinessModalOpen, closeContactBusinessModal, contactBusinessModalParams } = useModals();
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet);

    const { business, videoId, message } = contactBusinessModalParams  || {}

    const handleSuccess = () => {
        closeContactBusinessModal()
    }

    return ready && isContactBusinessModalOpen ? (
        <Modal
            fullHeight
            width="100%"
            bigCloseButton
            open={isContactBusinessModalOpen}
            shouldDisableScroll={true}
            onClose={() => closeContactBusinessModal()}
            data-scroll-lock-scrollable
        >
            <Container>
                {!isMobile ? (
                    <div>
                        <BirdsImage src={birdsImage} />
                    </div>
                ) : null}
                <FormContainer>
                    {business ? (
                        <FormHeader>
                            <BusinessHeader business={business} />
                        </FormHeader>
                    ) : null}
                    <ContactBusinessForm
                        id={'cf_' + business?.slug}
                        business={business}
                        videoId={videoId}
                        message={message}
                        onSuccess={handleSuccess}
                    />
                </FormContainer>
            </Container>
        </Modal>
    ) : null;
};

export default ContactBusinessModal;
