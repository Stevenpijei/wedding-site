import axios from 'axios';
import { useServerErrors } from "./useServerErrors";
import { userEventsService } from "../services/userEventService";

 // Create a new CancelToken
const source = axios.CancelToken.source();

export const useUserEventService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        source,
        /*
         _   _                 __  __                                                   _
        | | | |___  ___ _ __  |  \/  | __ _ _ __   __ _  __ _  ___ _ __ ___   ___ _ __ | |_
        | | | / __|/ _ \ '__| | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
        | |_| \__ \  __/ |    | |  | | (_| | | | | (_| | (_| |  __/ | | | | |  __/ | | | |_
        \___/|___/\___|_|    |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_| |_| |_|\___|_| |_|\__|
                                                        |___/
        */
        async getUser() {
            try {
                return userEventsService.getUser()
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async getUserProperties() {

            try {
                return userEventsService.getUserProperties()
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async reportBufferedUserEvents(data) {
            try {
                return userEventsService.reportBufferedUserEvents(data)
            } catch (error) {
                return analyzeServerErrors(error);
            }
        },
        async postUserEvent(data) {
            try {
                return userEventsService.postUserEvent(data)
            } catch (error) {
                return analyzeServerErrors(error);
            }
        }
    }
}