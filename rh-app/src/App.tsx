import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Toaster } from "react-hot-toast";

import "./App.css";
import { ApiEndpointModal, AuthForm, TopBar } from "./components/index.ts";
import authService from "./services/auth.service.ts";
import { toastService } from "./services/toasts.service.ts";
import { useFeatureReminder } from "./hooks/useFeatureReminder.ts";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import { extractErrorMessage } from "./utils/errorHandling.ts";
import apiClient, { DEFAULT_API_BASE_URL } from "./HTTP/httpClient.ts";
import { useAppStore } from "./store/useAppStore.ts";

import type {
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
} from "./interfaces/department.codec.ts";
import type {
    AttendanceCreate,
    AttendanceUpdate,
} from "./interfaces/attendance.codec.ts";
import type { CreateEmployeePayload, UpdateEmployeePayload } from "./interfaces/employee.codec.ts";
import type { LeaveRequest } from "./interfaces/leaveRequest.codec.ts";

const LEAVE_API_AVAILABLE = false;

function App() {
    const {
        isAuthenticated,
        authMode,
        openAuth,
        closeAuth,
        login,
        logout,
        displayMode,
        setDisplayMode,
        employees,
        attendances,
        isLoadingEmployees,
        isLoadingAttendances,
        isEmployeeApiAvailable,
        isAttendanceApiAvailable,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        createAttendance,
        updateAttendance,
        deleteAttendance,
        departments,
        isLoadingDepartments,
        isDepartmentApiAvailable,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        isFileApiAvailable,
        isImportingEmployees,
        isImportingDepartments,
        isExportingEmployees,
        isExportingDepartments,
        importEmployees,
        importDepartments,
        exportEmployees,
        exportDepartments,
        loadEmployees,
        loadAttendances,
        loadDepartments,
        checkFileAvailability,
        resetAfterLogout,
        reconnectApis,
        apiBaseUrl,
        setApiBaseUrl,
    } = useAppStore();

    const [isReconnectingApis, setIsReconnectingApis] = useState(false);
    const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
    const [isSavingApiSettings, setIsSavingApiSettings] = useState(false);
    const [apiSettingsError, setApiSettingsError] = useState<string | null>(null);
    const missingFeatures = [
        !LEAVE_API_AVAILABLE ? "demandes d'absence" : null,
    ].filter((feature): feature is string => feature !== null);
    const featureReminder = useFeatureReminder(isAuthenticated, missingFeatures);

    const employeeFileInputRef = useRef<HTMLInputElement | null>(null);
    const departmentFileInputRef = useRef<HTMLInputElement | null>(null);

    const disableEmployeeImport = !isFileApiAvailable || isImportingEmployees;
    const disableDepartmentImport = !isFileApiAvailable || isImportingDepartments;
    const disableEmployeeExport = !isFileApiAvailable || isExportingEmployees;
    const disableDepartmentExport = !isFileApiAvailable || isExportingDepartments;
    const disableAttendanceActions = !isAttendanceApiAvailable || !isEmployeeApiAvailable;
    const disableLeaveActions = !LEAVE_API_AVAILABLE || !isEmployeeApiAvailable;

    const hasApiIssue =
        !isEmployeeApiAvailable ||
        !isAttendanceApiAvailable ||
        !isDepartmentApiAvailable ||
        !isFileApiAvailable;

    useEffect(() => {
        if (!isAuthenticated) {
            resetAfterLogout();
            return;
        }

        void loadEmployees();
        void loadAttendances();
        void loadDepartments();
        void checkFileAvailability();
    }, [
        checkFileAvailability,
        isAuthenticated,
        loadAttendances,
        loadDepartments,
        loadEmployees,
        resetAfterLogout,
    ]);

    const handleAuth = async (email: string, password: string, mode: "login" | "signup") => {
        const toastId = toastService.authAttempt();
        try {
            const mockToken = window.btoa(`${email}:${password}:${mode}:${Date.now()}`);
            authService.storeToken(mockToken);
            login();
            closeAuth();
            toastService.dismiss(toastId);
            toastService.authSuccess();
        } catch (error) {
            toastService.dismiss(toastId);
            toastService.authFailed(extractErrorMessage(error));
        }
    };

    const handleLogout = () => {
        authService.clearToken();
        logout();
        closeAuth();
        resetAfterLogout();
        featureReminder.reset();
    };

    const handleOpenApiSettings = () => {
        setApiSettingsError(null);
        setIsApiSettingsOpen(true);
    };

    const handleCloseApiSettings = () => {
        setIsApiSettingsOpen(false);
        setApiSettingsError(null);
    };

    const triggerEmployeeImport = () => {
        if (disableEmployeeImport) return;
        employeeFileInputRef.current?.click();
    };

    const triggerDepartmentImport = () => {
        if (disableDepartmentImport) return;
        departmentFileInputRef.current?.click();
    };

    const onImportEmployees = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        await importEmployees(file);
    };

    const onImportDepartments = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        await importDepartments(file);
    };

    const handleCreateEmployee = async (employee: CreateEmployeePayload) => {
        await createEmployee(employee);
    };

    const handleUpdateEmployee = async (id: number, employee: UpdateEmployeePayload) => {
        await updateEmployee(id, employee);
    };

    const handleDeleteEmployee = async (id: number) => {
        await deleteEmployee(id);
    };

    const handleCreateDepartment = async (department: CreateDepartmentPayload) => {
        await createDepartment(department);
    };

    const handleUpdateDepartment = async (id: number, department: UpdateDepartmentPayload) => {
        await updateDepartment(id, department);
    };

    const handleDeleteDepartment = async (id: number) => {
        await deleteDepartment(id);
    };

    const handleCreateAttendance = async (attendance: AttendanceCreate) => {
        await createAttendance(attendance);
    };

    const handleUpdateAttendance = async (id: number, attendance: AttendanceUpdate) => {
        await updateAttendance(id, attendance);
    };

    const handleDeleteAttendance = async (id: number) => {
        await deleteAttendance(id);
    };

    const handleCreateLeaveRequest = (_employeeId: number, _leave: LeaveRequest) => {
        toastService.featureUnavailable("Les demandes d'absence");
    };

    const handleReconnectApis = async () => {
        if (!isAuthenticated || isReconnectingApis) {
            return;
        }

        setIsReconnectingApis(true);
        const toastId = toastService.apiReconnectAttempt();
        try {
            const success = await reconnectApis();
            toastService.dismiss(toastId);
            if (success) {
                toastService.apiReconnectSuccess();
            } else {
                toastService.apiReconnectFailed();
            }
        } catch (error) {
            toastService.dismiss(toastId);
            toastService.apiReconnectFailed(extractErrorMessage(error));
        } finally {
            setIsReconnectingApis(false);
        }
    };

    const handleSaveApiBaseUrl = async (url: string) => {
        if (isSavingApiSettings) {
            return;
        }

        setIsSavingApiSettings(true);
        setApiSettingsError(null);
        const toastId = toastService.apiConfigTest();
        try {
            const normalizedUrl = await apiClient.testConnection(url);
            apiClient.setBaseURL(normalizedUrl);
            setApiBaseUrl(normalizedUrl);
            toastService.dismiss(toastId);
            toastService.apiConfigSuccess(normalizedUrl);
            setIsApiSettingsOpen(false);
            if (isAuthenticated) {
                void reconnectApis();
            }
        } catch (error) {
            toastService.dismiss(toastId);
            const message = extractErrorMessage(error);
            setApiSettingsError(message);
            toastService.apiConfigFailed(message);
        } finally {
            setIsSavingApiSettings(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar
                logIn={isAuthenticated}
                onOpenAuth={openAuth}
                onLogout={handleLogout}
                onReconnect={handleReconnectApis}
                canReconnect={isAuthenticated}
                isReconnecting={isReconnectingApis}
                hasApiIssue={hasApiIssue}
                onOpenApiSettings={handleOpenApiSettings}
            />
            <ApiEndpointModal
                isOpen={isApiSettingsOpen}
                currentUrl={apiBaseUrl}
                defaultUrl={DEFAULT_API_BASE_URL}
                error={apiSettingsError}
                isSubmitting={isSavingApiSettings}
                onClose={handleCloseApiSettings}
                onSave={handleSaveApiBaseUrl}
                onUrlChange={() => setApiSettingsError(null)}
            />

            {!isAuthenticated && authMode === null && (
                <div className="flex flex-col justify-center w-full h-80 items-center">
                    <span className="text-center">Merci de vous authentifier !</span>
                    <div className="flex gap-4 mt-8">
                        <span className="text-center">Email:</span>
                        <span className="text-center">Graou@minou.miaou</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-center">Mot de passse:</span>
                        <span className="text-center">Graou</span>
                    </div>
                </div>
            )}

            {!isAuthenticated && authMode && <AuthForm onSubmit={handleAuth} />}

            {isAuthenticated && (
                <DashboardLayout
                    displayMode={displayMode}
                    onDisplayModeChange={(mode) => setDisplayMode(mode)}
                    employees={employees}
                    attendances={attendances}
                    departments={departments}
                    isLoadingEmployees={isLoadingEmployees}
                    isLoadingAttendances={isLoadingAttendances}
                    isLoadingDepartments={isLoadingDepartments}
                    isEmployeeApiAvailable={isEmployeeApiAvailable}
                    isDepartmentApiAvailable={isDepartmentApiAvailable}
                    onCreateEmployee={handleCreateEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                    onCreateAttendance={handleCreateAttendance}
                    onUpdateAttendance={handleUpdateAttendance}
                    onDeleteAttendance={handleDeleteAttendance}
                    onCreateDepartment={handleCreateDepartment}
                    onUpdateDepartment={handleUpdateDepartment}
                    onDeleteDepartment={handleDeleteDepartment}
                    onCreateLeaveRequest={handleCreateLeaveRequest}
                    onEmployeeImportClick={triggerEmployeeImport}
                    onDepartmentImportClick={triggerDepartmentImport}
                    onExportEmployees={exportEmployees}
                    onExportDepartments={exportDepartments}
                    onEmployeeFileChange={onImportEmployees}
                    onDepartmentFileChange={onImportDepartments}
                    employeeFileInputRef={employeeFileInputRef}
                    departmentFileInputRef={departmentFileInputRef}
                    disableEmployeeImport={disableEmployeeImport}
                    disableDepartmentImport={disableDepartmentImport}
                    disableEmployeeExport={disableEmployeeExport}
                    disableDepartmentExport={disableDepartmentExport}
                    disableAttendanceActions={disableAttendanceActions}
                    disableLeaveActions={disableLeaveActions}
                />
            )}

            <Toaster position="top-left" />
        </div>
    );
}

export default App;
