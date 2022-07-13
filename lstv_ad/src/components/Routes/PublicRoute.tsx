import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectAuthState } from 'store/reducers/authentication';
import { PrivateRoutes } from 'config/routes';

const PublicRoute: React.FC<RouteProps> = (props: RouteProps) => {
    const { loggedIn } = useSelector(selectAuthState);

    return loggedIn ? <Redirect to={PrivateRoutes.DASHBOARD} /> : <Route {...props} />;
};

export default PublicRoute;
