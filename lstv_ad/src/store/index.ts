import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { loadState, saveState } from './localStorage';

import { authenticationSlice } from './reducers/authentication';
import { pageBreadCrumbSlice } from './reducers/pageBreadCrumb';

export const store = configureStore({
    reducer: {
        authentication: authenticationSlice.reducer,
        pageBreadCrumb: pageBreadCrumbSlice.reducer,
    },
    preloadedState: loadState(),
});

store.subscribe(() => {
    saveState({
        authentication: store.getState().authentication,
    });
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
