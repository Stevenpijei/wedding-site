import React from 'react';

import { Box, Grid } from '@material-ui/core';

export const HomeCardHeader: React.FC = () => {
    return (
        <Box mt="20px">
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    <Box component="span">Content Type</Box>
                </Grid>
                <Grid item xs={2}>
                    <Box component="span">Header</Box>
                </Grid>
                <Grid item xs={2}>
                    <Box component="span">CTA Text</Box>
                </Grid>
                <Grid item xs={2}>
                    <Box component="span">CTA Link</Box>
                </Grid>
                <Grid item xs={4}>
                    <Box component="span">Items</Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomeCardHeader;
