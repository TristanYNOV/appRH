import type { ChangeEvent, RefObject } from "react";

import DepartmentList from "../departments/DepartmentList.tsx";
import EmployeeList from "../employees/EmployeeList.tsx";
import AttendanceList from "../attendances/AttendanceList.tsx";

import type {
    CreateDepartmentPayload,
    Department,
    UpdateDepartmentPayload,
} from "../../interfaces/department.codec.ts";
import type {
    CreateEmployeePayload,
    Employee,
    UpdateEmployeePayload,
} from "../../interfaces/employee.codec.ts";
import type { LeaveRequest } from "../../interfaces/leaveRequest.codec.ts";
import type { Attendance, AttendanceCreate, AttendanceUpdate } from "../../interfaces/attendance.codec.ts";

type DisplayMode = "employee" | "department" | "attendance";

type Props = {
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
    employees: Employee[];
    attendances: Attendance[];
    departments: Department[];
    isLoadingEmployees: boolean;
    isLoadingAttendances: boolean;
    isLoadingDepartments: boolean;
    isEmployeeApiAvailable: boolean;
    isDepartmentApiAvailable: boolean;
    onCreateEmployee: (employee: CreateEmployeePayload) => void;
    onUpdateEmployee: (id: number, employee: UpdateEmployeePayload) => void;
    onDeleteEmployee: (id: number) => void;
    onCreateAttendance: (attendance: AttendanceCreate) => void;
    onUpdateAttendance: (id: number, attendance: AttendanceUpdate) => void;
    onDeleteAttendance: (id: number) => void;
    onCreateDepartment: (department: CreateDepartmentPayload) => void;
    onUpdateDepartment: (id: number, department: UpdateDepartmentPayload) => void;
    onDeleteDepartment: (id: number) => void;
    onCreateLeaveRequest: (employeeId: number, leave: LeaveRequest) => void;
    onEmployeeImportClick: () => void;
    onExportEmployees: () => void;
    onEmployeeFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    employeeFileInputRef: RefObject<HTMLInputElement | null>;
    disableEmployeeImport: boolean;
    disableEmployeeExport: boolean;
    disableAttendanceActions: boolean;
    disableLeaveActions: boolean;
};

const DashboardLayout = ({
    displayMode,
    onDisplayModeChange,
    employees,
    departments,
    attendances,
    isLoadingEmployees,
    isLoadingAttendances,
    isLoadingDepartments,
    isEmployeeApiAvailable,
    isDepartmentApiAvailable,
    onCreateEmployee,
    onUpdateEmployee,
    onDeleteEmployee,
    onCreateAttendance,
    onUpdateAttendance,
    onDeleteAttendance,
    onCreateDepartment,
    onUpdateDepartment,
    onDeleteDepartment,
    onCreateLeaveRequest,
    onEmployeeImportClick,
    onExportEmployees,
    onEmployeeFileChange,
    employeeFileInputRef,
    disableEmployeeImport,
    disableEmployeeExport,
    disableAttendanceActions,
    disableLeaveActions,
}: Props) => (
    <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-wrap justify-center gap-3 mt-4 px-4">
            <button
                onClick={onEmployeeImportClick}
                disabled={disableEmployeeImport}
                className={`px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50${
                    disableEmployeeImport ? " opacity-60 cursor-not-allowed" : ""
                }`}
                title="Importer Excel employés"
            >
                Importer Excel — Employés
            </button>
            <button
                onClick={onExportEmployees}
                disabled={disableEmployeeExport}
                className={`px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700${
                    disableEmployeeExport ? " opacity-60 cursor-not-allowed" : ""
                }`}
                title="Exporter les employés"
            >
                Exporter Excel — Employés
            </button>

            <input
                ref={employeeFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onEmployeeFileChange}
            />
        </div>
        <div className="flex w-full justify-center gap-2 mt-16">
            <button
                className="btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => onDisplayModeChange("department")}
                disabled={displayMode === "department"}
            >
                Voir les départements
            </button>
            <button
                onClick={() => onDisplayModeChange("employee")}
                className="btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                disabled={displayMode === "employee"}
            >
                Voir les employées
            </button>
            <button
                onClick={() => onDisplayModeChange("attendance")}
                className="btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                disabled={displayMode === "attendance"}
            >
                Voir les présences
            </button>
        </div>

        <div className="flex flex-col overflow-y-auto gap-4">
            {displayMode === "department" && (
                <DepartmentList
                    departments={departments}
                    onCreate={onCreateDepartment}
                    onUpdate={onUpdateDepartment}
                    onDelete={onDeleteDepartment}
                    isLoading={isLoadingDepartments}
                    actionsDisabled={!isDepartmentApiAvailable}
                />
            )}
            {displayMode === "employee" && (
                <EmployeeList
                    title="Liste des employés"
                    employees={employees}
                    attendances={attendances}
                    departments={departments}
                    onCreate={onCreateEmployee}
                    onUpdate={onUpdateEmployee}
                    onDelete={onDeleteEmployee}
                    onCreateAttendance={onCreateAttendance}
                    onUpdateAttendance={onUpdateAttendance}
                    onDeleteAttendance={onDeleteAttendance}
                    onCreateLeaveRequest={onCreateLeaveRequest}
                    isLoading={isLoadingEmployees}
                    disableCrudActions={!isEmployeeApiAvailable}
                    disableAttendanceActions={disableAttendanceActions}
                    disableLeaveActions={disableLeaveActions}
                />
            )}
            {displayMode === "attendance" && (
                <AttendanceList
                    attendances={attendances}
                    employees={employees}
                    isLoading={isLoadingAttendances}
                    disableActions={disableAttendanceActions}
                    onCreate={onCreateAttendance}
                    onUpdate={onUpdateAttendance}
                    onDelete={onDeleteAttendance}
                />
            )}
        </div>
    </div>
);

export default DashboardLayout;
