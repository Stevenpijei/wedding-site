import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { saveState } from './store/localStorage';
import { Provider } from 'react-redux';
// DO NOT Remove style import
import style from './styles/index.scss';
import throttle from 'lodash.throttle';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';
import reduxStore from './store/store';
import * as ActionTypes from './store/actions';
import { volatileState } from './store/reducer';
import { ThemeProvider } from 'styled-components';
import theme from './styledComponentsTheme';
import { GlobalTypographyStyles } from './components/typography';
import { Layout } from './newComponents/layout/Layout';
import ScrollToTop from './newComponents/ScrollToTop';
import Routes from './components/Routes';
import ApiErrorBoundary from './rest-api/ApiErrorBoundary'
import MarketingModal from './newComponents/MarketingModal';
import mixpanel from 'mixpanel-browser';

/* Initializing Bugsnag */
const bugsnagClient = bugsnag({
    releaseStage: process.env.NODE_ENV,
    appVersion: process.env.APP_VERSION,
    apiKey: '1d1bac5918c34e78f7355d7d43846b06',
    notifyReleaseStages: ['staging', 'production'],
});
bugsnagClient.use(bugsnagReact, React);

console.info(process.env.NODE_ENV);
console.info(process.env.APP_VERSION);


// initialize volatile state
reduxStore.getState().volatile = {
    ...volatileState,
};

reduxStore.subscribe(
    throttle(() => {
        saveState({
            version: reduxStore.getState().version,
            user: reduxStore.getState().user,
            app: reduxStore.getState().app,
            contentCache: reduxStore.getState().contentCache,
        });
    }, 100)
);

// online/offline monitoring
const updateOnlineStatus = (event) => {
    reduxStore.dispatch({
        type: ActionTypes.ACTION_ONLINE_STATUS,
        data: { online: navigator.onLine },
    });
};

// first test of online/offline
updateOnlineStatus(null);

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

mixpanel.init('35d9e21c117f16c07761183920e4d598');

const App = () => {

    return (
        <Provider store={reduxStore}>
            <ThemeProvider theme={theme}>
                <GlobalTypographyStyles />
                <BrowserRouter>
                    {/* <ErrorBoundary
                    FallbackComponent={ErrorPage}
                    onReset={() => {
                        // reset the state of your app so the error doesn't happen again
                    }}
                > */}
                    <ApiErrorBoundary />
                    <ScrollToTop />
                    <Layout>
                        <Routes />
                    </Layout>
                    {/* </ErrorBoundary> */}
                </BrowserRouter>
                <MarketingModal />
            </ThemeProvider>
        </Provider>
    );
}
ReactDOM.render(<App/>, document.getElementById('root'));
