import type { StoreCreator } from "../types.ts";
import type { GlobalActions } from "../types.ts";

export const createGlobalActionsSlice: StoreCreator<GlobalActions> = (set, get) => ({
    resetAfterLogout: () => {
        set({ displayMode: "employee" });
        get().resetEmployees();
        get().resetAttendances();
        get().resetDepartments();
        get().resetFileTransfers();
    },
    reconnectApis: async () => {
        const [employeeOk, attendanceOk, departmentOk, fileOk] = await Promise.all([
            get().checkEmployeeAvailability(),
            get().checkAttendanceAvailability(),
            get().checkDepartmentAvailability(),
            get().checkFileAvailability(),
        ]);

        if (employeeOk) {
            void get().loadEmployees();
        }
        if (attendanceOk) {
            void get().loadAttendances();
        }
        if (departmentOk) {
            void get().loadDepartments();
        }

        return employeeOk && attendanceOk && departmentOk && fileOk;
    },
});
