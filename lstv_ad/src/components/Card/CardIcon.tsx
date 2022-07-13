import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import styles from 'assets/tss/material-dashboard-pro-react/components/cardIconStyle';

interface Props {
    className?: string;
    color: 'warning' | 'success' | 'danger' | 'info' | 'primary' | 'rose';
    children: React.ReactNode | React.ReactNode[];
}

const useStyles = makeStyles(styles as any);

const CardIcon: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const { className = '', children, color, ...rest } = props;
    const cardIconClasses = classNames({
        [classes.cardIcon]: true,
        [classes[color + 'CardHeader']]: color,
        [className]: className !== undefined,
    });
    return (
        <div className={cardIconClasses} {...rest}>
            {children}
        </div>
    );
};

export default CardIcon;
