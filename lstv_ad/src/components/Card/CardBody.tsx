import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import styles from 'assets/tss/material-dashboard-pro-react/components/cardBodyStyle';

interface Props {
    className?: string;
    background?: boolean;
    plain?: boolean;
    formHorizontal?: boolean;
    pricing?: boolean;
    signup?: boolean;
    color?: boolean;
    profile?: boolean;
    calendar?: boolean;
    children: React.ReactNode | React.ReactNode[];
}

const useStyles = makeStyles(styles as any);

const CardBody: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {
        className = '',
        children,
        background,
        plain,
        formHorizontal,
        pricing,
        signup,
        color,
        profile,
        calendar,
        ...rest
    } = props;
    const cardBodyClasses = classNames({
        [classes.cardBody]: true,
        [classes.cardBodyBackground]: background,
        [classes.cardBodyPlain]: plain,
        [classes.cardBodyFormHorizontal]: formHorizontal,
        [classes.cardPricing]: pricing,
        [classes.cardSignup]: signup,
        [classes.cardBodyColor]: color,
        [classes.cardBodyProfile]: profile,
        [classes.cardBodyCalendar]: calendar,
        [className]: className !== undefined,
    });
    return (
        <div className={cardBodyClasses} {...rest}>
            {children}
        </div>
    );
};

export default CardBody;
