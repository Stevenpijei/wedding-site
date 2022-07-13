import React from 'react';
import cogoToast from 'cogo-toast';

interface IState {
    showToast: (props: ToastProps) => void;
}

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warn' | 'info' | 'loading';
}

interface IProps {
    children?: React.ReactNode | React.ReactNode[];
}

const initialState: IState = {
    showToast: () => null,
};

export const ToastContext = React.createContext<IState>(initialState);

export const ToastContextProvider = ({ children }: IProps) => {
    const showToast = ({ message, type }: ToastProps) => {
        const { hide } = cogoToast[type](message, {
            hideAfter: 7,
            position: 'top-right',
            onClick: () => {
                if (hide) hide();
            },
        });
    };

    return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>;
};
