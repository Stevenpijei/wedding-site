import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { selectAuthState } from 'store/reducers/authentication';

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
    const { loggedIn } = useSelector(selectAuthState);

    return loggedIn ? <Route {...props} /> : <Redirect to="/login" />;
};

export default PrivateRoute;
