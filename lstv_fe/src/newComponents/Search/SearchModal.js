import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router'

import { useSearch } from './use-search';

import Modal from '../Modal';
import SearchContent from './SearchContent';
import BaseCtaButton from '../buttons/BaseCtaButton';

const Container = styled.div`
    padding: 32px 0 0 0;
`;

const CloseContainer = styled.div`
    margin: 0 0 32px 0;
    padding: 0 24px;
    max-width: 170px;
`;

const SearchModal = () => {
    const { isSearchModalOpen, closeSearchModal } = useSearch();
    const [currentLocationKey, setCurrentLocationKey] = useState("")
    const location = useLocation()

    useEffect(() => {
        if (currentLocationKey && currentLocationKey !== location.pathname) {
            closeSearchModal()
        }

        setCurrentLocationKey(location.pathname)
    }, [location])

    return isSearchModalOpen ? (
        <Modal open={isSearchModalOpen} shouldDisableScroll={false} showCloseButton={false} customStyles={modalStyles}>
            <Container>
                <CloseContainer>
                    <BaseCtaButton title="Back" size="fullWidthMedium" onClick={closeSearchModal} iconLeft />
                </CloseContainer>
                {isSearchModalOpen ? <SearchContent source="modal" /> : null}
            </Container>
        </Modal>
    ) : null;
};

const modalStyles = {
    content: {
        borderRadius: '0',
        padding: 0
    },
};

export default SearchModal;