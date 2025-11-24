// src/api/endpoints/employee.api.ts

import apiClient from "./httpClient.ts";
import { EmployeeCodec, EmployeePayloadCodec, type Employee } from "../interfaces/employee.codec.ts";
import { decode } from "../utils/decode.ts";

export const baseURLEmployee = "employees";

export const EmployeeAPI = {
    async getAll(): Promise<Employee[]> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}`);
        return decode(EmployeeCodec.array(), data, "EmployeeAPI.getAll");
    },

    async getById(id: number): Promise<Employee> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/${id}`);
        return decode(EmployeeCodec, data, "EmployeeAPI.getById");
    },

    async getByEmail(email: string): Promise<Employee> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/by-email/${email}`);
        return decode(EmployeeCodec, data, "EmployeeAPI.getByEmail");
    },

    async getByDepartmentId(employeeId: number): Promise<Employee> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/by-department/${employeeId}`);
        return decode(EmployeeCodec, data, "EmployeeAPI.getByDepartmentId");
    },

    async create(employee: Partial<Employee>): Promise<Employee> {
        const payload = decode(EmployeePayloadCodec, employee, "EmployeeAPI.create.payload");
        const created = await apiClient.post<unknown>(`/${baseURLEmployee}`, payload);
        return decode(EmployeeCodec, created, "EmployeeAPI.create.response");
    },

    async update(employee: Partial<Employee>): Promise<Employee> {
        const payload = decode(EmployeePayloadCodec, employee, "EmployeeAPI.update.payload");
        const updated = await apiClient.put<unknown>(`/${baseURLEmployee}`, payload);
        return decode(EmployeeCodec, updated, "EmployeeAPI.update.response");
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLEmployee}/${id}`);
    },
};
