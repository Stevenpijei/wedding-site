import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import styles from 'assets/tss/material-dashboard-pro-react/components/cardAvatarStyle';

interface Props {
    children: React.ReactNode | React.ReactNode[];
    className?: string;
    profile: boolean;
    plain: boolean;
    testimonial: boolean;
    testimonialFooter: boolean;
}

const useStyles = makeStyles(styles as any);

const CardAvatar: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const { children, className = '', plain, profile, testimonial, testimonialFooter, ...rest } = props;
    const cardAvatarClasses = classNames({
        [classes.cardAvatar]: true,
        [classes.cardAvatarProfile]: profile,
        [classes.cardAvatarPlain]: plain,
        [classes.cardAvatarTestimonial]: testimonial,
        [classes.cardAvatarTestimonialFooter]: testimonialFooter,
        [className]: className !== undefined,
    });
    return (
        <div className={cardAvatarClasses} {...rest}>
            {children}
        </div>
    );
};

export default CardAvatar;
