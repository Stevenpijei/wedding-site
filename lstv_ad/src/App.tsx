import React, { lazy, Suspense, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { PrivateRoutes, PublicRoutes } from './config/routes';
import AdminLayout from 'components/Layouts/AdminLayout';
import PrivateRoute from 'components/Routes/PrivateRoute';
import PublicRoute from 'components/Routes/PublicRoute';

import ErrorBoundary from 'components/ErrorBoundary';
import LoadingIndicator from 'components/LoadingIndicator';
import 'assets/scss/material-dashboard-pro-react.scss?v=1.9.0';
import { useDispatch } from 'react-redux';
import { setPageBreadCrumbs } from 'store/reducers/pageBreadCrumb';
import { ModalContextProvider } from 'contexts/ModalContext';
import { ToastContextProvider } from 'contexts/ToastContext';

const NotFoundPage = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Businesses = lazy(() => import('./pages/Businesses'));
const Business = lazy(() => import('./pages/Business'));
const Videos = lazy(() => import('./pages/Videos'));
const Users = lazy(() => import('./pages/Users'));
const Video = lazy(() => import('./pages/Video'));
const Photos = lazy(() => import('./pages/Photos'));
const SiteSettings = lazy(() => import('./pages/SiteSettings'));
const Articles = lazy(() => import('./pages/Articles'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tags = lazy(() => import('./pages/Tags'));
const Tag = lazy(() => import('./pages/Tag'));

const App: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(setPageBreadCrumbs([]));
    }, [location.pathname]);

    return (
        <div className="App">
            <ToastContextProvider>
                <ModalContextProvider>
                    <ErrorBoundary>
                        <Switch>
                            <Route path={Object.values(PublicRoutes)}>
                                <Suspense fallback={<LoadingIndicator />}>
                                    <Switch>
                                        <PublicRoute exact path={PublicRoutes.LOGIN} component={Login} />
                                    </Switch>
                                </Suspense>
                            </Route>
                            <Route path={Object.values(PrivateRoutes)}>
                                <Suspense fallback={<LoadingIndicator />}>
                                    <AdminLayout>
                                        <Switch>
                                            <PrivateRoute exact path={PrivateRoutes.DASHBOARD} component={Dashboard} />
                                            <PrivateRoute
                                                exact
                                                path={PrivateRoutes.BUSINESSES}
                                                component={Businesses}
                                            />
                                            <PrivateRoute
                                                exact
                                                path={`${PrivateRoutes.BUSINESSES}/:id`}
                                                component={Business}
                                            />
                                            <PrivateRoute exact path={PrivateRoutes.VIDEOS} component={Videos} />
                                            <PrivateRoute
                                                exact
                                                path={`${PrivateRoutes.VIDEOS}/:id`}
                                                component={Video}
                                            />
                                            <PrivateRoute exact path={PrivateRoutes.PHOTOS} component={Photos} />
                                            <PrivateRoute exact path={PrivateRoutes.USERS} component={Users} />
                                            <PrivateRoute exact path={PrivateRoutes.ARTICLES} component={Articles} />
                                            <PrivateRoute exact path={PrivateRoutes.TAGS} component={Tags} />
                                            <PrivateRoute exact path={`${PrivateRoutes.TAGS}/:id`} component={Tag} />
                                            <PrivateRoute
                                                exact
                                                path={PrivateRoutes.SETTINGS}
                                                component={SiteSettings}
                                            />
                                            <PrivateRoute component={NotFoundPage} />
                                        </Switch>
                                    </AdminLayout>
                                </Suspense>
                            </Route>
                            <Redirect to={PublicRoutes.LOGIN} />
                        </Switch>
                    </ErrorBoundary>
                </ModalContextProvider>
            </ToastContextProvider>
        </div>
    );
};

export default App;
