import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import styles from 'assets/tss/material-dashboard-pro-react/components/cardFooterStyle';

interface Props {
    className?: string;
    plain?: boolean;
    profile?: boolean;
    pricing?: boolean;
    testimonial?: boolean;
    stats?: boolean;
    product?: boolean;
    chart?: boolean;
    children: React.ReactNode | React.ReactNode[];
}

const useStyles = makeStyles(styles as any);

const CardFooter: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const { className = '', children, plain, profile, pricing, testimonial, stats, chart, product, ...rest } = props;
    const cardFooterClasses = classNames({
        [classes.cardFooter]: true,
        [classes.cardFooterPlain]: plain,
        [classes.cardFooterProfile]: profile || testimonial,
        [classes.cardFooterPricing]: pricing,
        [classes.cardFooterTestimonial]: testimonial,
        [classes.cardFooterStats]: stats,
        [classes.cardFooterChart]: chart || product,
        [className]: className !== undefined,
    });
    return (
        <div className={cardFooterClasses} {...rest}>
            {children}
        </div>
    );
};

export default CardFooter;
