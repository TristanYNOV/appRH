const TOKEN_KEY = "appRH_token" as const;

export const authService = {
    storeToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    clearToken() {
        localStorage.removeItem(TOKEN_KEY);
    },
} as const;

export default authService;
