// src/api/endpoints/file.api.ts

import apiClient from "./httpClient.ts";
import {baseURLEmployee} from "./employee.api.ts";
import {baseURLDepartment} from "./department.api.ts";

export const FileAPI = {
    async importEmployees(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(`${baseURLEmployee}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async importDepartments(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(`${baseURLDepartment}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async exportEmployees() {
        return apiClient.get<Blob>(`${baseURLEmployee}/export`, {
            responseType: "blob",
        });
    },

    async exportDepartments() {
        return apiClient.get<Blob>(`${baseURLDepartment}/export`, {
            responseType: "blob",
        });
    },
};
