import { useCallback, useRef, useState } from "react";

import { toastService } from "../services/toasts.service.ts";

type Options = {
    label: string;
    onUnavailable?: () => void;
};

export const useApiAvailability = ({ label, onUnavailable }: Options) => {
    const [isAvailable, setIsAvailable] = useState(true);
    const lastStatus = useRef(true);

    const updateAvailability = useCallback(
        (available: boolean) => {
            setIsAvailable(available);
            if (lastStatus.current === available) return;
            lastStatus.current = available;

            toastService[available ? "apiRestored" : "apiUnavailable"](label);

            if (!available) {
                onUnavailable?.();
            }
        },
        [label, onUnavailable]
    );

    const resetAvailability = useCallback(() => {
        lastStatus.current = true;
        setIsAvailable(true);
    }, []);

    return { isAvailable, updateAvailability, resetAvailability };
};
