import { useEffect, useRef } from "react";

import { toastService } from "../services/toasts.service.ts";

export const useFeatureReminder = (
    isAuthenticated: boolean,
    missingFeatures: string[]
) => {
    const reminderShown = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || reminderShown.current) return;
        if (missingFeatures.length === 0) return;

        toastService.featureUnavailable(
            `Les ${missingFeatures.join(" et ")} ne sont pas encore disponibles.`
        );
        reminderShown.current = true;
    }, [isAuthenticated, missingFeatures]);

    const reset = () => {
        reminderShown.current = false;
    };

    return { reset } as const;
};
