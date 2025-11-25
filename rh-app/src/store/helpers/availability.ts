import apiClient from "../../HTTP/httpClient.ts";
import { notifyAvailability } from "./notifications.ts";
import type { AppState, StoreGet, StoreSet } from "../types.ts";

type AvailabilityKey =
    | "isEmployeeApiAvailable"
    | "isDepartmentApiAvailable"
    | "isFileApiAvailable"
    | "isAttendanceApiAvailable";

export const createAvailabilityHelpers = (
    label: string,
    availabilityKey: AvailabilityKey,
    clearState: Partial<AppState>,
    set: StoreSet,
    _get: StoreGet
) => {
    const syncAvailability = (available: boolean) =>
        set((state) => {
            notifyAvailability(
                label,
                (state as AppState)[availabilityKey],
                available,
                () => set(clearState)
            );
            return {
                [availabilityKey]: available,
                ...(available ? {} : clearState),
            } as Partial<AppState>;
        });

    const checkHealth = async () => {
        try {
            await apiClient.checkHealth();
            syncAvailability(true);
            return true;
        } catch {
            syncAvailability(false);
            return false;
        }
    };

    return { syncAvailability, checkHealth } as const;
};

export const restoreFileAvailability = (set: StoreSet) =>
    set((state) => {
        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
        return { isFileApiAvailable: true } as Partial<AppState>;
    });

export const markFileUnavailable = (set: StoreSet) =>
    set((state) => {
        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
        return { isFileApiAvailable: false } as Partial<AppState>;
    });

