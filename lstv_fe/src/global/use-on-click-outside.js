import { useEffect, useRef } from 'react';

export const useOnClickOutside = (ref, triggerRef, handler) => {
    useEffect(() => {
        const listener = (event) => {
            // Do nothing if clicking ref's element or descendent elementss
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            } else if (!triggerRef.current || triggerRef.current.contains(event.target)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, triggerRef, handler]);
};
