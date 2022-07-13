import React from 'react';
import styled from 'styled-components';
import Modal from '../newComponents/Modal';
import theme from '../styledComponentsTheme';
import { useModals } from '../global/use-modals'
import { useMediaReady } from '../utils/LSTVUtils';
import BaseCTAButton from './buttons/BaseCtaButton';
import { useHistory } from 'react-router';
import { useAuthService } from '../rest-api/hooks/useAuthService';

const Container = styled.div`
    padding: 16px 8px;
`;

const Buttons = styled.div`
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
`
const NewAccount = styled.button`
    background-color: unset;
    text-decoration: underline;
    margin-top: 20px;
    cursor: pointer;
`;

const LoginModal = () => {
    const { isLoginModalOpen, closeLoginModal } = useModals();
    const { goToLogin, goToSignUp } = useAuthService();
    let history = useHistory();

    const handleLoginClicked = () => {
        closeLoginModal();
        goToLogin();
    }
    const handleSignUpClicked = () => {
        closeLoginModal();
        goToSignUp();
    }

    return (
        isLoginModalOpen && (
            <Modal
                // fullHeight
                height={'fit-content'}
                width={'75vw'}
                // bigCloseButton
                open={isLoginModalOpen}
                onClose={() => closeLoginModal()}
                data-scroll-lock-scrollable
                title={'Log in to continue'}
                customStyles={{ content: { overflow: 'unset', maxWidth: '500px', margin: 'auto' }, container: {} }}
            >
                <Container>
                    <Buttons>
                        <BaseCTAButton title={'Login'} size={'medium'} onClick={() => handleLoginClicked()} />
                        <NewAccount onClick={() => handleSignUpClicked()}>Create new acount</NewAccount>
                    </Buttons>
                </Container>
            </Modal>
        )
    );
};

export default LoginModal;