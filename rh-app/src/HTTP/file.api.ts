// src/api/endpoints/file.api.ts

import apiClient from "./httpClient.ts";

export const FileAPI = {
    async importEmployees(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/file/import/employees", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async importDepartments(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/file/import/departments", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    async exportEmployees() {
        return apiClient.get<Blob>("/file/export/employees", {
            responseType: "blob",
        });
    },

    async exportDepartments() {
        return apiClient.get<Blob>("/file/export/departments", {
            responseType: "blob",
        });
    },
};
