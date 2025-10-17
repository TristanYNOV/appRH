// src/api/endpoints/employee.api.ts


import type {Employee} from "../interfaces/employee.interface.ts";
import apiClient from "./httpClient.ts";

const baseURLEmployee = "employee";

export const EmployeeAPI = {
    async getAll(): Promise<Employee[]> {
        return apiClient.get<Employee[]>(`/${baseURLEmployee}`);
    },

    async getById(id: number): Promise<Employee> {
        return apiClient.get<Employee>(`/${baseURLEmployee}/${id}`);
    },

    async create(employee: Partial<Employee>): Promise<Employee> {
        return apiClient.post<Employee>(`/${baseURLEmployee}`, employee);
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLEmployee}/${id}`);
    },
};
