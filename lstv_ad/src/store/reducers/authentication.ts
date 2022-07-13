import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

export interface IUser {
    uid: string;
    email: string;
    profile_thumbnail_url: string;
    first_name: string;
    last_name: string;
    user_type: string;
}

interface IAuthState {
    loggedIn: boolean;
    // TODO: replace this user type with valid one.
    user: IUser | null;
}

const initialState: IAuthState = {
    loggedIn: false,
    user: null,
};

export const authenticationSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        setLoggedIn: (state, action: PayloadAction<any>) => {
            state.loggedIn = true;
            state.user = action.payload;
        },
        logOut: () => {
            window.localStorage.clear();
            return initialState;
        },
    },
});

export const { logOut, setLoggedIn } = authenticationSlice.actions;

export const selectAuthState = (state: RootState): IAuthState => state.authentication;

export default authenticationSlice.reducer;
