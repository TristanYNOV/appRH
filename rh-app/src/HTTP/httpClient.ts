// src/api/HTTPClient.ts

import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
} from "axios";
import { authService } from "../services/auth.service.ts";

const API_BASE_URL_STORAGE_KEY = "appRH_api_base_url" as const;
export const DEFAULT_API_BASE_URL = "http://localhost:5171/api" as const;

const ensureProtocol = (url: string) => {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
        return url;
    }
    return `http://${url}`;
};

export const normalizeApiBaseUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
        throw new Error("L'URL de l'API ne peut pas être vide.");
    }

    let parsed: URL;
    try {
        parsed = new URL(ensureProtocol(trimmed));
    } catch (error) {
        console.error(error)
        throw new Error("L'URL renseignée est invalide.");
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    const path = normalizedPath === "/" ? "" : normalizedPath;
    return `${parsed.origin}${path}`;
};

const isBrowser = typeof window !== "undefined";

const readStoredBaseUrl = () => {
    if (!isBrowser) {
        return undefined;
    }

    const stored = window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);
    if (!stored) {
        return undefined;
    }

    try {
        return normalizeApiBaseUrl(stored);
    } catch {
        window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
        return undefined;
    }
};

class HTTPClient {
    private client: AxiosInstance;
    private baseURL: string;

    constructor(initialBaseUrl: string = DEFAULT_API_BASE_URL) {
        this.baseURL = initialBaseUrl;
        this.client = this.createClient(initialBaseUrl);
    }

    private createClient(baseURL: string) {
        const client = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: false,
        });

        this.setupInterceptors(client);
        return client;
    }

    private setupInterceptors(client: AxiosInstance) {
        client.interceptors.request.use(
            (config) => {
                const token = authService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("[HTTP ERROR]", error?.response || error.message);
                if (error.response?.status === 401) {
                    console.warn("Non autorisé — redirection login possible");
                }
                return Promise.reject(error);
            }
        );
    }

    public setBaseURL(baseURL: string) {
        this.baseURL = baseURL;
        this.client = this.createClient(baseURL);
        if (isBrowser) {
            window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, baseURL);
        }
    }

    public resetBaseURL() {
        this.setBaseURL(DEFAULT_API_BASE_URL);
    }

    public getBaseURL() {
        return this.baseURL;
    }

    private async pingHealth(baseURL: string) {
        try {
            const response = await axios.get(`${baseURL}/health`, {
                timeout: 5000,
                validateStatus: () => true,
            });

            if (response.status >= 400) {
                throw new Error(`Le serveur a répondu avec le statut ${response.status}.`);
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.code === "ECONNABORTED") {
                throw new Error("La tentative de connexion a expiré.");
            }
            throw error;
        }
    }

    public async checkHealth(baseURL?: string): Promise<void> {
        const normalizedUrl = normalizeApiBaseUrl(baseURL ?? this.baseURL);
        await this.pingHealth(normalizedUrl);
    }

    public async testConnection(baseURL: string): Promise<string> {
        const normalizedUrl = normalizeApiBaseUrl(baseURL);

        await this.pingHealth(normalizedUrl);

        return normalizedUrl;
    }

    public async get<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res: AxiosResponse<T> = await this.client.get(url, config);
        return res.data;
    }

    public async post<T = unknown>(
        url: string,
        data: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res: AxiosResponse<T> = await this.client.post(url, data, config);
        return res.data;
    }

    public async put<T = unknown>(
        url: string,
        data: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res: AxiosResponse<T> = await this.client.put(url, data, config);
        return res.data;
    }

    public async patch<T = unknown>(
        url: string,
        data: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res: AxiosResponse<T> = await this.client.patch(url, data, config);
        return res.data;
    }

    public async delete<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res: AxiosResponse<T> = await this.client.delete(url, config);
        return res.data;
    }

    public async head(url: string, config?: AxiosRequestConfig): Promise<void> {
        await this.client.head(url, config);
    }
}

const initialBaseUrl = readStoredBaseUrl() ?? DEFAULT_API_BASE_URL;

const apiClient = new HTTPClient(initialBaseUrl);

export { API_BASE_URL_STORAGE_KEY };
export default apiClient;
