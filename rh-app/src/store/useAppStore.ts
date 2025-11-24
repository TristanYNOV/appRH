import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EmployeeAPI } from "../HTTP/employee.api.ts";
import { DepartmentAPI } from "../HTTP/department.api.ts";
import { FileAPI } from "../HTTP/file.api.ts";
import apiClient from "../HTTP/httpClient.ts";
import type {
    CreateEmployeePayload,
    Employee,
    UpdateEmployeePayload,
} from "../interfaces/employee.codec.ts";
import type {
    CreateDepartmentPayload,
    Department,
    UpdateDepartmentPayload,
} from "../interfaces/department.codec.ts";
import type { LeaveRequest } from "../interfaces/leaveRequest.codec.ts";
import { normalizeDepartment, normalizeEmployee } from "../utils/dateNormalization.ts";
import { extractErrorMessage } from "../utils/errorHandling.ts";
import { downloadBlob } from "../utils/download.ts";
import { toastService } from "../services/toasts.service.ts";

export type DisplayMode = "employee" | "department";
export type AuthMode = "login" | "signup" | null;

const notifyAvailability = (
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

interface PreferenceSlice {
    apiBaseUrl: string;
    setApiBaseUrl: (url: string) => void;
}

interface AuthSlice {
    isAuthenticated: boolean;
    authMode: AuthMode;
    login: () => void;
    logout: () => void;
    openAuth: (mode: Exclude<AuthMode, null>) => void;
    closeAuth: () => void;
}

interface DashboardSlice {
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
}

interface EmployeeSlice {
    employees: Employee[];
    isLoadingEmployees: boolean;
    isEmployeeApiAvailable: boolean;
    loadEmployees: () => Promise<boolean>;
    createEmployee: (employee: CreateEmployeePayload) => Promise<void>;
    updateEmployee: (id: number, employee: UpdateEmployeePayload) => Promise<void>;
    deleteEmployee: (id: number) => Promise<void>;
    checkEmployeeAvailability: () => Promise<boolean>;
    resetEmployees: () => void;
}

interface DepartmentSlice {
    departments: Department[];
    isLoadingDepartments: boolean;
    isDepartmentApiAvailable: boolean;
    loadDepartments: () => Promise<boolean>;
    createDepartment: (department: CreateDepartmentPayload) => Promise<void>;
    updateDepartment: (id: number, department: UpdateDepartmentPayload) => Promise<void>;
    deleteDepartment: (id: number) => Promise<void>;
    checkDepartmentAvailability: () => Promise<boolean>;
    resetDepartments: () => void;
}

interface FileTransferSlice {
    isFileApiAvailable: boolean;
    isImportingEmployees: boolean;
    isImportingDepartments: boolean;
    isExportingEmployees: boolean;
    isExportingDepartments: boolean;
    importEmployees: (file: File) => Promise<void>;
    importDepartments: (file: File) => Promise<void>;
    exportEmployees: () => Promise<void>;
    exportDepartments: () => Promise<void>;
    checkFileAvailability: () => Promise<boolean>;
    resetFileTransfers: () => void;
}

interface GlobalActions {
    resetAfterLogout: () => void;
    reconnectApis: () => Promise<boolean>;
}

export type AppState = PreferenceSlice &
    AuthSlice &
    DashboardSlice &
    EmployeeSlice &
    DepartmentSlice &
    FileTransferSlice &
    GlobalActions;

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            apiBaseUrl: apiClient.getBaseURL(),
            setApiBaseUrl: (url: string) => {
                apiClient.setBaseURL(url);
                set({ apiBaseUrl: url });
            },

            isAuthenticated: false,
            authMode: null,
            login: () => set({ isAuthenticated: true }),
            logout: () => set({ isAuthenticated: false }),
            openAuth: (mode) => set({ authMode: mode }),
            closeAuth: () => set({ authMode: null }),

            displayMode: "employee",
            setDisplayMode: (mode) => set({ displayMode: mode }),

            employees: [],
            isLoadingEmployees: false,
            isEmployeeApiAvailable: true,
            loadEmployees: async () => {
                set({ isLoadingEmployees: true });
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Employés",
                            state.isEmployeeApiAvailable,
                            available,
                            () => set({ employees: [] })
                        );
                        return {
                            isEmployeeApiAvailable: available,
                            ...(available ? {} : { employees: [] }),
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
            },
            createEmployee: async (employee) => {
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Employés",
                            state.isEmployeeApiAvailable,
                            available,
                            () => set({ employees: [] })
                        );
                        return {
                            isEmployeeApiAvailable: available,
                            ...(available ? {} : { employees: [] }),
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
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Employés",
                            state.isEmployeeApiAvailable,
                            available,
                            () => set({ employees: [] })
                        );
                        return {
                            isEmployeeApiAvailable: available,
                            ...(available ? {} : { employees: [] }),
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
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Employés",
                            state.isEmployeeApiAvailable,
                            available,
                            () => set({ employees: [] })
                        );
                        return {
                            isEmployeeApiAvailable: available,
                            ...(available ? {} : { employees: [] }),
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
                    await apiClient.checkHealth();
                    set((state) => {
                        notifyAvailability("API Employés", state.isEmployeeApiAvailable, true);
                        return { isEmployeeApiAvailable: true } as Partial<AppState>;
                    });
                    await get().loadEmployees();
                    return true;
                } catch {
                    set((state) => {
                        notifyAvailability("API Employés", state.isEmployeeApiAvailable, false, () =>
                            set({ employees: [] })
                        );
                        return { isEmployeeApiAvailable: false, employees: [] } as Partial<AppState>;
                    });
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

            departments: [],
            isLoadingDepartments: false,
            isDepartmentApiAvailable: true,
            loadDepartments: async () => {
                set({ isLoadingDepartments: true });
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Départements",
                            state.isDepartmentApiAvailable,
                            available,
                            () => set({ departments: [] })
                        );
                        return {
                            isDepartmentApiAvailable: available,
                            ...(available ? {} : { departments: [] }),
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

                const healthy = await checkHealth();
                if (!healthy) {
                    set({ isLoadingDepartments: false });
                    return false;
                }

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
            },
            createDepartment: async (department) => {
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Départements",
                            state.isDepartmentApiAvailable,
                            available,
                            () => set({ departments: [] })
                        );
                        return {
                            isDepartmentApiAvailable: available,
                            ...(available ? {} : { departments: [] }),
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
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Départements",
                            state.isDepartmentApiAvailable,
                            available,
                            () => set({ departments: [] })
                        );
                        return {
                            isDepartmentApiAvailable: available,
                            ...(available ? {} : { departments: [] }),
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
                const syncAvailability = (available: boolean) =>
                    set((state) => {
                        notifyAvailability(
                            "API Départements",
                            state.isDepartmentApiAvailable,
                            available,
                            () => set({ departments: [] })
                        );
                        return {
                            isDepartmentApiAvailable: available,
                            ...(available ? {} : { departments: [] }),
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
                    await apiClient.checkHealth();
                    set((state) => {
                        notifyAvailability("API Départements", state.isDepartmentApiAvailable, true);
                        return { isDepartmentApiAvailable: true } as Partial<AppState>;
                    });
                    await get().loadDepartments();
                    return true;
                } catch {
                    set((state) => {
                        notifyAvailability(
                            "API Départements",
                            state.isDepartmentApiAvailable,
                            false,
                            () => set({ departments: [] })
                        );
                        return { isDepartmentApiAvailable: false, departments: [] } as Partial<AppState>;
                    });
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

            isFileApiAvailable: true,
            isImportingEmployees: false,
            isImportingDepartments: false,
            isExportingEmployees: false,
            isExportingDepartments: false,
            importEmployees: async (file: File) => {
                set({ isImportingEmployees: true });
                const toastId = toastService.fileImporting("employés");
                try {
                    await FileAPI.importEmployees(file);
                    toastService.dismiss(toastId);
                    toastService.fileImported("employés");
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
                        return { isFileApiAvailable: true } as Partial<AppState>;
                    });
                    await get().loadEmployees();
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileImportFailed("employés", extractErrorMessage(error));
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
                        return { isFileApiAvailable: false } as Partial<AppState>;
                    });
                    void apiClient.checkHealth();
                } finally {
                    set({ isImportingEmployees: false });
                }
            },
            importDepartments: async (file: File) => {
                set({ isImportingDepartments: true });
                const toastId = toastService.fileImporting("départements");
                try {
                    await FileAPI.importDepartments(file);
                    toastService.dismiss(toastId);
                    toastService.fileImported("départements");
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
                        return { isFileApiAvailable: true } as Partial<AppState>;
                    });
                    await get().loadDepartments();
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileImportFailed("départements", extractErrorMessage(error));
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
                        return { isFileApiAvailable: false } as Partial<AppState>;
                    });
                    void apiClient.checkHealth();
                } finally {
                    set({ isImportingDepartments: false });
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
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
                        return { isFileApiAvailable: true } as Partial<AppState>;
                    });
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileExportFailed("employés", extractErrorMessage(error));
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
                        return { isFileApiAvailable: false } as Partial<AppState>;
                    });
                    void apiClient.checkHealth();
                } finally {
                    set({ isExportingEmployees: false });
                }
            },
            exportDepartments: async () => {
                set({ isExportingDepartments: true });
                const toastId = toastService.fileExporting("départements");
                try {
                    const blob = await FileAPI.exportDepartments();
                    downloadBlob(blob, `departments-${new Date().toISOString()}.xlsx`);
                    toastService.dismiss(toastId);
                    toastService.fileExported("départements");
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
                        return { isFileApiAvailable: true } as Partial<AppState>;
                    });
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileExportFailed("départements", extractErrorMessage(error));
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
                        return { isFileApiAvailable: false } as Partial<AppState>;
                    });
                    void apiClient.checkHealth();
                } finally {
                    set({ isExportingDepartments: false });
                }
            },
            checkFileAvailability: async () => {
                try {
                    await apiClient.checkHealth();
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, true);
                        return { isFileApiAvailable: true } as Partial<AppState>;
                    });
                    return true;
                } catch {
                    set((state) => {
                        notifyAvailability("Import / Export", state.isFileApiAvailable, false);
                        return { isFileApiAvailable: false } as Partial<AppState>;
                    });
                    return false;
                }
            },
            resetFileTransfers: () =>
                set({
                    isFileApiAvailable: true,
                    isImportingEmployees: false,
                    isImportingDepartments: false,
                    isExportingEmployees: false,
                    isExportingDepartments: false,
                }),

            resetAfterLogout: () => {
                set({ displayMode: "employee" });
                get().resetEmployees();
                get().resetDepartments();
                get().resetFileTransfers();
            },
            reconnectApis: async () => {
                const [employeeOk, departmentOk, fileOk] = await Promise.all([
                    get().checkEmployeeAvailability(),
                    get().checkDepartmentAvailability(),
                    get().checkFileAvailability(),
                ]);

                if (employeeOk) {
                    void get().loadEmployees();
                }
                if (departmentOk) {
                    void get().loadDepartments();
                }

                return employeeOk && departmentOk && fileOk;
            },
        }),
        {
            name: "rh-app-store",
            partialize: (state) => ({
                apiBaseUrl: state.apiBaseUrl,
                displayMode: state.displayMode,
            }),
        }
    )
);

export type { DisplayMode as StoreDisplayMode };
export type { AuthMode as StoreAuthMode };
export type { LeaveRequest };
