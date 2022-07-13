import React from 'react';
import classNames from 'classnames';

// material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import styles from 'assets/tss/material-dashboard-pro-react/components/buttonStyle';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(styles as any);

interface Props {
    color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'rose' | 'white' | 'transparent';
    size?: 'sm' | 'lg';
    simple?: boolean;
    round?: boolean;
    disabled?: boolean;
    block?: boolean;
    link?: boolean;
    justIcon?: boolean;
    className?: string;
    loading?: boolean;
    // use this to pass the classes props from Material-UI
    muiClasses?: any;
    children?: React.ReactNode | React.ReactNode[];
    [key: string]: any;
}

const RegularButton: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {
        color = 'primary',
        round,
        children,
        disabled,
        simple,
        size = 'sm',
        block,
        link,
        justIcon,
        className = '',
        muiClasses,
        loading = false,
        ...rest
    } = props;
    const btnClasses = classNames({
        [classes.button]: true,
        [classes[size]]: size,
        [classes[color]]: color,
        [classes.round]: round,
        [classes.disabled]: disabled,
        [classes.simple]: simple,
        [classes.block]: block,
        [classes.link]: link,
        [classes.justIcon]: justIcon,
        [className]: className,
    });
    return (
        <Button {...rest} classes={muiClasses} className={btnClasses}>
            {loading && (
                <div style={{ marginRight: '10px' }}>
                    <CircularProgress style={{ color: 'white' }} size={15} />
                </div>
            )}
            {children}
        </Button>
    );
};

export default RegularButton;
