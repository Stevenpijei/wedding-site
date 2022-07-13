import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface ModalProps {
    content: React.ReactNode | React.ReactNode[];
    header: React.ReactNode | React.ReactNode[];
}

interface ConfirmModalProps extends ModalProps {
    confirmButton: {
        name: string;
        action: () => void;
    };
}

interface IState {
    showModal: (payload: ModalProps) => void;
    showConfirmModal: (payload: ConfirmModalProps) => void;
    closeModal: () => void;
}

const initialState: IState = {
    showModal: () => null,
    showConfirmModal: () => null,
    closeModal: () => null,
};

export const ModalContext = React.createContext<IState>(initialState);

interface Props {
    children?: React.ReactNode | React.ReactNode[];
}

export const ModalContextProvider: React.FC<Props> = ({ children }: Props) => {
    const [open, setOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<React.ReactNode | React.ReactNode[]>('');
    const [modalHeader, setModalHeader] = useState<React.ReactNode | React.ReactNode[]>('');
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const [confirmButton, setConfirmButton] = useState<{
        name: string;
        action: () => void;
    } | null>(null);

    const showModal = ({ content, header }: ModalProps) => {
        setModalContent(content);
        setModalHeader(header);
        setOpen(true);
    };

    const showConfirmModal = ({ confirmButton: _confirmButton, content, header }: ConfirmModalProps) => {
        setConfirmModal(true);
        setModalContent(content);
        setModalHeader(header);
        setConfirmButton(_confirmButton);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setModalContent('');
        setModalHeader('');
        setConfirmButton(null);
        setConfirmModal(false);
    };

    const handleConfirm = () => {
        if (confirmButton) {
            confirmButton.action();
            closeModal();
        }
    };

    return (
        <ModalContext.Provider value={{ showModal, showConfirmModal, closeModal }}>
            {children}
            {open && (
                <Dialog open={open} onClose={closeModal}>
                    <Box padding="8px 24px" display="flex" justifyContent="space-between" alignItems="center">
                        <h3 style={{ margin: '0 0' }}>{modalHeader}</h3>
                        <IconButton aria-label="close" onClick={closeModal}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider />
                    <DialogContent>{modalContent}</DialogContent>
                    {confirmModal && (
                        <DialogActions>
                            <Button onClick={closeModal} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirm} color="primary" autoFocus>
                                {confirmButton?.name}
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            )}
        </ModalContext.Provider>
    );
};
