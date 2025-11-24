import { useEffect, useRef, type ChangeEvent } from "react";
import { Toaster } from "react-hot-toast";

import "./App.css";
import { ApiEndpointModal, AuthForm, TopBar } from "./components/index.ts";
import authService from "./services/auth.service.ts";
import { toastService } from "./services/toasts.service.ts";
import { useFeatureReminder } from "./hooks/useFeatureReminder.ts";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import { extractErrorMessage } from "./utils/errorHandling.ts";
import apiClient, { DEFAULT_API_BASE_URL } from "./HTTP/httpClient.ts";
import { useAppStore } from "./store/appStore.ts";

import type { Department } from "./interfaces/department.codec.ts";
import type { Employee } from "./interfaces/employee.codec.ts";
import type { LeaveRequest } from "./interfaces/leaveRequest.codec.ts";

const ATTENDANCE_API_AVAILABLE = false;
const LEAVE_API_AVAILABLE = false;

function App() {
    const {
        auth,
        api,
        displayMode,
        availability,
        loading,
        transfers,
        data,
        setDisplayMode,
        openAuth,
        closeAuth,
        login,
        logout,
        updateApiSettings,
        loadEmployees,
        loadDepartments,
        setEmployees,
        setDepartments,
        setAttendances,
        setLeaveRequests,
        createEmployee,
        updateEmployeeApi,
        deleteEmployeeApi,
        createDepartment,
        updateDepartmentApi,
        deleteDepartmentApi,
        checkFileAvailability,
        importEmployees,
        importDepartments,
        exportEmployees,
        exportDepartments,
        reconnectApis,
        reset,
    } = useAppStore();

    useEffect(() => {
        if (!api.apiBaseUrl) {
            updateApiSettings({ apiBaseUrl: apiClient.getBaseURL() });
        }
    }, [api.apiBaseUrl, updateApiSettings]);
    const missingFeatures = [
        !ATTENDANCE_API_AVAILABLE ? "présences" : null,
        !LEAVE_API_AVAILABLE ? "demandes d'absence" : null,
    ].filter((feature): feature is string => feature !== null);
    const featureReminder = useFeatureReminder(auth.isAuthenticated, missingFeatures);

    const employeeFileInputRef = useRef<HTMLInputElement | null>(null);
    const departmentFileInputRef = useRef<HTMLInputElement | null>(null);

    const disableEmployeeImport = !availability.isFileApiAvailable || transfers.isImportingEmployees;
    const disableDepartmentImport = !availability.isFileApiAvailable || transfers.isImportingDepartments;
    const disableEmployeeExport = !availability.isFileApiAvailable || transfers.isExportingEmployees;
    const disableDepartmentExport = !availability.isFileApiAvailable || transfers.isExportingDepartments;
    const disableAttendanceActions = !ATTENDANCE_API_AVAILABLE || !availability.isEmployeeApiAvailable;
    const disableLeaveActions = !LEAVE_API_AVAILABLE || !availability.isEmployeeApiAvailable;

    const hasApiIssue =
        auth.isAuthenticated &&
        (!availability.isEmployeeApiAvailable ||
            !availability.isDepartmentApiAvailable ||
            !availability.isFileApiAvailable);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            setEmployees([]);
            setDepartments([]);
            setAttendances([]);
            setLeaveRequests([]);
            return;
        }

        void loadEmployees();
        void loadDepartments();
        void checkFileAvailability();
    }, [auth.isAuthenticated, checkFileAvailability, loadDepartments, loadEmployees, setAttendances, setDepartments, setEmployees, setLeaveRequests]);

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
        reset();
        featureReminder.reset();
    };

    const handleOpenApiSettings = () => {
        updateApiSettings({ apiSettingsError: null, isApiSettingsOpen: true });
    };

    const handleCloseApiSettings = () => {
        updateApiSettings({ isApiSettingsOpen: false, apiSettingsError: null });
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

    const handleCreateEmployee = async (employee: Employee) => {
        await createEmployee(employee);
    };

    const handleUpdateEmployee = async (employee: Employee) => {
        await updateEmployeeApi(employee);
    };

    const handleDeleteEmployee = async (id: number) => {
        await deleteEmployeeApi(id);
    };

    const handleCreateDepartment = async (department: Department) => {
        await createDepartment(department);
    };

    const handleUpdateDepartment = async (department: Department) => {
        await updateDepartmentApi(department);
    };

    const handleDeleteDepartment = async (id: number) => {
        await deleteDepartmentApi(id);
    };

    const handleCreateLeaveRequest = (_employeeId: number, _leave: LeaveRequest) => {
        toastService.featureUnavailable("Les demandes d'absence");
    };

    const handleReconnectApis = async () => {
        if (!auth.isAuthenticated || api.isReconnectingApis) {
            return;
        }

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
        }
    };

    const handleSaveApiBaseUrl = async (url: string) => {
        if (api.isSavingApiSettings) {
            return;
        }

        updateApiSettings({ isSavingApiSettings: true, apiSettingsError: null });
        const toastId = toastService.apiConfigTest();
        try {
            const normalizedUrl = await apiClient.testConnection(url);
            apiClient.setBaseURL(normalizedUrl);
            updateApiSettings({ apiBaseUrl: normalizedUrl });
            toastService.dismiss(toastId);
            toastService.apiConfigSuccess(normalizedUrl);
            updateApiSettings({ isApiSettingsOpen: false });
            if (auth.isAuthenticated) {
                void reconnectApis();
            }
        } catch (error) {
            toastService.dismiss(toastId);
            const message = extractErrorMessage(error);
            updateApiSettings({ apiSettingsError: message });
            toastService.apiConfigFailed(message);
        } finally {
            updateApiSettings({ isSavingApiSettings: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar
                logIn={auth.isAuthenticated}
                onOpenAuth={openAuth}
                onLogout={handleLogout}
                onReconnect={handleReconnectApis}
                canReconnect={auth.isAuthenticated}
                isReconnecting={api.isReconnectingApis}
                hasApiIssue={hasApiIssue}
                onOpenApiSettings={handleOpenApiSettings}
            />
            <ApiEndpointModal
                isOpen={api.isApiSettingsOpen}
                currentUrl={api.apiBaseUrl || apiClient.getBaseURL()}
                defaultUrl={DEFAULT_API_BASE_URL}
                error={api.apiSettingsError}
                isSubmitting={api.isSavingApiSettings}
                onClose={handleCloseApiSettings}
                onSave={handleSaveApiBaseUrl}
                onUrlChange={() => updateApiSettings({ apiSettingsError: null })}
            />

            {!auth.isAuthenticated && auth.authMode === null && (
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

            {!auth.isAuthenticated && auth.authMode && <AuthForm onSubmit={handleAuth} />}

            {auth.isAuthenticated && (
                <DashboardLayout
                    displayMode={displayMode}
                    onDisplayModeChange={(mode) => setDisplayMode(mode)}
                    employees={data.employees}
                    departments={data.departments}
                    isLoadingEmployees={loading.isLoadingEmployees}
                    isLoadingDepartments={loading.isLoadingDepartments}
                    isEmployeeApiAvailable={availability.isEmployeeApiAvailable}
                    isDepartmentApiAvailable={availability.isDepartmentApiAvailable}
                    onCreateEmployee={handleCreateEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
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
