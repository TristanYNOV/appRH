import { AttendanceAPI } from "../../HTTP/attendance.api.ts";
import { normalizeAttendance } from "../../utils/dateNormalization.ts";
import { extractErrorMessage } from "../../utils/errorHandling.ts";
import { toastService } from "../../services/toasts.service.ts";
import { createAvailabilityHelpers } from "../helpers/availability.ts";
import type { AttendanceSlice, StoreCreator } from "../types.ts";

export const createAttendanceSlice: StoreCreator<AttendanceSlice> = (set, get) => {
    const { syncAvailability, checkHealth } = createAvailabilityHelpers(
        "API Présences",
        "isAttendanceApiAvailable",
        { attendances: [] },
        set,
        get
    );

    const refreshAttendances = async () => {
        set({ isLoadingAttendances: true });
        await checkHealth();

        try {
            const data = await AttendanceAPI.getAll();
            set({
                attendances: data.map(normalizeAttendance),
                isAttendanceApiAvailable: true,
            });
            return true;
        } catch (error) {
            toastService.attendanceSyncFailed(extractErrorMessage(error));
            void checkHealth();
            return false;
        } finally {
            set({ isLoadingAttendances: false });
        }
    };

    return {
        attendances: [],
        isLoadingAttendances: false,
        isAttendanceApiAvailable: true,
        loadAttendances: refreshAttendances,
        createAttendance: async (attendance) => {
            const toastId = toastService.attendanceCreation(attendance);
            try {
                const created = await AttendanceAPI.create(attendance);
                toastService.dismiss(toastId);
                toastService.attendanceCreated(normalizeAttendance(created));
                syncAvailability(true);
                void get().loadAttendances();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.attendanceCreationFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        updateAttendance: async (id, attendance) => {
            const toastId = toastService.attendanceUpdate(attendance);
            try {
                const updated = await AttendanceAPI.update(id, attendance);
                toastService.dismiss(toastId);
                toastService.attendanceUpdated(normalizeAttendance(updated));
                syncAvailability(true);
                void get().loadAttendances();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.attendanceUpdateFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        deleteAttendance: async (id) => {
            const attendanceToDelete = get().attendances.find((a) => a.id === id);
            const toastId = toastService.attendanceDeletion(attendanceToDelete);
            try {
                await AttendanceAPI.remove(id);
                toastService.dismiss(toastId);
                if (attendanceToDelete) {
                    toastService.attendanceDeleted(attendanceToDelete);
                }
                syncAvailability(true);
                void get().loadAttendances();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.attendanceDeletionFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        checkAttendanceAvailability: async () => {
            set({ isLoadingAttendances: true });
            try {
                await checkHealth();
                await get().loadAttendances();
                return true;
            } catch {
                set({ attendances: [] });
                return false;
            } finally {
                set({ isLoadingAttendances: false });
            }
        },
        resetAttendances: () =>
            set({
                attendances: [],
                isLoadingAttendances: false,
                isAttendanceApiAvailable: true,
            }),
    };
};
