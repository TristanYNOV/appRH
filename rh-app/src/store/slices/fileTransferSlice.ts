import { FileAPI } from "../../HTTP/file.api.ts";
import { downloadBlob } from "../../utils/download.ts";
import { extractErrorMessage } from "../../utils/errorHandling.ts";
import { toastService } from "../../services/toasts.service.ts";
import {
    createAvailabilityHelpers,
    markFileUnavailable,
    restoreFileAvailability,
} from "../helpers/availability.ts";
import type { FileTransferSlice, StoreCreator } from "../types.ts";

export const createFileTransferSlice: StoreCreator<FileTransferSlice> = (set, get) => {
    const { checkHealth } = createAvailabilityHelpers(
        "Import / Export",
        "isFileApiAvailable",
        {},
        set,
        get
    );

    return {
        isFileApiAvailable: true,
        isImportingEmployees: false,
        isExportingEmployees: false,
        importEmployees: async (file) => {
            set({ isImportingEmployees: true });
            const toastId = toastService.fileImporting("employés");
            try {
                await FileAPI.importEmployees(file);
                toastService.dismiss(toastId);
                toastService.fileImported("employés");
                restoreFileAvailability(set);
                await get().loadEmployees();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.fileImportFailed("employés", extractErrorMessage(error));
                markFileUnavailable(set);
                void checkHealth();
            } finally {
                set({ isImportingEmployees: false });
            }
        },
        exportEmployees: async () => {
            set({ isExportingEmployees: true });
            const toastId = toastService.fileExporting("employés");
            try {
                const blob = await FileAPI.exportEmployees();
                downloadBlob(blob, `employees-${new Date().toISOString()}.xlsx`);
                toastService.dismiss(toastId);
                toastService.fileExported("employés");
                restoreFileAvailability(set);
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.fileExportFailed("employés", extractErrorMessage(error));
                markFileUnavailable(set);
                void checkHealth();
            } finally {
                set({ isExportingEmployees: false });
            }
        },
        checkFileAvailability: async () => {
            try {
                await checkHealth();
                return true;
            } catch {
                return false;
            }
        },
        resetFileTransfers: () =>
            set({
                isFileApiAvailable: true,
                isImportingEmployees: false,
                isExportingEmployees: false,
            }),
    };
};
