import type { DashboardSlice, StoreCreator } from "../types.ts";

export const createDashboardSlice: StoreCreator<DashboardSlice> = (set) => ({
    displayMode: "employee",
    setDisplayMode: (mode) => set({ displayMode: mode }),
});
