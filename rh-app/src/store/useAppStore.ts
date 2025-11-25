import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createAuthSlice } from "./slices/authSlice.ts";
import { createAttendanceSlice } from "./slices/attendanceSlice.ts";
import { createDashboardSlice } from "./slices/dashboardSlice.ts";
import { createDepartmentSlice } from "./slices/departmentSlice.ts";
import { createEmployeeSlice } from "./slices/employeeSlice.ts";
import { createFileTransferSlice } from "./slices/fileTransferSlice.ts";
import { createGlobalActionsSlice } from "./slices/globalActionsSlice.ts";
import { createPreferenceSlice } from "./slices/preferenceSlice.ts";
import type { AppState } from "./types.ts";
export type { StoreAuthMode, StoreDisplayMode, LeaveRequest } from "./types.ts";

export const useAppStore = create<AppState>()(
    persist(
        (...args) => ({
            ...createPreferenceSlice(...args),
            ...createAuthSlice(...args),
            ...createDashboardSlice(...args),
            ...createAttendanceSlice(...args),
            ...createEmployeeSlice(...args),
            ...createDepartmentSlice(...args),
            ...createFileTransferSlice(...args),
            ...createGlobalActionsSlice(...args),
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
