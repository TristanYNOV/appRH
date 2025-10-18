import { useState } from "react";

export type AuthMode = "login" | "signup" | null;

export const useAuthState = () => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>(null);

    const login = () => setAuthenticated(true);
    const logout = () => setAuthenticated(false);
    const openAuth = (mode: Exclude<AuthMode, null>) => setAuthMode(mode);
    const closeAuth = () => setAuthMode(null);

    return {
        isAuthenticated,
        authMode,
        openAuth,
        closeAuth,
        login,
        logout,
    } as const;
};
