import { useCallback, useEffect, useState } from "react";

import { EmployeeAPI } from "../HTTP/employee.api.ts";
import type { Employee } from "../interfaces/employee.codec.ts";
import { useApiAvailability } from "./useApiAvailability.ts";
import { normalizeEmployee } from "../utils/dateNormalization.ts";
import { extractErrorMessage } from "../utils/errorHandling.ts";
import { toastService } from "../services/toasts.service.ts";

type Options = {
    enabled: boolean;
    onAvailabilityChange?: (available: boolean) => void;
};

export const useEmployees = ({ enabled, onAvailabilityChange }: Options) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleUnavailable = useCallback(() => {
        setEmployees([]);
    }, []);

    const { isAvailable, updateAvailability, resetAvailability } = useApiAvailability({
        label: "API Employés",
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
                setEmployees([]);
            }
        },
        [onAvailabilityChange, updateAvailability]
    );

    const checkAvailability = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await EmployeeAPI.getAll();
            setEmployees(data.map(normalizeEmployee));
            syncAvailability(true);
            return true;
        } catch (error) {
            toastService.employeeSyncFailed(extractErrorMessage(error));
            syncAvailability(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [syncAvailability]);

    useEffect(() => {
        if (!enabled) {
            setEmployees([]);
            setIsLoading(false);
            resetAvailability();
            return;
        }

        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await EmployeeAPI.getAll();
                if (cancelled) return;
                setEmployees(data.map(normalizeEmployee));
                syncAvailability(true);
            } catch (error) {
                if (cancelled) return;
                toastService.employeeSyncFailed(extractErrorMessage(error));
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

    const createEmployee = useCallback(
        async (employee: Employee) => {
            const { id: _tempId, ...rest } = employee;
            const payload: Partial<Employee> = {
                ...rest,
                department: undefined,
                attendances: undefined,
                leaveRequests: undefined,
            };

            const toastId = toastService.employeeCreation(employee);
            try {
                const created = await EmployeeAPI.create(payload);
                toastService.dismiss(toastId);
                toastService.employeeCreated(normalizeEmployee(created));
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeCreationFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [bumpRefresh, syncAvailability]
    );

    const updateEmployee = useCallback(
        async (employee: Employee) => {
            const payload: Partial<Employee> = {
                ...employee,
                department: undefined,
                attendances: undefined,
                leaveRequests: undefined,
            };
            const toastId = toastService.employeeUpdate(employee);
            try {
                const updated = await EmployeeAPI.update(payload);
                toastService.dismiss(toastId);
                toastService.employeeUpdated(normalizeEmployee(updated));
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeUpdateFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [bumpRefresh, syncAvailability]
    );

    const deleteEmployee = useCallback(
        async (id: number) => {
            const employeeToDelete = employees.find((e) => e.id === id);
            if (!employeeToDelete) return;

            const toastId = toastService.employeeDeletion(employeeToDelete);
            try {
                await EmployeeAPI.remove(id);
                toastService.dismiss(toastId);
                toastService.employeeDeleted(employeeToDelete);
                syncAvailability(true);
                bumpRefresh();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeDeletionFailed(extractErrorMessage(error));
                syncAvailability(false);
            }
        },
        [employees, bumpRefresh, syncAvailability]
    );

    return {
        employees,
        isLoading,
        isAvailable,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        refresh: bumpRefresh,
        checkAvailability,
        reset: () => {
            setEmployees([]);
            setIsLoading(false);
            resetAvailability();
        },
    };
};
