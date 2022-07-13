import concurrentAxios, { cancelToken } from './ConcurrentAxios';
import * as LSTVGlobals from '../global/globals';
import reduxStore from './../store/store';
import slugify from 'slugify';
import * as ActionTypes from '../store/actions';
import cogoToast from 'cogo-toast';
import React from 'react';
import axios from 'axios';
/*

██╗   ██╗ ██╗       █████╗ ██████╗ ██╗
██║   ██║███║      ██╔══██╗██╔══██╗██║
██║   ██║╚██║█████╗███████║██████╔╝██║
╚██╗ ██╔╝ ██║╚════╝██╔══██║██╔═══╝ ██║
 ╚████╔╝  ██║      ██║  ██║██║     ██║
  ╚═══╝   ╚═╝      ╚═╝  ╚═╝╚═╝     ╚═╝

*/

/* ENDPOINT DEFINITION */
export const V1 = API_URL + '/v1/';

export const LSTV_API_V1 = {
    /*
         _                  ____        _
        / \   _ __  _ __   |  _ \  __ _| |_ __ _
       / _ \ | '_ \| '_ \  | | | |/ _` | __/ _` |
      / ___ \| |_) | |_) | | |_| | (_| | || (_| |
     /_/   \_\ .__/| .__/  |____/ \__,_|\__\__,_|
             |_|   |_|
    */

    // GET_NAVBAR_CONTENT: {
    //     url: 'navbar',
    // },
    // GET_VENDOR_ROLE_TYPES: {
    //     url: 'businessRoleTypes',
    // },
    // GET_VENDOR_CAPACITY_TYPES: {
    //     url: 'businessCapacityTypes',
    // },
    // GET_MAIN_VIDEO_INFO: {
    //     url: 'mainVideo',
    // },
    // GET_FRONT_END_SETTINGS: {
    //     url: 'frontEndSettings',
    // },
    // GET_HOME_CARD_GRID_SECTIONS: {
    //     url: 'homeCardSections',
    // },

    /*
       ____           _              _    ____            _             _
      / ___|__ _  ___| |__   ___  __| |  / ___|___  _ __ | |_ ___ _ __ | |_
     | |   / _` |/ __| '_ \ / _ \/ _` | | |   / _ \| '_ \| __/ _ \ '_ \| __|
     | |__| (_| | (__| | | |  __/ (_| | | |__| (_) | | | | ||  __/ | | | |_
      \____\__,_|\___|_| |_|\___|\__,_|  \____\___/|_| |_|\__\___|_| |_|\__|

    */

     GET_SLUG_CONTENT: {
         url: 'slugContent',
     },
     GET_EVENT_STORY: {
         url: 'video',
     },
     GET_CUSTOM_CONTENT: {
         url: 'contentGridQuery',
     },
     GET_VENDOR: {
         url: 'business',
     },
     GET_CONTENT_COMPOSITION: {
         url: 'contentComposition',
     },

    /*
      ____            _     _____ _
     |  _ \ ___  __ _| |   |_   _(_)_ __ ___   ___
     | |_) / _ \/ _` | |_____| | | | '_ ` _ \ / _ \
     |  _ <  __/ (_| | |_____| | | | | | | | |  __/
     |_| \_\___|\__,_|_|     |_| |_|_| |_| |_|\___|

    */

    // LIKE: { url: 'like' },

    //POST_VIDEO_PLAYBACK_LOG: { url: 'videoPlaybackLog' },
    //POST_AD_PLAYBACK_LOG: { url: 'adPlaybackLog' },
    //POST_AD_PLAYBACK_CLICK_LOG: { url: 'adPlaybackClickLog' },

    //POST_CONTENT_VIEW: { url: 'contentView' },

    //POST_CONTACT_VENDOR: { url: 'contactBusiness' },
    //POST_MESSAGE_BRIDE_GROOM: { url: 'contactBrideGroom' },
    //GET_STATS: { url: 'stats' },
    //TOKEN_AUTH: { url: 'login' },
    //TOKEN_VERIFY: { url: 'tokenVerify' },
    //TOKEN_REFRESH: { url: 'tokenRefresh' },
    //TOKEN_LOGOUT: { url: 'logout' },
    //TOKEN_BLACKLIST: { url: 'tokenBlacklist' },
    //PASSWORD_RESET_REQEST: { url: 'passwordReserRequest' },
    //PASSWORD_RESET_ACTION: { url: 'passwordReserRequest' },


    /*
      _   _                 __  __                                                   _
     | | | |___  ___ _ __  |  \/  | __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_
     | | | / __|/ _ \ '__| | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
     | |_| \__ \  __/ |    | |  | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_
     \___/|___/\___|_|    |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
                                                     |___/
     */

    //USER: { url: 'user' },
    //USER_PROPERTIES: { url: 'userProperties' },
    USER_BUFFERED_EVENTS: { url: 'userBufferedEvents'},

    /*
     _   _ _   _ _ _ _
    | | | | |_(_) (_) |_ _   _
    | | | | __| | | | __| | | |
    | |_| | |_| | | | |_| |_| |
     \___/ \__|_|_|_|\__|\__, |
                         |___/
    */

    POST_USER_EVENT: { url: +'userEvent' },
};

/*
   ____      _ _   _____                 _   _
  / ___|__ _| | | |  ___|   _ _ __   ___| |_(_) ___  _ __
 | |   / _` | | | | |_ | | | | '_ \ / __| __| |/ _ \| '_ \
 | |__| (_| | | | |  _|| |_| | | | | (__| |_| | (_) | | | |
  \____\__,_|_|_| |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|

*/

export const call = async (
    method,
    context,
    endpoint,
    onSuccess,
    onError,
    onRetry,
    data,
    actionDesc = 'interact with the server',
    showPopupOnFailure = false,
    attemptNumber = 0,
    retryInterval = LSTVGlobals.REST_FAILURE_REATTEMPT_INTERVAL,
    maxRetries = LSTVGlobals.REST_FAILURE_MAX_RETRIES
) => {
    // everything ready for element caching?

    let storeContent = reduxStore.getState();
    if (storeContent && !storeContent.contentCache) storeContent.contentCache = {};

    // is caching enabled for this call?

    let cache = endpoint && endpoint.cache && storeContent;
    let secs = 0;
    let key = '';
    if (context) {
        endpoint.context = context;
        //console.table(endpoint);
    }


    const cancelSource = cancelToken.source();

    concurrentAxios.defaults.withCredentials = true;

    concurrentAxios({
        method: method,
        cancelToken: cancelSource.token,
        url: V1 + endpoint.url,
        data: method !== 'get' ? data : null,
        params: method === 'get' ? data : null,
        widhCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => {
            // is this redirection ?
            if (res.data && res.data.redirect)
                window.location.href = `${window.location.origin}/${res.data.redirect.slug}`;

            //console.info(`Axios .then: ${method.toUpperCase()} url: ${endpoint.url} called`);

            // if the server indicates that the local cache is the most up to date, use it.

            // if (res.data && res.data.localCache && key) {
            //     // update the last client request timestamp (to throttle server requests)
            //     reduxStore.dispatch({
            //         type: ActionTypes.CACHE_REST_API_LAST_REQUEST_TIMESTAMP,
            //         cacheKey: key,
            //         cacheAt: endpoint.cacheAt,
            //     });
            //
            //     let cachedElement = getCachedElement(endpoint, data, true);
            //     onSuccess(cachedElement);
            //     return;
            // }

            // // retain in cache if applicable
            // if (cache) {
            //     res.data.ttl = secs;
            //     reduxStore.dispatch({
            //         type: ActionTypes.CACHE_REST_API_RESPONSE,
            //         cacheKey: key,
            //         cacheAt: endpoint.cacheAt,
            //         data: res.data,
            //     });
            // }

            onSuccess(res.data);

            // reduxStore.dispatch({
            //     type: ActionTypes.TEMPORARY_CONNECTIVITY_ISSUE,
            //     issue: false
            // });
        })
        .catch(async (e) => {
            if (axios.isCancel(e)) {
                //console.log('cancelled axios call');
            } else {
                let result_code = null;

                // active server error? or a network failure (server unreachable)

                if (e.response && e.response.status) {
                    result_code = e.response.status;

                    // those are permanent errors? if so stop right here without re-trying.

                    if ([500, 501, 502, 503, 400, 401, 403, 404, 429].includes(result_code)) {
                        onError(result_code, e.response);
                        return;
                    }

                    // do we give up?
                    if (attemptNumber === maxRetries) {
                        if (result_code) onError(result_code, e.response);
                        else onError(0);
                    } else {
                        console.info('retry......');
                        onRetry(attemptNumber);
                        // or try again !
                        setTimeout(() => {
                            call(
                                method,
                                context,
                                endpoint,
                                onSuccess,
                                onError,
                                onRetry,
                                data,
                                actionDesc,
                                showPopupOnFailure,
                                attemptNumber + 1,
                                retryInterval,
                                maxRetries
                            );
                        }, retryInterval);
                    }
                } else {
                    // server not responding? find out why -- no internet? or just our server's out?

                    await fetch('https://lstv-content.s3.us-east-2.amazonaws.com/downloads/test.json')
                        .then((data) => {
                            if (data.status === 200) onError(1, 'server unresponsive');
                            else onError(0, 'no internet connection');
                        })
                        .catch((e) => {
                            onError(0, 'no internet connection');
                        });
                }
            }
        });

    return cancelSource;
};
