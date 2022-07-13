import React from 'react';
import PropTypes from 'prop-types';

const ConditionalWrapper = ({ condition, Wrapper, children }) => {
    return condition ? <Wrapper>{children}</Wrapper> : children;
};

ConditionalWrapper.propTypes = {
    condition: PropTypes.bool,
    Wrapper: PropTypes.any,
    children: PropTypes.node,
};

export default ConditionalWrapper
