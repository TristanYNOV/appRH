import { useCallback, useEffect, useState } from "react";

import { DepartmentAPI } from "../HTTP/department.api.ts";
import type { Department } from "../interfaces/department.codec.ts";
import { useApiAvailability } from "./useApiAvailability.ts";
import { normalizeDepartment } from "../utils/dateNormalization.ts";
import { extractErrorMessage } from "../utils/errorHandling.ts";
import { toastService } from "../services/toasts.service.ts";

type Options = {
    enabled: boolean;
    onAvailabilityChange?: (available: boolean) => void;
};

export const useDepartments = ({ enabled, onAvailabilityChange }: Options) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleUnavailable = useCallback(() => {
        setDepartments([]);
    }, []);

    const { isAvailable, updateAvailability, resetAvailability } = useApiAvailability({
        label: "API Départements",
        onUnavailable: handleUnavailable,
    });

    const [refreshKey, setRefreshKey] = useState(0);
    const bumpRefresh = useCallback(() => {
        setRefreshKey((key) => key + 1);
    }, []);

    const syncAvailability = useCallback(
        (available: boolean) => {
            updateAvailability(available);
            onAvailabilityChange?.(available);
            if (!available) {
                setDepartments([]);
            }
        },
        [onAvailabilityChange, updateAvailability]
    );

    const checkAvailability = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await DepartmentAPI.getAll();
            setDepartments(data.map(normalizeDepartment));
            syncAvailability(true);
            return true;
        } catch (error) {
            toastService.departmentSyncFailed(extractErrorMessage(error));
            syncAvailability(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [syncAvailability]);

    useEffect(() => {
        if (!enabled) {
            setDepartments([]);
            setIsLoading(false);
            resetAvailability();
            return;
        }

        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await DepartmentAPI.getAll();
                if (cancelled) return;
                setDepartments(data.map(normalizeDepartment));
                syncAvailability(true);
            } catch (error) {
                if (cancelled) return;
                toastService.departmentSyncFailed(extractErrorMessage(error));
                syncAvailability(false);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [enabled, refreshKey, resetAvailability, syncAvailability]);

    const createDepartment = useCallback(
        async (department: Department) => {
            const { id: _tempId, ...rest } = department;
            const payload: Partial<Department> = {
                ...rest,
                employees: undefined,
            };

            const toastId = toastService.departmentCreation(department);
            try {
                const created = await DepartmentAPI.create(payload);
                toastService.dismiss(toastId);
                toastService.departmentCreated(normalizeDepartment(created));
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentCreationFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [bumpRefresh, syncAvailability]
    );

    const updateDepartment = useCallback(
        async (department: Department) => {
            const payload: Partial<Department> = {
                ...department,
                employees: undefined,
            };
            const toastId = toastService.departmentUpdate(department);
            try {
                const updated = await DepartmentAPI.update(payload);
                toastService.dismiss(toastId);
                toastService.departmentUpdated(normalizeDepartment(updated));
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentUpdateFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [bumpRefresh, syncAvailability]
    );

    const deleteDepartment = useCallback(
        async (id: number) => {
            const departmentToDelete = departments.find((d) => d.id === id);
            if (!departmentToDelete) return;

            const toastId = toastService.departmentDeletion(departmentToDelete);
            try {
                await DepartmentAPI.remove(id);
                toastService.dismiss(toastId);
                toastService.departmentDeleted(departmentToDelete);
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentDeletionFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [departments, bumpRefresh, syncAvailability]
    );

    return {
        departments,
        isLoading,
        isAvailable,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refresh: bumpRefresh,
        checkAvailability,
        reset: () => {
            setDepartments([]);
            setIsLoading(false);
            resetAvailability();
        },
    };
};
