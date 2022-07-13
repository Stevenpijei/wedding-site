import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import styles from 'assets/tss/material-dashboard-pro-react/components/cardHeaderStyle';

interface Props {
    className?: string;
    color?: 'warning' | 'success' | 'danger' | 'info' | 'primary' | 'rose' | 'purple' | 'yellow';
    plain?: boolean;
    image?: boolean;
    contact?: boolean;
    signup?: boolean;
    stats?: boolean;
    icon?: boolean;
    text?: boolean;
    children: React.ReactNode | React.ReactNode[];
}

const useStyles = makeStyles(styles as any);

const CardHeader: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const { className = '', children, color, plain, image, contact, signup, stats, icon, text, ...rest } = props;
    const cardHeaderClasses = classNames({
        [classes.cardHeader]: true,
        [classes[color + 'CardHeader']]: color,
        [classes.cardHeaderPlain]: plain,
        [classes.cardHeaderImage]: image,
        [classes.cardHeaderContact]: contact,
        [classes.cardHeaderSignup]: signup,
        [classes.cardHeaderStats]: stats,
        [classes.cardHeaderIcon]: icon,
        [classes.cardHeaderText]: text,
        [className]: className !== undefined,
    });
    return (
        <div className={cardHeaderClasses} {...rest}>
            {children}
        </div>
    );
};

export default CardHeader;
