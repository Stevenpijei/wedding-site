import {  useState } from 'react';

export const useServerErrors = () => {
    const [errorMessages, setErrorMessages] = useState(undefined);

    return {
        analyzeServerErrors(errors) {
            let rc = {
                success: false,
                response_code: null,
                response_errors: {},
                request_errors: {}
            }

            if (Array.isArray(errors?.response?.data?.errors)) {
                rc.response_code = errors?.response?.status;
                errors.response.data.errors.forEach((d) => {
                    if (d.field) {
                        if (rc.response_errors[d.field]) {
                            rc.response_errors[d.field].push(` ${d.errors.join('. ')}`);
                        } else {
                            rc.response_errors[d.field] = [d.errors.join('. ')];
                        }
                    } else {
                        if (rc.response_errors?.generic) {
                            rc.response_errors.generic.push(` ${d.errors.join('. ')}`);
                        } else {
                            rc.response_errors.generic = [d.errors.join('. ')];
                        }
                    }
                });
            } else {
                if (errors?.response) {
                    rc.response_code = errors.response?.status;
                    rc.response_errors.generic = [errors.response?.statusText]
                }
                else {
                    rc.request_errors.generic  = ["Server unreachable. Check your connection and try again"]
                }
            }

            setErrorMessages(rc);
            console.log(rc);
            return rc
        },
        errorMessages,
    };
};
