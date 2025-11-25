import type { AuthSlice, StoreCreator } from "../types.ts";

export const createAuthSlice: StoreCreator<AuthSlice> = (set) => ({
    isAuthenticated: false,
    authMode: null,
    accessToken: null,
    user: null,
    login: (accessToken, user) =>
        set({ isAuthenticated: true, accessToken, user }),
    logout: () => set({ isAuthenticated: false, accessToken: null, user: null }),
    openAuth: (mode) => set({ authMode: mode }),
    closeAuth: () => set({ authMode: null }),
});
