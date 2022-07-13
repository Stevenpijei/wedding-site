import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { Box, BoxProps } from '@material-ui/core';
import { IError } from 'interface';

interface Props extends BoxProps {
    error: IError | null;
    isError: boolean;
}

const ErrorAlert: React.FC<Props> = ({ error, isError, ...rest }: Props) => {
    if (!isError) return <></>;

    return (
        <Box my="10px" {...rest}>
            <Alert severity="error">{(error && error.message) || 'Service unavailable.'}</Alert>
        </Box>
    );
};

export default ErrorAlert;
