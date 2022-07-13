import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid, { GridProps } from '@material-ui/core/Grid';

const styles = {
    grid: {
        margin: '0 -15px',
        width: 'calc(100% + 30px)',
    },
};

const useStyles = makeStyles(styles as any);

const GridContainer: React.FC<GridProps> = ({ className = '', children = '', ...rest }: GridProps) => {
    const classes = useStyles();
    return (
        <Grid container {...rest} className={classes.grid + ' ' + className}>
            {children}
        </Grid>
    );
};

export default GridContainer;
