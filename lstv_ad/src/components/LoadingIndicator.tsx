import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

const LoadingIndicator: React.FC = () => {
    return (
        <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
            <CircularProgress color="primary" />
        </Box>
    );
};

export default LoadingIndicator;
