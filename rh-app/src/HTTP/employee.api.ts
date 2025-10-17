// src/api/endpoints/employee.api.ts


import type {Employee} from "../interfaces/employee.interface.ts";
import apiClient from "./httpClient.ts";

export const baseURLEmployee = "employee";

export const EmployeeAPI = {
    async getAll(): Promise<Employee[]> {
        return apiClient.get<Employee[]>(`/${baseURLEmployee}`);
    },

    async getById(id: number): Promise<Employee> {
        return apiClient.get<Employee>(`/${baseURLEmployee}/${id}`);
    },

    async getByEmail(email: string): Promise<Employee> {
        return apiClient.get<Employee>(`/${baseURLEmployee}/by-email//${email}`);
    },

    async getByDepartmentId(employeeId: number): Promise<Employee> {
        return apiClient.get<Employee>(`/${baseURLEmployee}/by-department//${employeeId}`);
    },

    async create(employee: Partial<Employee>): Promise<Employee> {
        return apiClient.post<Employee>(`/${baseURLEmployee}`, employee);
    },

    async update(employee: Partial<Employee>): Promise<Employee> {
        return apiClient.put<Employee>(`/${baseURLEmployee}`, employee);
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLEmployee}/${id}`);
    },
};
