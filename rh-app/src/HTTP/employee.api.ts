// src/api/endpoints/employee.api.ts

import apiClient from "./httpClient.ts";
import {
    EmployeeAPICodec,
    createEmployeeCodec,
    type CreateEmployeePayload,
    type Employee,
    type UpdateEmployeePayload,
    updateEmployeeCodec,
} from "../interfaces/employee.codec.ts";
import { decode } from "../utils/decode.ts";

export const baseURLEmployee = "employees";

export const EmployeeAPI = {
    async getAll(): Promise<Employee[]> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}`);
        return decode(EmployeeAPICodec.array(), data, "EmployeeAPI.getAll");
    },

    async getById(id: number): Promise<Employee> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/${id}`);
        return decode(EmployeeAPICodec, data, "EmployeeAPI.getById");
    },

    async getByEmail(email: string): Promise<Employee> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/by-email/${email}`);
        return decode(EmployeeAPICodec, data, "EmployeeAPI.getByEmail");
    },

    async getByDepartmentId(employeeId: number): Promise<Employee[]> {
        const data = await apiClient.get<unknown>(`/${baseURLEmployee}/by-department/${employeeId}`);
        return decode(EmployeeAPICodec.array(), data, "EmployeeAPI.getByDepartmentId");
    },

    async create(employee: CreateEmployeePayload): Promise<Employee> {
        const payload = decode(createEmployeeCodec, employee, "EmployeeAPI.create.payload");
        const created = await apiClient.post<unknown>(`/${baseURLEmployee}`, payload);
        return decode(EmployeeAPICodec, created, "EmployeeAPI.create.response");
    },

    async update(id: number, employee: UpdateEmployeePayload): Promise<Employee> {
        const payload = decode(updateEmployeeCodec, employee, "EmployeeAPI.update.payload");
        const updated = await apiClient.put<unknown>(`/${baseURLEmployee}/${id}`, payload);
        return decode(EmployeeAPICodec, updated, "EmployeeAPI.update.response");
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLEmployee}/${id}`);
    },
};
