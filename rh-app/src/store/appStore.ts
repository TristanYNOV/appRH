import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";

import { AttendanceCodec, AttendancePayloadCodec } from "../interfaces/attendance.codec.ts";
import { DepartmentCodec, DepartmentPayloadCodec } from "../interfaces/department.codec.ts";
import { EmployeeCodec, EmployeePayloadCodec } from "../interfaces/employee.codec.ts";
import { LeaveRequestCodec, LeaveRequestPayloadCodec } from "../interfaces/leaveRequest.codec.ts";
import { EmployeeAPI } from "../HTTP/employee.api.ts";
import { DepartmentAPI } from "../HTTP/department.api.ts";
import { FileAPI } from "../HTTP/file.api.ts";
import { normalizeDepartment, normalizeEmployee } from "../utils/dateNormalization.ts";
import { extractErrorMessage } from "../utils/errorHandling.ts";
import { downloadBlob } from "../utils/download.ts";
import { toastService } from "../services/toasts.service.ts";

const DisplayModeCodec = z.union([z.literal("employee"), z.literal("department")]);

const AuthCodec = z.object({
    isAuthenticated: z.boolean(),
    authMode: z.union([z.literal("login"), z.literal("signup"), z.null()]),
});

const ApiSettingsCodec = z.object({
    apiBaseUrl: z.string(),
    isApiSettingsOpen: z.boolean(),
    isSavingApiSettings: z.boolean(),
    apiSettingsError: z.string().nullable(),
    isReconnectingApis: z.boolean(),
});

const AvailabilityCodec = z.object({
    isEmployeeApiAvailable: z.boolean(),
    isDepartmentApiAvailable: z.boolean(),
    isFileApiAvailable: z.boolean(),
});

const LoadingCodec = z.object({
    isLoadingEmployees: z.boolean(),
    isLoadingDepartments: z.boolean(),
});

const TransferCodec = z.object({
    isImportingEmployees: z.boolean(),
    isImportingDepartments: z.boolean(),
    isExportingEmployees: z.boolean(),
    isExportingDepartments: z.boolean(),
});

const DataCodec = z.object({
    employees: z.array(EmployeeCodec).default([]),
    departments: z.array(DepartmentCodec).default([]),
    attendances: z.array(AttendanceCodec).default([]),
    leaveRequests: z.array(LeaveRequestCodec).default([]),
});

const AppStoreCodec = z.object({
    auth: AuthCodec,
    api: ApiSettingsCodec,
    displayMode: DisplayModeCodec,
    data: DataCodec,
    availability: AvailabilityCodec,
    loading: LoadingCodec,
    transfers: TransferCodec,
});

type AppStoreState = z.infer<typeof AppStoreCodec>;

type AuthMode = AppStoreState["auth"]["authMode"];

type PartialApiSettings = Partial<z.infer<typeof ApiSettingsCodec>>;
type PartialEmployee = z.infer<typeof EmployeePayloadCodec>;
type PartialDepartment = z.infer<typeof DepartmentPayloadCodec>;
type PartialAttendance = z.infer<typeof AttendancePayloadCodec>;
type PartialLeaveRequest = z.infer<typeof LeaveRequestPayloadCodec>;

type StoreSetter = (updater: (state: AppStore) => AppStore | Partial<AppStore>) => void;
type StoreGetter = () => AppStore;

type AppStore = AppStoreState & {
    setAuthMode: (mode: Exclude<AuthMode, null>) => void;
    openAuth: (mode: Exclude<AuthMode, null>) => void;
    closeAuth: () => void;
    login: () => void;
    logout: () => void;
    updateApiSettings: (patch: PartialApiSettings) => void;
    setDisplayMode: (mode: AppStoreState["displayMode"]) => void;
    setEmployees: (employees: AppStoreState["data"]["employees"]) => void;
    upsertEmployee: (employee: AppStoreState["data"]["employees"][number]) => void;
    updateEmployee: (id: number, updates: PartialEmployee) => void;
    removeEmployee: (id: number) => void;
    setDepartments: (departments: AppStoreState["data"]["departments"]) => void;
    upsertDepartment: (department: AppStoreState["data"]["departments"][number]) => void;
    updateDepartment: (id: number, updates: PartialDepartment) => void;
    removeDepartment: (id: number) => void;
    setAttendances: (attendances: AppStoreState["data"]["attendances"]) => void;
    upsertAttendance: (attendance: AppStoreState["data"]["attendances"][number]) => void;
    updateAttendance: (id: number, updates: PartialAttendance) => void;
    removeAttendance: (id: number) => void;
    setLeaveRequests: (leaveRequests: AppStoreState["data"]["leaveRequests"]) => void;
    upsertLeaveRequest: (leaveRequest: AppStoreState["data"]["leaveRequests"][number]) => void;
    updateLeaveRequest: (id: number, updates: PartialLeaveRequest) => void;
    removeLeaveRequest: (id: number) => void;
    loadEmployees: () => Promise<boolean>;
    loadDepartments: () => Promise<boolean>;
    createEmployee: (employee: AppStoreState["data"]["employees"][number]) => Promise<void>;
    updateEmployeeApi: (employee: AppStoreState["data"]["employees"][number]) => Promise<void>;
    deleteEmployeeApi: (id: number) => Promise<void>;
    createDepartment: (department: AppStoreState["data"]["departments"][number]) => Promise<void>;
    updateDepartmentApi: (department: AppStoreState["data"]["departments"][number]) => Promise<void>;
    deleteDepartmentApi: (id: number) => Promise<void>;
    checkFileAvailability: () => Promise<boolean>;
    importEmployees: (file: File) => Promise<void>;
    importDepartments: (file: File) => Promise<void>;
    exportEmployees: () => Promise<void>;
    exportDepartments: () => Promise<void>;
    reconnectApis: () => Promise<boolean>;
    reset: () => void;
};

const defaultState: AppStoreState = AppStoreCodec.parse({
    auth: {
        isAuthenticated: false,
        authMode: null,
    },
    api: {
        apiBaseUrl: "",
        isApiSettingsOpen: false,
        isSavingApiSettings: false,
        apiSettingsError: null,
        isReconnectingApis: false,
    },
    displayMode: "employee",
    data: {
        employees: [],
        departments: [],
        attendances: [],
        leaveRequests: [],
    },
    availability: {
        isEmployeeApiAvailable: false,
        isDepartmentApiAvailable: false,
        isFileApiAvailable: false,
    },
    loading: {
        isLoadingEmployees: false,
        isLoadingDepartments: false,
    },
    transfers: {
        isImportingEmployees: false,
        isImportingDepartments: false,
        isExportingEmployees: false,
        isExportingDepartments: false,
    },
});

const appStoreCreator: StateCreator<AppStore> = (set: StoreSetter, get: StoreGetter) => ({
    ...defaultState,
    setAuthMode: (mode: Exclude<AuthMode, null>) => {
        const authMode = AuthCodec.shape.authMode.parse(mode);
        set((state: AppStore) => ({ auth: { ...state.auth, authMode } }));
    },
    openAuth: (mode: Exclude<AuthMode, null>) => {
        const authMode = AuthCodec.shape.authMode.parse(mode);
        set((state: AppStore) => ({ auth: { ...state.auth, authMode } }));
    },
    closeAuth: () => set((state: AppStore) => ({ auth: { ...state.auth, authMode: null } })),
    login: () => set((state: AppStore) => ({ auth: { ...state.auth, isAuthenticated: true } })),
    logout: () => set((state: AppStore) => ({ auth: { ...state.auth, isAuthenticated: false, authMode: null } })),
    updateApiSettings: (patch: PartialApiSettings) => {
        const nextApi = ApiSettingsCodec.parse({ ...get().api, ...ApiSettingsCodec.partial().parse(patch) });
        set(() => ({ api: nextApi }));
    },
    setDisplayMode: (mode: AppStoreState["displayMode"]) => {
        const displayMode = DisplayModeCodec.parse(mode);
        set(() => ({ displayMode }));
    },
    setEmployees: (employees: AppStoreState["data"]["employees"]) => {
        const parsed = DataCodec.shape.employees.parse(employees);
        set((state: AppStore) => ({ data: { ...state.data, employees: parsed } }));
    },
    upsertEmployee: (employee: AppStoreState["data"]["employees"][number]) => {
        const parsed = EmployeeCodec.parse(employee);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                employees: state.data.employees.some(
                    (item: AppStoreState["data"]["employees"][number]) => item.id === parsed.id
                )
                    ? state.data.employees.map((item: AppStoreState["data"]["employees"][number]) =>
                          item.id === parsed.id ? parsed : item
                      )
                    : [...state.data.employees, parsed],
            },
        }));
    },
    updateEmployee: (id: number, updates: PartialEmployee) => {
        const parsedUpdates = EmployeePayloadCodec.parse(updates);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                employees: state.data.employees.map((employee: AppStoreState["data"]["employees"][number]) =>
                    employee.id === id ? EmployeeCodec.parse({ ...employee, ...parsedUpdates }) : employee
                ),
            },
        }));
    },
    removeEmployee: (id: number) =>
        set((state: AppStore) => ({
            data: { ...state.data, employees: state.data.employees.filter((employee) => employee.id !== id) },
        })),
    setDepartments: (departments: AppStoreState["data"]["departments"]) => {
        const parsed = DataCodec.shape.departments.parse(departments);
        set((state: AppStore) => ({ data: { ...state.data, departments: parsed } }));
    },
    upsertDepartment: (department: AppStoreState["data"]["departments"][number]) => {
        const parsed = DepartmentCodec.parse(department);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                departments: state.data.departments.some(
                    (item: AppStoreState["data"]["departments"][number]) => item.id === parsed.id
                )
                    ? state.data.departments.map((item: AppStoreState["data"]["departments"][number]) =>
                          item.id === parsed.id ? parsed : item
                      )
                    : [...state.data.departments, parsed],
            },
        }));
    },
    updateDepartment: (id: number, updates: PartialDepartment) => {
        const parsedUpdates = DepartmentPayloadCodec.parse(updates);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                departments: state.data.departments.map(
                    (department: AppStoreState["data"]["departments"][number]) =>
                        department.id === id
                            ? DepartmentCodec.parse({ ...department, ...parsedUpdates })
                            : department
                ),
            },
        }));
    },
    removeDepartment: (id: number) =>
        set((state: AppStore) => ({
            data: {
                ...state.data,
                departments: state.data.departments.filter(
                    (department: AppStoreState["data"]["departments"][number]) => department.id !== id
                ),
            },
        })),
    setAttendances: (attendances: AppStoreState["data"]["attendances"]) => {
        const parsed = DataCodec.shape.attendances.parse(attendances);
        set((state: AppStore) => ({ data: { ...state.data, attendances: parsed } }));
    },
    upsertAttendance: (attendance: AppStoreState["data"]["attendances"][number]) => {
        const parsed = AttendanceCodec.parse(attendance);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                attendances: state.data.attendances.some(
                    (item: AppStoreState["data"]["attendances"][number]) => item.id === parsed.id
                )
                    ? state.data.attendances.map((item: AppStoreState["data"]["attendances"][number]) =>
                          item.id === parsed.id ? parsed : item
                      )
                    : [...state.data.attendances, parsed],
            },
        }));
    },
    updateAttendance: (id: number, updates: PartialAttendance) => {
        const parsedUpdates = AttendancePayloadCodec.parse(updates);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                attendances: state.data.attendances.map((attendance: AppStoreState["data"]["attendances"][number]) =>
                    attendance.id === id
                        ? AttendanceCodec.parse({ ...attendance, ...parsedUpdates })
                        : attendance
                ),
            },
        }));
    },
    removeAttendance: (id: number) =>
        set((state: AppStore) => ({
            data: {
                ...state.data,
                attendances: state.data.attendances.filter(
                    (attendance: AppStoreState["data"]["attendances"][number]) => attendance.id !== id
                ),
            },
        })),
    setLeaveRequests: (leaveRequests: AppStoreState["data"]["leaveRequests"]) => {
        const parsed = DataCodec.shape.leaveRequests.parse(leaveRequests);
        set((state: AppStore) => ({ data: { ...state.data, leaveRequests: parsed } }));
    },
    upsertLeaveRequest: (leaveRequest: AppStoreState["data"]["leaveRequests"][number]) => {
        const parsed = LeaveRequestCodec.parse(leaveRequest);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                leaveRequests: state.data.leaveRequests.some(
                    (item: AppStoreState["data"]["leaveRequests"][number]) => item.id === parsed.id
                )
                    ? state.data.leaveRequests.map((item: AppStoreState["data"]["leaveRequests"][number]) =>
                          item.id === parsed.id ? parsed : item
                      )
                    : [...state.data.leaveRequests, parsed],
            },
        }));
    },
    updateLeaveRequest: (id: number, updates: PartialLeaveRequest) => {
        const parsedUpdates = LeaveRequestPayloadCodec.parse(updates);
        set((state: AppStore) => ({
            data: {
                ...state.data,
                leaveRequests: state.data.leaveRequests.map(
                    (leaveRequest: AppStoreState["data"]["leaveRequests"][number]) =>
                        leaveRequest.id === id
                            ? LeaveRequestCodec.parse({ ...leaveRequest, ...parsedUpdates })
                            : leaveRequest
                ),
            },
        }));
    },
    removeLeaveRequest: (id: number) =>
        set((state: AppStore) => ({
            data: {
                ...state.data,
                leaveRequests: state.data.leaveRequests.filter(
                    (leaveRequest: AppStoreState["data"]["leaveRequests"][number]) => leaveRequest.id !== id
                ),
            },
        })),
            loadEmployees: async () => {
                set((state: AppStore) => ({ loading: { ...state.loading, isLoadingEmployees: true } }));
                try {
                    const data = await EmployeeAPI.getAll();
                    const normalized = data.map(normalizeEmployee);
                    const parsed = DataCodec.shape.employees.parse(normalized);
                    set((state: AppStore) => ({
                        data: { ...state.data, employees: parsed },
                        availability: { ...state.availability, isEmployeeApiAvailable: true },
                    }));
                    return true;
                } catch (error) {
                    toastService.employeeSyncFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({
                        data: { ...state.data, employees: [] },
                        availability: { ...state.availability, isEmployeeApiAvailable: false },
                    }));
                    return false;
                } finally {
                    set((state: AppStore) => ({ loading: { ...state.loading, isLoadingEmployees: false } }));
                }
            },
    loadDepartments: async () => {
        set((state: AppStore) => ({ loading: { ...state.loading, isLoadingDepartments: true } }));
        try {
            const data = await DepartmentAPI.getAll();
            const normalized = data.map(normalizeDepartment);
                    const parsed = DataCodec.shape.departments.parse(normalized);
                    set((state: AppStore) => ({
                        data: { ...state.data, departments: parsed },
                        availability: { ...state.availability, isDepartmentApiAvailable: true },
                    }));
                    return true;
                } catch (error) {
                    toastService.departmentSyncFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({
                        data: { ...state.data, departments: [] },
                        availability: { ...state.availability, isDepartmentApiAvailable: false },
                    }));
                    return false;
                } finally {
                    set((state: AppStore) => ({ loading: { ...state.loading, isLoadingDepartments: false } }));
                }
            },
    createEmployee: async (employee: AppStoreState["data"]["employees"][number]) => {
        const parsedEmployee = EmployeeCodec.parse(employee);
        const toastId = toastService.employeeCreation(parsedEmployee);
        try {
            const { id: _tempId, ...rest } = parsedEmployee;
                    const created = await EmployeeAPI.create({ ...rest, department: undefined, attendances: undefined, leaveRequests: undefined });
                    const normalized = normalizeEmployee(created);
                    get().upsertEmployee(normalized);
                    toastService.dismiss(toastId);
                    toastService.employeeCreated(normalized);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isEmployeeApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.employeeCreationFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isEmployeeApiAvailable: false } }));
                }
            },
    updateEmployeeApi: async (employee: AppStoreState["data"]["employees"][number]) => {
        const parsedEmployee = EmployeeCodec.parse(employee);
        const toastId = toastService.employeeUpdate(parsedEmployee);
        try {
            const updated = await EmployeeAPI.update({
                        ...parsedEmployee,
                        department: undefined,
                        attendances: undefined,
                        leaveRequests: undefined,
                    });
                    const normalized = normalizeEmployee(updated);
                    get().upsertEmployee(normalized);
                    toastService.dismiss(toastId);
                    toastService.employeeUpdated(normalized);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isEmployeeApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.employeeUpdateFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isEmployeeApiAvailable: false } }));
                }
            },
    deleteEmployeeApi: async (id: number) => {
        const employeeToDelete = get().data.employees.find((employee) => employee.id === id);
        if (!employeeToDelete) return;
                const toastId = toastService.employeeDeletion(employeeToDelete);
                try {
                    await EmployeeAPI.remove(id);
                    get().removeEmployee(id);
                    toastService.dismiss(toastId);
                    toastService.employeeDeleted(employeeToDelete);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isEmployeeApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.employeeDeletionFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isEmployeeApiAvailable: false } }));
                }
            },
    createDepartment: async (department: AppStoreState["data"]["departments"][number]) => {
        const parsedDepartment = DepartmentCodec.parse(department);
        const toastId = toastService.departmentCreation(parsedDepartment);
        try {
                    const { id: _tempId, ...rest } = parsedDepartment;
                    const created = await DepartmentAPI.create({ ...rest, employees: undefined });
                    const normalized = normalizeDepartment(created);
                    get().upsertDepartment(normalized);
                    toastService.dismiss(toastId);
                    toastService.departmentCreated(normalized);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isDepartmentApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.departmentCreationFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isDepartmentApiAvailable: false } }));
                }
            },
    updateDepartmentApi: async (department: AppStoreState["data"]["departments"][number]) => {
        const parsedDepartment = DepartmentCodec.parse(department);
        const toastId = toastService.departmentUpdate(parsedDepartment);
        try {
                    const updated = await DepartmentAPI.update({ ...parsedDepartment, employees: undefined });
                    const normalized = normalizeDepartment(updated);
                    get().upsertDepartment(normalized);
                    toastService.dismiss(toastId);
                    toastService.departmentUpdated(normalized);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isDepartmentApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.departmentUpdateFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isDepartmentApiAvailable: false } }));
                }
            },
    deleteDepartmentApi: async (id: number) => {
        const departmentToDelete = get().data.departments.find((department) => department.id === id);
        if (!departmentToDelete) return;
                const toastId = toastService.departmentDeletion(departmentToDelete);
                try {
                    await DepartmentAPI.remove(id);
                    get().removeDepartment(id);
                    toastService.dismiss(toastId);
                    toastService.departmentDeleted(departmentToDelete);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isDepartmentApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.departmentDeletionFailed(extractErrorMessage(error));
                    set((state: AppStore) => ({ availability: { ...state.availability, isDepartmentApiAvailable: false } }));
                }
            },
            checkFileAvailability: async () => {
                try {
                    await FileAPI.checkAvailability();
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: true },
                    }));
                    return true;
                } catch (error) {
                    console.error("[IMPORT/EXPORT] Vérification de l'API échouée", error);
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: false },
                    }));
                    return false;
                }
            },
            importEmployees: async (file: File) => {
                set((state: AppStore) => ({ transfers: { ...state.transfers, isImportingEmployees: true } }));
                const toastId = toastService.fileImporting("employés");
                try {
                    await FileAPI.importEmployees(file);
                    toastService.dismiss(toastId);
                    toastService.fileImported("employés");
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: true },
                    }));
                    await get().loadEmployees();
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileImportFailed("employés", extractErrorMessage(error));
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: false },
                    }));
                } finally {
                    set((state: AppStore) => ({ transfers: { ...state.transfers, isImportingEmployees: false } }));
                }
            },
            importDepartments: async (file: File) => {
                set((state: AppStore) => ({ transfers: { ...state.transfers, isImportingDepartments: true } }));
                const toastId = toastService.fileImporting("départements");
                try {
                    await FileAPI.importDepartments(file);
                    toastService.dismiss(toastId);
                    toastService.fileImported("départements");
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: true },
                    }));
                    await get().loadDepartments();
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileImportFailed("départements", extractErrorMessage(error));
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: false },
                    }));
                } finally {
                    set((state: AppStore) => ({ transfers: { ...state.transfers, isImportingDepartments: false } }));
                }
            },
            exportEmployees: async () => {
                set((state: AppStore) => ({ transfers: { ...state.transfers, isExportingEmployees: true } }));
                const toastId = toastService.fileExporting("employés");
                try {
                    const blob = await FileAPI.exportEmployees();
                    downloadBlob(blob, `employees-${new Date().toISOString()}.xlsx`);
                    toastService.dismiss(toastId);
                    toastService.fileExported("employés");
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileExportFailed("employés", extractErrorMessage(error));
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: false },
                    }));
                } finally {
                    set((state: AppStore) => ({ transfers: { ...state.transfers, isExportingEmployees: false } }));
                }
            },
            exportDepartments: async () => {
                set((state: AppStore) => ({ transfers: { ...state.transfers, isExportingDepartments: true } }));
                const toastId = toastService.fileExporting("départements");
                try {
                    const blob = await FileAPI.exportDepartments();
                    downloadBlob(blob, `departments-${new Date().toISOString()}.xlsx`);
                    toastService.dismiss(toastId);
                    toastService.fileExported("départements");
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: true },
                    }));
                } catch (error) {
                    toastService.dismiss(toastId);
                    toastService.fileExportFailed("départements", extractErrorMessage(error));
                    set((state: AppStore) => ({
                        availability: { ...state.availability, isFileApiAvailable: false },
                    }));
                } finally {
                    set((state: AppStore) => ({ transfers: { ...state.transfers, isExportingDepartments: false } }));
                }
            },
            reconnectApis: async () => {
                if (get().api.isReconnectingApis) return false;
                set((state: AppStore) => ({ api: { ...state.api, isReconnectingApis: true } }));
                try {
                    const [employeeAvailable, departmentAvailable, fileAvailable] = await Promise.all([
                        get().loadEmployees(),
                        get().loadDepartments(),
                        get().checkFileAvailability(),
                    ]);
                    return employeeAvailable && departmentAvailable && fileAvailable;
                } finally {
                    set((state: AppStore) => ({ api: { ...state.api, isReconnectingApis: false } }));
                }
            },
            reset: () =>
                set((state: AppStore) => ({
                    ...defaultState,
                    api: { ...defaultState.api, apiBaseUrl: state.api.apiBaseUrl },
                })),
});

export const useAppStore = create<AppStore>()(
    persist<AppStore>(appStoreCreator, {
        name: "app-store",
        storage: createJSONStorage(() => localStorage),
    })
);
