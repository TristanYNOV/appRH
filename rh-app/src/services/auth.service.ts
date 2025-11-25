import apiClient from "../HTTP/httpClient.ts";
import {
    authLoginPayloadCodec,
    authRegisterAndLoginResponseCodec,
    authRegisterPayloadCodec,
    type AuthLoginPayload,
    type AuthRegisterAndLoginResponse,
    type AuthRegisterPayload,
} from "../interfaces/auth.codec.ts";
import { decode } from "../utils/decode.ts";

const REFRESH_TOKEN_KEY = "appRH_refresh_token" as const;
const REFRESH_TOKEN_MAX_AGE_DAYS = 30;
const isBrowser = typeof document !== "undefined";

const setCookie = (token: string, maxAgeDays: number) => {
    if (!isBrowser) return;
    const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60);
    document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

const readCookie = (): string | null => {
    if (!isBrowser) return null;
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    const refreshEntry = cookies.find((cookie) => cookie.startsWith(`${REFRESH_TOKEN_KEY}=`));
    if (!refreshEntry) return null;
    return decodeURIComponent(refreshEntry.split("=")[1]);
};

const clearCookie = () => {
    if (!isBrowser) return;
    document.cookie = `${REFRESH_TOKEN_KEY}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

export const authService = {
    storeRefreshToken(token: string, maxAgeDays: number = REFRESH_TOKEN_MAX_AGE_DAYS) {
        setCookie(token, maxAgeDays);
    },
    getRefreshToken(): string | null {
        return readCookie();
    },
    clearRefreshToken() {
        clearCookie();
    },
    async login(payload: AuthLoginPayload): Promise<AuthRegisterAndLoginResponse> {
        const body = decode(authLoginPayloadCodec, payload, "authService.login.payload");
        const response = await apiClient.post<unknown>("/auth/login", body, {
            withCredentials: true,
        });
        return decode(
            authRegisterAndLoginResponseCodec,
            response,
            "authService.login.response"
        );
    },
    async register(payload: AuthRegisterPayload): Promise<AuthRegisterAndLoginResponse> {
        const body = decode(authRegisterPayloadCodec, payload, "authService.register.payload");
        const response = await apiClient.post<unknown>("/auth/register", body, {
            withCredentials: true,
        });
        return decode(
            authRegisterAndLoginResponseCodec,
            response,
            "authService.register.response"
        );
    },
    async refreshAccessToken(
        refreshToken?: string
    ): Promise<AuthRegisterAndLoginResponse> {
        const token = refreshToken ?? this.getRefreshToken();
        if (!token) {
            throw new Error("Aucun refreshToken disponible pour renouveler la session.");
        }

        const response = await apiClient.post<unknown>(
            "/auth/refresh-token",
            { refreshToken: token },
            { withCredentials: true }
        );

        return decode(
            authRegisterAndLoginResponseCodec,
            response,
            "authService.refreshAccessToken.response"
        );
    },
    async revokeToken(refreshToken?: string): Promise<void> {
        const token = refreshToken ?? this.getRefreshToken();
        if (!token) {
            return;
        }

        await apiClient.post(
            "/auth/revoke-token",
            { refreshToken: token },
            { withCredentials: true }
        );
        this.clearRefreshToken();
    },
} as const;

export default authService;
