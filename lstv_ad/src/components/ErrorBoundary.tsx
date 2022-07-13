import React from 'react';

interface State {
    hasError: boolean;
    errorMessage: string;
}

class ErrorBoundary extends React.Component<unknown, State> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: any) {
        return {
            hasError: true,
            errorMessage: JSON.stringify(error),
        };
    }

    handleClose = () => {
        this.setState({
            hasError: false,
        });
    };

    render() {
        const { hasError } = this.state;
        if (hasError) {
            return (
                <div
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <h2>Oops, something went wrong!</h2>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
