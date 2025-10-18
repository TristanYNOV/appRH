import { useRef, useState, type ChangeEvent } from "react";
import { Toaster } from "react-hot-toast";

import "./App.css";
import { AuthForm, TopBar } from "./components/index.ts";
import authService from "./services/auth.service.ts";
import { toastService } from "./services/toasts.service.ts";
import { useAuthState } from "./hooks/useAuthState.ts";
import { useDashboardState } from "./hooks/useDashboardState.ts";
import { useFeatureReminder } from "./hooks/useFeatureReminder.ts";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import { extractErrorMessage } from "./utils/errorHandling.ts";

import type { LeaveRequest } from "./interfaces/leaveRequest.interface.ts";
import type { Employee } from "./interfaces/employee.interface.ts";
import type { Department } from "./interfaces/department.interface.ts";

const ATTENDANCE_API_AVAILABLE = false;
const LEAVE_API_AVAILABLE = false;

function App() {
    const auth = useAuthState();
    const dashboard = useDashboardState(auth.isAuthenticated);
    const [isReconnectingApis, setIsReconnectingApis] = useState(false);
    const missingFeatures = [
        !ATTENDANCE_API_AVAILABLE ? "présences" : null,
        !LEAVE_API_AVAILABLE ? "demandes d'absence" : null,
    ].filter((feature): feature is string => feature !== null);
    const featureReminder = useFeatureReminder(auth.isAuthenticated, missingFeatures);

    const employeeFileInputRef = useRef<HTMLInputElement | null>(null);
    const departmentFileInputRef = useRef<HTMLInputElement | null>(null);

    const disableEmployeeImport =
        !dashboard.isFileApiAvailable || dashboard.isImportingEmployees;
    const disableDepartmentImport =
        !dashboard.isFileApiAvailable || dashboard.isImportingDepartments;
    const disableEmployeeExport =
        !dashboard.isFileApiAvailable || dashboard.isExportingEmployees;
    const disableDepartmentExport =
        !dashboard.isFileApiAvailable || dashboard.isExportingDepartments;
    const disableAttendanceActions =
        !ATTENDANCE_API_AVAILABLE || !dashboard.isEmployeeApiAvailable;
    const disableLeaveActions =
        !LEAVE_API_AVAILABLE || !dashboard.isEmployeeApiAvailable;

    const hasApiIssue =
        !dashboard.isEmployeeApiAvailable ||
        !dashboard.isDepartmentApiAvailable ||
        !dashboard.isFileApiAvailable;

    const handleAuth = async (email: string, password: string, mode: "login" | "signup") => {
        const toastId = toastService.authAttempt();
        try {
            const mockToken = window.btoa(`${email}:${password}:${mode}:${Date.now()}`);
            authService.storeToken(mockToken);
            auth.login();
            auth.closeAuth();
            toastService.dismiss(toastId);
            toastService.authSuccess();
        } catch (error) {
            toastService.dismiss(toastId);
            toastService.authFailed(extractErrorMessage(error));
        }
    };

    const handleLogout = () => {
        authService.clearToken();
        auth.logout();
        auth.closeAuth();
        dashboard.reset();
        featureReminder.reset();
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
        await dashboard.importEmployees(file);
    };

    const onImportDepartments = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        await dashboard.importDepartments(file);
    };

    const handleCreateEmployee = async (employee: Employee) => {
        await dashboard.createEmployee(employee);
    };

    const handleUpdateEmployee = async (employee: Employee) => {
        await dashboard.updateEmployee(employee);
    };

    const handleDeleteEmployee = async (id: number) => {
        await dashboard.deleteEmployee(id);
    };

    const handleCreateDepartment = async (department: Department) => {
        await dashboard.createDepartment(department);
    };

    const handleUpdateDepartment = async (department: Department) => {
        await dashboard.updateDepartment(department);
    };

    const handleDeleteDepartment = async (id: number) => {
        await dashboard.deleteDepartment(id);
    };

    const handleCreateLeaveRequest = (_employeeId: number, _leave: LeaveRequest) => {
        toastService.featureUnavailable("Les demandes d'absence");
    };

    const handleReconnectApis = async () => {
        if (!auth.isAuthenticated || isReconnectingApis) {
            return;
        }

        setIsReconnectingApis(true);
        const toastId = toastService.apiReconnectAttempt();
        try {
            const success = await dashboard.reconnectApis();
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

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar
                logIn={auth.isAuthenticated}
                onOpenAuth={auth.openAuth}
                onLogout={handleLogout}
                onReconnect={handleReconnectApis}
                canReconnect={auth.isAuthenticated}
                isReconnecting={isReconnectingApis}
                hasApiIssue={hasApiIssue}
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
                    displayMode={dashboard.displayMode}
                    onDisplayModeChange={(mode) => dashboard.setDisplayMode(mode)}
                    employees={dashboard.employees}
                    departments={dashboard.departments}
                    isLoadingEmployees={dashboard.isLoadingEmployees}
                    isLoadingDepartments={dashboard.isLoadingDepartments}
                    isEmployeeApiAvailable={dashboard.isEmployeeApiAvailable}
                    isDepartmentApiAvailable={dashboard.isDepartmentApiAvailable}
                    onCreateEmployee={handleCreateEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                    onCreateDepartment={handleCreateDepartment}
                    onUpdateDepartment={handleUpdateDepartment}
                    onDeleteDepartment={handleDeleteDepartment}
                    onCreateLeaveRequest={handleCreateLeaveRequest}
                    onEmployeeImportClick={triggerEmployeeImport}
                    onDepartmentImportClick={triggerDepartmentImport}
                    onExportEmployees={dashboard.exportEmployees}
                    onExportDepartments={dashboard.exportDepartments}
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
