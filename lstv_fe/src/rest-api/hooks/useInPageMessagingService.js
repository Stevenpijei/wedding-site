import InPageMessagingService from '../services/inPageMessagingService';
import { useServerErrors } from './useServerErrors';

export const useInPageMessagingService = () => {
    const { errorMessages, analyzeServerErrors } = useServerErrors();

    return {
        errorMessages,
        cancel(message = 'host component unmounted') {
            InPageMessagingService.cancelSource.cancel(message);
        },
        postRootLevelQuestion(videoSlug, content) {
            return InPageMessagingService.postRootLevelQuestion(videoSlug, {
                "element_context": "event_story_q_and_a",
                "content": content,
            }).then(
                (data) => (data),
                (error) => {
                    return analyzeServerErrors(error);
                }
            )
        },
        postComment(videoSlug, content, parent_message_id) {
            return InPageMessagingService.postRootLevelQuestion(videoSlug, {
                "element_context": "event_story_q_and_a",
                "content": content,
                "parent_message_id": parent_message_id 
            }).then(
                (data) => (data),
                (error) => {
                    return analyzeServerErrors(error);
                }
            )    
        },
        editComment(videoSlug, message_id, content) {
        
            return InPageMessagingService.editElement(videoSlug, message_id,{
                "content": content,
            }).then(
                (data) => (data),
                (error) => {
                    return analyzeServerErrors(error);
                }
            )  
        },
        deleteComment(videoSlug, message_id) {
            return InPageMessagingService.deleteElement(videoSlug, message_id).then(
                (data) => (data),
                (error) => {
                    return analyzeServerErrors(error);
                }
            )    
        },
        getQandA(element_id) {
            return InPageMessagingService.getElement({
                "element_type": "video",
                "element_id": element_id,

            }).then(
                (data) => (data.result),
                (error) => {
                    console.log("an error was thrown here")
                    return analyzeServerErrors(error);
                }
            )    
        },
        flagComment(message_id, complaint) {
            return InPageMessagingService.flagComment({
                "complaint": complaint,
                "message_id": message_id,
            }).then(
                (data) => (data.result),
                (error) => {
                    console.log("an error was thrown here")
                    throw analyzeServerErrors(error);
                }
            )   
        }
        
    }

 }