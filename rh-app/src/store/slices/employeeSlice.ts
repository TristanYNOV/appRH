import { EmployeeAPI } from "../../HTTP/employee.api.ts";
import { normalizeEmployee } from "../../utils/dateNormalization.ts";
import { extractErrorMessage } from "../../utils/errorHandling.ts";
import { toastService } from "../../services/toasts.service.ts";
import { createAvailabilityHelpers } from "../helpers/availability.ts";
import type { EmployeeSlice, StoreCreator } from "../types.ts";

export const createEmployeeSlice: StoreCreator<EmployeeSlice> = (set, get) => {
    const { syncAvailability, checkHealth } = createAvailabilityHelpers(
        "API Employés",
        "isEmployeeApiAvailable",
        { employees: [] },
        set,
        get
    );

    const refreshEmployees = async () => {
        set({ isLoadingEmployees: true });
        const healthy = await checkHealth();
        if (!healthy) {
            set({ isLoadingEmployees: false });
            return false;
        }

        try {
            const data = await EmployeeAPI.getAll();
            set({
                employees: data.map(normalizeEmployee),
                isEmployeeApiAvailable: true,
            });
            return true;
        } catch (error) {
            toastService.employeeSyncFailed(extractErrorMessage(error));
            void checkHealth();
            return false;
        } finally {
            set({ isLoadingEmployees: false });
        }
    };

    return {
        employees: [],
        isLoadingEmployees: false,
        isEmployeeApiAvailable: true,
        loadEmployees: refreshEmployees,
        createEmployee: async (employee) => {
            const toastId = toastService.employeeCreation(employee);
            try {
                const created = await EmployeeAPI.create(employee);
                toastService.dismiss(toastId);
                toastService.employeeCreated(normalizeEmployee(created));
                syncAvailability(true);
                void get().loadEmployees();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeCreationFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        updateEmployee: async (id, employee) => {
            const toastId = toastService.employeeUpdate({ ...employee, id });
            try {
                const updated = await EmployeeAPI.update(id, employee);
                toastService.dismiss(toastId);
                toastService.employeeUpdated(normalizeEmployee(updated));
                syncAvailability(true);
                void get().loadEmployees();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeUpdateFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        deleteEmployee: async (id) => {
            const employeeToDelete = get().employees.find((e) => e.id === id);
            if (!employeeToDelete) return;

            const toastId = toastService.employeeDeletion(employeeToDelete);
            try {
                await EmployeeAPI.remove(id);
                toastService.dismiss(toastId);
                toastService.employeeDeleted(employeeToDelete);
                syncAvailability(true);
                void get().loadEmployees();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.employeeDeletionFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        checkEmployeeAvailability: async () => {
            set({ isLoadingEmployees: true });
            try {
                await checkHealth();
                await get().loadEmployees();
                return true;
            } catch {
                set({ employees: [] });
                return false;
            } finally {
                set({ isLoadingEmployees: false });
            }
        },
        resetEmployees: () =>
            set({
                employees: [],
                isLoadingEmployees: false,
                isEmployeeApiAvailable: true,
            }),
    };
};
