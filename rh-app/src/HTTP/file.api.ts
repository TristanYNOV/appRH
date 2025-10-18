// src/api/endpoints/file.api.ts

import type {AxiosError} from "axios";

import apiClient from "./httpClient.ts";
import {baseURLEmployee} from "./employee.api.ts";
import {baseURLDepartment} from "./department.api.ts";

export const FileAPI = {
    async importEmployees(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(`/${baseURLEmployee}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async importDepartments(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(`/${baseURLDepartment}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async exportEmployees() {
        return apiClient.get<Blob>(`/${baseURLEmployee}/export`, {
            responseType: "blob",
        });
    },

    async exportDepartments() {
        return apiClient.get<Blob>(`/${baseURLDepartment}/export`, {
            responseType: "blob",
        });
    },

    async checkAvailability() {
        try {
            await apiClient.head(`/${baseURLEmployee}/export`);
        } catch (error) {
            const axiosError = error as AxiosError | undefined;
            if (axiosError?.response?.status === 405) {
                await apiClient.get(`/${baseURLEmployee}/export`, {
                    responseType: "blob",
                    headers: { Range: "bytes=0-0" },
                });
                return;
            }

            throw error;
        }
    },
};
