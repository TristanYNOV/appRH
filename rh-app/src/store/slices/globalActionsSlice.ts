import type { StoreCreator } from "../types.ts";
import type { GlobalActions } from "../types.ts";

export const createGlobalActionsSlice: StoreCreator<GlobalActions> = (set, get) => ({
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
});
