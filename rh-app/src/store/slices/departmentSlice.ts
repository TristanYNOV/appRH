import { DepartmentAPI } from "../../HTTP/department.api.ts";
import { normalizeDepartment } from "../../utils/dateNormalization.ts";
import { extractErrorMessage } from "../../utils/errorHandling.ts";
import { toastService } from "../../services/toasts.service.ts";
import { createAvailabilityHelpers } from "../helpers/availability.ts";
import type { DepartmentSlice, StoreCreator } from "../types.ts";

export const createDepartmentSlice: StoreCreator<DepartmentSlice> = (set, get) => {
    const { syncAvailability, checkHealth } = createAvailabilityHelpers(
        "API Départements",
        "isDepartmentApiAvailable",
        { departments: [] },
        set,
        get
    );

    const refreshDepartments = async () => {
        set({ isLoadingDepartments: true });
        await checkHealth();

        try {
            const data = await DepartmentAPI.getAll();
            set({
                departments: data.map(normalizeDepartment),
                isDepartmentApiAvailable: true,
            });
            return true;
        } catch (error) {
            toastService.departmentSyncFailed(extractErrorMessage(error));
            void checkHealth();
            return false;
        } finally {
            set({ isLoadingDepartments: false });
        }
    };

    return {
        departments: [],
        isLoadingDepartments: false,
        isDepartmentApiAvailable: true,
        loadDepartments: refreshDepartments,
        createDepartment: async (department) => {
            const toastId = toastService.departmentCreation(department);
            try {
                const created = await DepartmentAPI.create(department);
                toastService.dismiss(toastId);
                toastService.departmentCreated(normalizeDepartment(created));
                syncAvailability(true);
                void get().loadDepartments();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentCreationFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        updateDepartment: async (id, department) => {
            const toastId = toastService.departmentUpdate({ ...department, id });
            try {
                const updated = await DepartmentAPI.update(id, department);
                toastService.dismiss(toastId);
                toastService.departmentUpdated(normalizeDepartment(updated));
                syncAvailability(true);
                void get().loadDepartments();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentUpdateFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        deleteDepartment: async (id) => {
            const departmentToDelete = get().departments.find((d) => d.id === id);
            if (!departmentToDelete) return;

            const toastId = toastService.departmentDeletion(departmentToDelete);
            try {
                await DepartmentAPI.remove(id);
                toastService.dismiss(toastId);
                toastService.departmentDeleted(departmentToDelete);
                syncAvailability(true);
                void get().loadDepartments();
            } catch (error) {
                toastService.dismiss(toastId);
                toastService.departmentDeletionFailed(extractErrorMessage(error));
                void checkHealth();
            }
        },
        checkDepartmentAvailability: async () => {
            set({ isLoadingDepartments: true });
            try {
                await checkHealth();
                await get().loadDepartments();
                return true;
            } catch {
                set({ departments: [] });
                return false;
            } finally {
                set({ isLoadingDepartments: false });
            }
        },
        resetDepartments: () =>
            set({
                departments: [],
                isLoadingDepartments: false,
                isDepartmentApiAvailable: true,
            }),
    };
};
