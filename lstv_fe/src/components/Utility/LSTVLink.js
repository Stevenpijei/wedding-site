import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const LSTVLink = (props) => {
    let rc;

    // @TODO: remove this after LSTV2 cleanup. As of Oct/2020 we may still have edge cases where "to" props will be
    // sumitted with a null value. unlike with undefined value props it will be passed as prop and the default value in
    // default Props won't be used.

    let link = props.to;
    if (!link) link = '/';

    if (!link.startsWith('http') && !link.startsWith('/'))
        link  = `/${link}`;


    if (link.startsWith('/')) {
        rc = (
            <Link to={link} className={props.noStyle ? 'lstvLinkNoStyle' : 'lstvLink'}>
                {props.children}
            </Link>
        );
    } else {
        rc = (
            <a
                className={props.noStyle ? 'lstvLinkNoStyle' : 'lstvLink'}
                rel={'noreferrer'}
                target={'_blank'}
                href={link}
            >
                {props.children}
            </a>
        );
    }
    return rc;
};

LSTVLink.propTypes = {
    to: PropTypes.string.isRequired,
    noStyle: PropTypes.bool,
};

LSTVLink.defaultProps = {
    to: '/',
    noStyle: false,
};

export default LSTVLink;
