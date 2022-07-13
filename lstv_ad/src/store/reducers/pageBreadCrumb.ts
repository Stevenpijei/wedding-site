import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';

interface ILinkBreadCrumb {
    title: string;
    link: string;
}

interface IPageBreadCrumb {
    value: ILinkBreadCrumb[];
}

const initialState: IPageBreadCrumb = {
    value: [],
};

export const pageBreadCrumbSlice = createSlice({
    name: 'pageBreadCrumb',
    initialState,
    reducers: {
        setPageBreadCrumbs: (state, action: PayloadAction<any>) => {
            state.value = action.payload;
        },
    },
});

export const { setPageBreadCrumbs } = pageBreadCrumbSlice.actions;

export const selectPageBreadCrumbs = (state: RootState): IPageBreadCrumb => state.pageBreadCrumb;

export default pageBreadCrumbSlice.reducer;
