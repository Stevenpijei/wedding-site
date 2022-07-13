import axios from 'axios';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const ContentAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
ContentAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
ContentAxiosInstance.defaults.withCredentials = true;

const ContentService = {
    /*
         _                  ____        _
        / \   _ __  _ __   |  _ \  __ _| |_ __ _
       / _ \ | '_ \| '_ \  | | | |/ _` | __/ _` |
      / ___ \| |_) | |_) | | |_| | (_| | || (_| |
     /_/   \_\ .__/| .__/  |____/ \__,_|\__\__,_|
             |_|   |_|
    */
    async identCall() {
        const res = await ContentAxiosInstance.get('/');
        return res.data.result;
    },
    async getNavbarContent() {
        const res = await ContentAxiosInstance.get('/navbar');
        return res.data.result;
    },
    async getBusinessTypes() {
        const res = await ContentAxiosInstance.get('/businessRoleTypes');
        return res.data.result;
    },
    async getBusinessCapacityTypes() {
        const res = await ContentAxiosInstance.get('/businessCapacityTypes');
        return res.data.result;
    },
    async getMainVideo() {
        const res = await ContentAxiosInstance.get('/mainVideo');
        return res.data.result;
    },
    async getFrontEndSettings() {
        const res = await ContentAxiosInstance.get('/frontEndSettings');
        return res.data.result;
    },
    async getHomeCardSections(loggedIn) {
        const res = await ContentAxiosInstance.get('/homeCardSections', {
            params: { target: loggedIn ? 'logged_in_home_page' : 'logged_out_home_page' },
        });
        return res.data.result;
    },
};

export default ContentService;
