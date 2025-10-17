import { useCallback, useState } from "react";

import { FileAPI } from "../HTTP/file.api.ts";
import { useApiAvailability } from "./useApiAvailability.ts";
import { extractErrorMessage } from "../utils/errorHandling.ts";
import { downloadBlob } from "../utils/download.ts";
import { toastService } from "../services/toasts.service.ts";

type Options = {
    onAvailabilityChange?: (available: boolean) => void;
    onEmployeesUpdated?: () => void;
    onDepartmentsUpdated?: () => void;
};

const logFileInfo = async (file: File) => {
    console.log("[IMPORT] Fichier:", {
        name: file.name,
        size: `${file.size} bytes`,
        type: file.type || "(no mime type)",
        lastModified: new Date(file.lastModified).toISOString(),
    });

    try {
        const buf = await file.slice(0, 16).arrayBuffer();
        const bytes = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0"));
        console.log("[IMPORT] Premiers octets (hex):", bytes.join(" "));
    } catch (e) {
        console.warn("[IMPORT] Impossible de lire l’aperçu binaire:", e);
    }
};

export const useFileTransfers = ({
    onAvailabilityChange,
    onEmployeesUpdated,
    onDepartmentsUpdated,
}: Options) => {
    const [isImportingEmployees, setIsImportingEmployees] = useState(false);
    const [isImportingDepartments, setIsImportingDepartments] = useState(false);
    const [isExportingEmployees, setIsExportingEmployees] = useState(false);
    const [isExportingDepartments, setIsExportingDepartments] = useState(false);

    const { isAvailable, updateAvailability, resetAvailability } = useApiAvailability({
        label: "Import / Export",
    });

    const syncAvailability = useCallback(
        (available: boolean) => {
            updateAvailability(available);
            onAvailabilityChange?.(available);
        },
        [onAvailabilityChange, updateAvailability]
    );

    const importEmployees = useCallback(
        async (file: File) => {
            setIsImportingEmployees(true);
            const toastId = toastService.fileImporting("employés");
            try {
                await logFileInfo(file);
                await FileAPI.importEmployees(file);
                toastService.dismiss(toastId);
                toastService.fileImported("employés");
                syncAvailability(true);
                onEmployeesUpdated?.();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.fileImportFailed("employés", extractErrorMessage(error));
                syncAvailability(false);
            } finally {
                setIsImportingEmployees(false);
            }
        },
        [onEmployeesUpdated, syncAvailability]
    );

    const importDepartments = useCallback(
        async (file: File) => {
            setIsImportingDepartments(true);
            const toastId = toastService.fileImporting("départements");
            try {
                await logFileInfo(file);
                await FileAPI.importDepartments(file);
                toastService.dismiss(toastId);
                toastService.fileImported("départements");
                syncAvailability(true);
                onDepartmentsUpdated?.();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.fileImportFailed("départements", extractErrorMessage(error));
                syncAvailability(false);
            } finally {
                setIsImportingDepartments(false);
            }
        },
        [onDepartmentsUpdated, syncAvailability]
    );

    const exportEmployees = useCallback(async () => {
        setIsExportingEmployees(true);
        const toastId = toastService.fileExporting("employés");
        try {
            const blob = await FileAPI.exportEmployees();
            downloadBlob(blob, `employees-${new Date().toISOString()}.xlsx`);
            toastService.dismiss(toastId);
            toastService.fileExported("employés");
            syncAvailability(true);
        } catch (error) {
            toastService.dismiss(toastId);
            toastService.fileExportFailed("employés", extractErrorMessage(error));
            syncAvailability(false);
        } finally {
            setIsExportingEmployees(false);
        }
    }, [syncAvailability]);

    const exportDepartments = useCallback(async () => {
        setIsExportingDepartments(true);
        const toastId = toastService.fileExporting("départements");
        try {
            const blob = await FileAPI.exportDepartments();
            downloadBlob(blob, `departments-${new Date().toISOString()}.xlsx`);
            toastService.dismiss(toastId);
            toastService.fileExported("départements");
            syncAvailability(true);
        } catch (error) {
            toastService.dismiss(toastId);
            toastService.fileExportFailed("départements", extractErrorMessage(error));
            syncAvailability(false);
        } finally {
            setIsExportingDepartments(false);
        }
    }, [syncAvailability]);

    return {
        isAvailable,
        isImportingEmployees,
        isImportingDepartments,
        isExportingEmployees,
        isExportingDepartments,
        importEmployees,
        importDepartments,
        exportEmployees,
        exportDepartments,
        reset: () => {
            setIsImportingEmployees(false);
            setIsImportingDepartments(false);
            setIsExportingEmployees(false);
            setIsExportingDepartments(false);
            resetAvailability();
        },
    };
};
