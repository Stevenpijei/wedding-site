import axios from 'axios';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

// eslint-disable-next-line no-undef
export const V1 = API_URL + '/v1/';

const axiosInstance = axios.create();
axiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
axiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const AuthService = {
    cancelSource: source,
    async getUserProfile() {
        const res = await axiosInstance.get(V1 + 'userProperties?domain=profile');
        return res.data.result;
    },
    async updateUserProfile(profile) {
        const res = await axiosInstance.post(V1 + 'userProperties', {
            domain: 'profile',
            value: {
                wedding_date: profile.weddingDate,
                wedding_location: profile.weddingLocation,
                skip: profile.skip,
            },
        });
        return res.data.result;
    },
    async updateBusinessProfile(business) {
        const res = await axiosInstance.post(V1 + 'businessProperties', {
            business_name: business.business_name,
            location: business.location,
            business_roles: business.business_roles,
        });
        return res.data.result;
    },
    async signInWithEmailAndPassword({ email, password }) {
        const res = await axiosInstance.post(V1 + 'login', { email, password });
        return res.data.result;
    },

    // perhaps these two are logically better off in businessService?
    async verifyAccountClaim(code) {
        const res = await axiosInstance.get(`${V1}verifyAccountClaim?code=${code}`)
        return res.data.result
    },
    async signUpAndClaimBusiness(businessSlug, claimData) {
        const res = await axiosInstance
            .post(`${V1}business/${businessSlug}/accountClaim/accept`, claimData)
        return res.data.result
    },

    async signUpWithEmailAndPassword({ first_name, last_name, email, password, type }) {
        const res = await axiosInstance.post(V1 + 'user', {
            first_name: first_name,
            last_name: last_name,
            email,
            password,
            type,
        });
        return res.data.result;
    },
    async loginWithOAuth(oauthPayload, userType) {
        const res = await axiosInstance.post(V1 + 'user', { oauth_payload: oauthPayload, type: userType });
        return {
            data: res.data.result,
            isNewUser: res.status === 201,
        };
    },
    async resetPasswordStart(email) {
        const res = await axiosInstance.post(V1 + 'passwordResetRequest', email);
        return res.data.result;
    },
    async changePassword({ password, code }) {
        const res = await axiosInstance.post(V1 + 'passwordResetAction', { code, new_password: password });
        return res;
    },
    async validateToken() {
        const res = await axiosInstance.get(V1 + 'tokenVerify');
        return res.data.result;
    },
    async refreshToken() {
        const res = await axiosInstance.post(V1 + 'tokenRefresh');
        return res.data.result;
    },
    async signOut() {
        const res = await axiosInstance.post(V1 + 'logout');
        return res.data.result;
    },
};

export default AuthService;
