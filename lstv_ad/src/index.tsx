import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';

import App from './App';
import { store } from 'store';
import './index.scss';
import { LicenseInfo } from '@material-ui/x-grid';

LicenseInfo.setLicenseKey(
    '6f2939a6805d786279106dbd56aa9c97T1JERVI6MjI2OTUsRVhQSVJZPTE2NDc3MTA4OTYwMDAsS0VZVkVSU0lPTj0x'
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
});

ReactDOM.render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <Router>
                <App />
            </Router>
        </QueryClientProvider>
    </Provider>,

    document.getElementById('root')
);
