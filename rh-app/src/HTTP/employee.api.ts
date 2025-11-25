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
import { formatDateTime } from "../utils/dateFormat.ts";

export const baseURLEmployee = "employees";

type CreateEmployeeApiPayload = Omit<CreateEmployeePayload, "hireDate"> & { hireDate: string };
type UpdateEmployeeApiPayload = Omit<UpdateEmployeePayload, "hireDate"> & { hireDate?: string };

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
        const formattedPayload: CreateEmployeeApiPayload = {
            ...payload,
            hireDate: formatDateTime(payload.hireDate),
        };

        const created = await apiClient.post<unknown>(`/${baseURLEmployee}`, formattedPayload);
        return decode(EmployeeAPICodec, created, "EmployeeAPI.create.response");
    },

    async update(id: number, employee: UpdateEmployeePayload): Promise<Employee> {
        const payload = decode(updateEmployeeCodec, employee, "EmployeeAPI.update.payload");
        const formattedPayload: UpdateEmployeeApiPayload = {
            ...payload,
            hireDate: payload.hireDate ? formatDateTime(payload.hireDate) : undefined,
        };

        const updated = await apiClient.put<unknown>(`/${baseURLEmployee}/${id}`, formattedPayload);

        const parsed = EmployeeAPICodec.safeParse(updated);
        if (parsed.success) {
            return parsed.data;
        }

        if (typeof updated === "string" || updated == null) {
            return this.getById(id);
        }

        console.error(`[DECODE][EmployeeAPI.update.response]`, parsed.error.format());
        throw new Error(
            "Les données reçues pour EmployeeAPI.update.response ne respectent pas le contrat attendu."
        );
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLEmployee}/${id}`);
    },
};
