import React, { useState, createContext, useContext } from 'react';

const modalsContext = createContext({
    isContactBusinessModalOpen: false,
    isLoginModalOpen: false,
    isFlagModalOpen: false,
    contactBusinessModalParams: null,
    flagModalParams: null,
    openContactBusinessModal: () => {},
    openLoginModal: () => {},
    closeContactBusinessModal: () => {},
    closeLoginModal: () => {},
    openFlagModal: () => {}, 
    closeFlagModal: () => {},
});

const useModals = () => {
    return useContext(modalsContext);
};

const useProvideModals = () => {
    const [isContactBusinessModalOpen, setIsContactBusinessModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
    const [contactBusinessModalParams, setContactBusinessModalParams] = useState(null);
    const [flagModalParams, setFlagModalParams] = useState(null);

    const openContactBusinessModal = (params) => {
        setIsContactBusinessModalOpen(true)
        setContactBusinessModalParams(params);
    };
       
    const closeContactBusinessModal = () => {
        setIsContactBusinessModalOpen(false)
        setContactBusinessModalParams(null);
    };
    const openLoginModal = () => {
        setIsLoginModalOpen(true)
    };
    const openFlagModal = (params) => {
        setIsFlagModalOpen(true)
        setFlagModalParams(params)
    };

    
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };
    const closeFlagModal = () => {
        setIsFlagModalOpen(false);
    };

    return {
        isContactBusinessModalOpen,
        isLoginModalOpen,
        isFlagModalOpen,
        openContactBusinessModal,
        openLoginModal,
        openFlagModal,
        contactBusinessModalParams,
        flagModalParams,
        closeContactBusinessModal,
        closeLoginModal,
        closeFlagModal
    };
};

function ModalsProvider({ children }) {
    const modals = useProvideModals();

    return <modalsContext.Provider value={modals}>{children}</modalsContext.Provider>;
}

export { useModals, ModalsProvider };
