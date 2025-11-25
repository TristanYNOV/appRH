import type { StateCreator } from "zustand";

import type { Attendance, AttendanceCreate, AttendanceUpdate } from "../interfaces/attendance.codec.ts";
import type {
    CreateDepartmentPayload,
    Department,
    UpdateDepartmentPayload,
} from "../interfaces/department.codec.ts";
import type {
    CreateEmployeePayload,
    Employee,
    UpdateEmployeePayload,
} from "../interfaces/employee.codec.ts";
import type { LeaveRequest } from "../interfaces/leaveRequest.codec.ts";
import type { AuthUser } from "../interfaces/auth.interface.ts";

export type DisplayMode = "employee" | "department" | "attendance";
export type AuthMode = "login" | "signup" | null;

export interface PreferenceSlice {
    apiBaseUrl: string;
    setApiBaseUrl: (url: string) => void;
}

export interface AuthSlice {
    isAuthenticated: boolean;
    authMode: AuthMode;
    accessToken: string | null;
    user: AuthUser | null;
    login: (accessToken: string, user: AuthUser) => void;
    logout: () => void;
    openAuth: (mode: Exclude<AuthMode, null>) => void;
    closeAuth: () => void;
}

export interface DashboardSlice {
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
}

export interface EmployeeSlice {
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

export interface DepartmentSlice {
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

export interface AttendanceSlice {
    attendances: Attendance[];
    isLoadingAttendances: boolean;
    isAttendanceApiAvailable: boolean;
    loadAttendances: () => Promise<boolean>;
    createAttendance: (attendance: AttendanceCreate) => Promise<void>;
    updateAttendance: (id: number, attendance: AttendanceUpdate) => Promise<void>;
    deleteAttendance: (id: number) => Promise<void>;
    checkAttendanceAvailability: () => Promise<boolean>;
    resetAttendances: () => void;
}

export interface FileTransferSlice {
    isFileApiAvailable: boolean;
    isImportingEmployees: boolean;
    isExportingEmployees: boolean;
    importEmployees: (file: File) => Promise<void>;
    exportEmployees: () => Promise<void>;
    checkFileAvailability: () => Promise<boolean>;
    resetFileTransfers: () => void;
}

export interface GlobalActions {
    resetAfterLogout: () => void;
    reconnectApis: () => Promise<boolean>;
}

export type AppState = PreferenceSlice &
    AuthSlice &
    DashboardSlice &
    EmployeeSlice &
    DepartmentSlice &
    AttendanceSlice &
    FileTransferSlice &
    GlobalActions;

export type StoreCreator<T> = StateCreator<AppState, [], [], T>;
export type StoreSet = Parameters<StoreCreator<AppState>>[0];
export type StoreGet = Parameters<StoreCreator<AppState>>[1];

export type { DisplayMode as StoreDisplayMode };
export type { AuthMode as StoreAuthMode };
export type { LeaveRequest };
