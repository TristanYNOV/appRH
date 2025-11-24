import type { AuthSlice, StoreCreator } from "../types.ts";

export const createAuthSlice: StoreCreator<AuthSlice> = (set) => ({
    isAuthenticated: false,
    authMode: null,
    login: () => set({ isAuthenticated: true }),
    logout: () => set({ isAuthenticated: false }),
    openAuth: (mode) => set({ authMode: mode }),
    closeAuth: () => set({ authMode: null }),
});
