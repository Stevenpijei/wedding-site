import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid, { GridProps } from '@material-ui/core/Grid';

const styles = {
    grid: {
        padding: '0 15px !important',
    },
};

const useStyles = makeStyles(styles as any);

const GridItem: React.FC<GridProps> = ({ children, className, ...rest }: GridProps) => {
    const classes = useStyles();
    return (
        <Grid item {...rest} className={classes.grid + ' ' + className}>
            {children}
        </Grid>
    );
};

export default GridItem;
