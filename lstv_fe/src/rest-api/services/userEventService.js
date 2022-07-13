import { useState } from 'react';
import useUserEventService from '../hooks/useUserEventsService';
import axios from 'axios';
import { useServerErrors } from '../hooks/useServerErrors';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const userEventServiceAxios = axios.create({ baseURL: `${API_URL}/v1` });
userEventServiceAxios.defaults.withCredentials = true;
userEventServiceAxios.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
const source = axios.CancelToken.source();

export const userEventsService = () => {
    return {
        cancel() {
            // UserEventsService.source.cancel("Component got unmounted");
        },
        async getUser() {
            const res = await userEventServiceAxios.get('/user');
            return res.data.result;
        },
        async getUserProperties() {
            const res = await userEventServiceAxios.get('/userProperties', {
                cancelToken: source.token,
                params: { domain: 'profile' },
            });
            return res.data.result;
        },
        async reportBufferedUserEvents(data) {
            const res = await userEventServiceAxios.post('/userBufferedEvents', {
                events: data,
            });
            return res.data.result;
        },
        async postUserEvent(data) {
            const res = await userEventServiceAxios.post('/userEvent', data);
            return res.data.result;
        },
    };
};
