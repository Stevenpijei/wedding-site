import {
    USER_NRT_REPORT_BUFFER_SCOPE_DAY,
    USER_NRT_REPORT_BUFFER_SCOPE_MONTH, USER_NRT_REPORT_BUFFER_SCOPE_WEEK,
    USER_NRT_REPORT_CARD_IMPRESSION,
    USER_NRT_REPORT_VENDOR_CARD_MENTION_IMPRESSION
} from '../global/globals';
import { userEventsService } from "../rest-api/services/userEventService";
import { getYearWeekStringFromDate } from '../utils/LSTVUtils';

export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch (e) {
        console.info(e);
    }
};

export const recordNonRealTimeUserEvent = (domain, bufferScope, payload) => {
    // do we have a user event buffer setup in local storage?
    if (localStorage.getItem('userEventsBuffer') === null) {
        localStorage.setItem('userEventsBuffer', JSON.stringify({}));
    }

    let buffer = JSON.parse(localStorage.getItem('userEventsBuffer'));
    let key;
    let todayKey =  new Date().toISOString().split('T')[0];
    let thisWeekKey = getYearWeekStringFromDate(new Date());
    let thisMonthKey = `${new Date().getMonth()}`;

    switch (bufferScope) {
        case USER_NRT_REPORT_BUFFER_SCOPE_DAY:
            key = todayKey;
            break;
        case USER_NRT_REPORT_BUFFER_SCOPE_WEEK:
            key = thisWeekKey;
            break;

        case USER_NRT_REPORT_BUFFER_SCOPE_MONTH:
            key = thisMonthKey;
            break;
    }

    if (!(key in buffer)) {
        buffer[key] = {};
    }

    switch (domain) {
        case USER_NRT_REPORT_CARD_IMPRESSION:
        case USER_NRT_REPORT_VENDOR_CARD_MENTION_IMPRESSION:
            if (!(domain in buffer[key])) {
                buffer[key][domain] = {};
            }

            if (!(payload.slug in buffer[key][domain])) {
                buffer[key][domain][payload.slug] = { count: 1, type: payload.type };
            } else {
                buffer[key][domain][payload.slug].count += 1;
            }
            break;
    }

    // do we need to update the server?
    let report = Object.keys(buffer)
        .filter((d) => d !== todayKey && d !== thisWeekKey && d !== thisMonthKey)
        .map((d) => {
            return { key: d, scope: bufferScope, data: buffer[d] };
        });

    if (report.length > 0) {
        userEventsService().reportBufferedUserEvents(report);
    }

    report.forEach( d =>{
        delete buffer[d.key]
    });

    localStorage.setItem('userEventsBuffer', JSON.stringify(buffer));
};
