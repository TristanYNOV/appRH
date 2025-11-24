import { toastService } from "../../services/toasts.service.ts";

export const notifyAvailability = (
    label: string,
    previous: boolean,
    available: boolean,
    onUnavailable?: () => void
) => {
    if (previous === available) return;
    toastService[available ? "apiRestored" : "apiUnavailable"](label);
    if (!available) {
        onUnavailable?.();
    }
};
