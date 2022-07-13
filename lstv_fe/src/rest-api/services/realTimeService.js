import axios from 'axios';
import { Switch } from 'react-router';
import { responseErrorInterceptor } from '../ApiErrorBoundary';

const rtAxiosInstance = axios.create({ baseURL: `${API_URL}/v1` });
rtAxiosInstance.interceptors.response.use(
    response => response,
    responseErrorInterceptor
)
rtAxiosInstance.defaults.withCredentials = true;
const source = axios.CancelToken.source();

const RealTimeService = {
    cancelSource: source,
    /**
     * like or unlike an LSTV element as the logged in user or the non logged-in guest.
     * @param {boolean} state true=liked, false=unliked
     * @param {string} element_type the type of element to work on. can be video, article, business, photo,
     * review, qa_element (qa= Q&A)
     * @param {string} element_id the uuid of the element to work on
     * @returns {Promise<*>}
     */
    async like(url) {
        const res = await rtAxiosInstance.post(url)
        return res.data.result;
    },
    async unLike(url) {
        const res =  await rtAxiosInstance.request({
            method: 'delete',
            url: url,
        });
        return res.data.result;
    },
    /**
     * get the like status of a given LSTV element (true/false) for the logged in user or the non-logged in guest.
     * @param {string} element_type the type of element to work on. can be video, article, business, photo,
     * review, qa_element (qa= Q&A)
     * @param {string} element_id the uuid of the element to work on
     * @returns {Promise<*>}
     */
    async getLike(url) {
        const res = await rtAxiosInstance.get(url);
        return res.data.result;
    },
   
    /**
     *
     * @param data
     * @returns {Promise<*>}
     */
    async logVideoPlayback(data) {
        const res = await rtAxiosInstance.post('/videoPlaybackLog', data, { cancelToken: source.token });
        return res.data.result;
    },
    /**
     *
     * @param data
     * @returns {Promise<*>}
     */
    async logAdPlayback(data) {
        const res = await rtAxiosInstance.post('/adPlaybackLog', data, { cancelToken: source.token });
        return res.data.result;
    },
    /**
     *
     * @param data
     * @returns {Promise<*>}
     */
    async logAdPlaybackClick(data) {
        const res = await rtAxiosInstance.post('/adPlaybackClickLog', data, { cancelToken: source.token });
        return res.data.result;
    },
    /**
     *
     * @param element_type
     * @param element_id
     * @returns {Promise<*>}
     */
    async logContentView(element_type, element_id) {
        const res = await rtAxiosInstance.post(
            '/contentWatchLog',
            {
                element_type: element_type,
                element_id: element_id,
            },
            { cancelToken: source.token }
        );
        return res.data.result;
    },
    /**
     * Sends an potential client inquiry to a business on the system with a name, wedding date, location and a brief
     * message.
     * @param fromPage url for the page the inquiry was sent from
     * @param guestName name of potential client
     * @param guestEmail email of potential client
     * @param weddingDate wedding date
     * @param message brief message from potential client
     * @param businessName name of business
     * @param businessRole role of business contacted (null if this is not sent from a video page)
     * @param businessSlug slug of business
     * @param googleLocationComponent google location components (the ones you receive from the Google Places
     * autocomplete dropdown)
     * @param GoogleLocationFormatted formatted google location (the ones you receive from the Google Places
     * autocomplete dropdown)
     * @param latitude latitude for the wedding location (Also provided by Google Places autocompoete dropdown)
     * @param longitude longirude for the wedding location (Also provided by Google Places autocompoete dropdown)
     * @param videoId if sent from a video page, provide the video's Id.
     * @returns {Promise<*>}
     */
    async contactBusiness(
        fromPage,
        guestName,
        guestEmail,
        weddingDate,
        message,
        businessName,
        businessRole,
        businessSlug,
        googleLocationComponent,
        GoogleLocationFormatted,
        latitude,
        longitude,
        videoId = null
    ) {
        let requestData = {
            from_page: fromPage,
            name: guestName,
            email: guestEmail,
            wedding_date: weddingDate,
            message: message,
            business_name: businessName,
            business_role: businessRole,
            business_slug: businessSlug,
            video_id: videoId,
            location: {
                components: googleLocationComponent,
                formatted: GoogleLocationFormatted,
                position: {
                    lat: latitude,
                    long: longitude,
                },
            },
        };

        const res = await rtAxiosInstance.post('/contactBusiness', requestData, { cancelToken: source.token });
        return res.data.result;
    },
    /**
     * Send a message (via email and inMail) to the bride/groom on a wedding page.
     * @param name sender's name
     * @param email sender's email
     * @param from_page the url of the page the message was sent from
     * @param message brief message from sender
     * @returns {Promise<*>}
     */
    async contactBrideOrGroom(name, email, from_page, message) {
        let requestData = {
            name: name,
            email: email,
            from_page: from_page,
            message: message,
        };
        const res = await rtAxiosInstance.post('/contactBrideGroom', requestData, { cancelToken: source.token });
        return res.data.result;
    },
};
export default RealTimeService;
