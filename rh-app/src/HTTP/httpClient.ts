// src/api/HTTPClient.ts

import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from "axios";

const baseURL = "http://localhost:5171/api";

class HTTPClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: false, // passe à true si tu veux envoyer les cookies
        });

        // ----------- Intercepteurs -----------
        this.client.interceptors.request.use(
            (config) => {
                // Exemple : ajout du token JWT automatiquement
                const token = localStorage.getItem("token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Exemple simple de gestion d’erreurs
                console.error("[HTTP ERROR]", error?.response || error.message);
                if (error.response?.status === 401) {
                    console.warn("Non autorisé — redirection login possible");
                }
                return Promise.reject(error);
            }
        );
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
}

const apiClient = new HTTPClient();
export default apiClient;
