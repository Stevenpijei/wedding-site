import AppDataService from '../services/appDataService';
import {useServerErrors} from "./useServerErrors";

export const useAppDataService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        cancel() {
            // AppDataService.source.cancel("Component got unmounted");
        },
        identCall() {
            return AppDataService.identCall().then((data) => (data.result),
                (error) =>  analyzeServerErrors(error)
            )
        },
        getNavbarContent() {
            return AppDataService.getNavbarContent().then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        },
        getBusinessTypes() {
            return AppDataService.getBusinessTypes().then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        },
        getBusinessCapacityTypes() {
            return AppDataService.getBusinessCapacityTypes().then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        },
        getMainVideo() {
            return AppDataService.getMainVideo().then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        },
        getFrontEndSettings() {
            return AppDataService.getFrontEndSettings().then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        },
        getHomeCardSections() {
            const loggedIn = false
            return AppDataService.getHomeCardSections(loggedIn).then((data) => (data),
                (error) => analyzeServerErrors(error)
            )
        }
    }

 }
