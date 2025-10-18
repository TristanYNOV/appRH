import { useCallback, useState } from "react";

import { useEmployees } from "./useEmployees.ts";
import { useDepartments } from "./useDepartments.ts";
import { useFileTransfers } from "./useFileTransfers.ts";

export type DisplayMode = "employee" | "department";

export const useDashboardState = (isAuthenticated: boolean) => {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("employee");

    const {
        employees,
        isLoading: isLoadingEmployees,
        isAvailable: isEmployeeApiAvailable,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        refresh: refreshEmployees,
        reset: resetEmployees,
        checkAvailability: checkEmployeeAvailability,
    } = useEmployees({
        enabled: isAuthenticated,
    });

    const {
        departments,
        isLoading: isLoadingDepartments,
        isAvailable: isDepartmentApiAvailable,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refresh: refreshDepartments,
        reset: resetDepartments,
        checkAvailability: checkDepartmentAvailability,
    } = useDepartments({
        enabled: isAuthenticated,
    });

    const {
        isAvailable: isFileApiAvailable,
        isImportingEmployees,
        isImportingDepartments,
        isExportingEmployees,
        isExportingDepartments,
        importEmployees,
        importDepartments,
        exportEmployees,
        exportDepartments,
        reset: resetFileTransfers,
        checkAvailability: checkFileAvailability,
    } = useFileTransfers({
        onEmployeesUpdated: refreshEmployees,
        onDepartmentsUpdated: refreshDepartments,
    });

    const reconnectApis = useCallback(async () => {
        const [employeeAvailable, departmentAvailable, fileAvailable] = await Promise.all([
            checkEmployeeAvailability(),
            checkDepartmentAvailability(),
            checkFileAvailability(),
        ]);

        return employeeAvailable && departmentAvailable && fileAvailable;
    }, [checkDepartmentAvailability, checkEmployeeAvailability, checkFileAvailability]);

    const reset = () => {
        setDisplayMode("employee");
        resetEmployees();
        resetDepartments();
        resetFileTransfers();
    };

    return {
        displayMode,
        setDisplayMode,
        employees,
        isLoadingEmployees,
        isEmployeeApiAvailable,
        createEmployee,
        updateEmployee,
        deleteEmployee,
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
        refreshEmployees,
        refreshDepartments,
        reconnectApis,
        reset,
    } as const;
};
